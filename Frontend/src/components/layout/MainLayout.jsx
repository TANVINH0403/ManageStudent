import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { mockUser } from '../../data/mockData';
// IMPORT ICON TỪ LUCIDE
import {
  LayoutDashboard,
  ListTodo,
  KanbanSquare,
  CalendarDays,
  FolderKanban,
  Search,
  Bell,
  Plus,
  GraduationCap
} from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();

  // Dùng component Icon thay vì Emoji
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/tasks', label: 'Task List', icon: <ListTodo size={20} /> },
    { path: '/kanban', label: 'Kanban Board', icon: <KanbanSquare size={20} /> },
    { path: '/calendar', label: 'Calendar', icon: <CalendarDays size={20} /> },
    { path: '/categories', label: 'Manage Categories', icon: <FolderKanban size={20} /> },
  ];

  return (
    <div className="layout-wrapper">
      <aside className="sidebar-glass">
        <div className="brand">
          <GraduationCap className="logo-icon" size={32} color="#3378ff" />
          <h2 className="logo-text">Student<span>Manage</span></h2>
        </div>

        <nav className="nav-list">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="icon-wrapper">{item.icon}</span>
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main-container">
        <header className="header-glass">
          <div className="search-box">
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search tasks, categories..." />
          </div>

          <div className="header-right">
            <button className="btn-primary-gradient">
              <Plus size={18} style={{ marginRight: '8px' }} /> Create Task
            </button>
            <div className="icon-btn notification">
              <Bell size={20} color="#64748b" />
              <span className="badge"></span>
            </div>
            {/* ... Giữ nguyên phần User Card ... */}
            <div className="user-card">
              <div className="user-info">
                <p className="user-name">{mockUser.username}</p>
                <p className="user-role">Student</p>
              </div>
              <img src={mockUser.avatar} alt="User" />
            </div>
          </div>
        </header>

        <section className="content-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default MainLayout;