import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as signalR from '@microsoft/signalr';
import notificationApi from '../../api/notificationApi';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef(null);

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

  // Fetch initial notifications
  React.useEffect(() => {
    if (!user) return;
    
    const fetchNotifs = async () => {
      try {
        const [countRes, listRes] = await Promise.all([
          notificationApi.getUnreadCount(),
          notificationApi.getAll(1, 20)
        ]);
        setUnreadCount(countRes);
        setNotifications(listRes.data || listRes);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    
    fetchNotifs();
  }, [user]);

  // SignalR connection
  React.useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('access_token');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5050/hubs/notifications", {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log('SignalR Connected!'))
      .catch(err => console.error('SignalR Connection Error: ', err));

    connection.on("ReceiveNotification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      // Auto open dropdown when new notification arrives
      setShowDropdown(true);
    });

    return () => {
      connection.stop();
    };
  }, [user]);

  // Click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
    setShowDropdown(false);
    if (notif.taskId) {
      navigate('/tasks'); // Or open the specific task modal
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

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
        <div className="notification-wrapper" ref={dropdownRef}>
          <div className="icon-btn notification" onClick={() => setShowDropdown(!showDropdown)}>
            <Bell size={20} color="#64748b" />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </div>
          
          {showDropdown && (
            <div className="notification-dropdown">
              <div className="nd-header">
                <h3>Thông báo</h3>
                {unreadCount > 0 && <span className="nd-unread-badge">{unreadCount} chưa đọc</span>}
              </div>
              <div className="nd-list">
                {notifications.length === 0 ? (
                  <div className="nd-empty">Không có thông báo nào</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`nd-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="nd-item-icon">
                        <Bell size={16} color={notif.isRead ? "#94a3b8" : "#3b82f6"} />
                      </div>
                      <div className="nd-item-content">
                        <p>{notif.message}</p>
                        <span>{formatTime(notif.createdAt)}</span>
                      </div>
                      {!notif.isRead && <div className="nd-unread-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="user-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.username || "Guest") + "&background=random"} alt="User Avatar" />
          <span className="user-name">{user?.username || 'Guest'}</span>
          <ChevronDown size={14} color="#94a3b8" />
        </Link>
      </div>
    </header>
  );
};

export default Header;