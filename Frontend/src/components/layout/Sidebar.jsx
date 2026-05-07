import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ListTodo, KanbanSquare,
  CalendarDays, FolderKanban, GraduationCap,
  Settings, User, ArrowRight, ChevronLeft, ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const Sidebar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/',           label: t('dashboard'),     icon: <LayoutDashboard size={20} /> },
    { path: '/tasks',      label: t('taskList'),      icon: <ListTodo size={20} /> },
    { path: '/kanban',     label: t('kanban'),        icon: <KanbanSquare size={20} /> },
    { path: '/calendar',   label: t('calendar'),      icon: <CalendarDays size={20} /> },
    { path: '/categories', label: t('categories'),    icon: <FolderKanban size={20} /> },
    { path: '/profile',    label: t('profile'),       icon: <User size={20} /> },
    { path: '/settings',   label: t('settings'),      icon: <Settings size={20} /> },
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
          <h4>{t('promoTitle')}</h4>
          <p>{t('promoDesc')}</p>
          <button className="btn-promo" onClick={() => navigate('/tasks')}>
            {t('learnMore')} <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? t('expand') : t('collapse')}
      >
        {collapsed
          ? <ChevronRight size={16} />
          : <><ChevronLeft size={16} /><span>{t('collapse')}</span></>
        }
      </button>
    </aside>
  );
};

export default Sidebar;