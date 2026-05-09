import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, CheckCheck, X, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useSelector } from 'react-redux';
import * as signalR from '@microsoft/signalr';
import notificationApi from '../../api/notificationApi';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, showAuthModal, logout } = useAuth();
  const { t, locale } = useTranslation();

  // Redux tasks for global search
  const tasks = useSelector(s => s.tasks.items);

  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const userDropdownRef = React.useRef(null);

  // Global search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [showSearch, setShowSearch] = React.useState(false);
  const searchRef = React.useRef(null);

  // Ctrl + / shortcut to focus search
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

  // Global search logic — filter tasks from Redux store
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = tasks
      .filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setSearchResults(results);
    setShowSearch(true);
  }, [searchQuery, tasks]);

  // Click outside search to close
  React.useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSelect = (task) => {
    setSearchQuery('');
    setShowSearch(false);
    navigate('/tasks', { state: { openTaskId: task.id } });
  };

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
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifs();
  }, [user]);

  // SignalR connection
  React.useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('access_token');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5050/hubs/notifications', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log('SignalR Connected!'))
      .catch(err => console.error('SignalR Error: ', err));

    connection.on('ReceiveNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      setShowDropdown(true);
    });

    return () => { connection.stop(); };
  }, [user]);

  // Click outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setShowDropdown(false);
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target))
        setShowUserDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
    setShowDropdown(false);
    if (notif.taskId || notif.TaskId) navigate('/tasks');
  };

  // Mark ALL as read
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, IsRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale) + ' ' + d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const STATUS_COLORS = { 'Completed': '#16a34a', 'In Progress': '#2563eb', 'Pending': '#d97706' };
  const PRIORITY_ICON = {
    High:   <ArrowUp   size={10} color="#ef4444" />,
    Medium: <Minus     size={10} color="#d97706" />,
    Low:    <ArrowDown size={10} color="#16a34a" />,
  };

  return (
    <header className="header-glass">

      {/* ── GLOBAL SEARCH ── */}
      <div className="search-box" ref={searchRef} style={{ position: 'relative' }}>
        <Search size={18} color="#64748b" />
        <input
          id="global-search"
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowSearch(true)}
          autoComplete="off"
        />
        {searchQuery
          ? <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              onClick={() => { setSearchQuery(''); setShowSearch(false); }}>
              <X size={15} color="#94a3b8" />
            </button>
          : <span className="kbd-hint">Ctrl /</span>
        }

        {/* Live search results */}
        {showSearch && (
          <div className="search-results-dropdown">
            {searchResults.length === 0 ? (
              <div className="search-no-result">{t('noTasksFound') || 'Không tìm thấy kết quả'}</div>
            ) : searchResults.map(task => (
              <div key={task.id} className="search-result-item" onClick={() => handleSearchSelect(task)}>
                <div className="sri-title">
                  <span style={{ color: STATUS_COLORS[task.status] ?? '#64748b', fontSize: '0.8rem' }}>●</span>
                  <span>{task.title}</span>
                </div>
                <div className="sri-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{PRIORITY_ICON[task.priority] ?? ''} {task.priority}</span>
                  {task.deadline && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} color="#64748b"/> {new Date(task.deadline).toLocaleDateString(locale)}</span>}
                </div>
              </div>
            ))}
            <div className="search-footer" onClick={() => { navigate('/tasks'); setShowSearch(false); }}>
              <Search size={14} style={{ marginRight: 4 }} /> {t('viewAll') || 'Xem tất cả'} →
            </div>
          </div>
        )}
      </div>

      <div className="header-right">

        {/* ── NOTIFICATION BELL ── */}
        <div className="notification-wrapper" ref={dropdownRef}>
          <div className="icon-btn notification" onClick={() => setShowDropdown(!showDropdown)} style={{ position: 'relative' }}>
            <Bell size={20} color="#64748b" />
            {unreadCount > 0 && <span className="header-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </div>

          {showDropdown && (
            <div className="notification-dropdown">
              <div className="nd-header">
                <h3>{t('notifications')}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {unreadCount > 0 && <span className="nd-unread-badge">{unreadCount} {t('unread')}</span>}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      title={t('markAllRead') || 'Đánh dấu tất cả đã đọc'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#3b82f6', fontSize: '0.78rem', fontWeight: 600,
                        padding: '2px 6px', borderRadius: 6
                      }}
                    >
                      <CheckCheck size={13} /> {t('markAllRead') || 'Đọc hết'}
                    </button>
                  )}
                </div>
              </div>
              <div className="nd-list">
                {notifications.length === 0 ? (
                  <div className="nd-empty">{t('noNotifications')}</div>
                ) : notifications.map(notif => {
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
                        <Bell size={16} color={isRead ? '#94a3b8' : '#3b82f6'} />
                      </div>
                      <div className="nd-item-content">
                        <p>{message}</p>
                        <span>{formatTime(createdAt)}</span>
                      </div>
                      {!isRead && <div className="nd-unread-dot" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── USER MENU ── */}
        {isAuthenticated ? (
          <div className="user-dropdown-wrapper" ref={userDropdownRef} style={{ position: 'relative' }}>
            <div className="user-card" onClick={() => setShowUserDropdown(!showUserDropdown)} style={{ cursor: 'pointer' }}>
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Guest')}&background=random`}
                alt="User Avatar"
              />
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
                  borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px'
                }} className="ud-item hover-bg">
                  {t('profile') || 'Hồ sơ'}
                </div>
                <div onClick={async () => { setShowUserDropdown(false); await logout(); window.location.href = '/'; }} style={{
                  padding: '12px 16px', cursor: 'pointer', color: '#ef4444', fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', gap: '8px'
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