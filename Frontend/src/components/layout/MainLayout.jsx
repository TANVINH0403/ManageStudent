// src/components/layout/MainLayout.jsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation(); // Lấy đường dẫn hiện tại để tô màu menu

  return (
    <div className="layout-container">
      {/* Thanh Menu Bên Trái */}
      <div className="sidebar soft-card m-3">
        <h4 className="text-center fw-bold mb-5" style={{ color: '#4318FF' }}>
          TaskManager.
        </h4>

        <nav>
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
             Dashboard
          </Link>
          <Link to="/tasks" className={`nav-item ${location.pathname === '/tasks' ? 'active' : ''}`}>
             Công Việc
          </Link>
          <Link to="/categories" className={`nav-item ${location.pathname === '/categories' ? 'active' : ''}`}>
             Danh Mục
          </Link>
          <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
             Tài Khoản
          </Link>
        </nav>
      </div>

      {/* Khu vực nội dung thay đổi bên phải */}
      <div className="main-content">
        {/* Component <Outlet /> sẽ hiển thị các trang con (như Dashboard, Tasks...) vào đây */}
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;