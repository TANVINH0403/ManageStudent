import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, KanbanSquare, CalendarDays, FolderKanban, GraduationCap, Settings, User } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/tasks', label: 'Task List', icon: <ListTodo size={20} /> },
    { path: '/kanban', label: 'Kanban Board', icon: <KanbanSquare size={20} /> },
    { path: '/calendar', label: 'Calendar', icon: <CalendarDays size={20} /> },
    { path: '/categories', label: 'Manage Categories', icon: <FolderKanban size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
    // Chuẩn bị sẵn menu Settings cho tương lai
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar-glass">
      <div className="brand">
        <GraduationCap className="logo-icon" size={32} color="#3b82f6" />
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
  );
};

export default Sidebar;