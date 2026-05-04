import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { authContext } from './authContext';
import { api } from '@/api/client';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<{ id: string; email: string; name: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [verificationFailed, setVerificationFailed] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    api.auth.me()
      .then((data) => {
        if (!cancelled) setAdmin(data.admin);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem('admin_token');
          setToken(null);
          setVerificationFailed(true);
        }
      });

    return () => { cancelled = true; };
  }, [token]);

  const isLoading = !!token && !admin && !verificationFailed;

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('admin_token', data.token);
    setToken(data.token);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <authContext.Provider value={{ admin, token, login, logout, isLoading }}>
      {children}
    </authContext.Provider>
  );
}