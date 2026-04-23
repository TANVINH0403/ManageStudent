import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Plus } from 'lucide-react';
import { mockUser } from '../../data/mockData';

const Header = () => {
  return (
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

        {/* Nút Avatar có thể bấm để vào thẳng Profile */}
        <Link to="/profile" className="user-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="user-info">
            <p className="user-name">{mockUser.username}</p>
            <p className="user-role">Student</p>
          </div>
          <img src={mockUser.avatar} alt="User Avatar" />
        </Link>
      </div>
    </header>
  );
};

export default Header;