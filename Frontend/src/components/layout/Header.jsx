import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, LogOut, User, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <header className="header-glass">
      {/* Hamburger — chỉ hiện trên mobile */}
      <button
        className="hamburger-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={22} />
      </button>

      {/* Search box */}
      <div className="search-box">
        <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
        <input type="text" placeholder="Search tasks, categories..." />
      </div>

      <div className="header-right">
        {/* Create Task button */}
        <button className="btn-primary-gradient">
          <Plus size={17} style={{ flexShrink: 0 }} />
          <span className="btn-label">Create Task</span>
        </button>

        {/* Notification bell */}
        <button className="icon-btn notification" aria-label="Notifications">
          <Bell size={20} color="#64748b" />
          <span className="badge"></span>
        </button>

        {/* User dropdown */}
        <div className="user-dropdown-wrap" ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="user-card"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              color: 'inherit',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 6px',
              borderRadius: '10px',
              transition: 'background 0.2s',
            }}
          >
            <div className="user-info" style={{ textAlign: 'right' }}>
              <p className="user-name">{user?.username || 'User'}</p>
              <p className="user-role">Student</p>
            </div>
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0,
            }}>
              {avatarLetter}
            </div>
            <ChevronDown size={13} color="#64748b" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              minWidth: '170px',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'fadeSlideDown 0.15s ease',
            }}>
              <style>{`
                @keyframes fadeSlideDown {
                  from { opacity:0; transform: translateY(-8px); }
                  to   { opacity:1; transform: translateY(0); }
                }
              `}</style>
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px',
                  color: '#1e293b',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <User size={16} /> Trang cá nhân
              </Link>
              <hr style={{ margin: 0, borderColor: '#f1f5f9' }} />
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px',
                  color: '#ef4444',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;