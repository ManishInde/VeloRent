'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, AuthResponse, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const storedToken = localStorage.getItem('velorent_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const response = await apiClient.get<ApiResponse<User> | User>('/api/auth/me');
        const userData = (response as ApiResponse<User>).data || (response as User);
        setUser(userData);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('velorent_token');
        localStorage.removeItem('velorent_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<ApiResponse<AuthResponse> | AuthResponse>(
        '/api/auth/login',
        credentials
      );

      const authData = (res as ApiResponse<AuthResponse>).data || (res as AuthResponse);
      const authToken = authData.token;
      const authUser = authData.user;

      if (!authToken || !authUser) {
        throw new Error('Invalid login response structure from server.');
      }

      localStorage.setItem('velorent_token', authToken);
      localStorage.setItem('velorent_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (token) {
      apiClient.post('/api/auth/logout').catch(() => {
        // Silent catch for logout endpoint cleanup
      });
    }

    localStorage.removeItem('velorent_token');
    localStorage.removeItem('velorent_user');
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
