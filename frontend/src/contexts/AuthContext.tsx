import { useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContextObject';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ username: string; id: string; isAdmin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');

    if (token && storedUserId && storedUsername) {
      setUser({ username: storedUsername, id: storedUserId, isAdmin: storedIsAdmin });
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, isAdmin: boolean, userId: string, username: string) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('isAdmin', String(isAdmin));
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    setUser({ username, id: userId, isAdmin });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};