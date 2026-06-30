'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { getToken, setToken, removeToken, getUser, setUser as saveUser } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage for instant auth state (no loading flash)
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(() => {
    // If we have a cached user, skip loading state
    return !getUser();
  });

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
      saveUser(res.data.data);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token } = res.data.data;
    setToken(token);
    setUser(userData);
    saveUser(userData);
    return userData;
  };

  const register = async (fullName, email, password, role) => {
    const res = await api.post('/auth/register', { fullName, email, password, role });
    const { user: userData, token } = res.data.data;
    setToken(token);
    setUser(userData);
    saveUser(userData);
    return userData;
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isCustomer = user?.role === 'CUSTOMER';
  const isOrganiser = user?.role === 'ORGANISER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isCustomer,
        isOrganiser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
