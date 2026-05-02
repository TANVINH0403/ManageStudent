import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown } from 'lucide-react';
import { mockUser } from '../../data/mockData';

const Header = () => {
  const navigate = useNavigate();

  // Ctrl + / shortcut để focus search
  React.useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="header-glass">
      <div className="search-box">
        <Search size={18} color="#64748b" />
        <input
          id="global-search"
          type="text"
          placeholder="Search tasks, categories..."
        />
        <span className="kbd-hint">Ctrl /</span>
      </div>

      <div className="header-right">
        <button className="btn-primary-gradient" onClick={() => navigate('/tasks')}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Create Task
        </button>

        <div className="icon-btn notification">
          <Bell size={20} color="#64748b" />
          <span className="badge">1</span>
        </div>

        <Link to="/profile" className="user-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={mockUser.avatar} alt="User Avatar" />
          <span className="user-name">{mockUser.username}</span>
          <ChevronDown size={14} color="#94a3b8" />
        </Link>
      </div>
    </header>
  );
};

export default Header;