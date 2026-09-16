import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { safeParseResponse, extractErrorMessage } from '../utils/apiClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    identifier: string,
    password: string,
    pin: string
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string; user?: User }>;
  logout: () => void;
  switchDemoRole: (role: UserRole, specificIdentifier?: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  switchDemoRole: async () => {},
  updateProfile: async () => false,
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('startsmart_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('startsmart_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}`, Accept: 'application/json' },
      });
      const { ok, data } = await safeParseResponse(res);
      if (ok && data && data._id) {
        setUser(data);
      } else {
        localStorage.removeItem('startsmart_token');
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.warn('Offline or fallback session recovery:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string, pin: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ identifier, password, pin }),
      });
      const { ok, data, error: parseError } = await safeParseResponse(res);
      if (ok && data && data.token) {
        localStorage.setItem('startsmart_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return {
          success: true,
          redirectUrl: data.redirectUrl || `/${data.user.role}/dashboard`,
          user: data.user,
        };
      }
      const rawError = data?.error ?? data?.message ?? parseError ?? 'Authentication failed';
      return { success: false, error: extractErrorMessage(rawError, 'Authentication failed') };
    } catch (e: any) {
      return { success: false, error: extractErrorMessage(e, 'Network connection failure') };
    }
  };

  const logout = () => {
    localStorage.removeItem('startsmart_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (role: UserRole) => {
    setLoading(true);
    if (role === 'admin') {
      await login('seidu.admin@startsmart.tech', '11316638', '70723');
    } else if (role === 'facilitator') {
      await login('seidu.facilitator@startsmart.tech', '11318142', '48617');
    } else {
      await login('seidu.student@startsmart.tech', '11037000', '21408');
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const currentToken = localStorage.getItem('startsmart_token');
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        },
        body: JSON.stringify(updates),
      });

      const { ok, data } = await safeParseResponse(res);
      if (ok && data && data._id) {
        setUser(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to update profile:', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        switchDemoRole,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
