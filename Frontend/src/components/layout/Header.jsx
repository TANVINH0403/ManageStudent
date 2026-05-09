import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import * as signalR from '@microsoft/signalr';
import notificationApi from '../../api/notificationApi';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, showAuthModal, logout } = useAuth();
  const { t, locale } = useTranslation();
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const userDropdownRef = React.useRef(null);

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
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    const isRead = notif.isRead ?? notif.IsRead;
    const id = notif.id ?? notif.Id;
    if (!isRead) {
      try {
        await notificationApi.markAsRead(id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => {
          const nId = n.id ?? n.Id;
          return nId === id ? { ...n, isRead: true, IsRead: true } : n;
        }));
      } catch(err) {
        console.error("Failed to mark as read", err);
      }
    }
    setShowDropdown(false);
    if (notif.taskId || notif.TaskId) {
      navigate('/tasks'); // Or open the specific task modal
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="header-glass">
      <div className="search-box">
        <Search size={18} color="#64748b" />
        <input
          id="global-search"
          type="text"
          placeholder={t('searchPlaceholder')}
        />
        <span className="kbd-hint">Ctrl /</span>
      </div>

      <div className="header-right">
        <div className="notification-wrapper" ref={dropdownRef}>
          <div className="icon-btn notification" onClick={() => setShowDropdown(!showDropdown)} style={{ position: 'relative' }}>
            <Bell size={20} color="#64748b" />
            {unreadCount > 0 && <span className="header-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </div>
          
          {showDropdown && (
            <div className="notification-dropdown">
              <div className="nd-header">
                <h3>{t('notifications')}</h3>
                {unreadCount > 0 && <span className="nd-unread-badge">{unreadCount} {t('unread')}</span>}
              </div>
              <div className="nd-list">
                {notifications.length === 0 ? (
                  <div className="nd-empty">{t('noNotifications')}</div>
                ) : (
                  notifications.map(notif => {
                    const id = notif.id ?? notif.Id;
                    const isRead = notif.isRead ?? notif.IsRead;
                    const message = notif.message ?? notif.Message;
                    const createdAt = notif.createdAt ?? notif.CreatedAt;
                    return (
                    <div 
                      key={id} 
                      className={`nd-item ${!isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="nd-item-icon">
                        <Bell size={16} color={isRead ? "#94a3b8" : "#3b82f6"} />
                      </div>
                      <div className="nd-item-content">
                        <p>{message}</p>
                        <span>{formatTime(createdAt)}</span>
                      </div>
                      {!isRead && <div className="nd-unread-dot" />}
                    </div>
                  )})
                )}
              </div>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <div className="user-dropdown-wrapper" ref={userDropdownRef} style={{ position: 'relative' }}>
            <div className="user-card" onClick={() => setShowUserDropdown(!showUserDropdown)} style={{ cursor: 'pointer' }}>
              <img src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.username || "Guest") + "&background=random"} alt="User Avatar" />
              <span className="user-name">{user?.username}</span>
              <ChevronDown size={14} color="#94a3b8" />
            </div>
            {showUserDropdown && (
              <div className="user-dropdown-menu" style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)',
                borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                minWidth: '150px', zIndex: 100, overflow: 'hidden'
              }}>
                <div onClick={() => { setShowUserDropdown(false); navigate('/profile'); }} style={{
                  padding: '12px 16px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.95rem',
                  borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }} className="ud-item hover-bg">
                  {t('profile') || 'Hồ sơ'}
                </div>
                <div onClick={async () => { setShowUserDropdown(false); await logout(); window.location.href = '/'; }} style={{
                  padding: '12px 16px', cursor: 'pointer', color: '#ef4444', fontSize: '0.95rem',
                  transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                }} className="ud-item hover-bg">
                  {t('logout') || 'Đăng xuất'}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-primary" onClick={showAuthModal}>
            {t('loginBtn')}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;