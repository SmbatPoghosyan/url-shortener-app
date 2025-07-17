import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { apiFetch } from '../api';

interface AuthContextType {
  token: string | null;
  isValidating: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  isValidating: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const stored = localStorage.getItem('token');
      if (stored) {
        try {
          // Validate token by making a request to a protected endpoint
          const res = await apiFetch('/auth/validate');
          if (res.ok) {
            setToken(stored);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          // Token validation failed, remove it
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsValidating(false);
    };

    validateToken();
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, isValidating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
