import { createContext } from 'react';

interface Admin {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  loginError: string | null;
  clearLoginError: () => void;
}

export const authContext = createContext<AuthContextType | null>(null);