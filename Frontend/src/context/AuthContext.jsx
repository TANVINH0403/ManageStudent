import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // { username }
  const [loading, setLoading] = useState(true); // đang kiểm tra phiên cũ

  // Khởi động: kiểm tra token cũ trong localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username });
    }
    setLoading(false);
  }, []);

  /**
   * Đăng nhập → lưu session → cập nhật state
   */
  const login = async (userName, password) => {
    const result = await authService.login(userName, password);
    // result = { success: true, data: { username, token } }
    const authData = result.data;
    authService.saveSession(authData.token, authData.username);
    setUser({ username: authData.username });
    return result;
  };

  /**
   * Đăng ký → không tự login, trả về data để page tự xử lý
   */
  const register = async (username, email, password, confirmPassword) => {
    return await authService.register(username, email, password, confirmPassword);
  };

  /**
   * Đăng xuất
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tiện lợi
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider');
  return ctx;
};

export default AuthContext;
