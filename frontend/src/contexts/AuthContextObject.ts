import { createContext } from 'react';

export interface AuthContextType {
  user: { username: string; id: string; isAdmin: boolean } | null;
  login: (token: string, isAdmin: boolean, userId: string, username: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 