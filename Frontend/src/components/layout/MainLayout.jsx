import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Đóng sidebar khi resize lên desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="layout-wrapper">
      {/* Overlay cho mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="main-container">
        <Header onToggleSidebar={toggleSidebar} />
        <section className="content-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default MainLayout;