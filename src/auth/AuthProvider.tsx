import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { authContext } from './authContext';
import { api } from '@/api/client';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<{ id: string; email: string; name: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const clearLoginError = useCallback(() => setLoginError(null), []);

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
    setLoginError(null);
    try {
      const data = await api.auth.login(email, password);
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setAdmin(data.admin);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid email or password';
      setLoginError(message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <authContext.Provider value={{ admin, token, login, logout, isLoading, loginError, clearLoginError }}>
      {children}
    </authContext.Provider>
  );
}