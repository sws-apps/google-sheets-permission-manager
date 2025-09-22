import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  serverAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  authMode: 'user' | 'server' | null;
  serverAccountInfo: { email: string; name: string } | null;
  login: () => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  checkServerAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5001'; // Correct port for backend

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [serverAuthenticated, setServerAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'user' | 'server' | null>(null);
  const [serverAccountInfo, setServerAccountInfo] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    // Check URL params for tokens after OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const access = urlParams.get('access_token');
    const refresh = urlParams.get('refresh_token');

    if (access && refresh) {
      setAccessToken(access);
      setRefreshToken(refresh);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check localStorage for existing tokens
      const storedAccess = localStorage.getItem('access_token');
      const storedRefresh = localStorage.getItem('refresh_token');
      
      if (storedAccess && storedRefresh) {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
      }
    }

    // Check server authentication status
    checkServerAuth();
  }, []);

  const checkServerAuth = async () => {
    try {
      console.log('Checking server auth at:', `${API_BASE_URL}/api/auth/server-status`);
      const response = await axios.get(`${API_BASE_URL}/api/auth/server-status`);
      console.log('Server auth response:', response.data);
      setServerAuthenticated(response.data.serverAuthenticated);
      setServerAccountInfo(response.data.accountInfo);
      
      // Determine auth mode
      if (response.data.serverAuthenticated) {
        setAuthMode('server');
      } else if (accessToken) {
        setAuthMode('user');
      }
    } catch (error) {
      console.error('Failed to check server auth status:', error);
    }
  };

  const login = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAuthMode(serverAuthenticated ? 'server' : null);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refresh_token: refreshToken
      });

      const newAccessToken = response.data.access_token;
      setAccessToken(newAccessToken);
      localStorage.setItem('access_token', newAccessToken);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!accessToken || serverAuthenticated,
    serverAuthenticated,
    accessToken,
    refreshToken,
    authMode,
    serverAccountInfo,
    login,
    logout,
    refreshAccessToken,
    checkServerAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};