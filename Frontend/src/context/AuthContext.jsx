// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);      // { username, ... }
  const [token, setToken]         = useState(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);      // checking session on mount
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ── On mount: verify token still valid ──────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    authApi.getMe()
      .then((res) => {
        // BE trả về { success, data: { username, ... }, message }
        const user = res.data ?? res;
        setUser(user);
      })
      .catch(() => {
        // token expired / invalid → clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));

    const handleAuthRequired = () => setIsAuthModalOpen(true);
    window.addEventListener('auth_required', handleAuthRequired);
    return () => window.removeEventListener('auth_required', handleAuthRequired);
  }, []);

  // ── Login ────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    // BE trả về: { success: true, data: { username, accessToken, refreshToken, accessTokenExpiry }, message }
    const res = await authApi.login({ UserName: username, Password: password });
    const data = res.data ?? res; // unwrap nếu có wrapper
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    setToken(data.accessToken);
    setUser({ username: data.username });
    return data;
  }, []);

  // ── Register ─────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    // BE trả về: { success: true, data: { ... }, message }
    const res = await authApi.register(formData);
    return res.data ?? res;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // ignore errors, clear local storage regardless
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  const updateUserSession = useCallback((newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  }, []);

  const showAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, register, updateUserSession, isAuthModalOpen, showAuthModal, closeAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
