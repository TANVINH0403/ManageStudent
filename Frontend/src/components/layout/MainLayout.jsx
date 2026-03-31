import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css'; // Giữ nguyên file CSS này để style cho Sidebar/Header

const MainLayout = () => {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <main className="main-container">
        <Header />
        <section className="content-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default MainLayout;