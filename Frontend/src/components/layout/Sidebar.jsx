import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ListTodo, KanbanSquare,
  CalendarDays, FolderKanban, GraduationCap,
  Settings, User, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/',           label: 'Dashboard',        icon: <LayoutDashboard size={20} /> },
    { path: '/tasks',      label: 'Task List',         icon: <ListTodo size={20} /> },
    { path: '/kanban',     label: 'Kanban Board',      icon: <KanbanSquare size={20} /> },
    { path: '/calendar',   label: 'Calendar',          icon: <CalendarDays size={20} /> },
    { path: '/categories', label: 'Manage Categories', icon: <FolderKanban size={20} /> },
    { path: '/profile',    label: 'Profile',           icon: <User size={20} /> },
    { path: '/settings',   label: 'Settings',          icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`sidebar-glass ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="brand">
        <GraduationCap size={30} color="#a78bfa" style={{ flexShrink: 0 }} />
        {!collapsed && <h2 className="logo-text">Student<span>Manage</span></h2>}
      </div>

      {/* Nav */}
      <nav className="nav-list">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="icon-wrapper">{item.icon}</span>
            {!collapsed && <span className="label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Promo card – only when expanded */}
      {!collapsed && (
        <div className="sidebar-promo">
          <div className="promo-illustration">🚀</div>
          <h4>Tăng năng suất mỗi ngày</h4>
          <p>Theo dõi và quản lý công việc hiệu quả hơn.</p>
          <button className="btn-promo" onClick={() => navigate('/tasks')}>
            Tìm hiểu thêm <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Mở rộng' : 'Thu gọn'}
      >
        {collapsed
          ? <ChevronRight size={16} />
          : <><ChevronLeft size={16} /><span>Thu gọn</span></>
        }
      </button>
    </aside>
  );
};

export default Sidebar;