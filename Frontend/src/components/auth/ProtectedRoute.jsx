import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Bao bọc các route cần xác thực.
 * Nếu chưa login → chuyển về /login
 * Nếu đang load phiên cũ → hiện spinner nhỏ
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#94a3b8',
        fontSize: '1rem',
        gap: '12px',
      }}>
        <span style={{
          display: 'inline-block',
          width: 24, height: 24,
          border: '3px solid rgba(59,130,246,0.3)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        Đang tải...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Lưu lại URL người dùng định vào để redirect sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
