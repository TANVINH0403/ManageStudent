import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ListTodo, KanbanSquare, CalendarDays,
  FolderKanban, GraduationCap, Settings, User, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/',           label: 'Dashboard',        icon: <LayoutDashboard size={20} /> },
    { path: '/tasks',      label: 'Task List',         icon: <ListTodo size={20} /> },
    { path: '/kanban',     label: 'Kanban Board',      icon: <KanbanSquare size={20} /> },
    { path: '/calendar',   label: 'Calendar',          icon: <CalendarDays size={20} /> },
    { path: '/categories', label: 'Manage Categories', icon: <FolderKanban size={20} /> },
    { path: '/profile',    label: 'Profile',           icon: <User size={20} /> },
    { path: '/settings',   label: 'Settings',          icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // Đóng drawer khi click nav trên mobile
    if (window.innerWidth <= 767) onClose?.();
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <aside className={`sidebar-glass${isOpen ? ' mobile-open' : ''}`}>
      {/* Logo / Brand */}
      <div className="brand">
        <GraduationCap className="logo-icon" size={28} color="#3b82f6" style={{ flexShrink: 0 }} />
        <h2 className="logo-text">Student<span>Manage</span></h2>
      </div>

      {/* Navigation */}
      <nav className="nav-list">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={handleNavClick}
            title={item.label}
          >
            <span className="icon-wrapper">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User info + Logout */}
      <div style={{
        marginTop: 'auto',
        padding: '12px 4px 0',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}>
        {/* User info row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px',
          padding: '0 8px',
          overflow: 'hidden',
        }}>
          {/* Avatar */}
          <div style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
          }}>
            {avatarLetter}
          </div>
          <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
            <p className="sidebar-user-name" style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username || 'User'}
            </p>
            <p className="sidebar-user-role" style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Student</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '12px',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            justifyContent: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          <span className="sidebar-logout-label">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;