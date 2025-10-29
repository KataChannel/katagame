'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import MVP1ApiClient from './graphqlApiClient';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setTokenState(storedToken);
    }
    setLoading(false);
  }, []);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await MVP1ApiClient.login(email, password);

      if (result.success && result.data) {
        setToken((result.data as { token: string }).token);
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setToken]);

  const register = useCallback(async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await MVP1ApiClient.register(email, password, username);

      if (result.success && result.data) {
        setToken((result.data as { token: string }).token);
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setToken]);

  const logout = useCallback(() => {
    setToken(null);
    setError(null);
  }, [setToken]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        loading,
        error,
        login,
        register,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
