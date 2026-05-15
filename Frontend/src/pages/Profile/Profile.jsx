import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Mail, CalendarDays, Edit2,
  CheckCircle2, Clock, RefreshCw, CalendarClock,
  TrendingUp, Trophy, Link2, Globe, ExternalLink,
  Save, X, Plus, Trash2, User, AlertCircle, Loader, ShieldCheck, Send
} from 'lucide-react';
import { fetchProfile, updateProfile } from '../../redux/userSlice';
import { fetchTasks } from '../../redux/taskSlice';
import userApi from '../../api/userApi';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

/* ── GitHub SVG icon ── */
const GithubIcon = ({ size = 22, color = 'var(--text-main)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const DriveIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H.06c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="M43.65 25 29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.26 48.2c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H60.3l5.9 12.6z" fill="#ea4335"/>
    <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="M60.3 52.7H27.56L13.8 76.5c1.35.8 2.9 1.3 4.5 1.3h50.7c1.6 0 3.15-.5 4.5-1.3z" fill="#2684fc"/>
    <path d="M73.4 26.5l-12.65-21.9c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 60.3 52.7h27.44c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

const getLinksInit = (t) => [
  { id: 1, label: 'GitHub Repository', desc: t('githubDesc') || 'Kho lưu trữ mã nguồn và các dự án cá nhân.', url: 'https://github.com/', type: 'github' },
  { id: 2, label: t('portfolioTitle') || 'Portfolio Cá Nhân', desc: t('portfolioDesc') || 'Trang web hiển thị chi tiết các dự án và kỹ năng.', url: 'https://myportfolio.com', type: 'web' },
];

const renderLinkIcon = (type) => {
  if (type === 'github') return <GithubIcon size={22} color="var(--text-main)" />;
  if (type === 'drive')  return <DriveIcon size={22} />;
  return <Globe size={22} color="#3b82f6" />;
};

/* ── Avatar placeholder using initials ── */
const AvatarPlaceholder = ({ name, size = 90 }) => {
  const initials = (name ?? 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

const Profile = () => {
  const dispatch   = useDispatch();
  const { t }      = useTranslation();
  const { user, updateUserSession }   = useAuth();
  const tasks      = useSelector(s => s.tasks.items);
  const userState  = useSelector(s => s.user);
  const profile    = userState.profile;

  // Fetch profile and tasks on mount
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchTasks());
  }, [dispatch]);

  /* Edit profile state */
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm]   = useState({ username: '', email: '' });
  const [saveMsg, setSaveMsg]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [dialog, setDialog]       = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  const [avatarUploading, setAvatarUploading] = useState(false);
  // URL hiển thị ngay lập tức sau khi upload (trước khi refetch profile)
  const [localAvatar, setLocalAvatar] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Avatar hiển thị: ưu tiên localAvatar, rồi profile từ API
  const displayAvatar = !imgError && (
    localAvatar
    || (profile?.avatarUrl ? `http://localhost:5050${profile.avatarUrl}` : null)
    || user?.avatar
    || null
  );

  /* Avatar upload handler */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset imgError before new upload
    setImgError(false);
    // Hiển thị preview ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    setLocalAvatar(objectUrl);
    setAvatarUploading(true);
    try {
      const res = await userApi.uploadAvatar(file);
      const avatarUrl = res.data?.avatarUrl ?? res.avatarUrl;
      const fullUrl = `http://localhost:5050${avatarUrl}`;
      // Cập nhật AuthContext → Header cũng đổi
      updateUserSession({ avatar: fullUrl });
      setLocalAvatar(fullUrl);
      dispatch(fetchProfile());
    } catch (err) {
      setLocalAvatar(null); // rollback preview
      alert(err?.response?.data?.message || 'Upload thất bại. API có thể chưa khởi động.');
    } finally {
      setAvatarUploading(false);
    }
  };

  /* Email OTP state */
  const [otpStep, setOtpStep]     = useState('idle');  // 'idle' | 'newEmail' | 'verifyOtp'
  const [newEmailInput, setNewEmailInput] = useState('');
  const [otpInput, setOtpInput]   = useState('');
  const [otpMsg, setOtpMsg]       = useState(null);    // {type:'success'|'error', text}
  const [otpLoading, setOtpLoading] = useState(false);

  /* Links state */
  const [links, setLinks]               = useState(() => getLinksInit(t));
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [editLinksForm, setEditLinksForm]   = useState([]);

  /* Task stats */
  const completed  = tasks.filter(t => t.status === 'Completed').length;
  const pending    = tasks.filter(t => t.status === 'Pending' || t.status === 'Todo').length;
  const inProgress = tasks.filter(t => t.status === 'InProgress' || t.status === 'In Progress').length;
  const upcoming   = tasks.filter(t => {
    const d   = new Date(t.deadline ?? t.dueDate);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const stats = [
    { value: completed,  label: t('tasksCompleted'),  icon: <CheckCircle2 size={20} color="#10b981" />, bg: '#dcfce7' },
    { value: pending,    label: t('tasksPending'), icon: <Clock size={20} color="#f59e0b" />,        bg: '#fef3c7' },
    { value: inProgress, label: t('tasksInProgress'), icon: <RefreshCw size={20} color="#3b82f6" />,   bg: '#dbeafe' },
    { value: upcoming,   label: t('upcomingDeadline'),    icon: <CalendarClock size={20} color="#8b5cf6" />, bg: '#ede9fe' },
  ];

  /* Handlers */
  const startEditProfile = () => {
    setEditForm({
      username: user?.username ?? profile?.username ?? '',
      email: user?.email ?? profile?.email ?? ''
    });
    setSaveMsg(null);
    setIsEditingProfile(true);
  };

  const saveProfile = async () => {
    const currentUsername = user?.username ?? profile?.username;
    const currentEmail    = user?.email    ?? profile?.email;
    const isUsernameChanged = editForm.username !== currentUsername;
    const isEmailChanged    = editForm.email    !== currentEmail;

    if (!isUsernameChanged && !isEmailChanged) {
      setIsEditingProfile(false);
      return;
    }

    if (isUsernameChanged) {
      setDialog({
        isOpen: true, type: 'confirm',
        title: 'Xác nhận cập nhật',
        message: isEmailChanged ? 'Bạn có chắc chắn muốn cập nhật tên đăng nhập và xác minh email mới không?' : 'Bạn có chắc chắn muốn thay đổi tên đăng nhập không?',
        onConfirm: async () => { 
          const success = await executeSaveProfile(); 
          if (success && isEmailChanged) launchOtpFlow();
        }
      });
    } else {
      launchOtpFlow();
    }
  };

  const launchOtpFlow = async () => {
    setNewEmailInput(editForm.email);
    setOtpStep('verifyOtp');
    setIsEditingProfile(false);
    setOtpLoading(true); setOtpMsg(null);
    try {
      await userApi.requestEmailChange(editForm.email);
      setOtpMsg({ type: 'success', text: `Mã OTP đã gửi đến ${editForm.email}. Kiểm tra hộp thư!` });
    } catch (err) {
      setOtpMsg({ type: 'error', text: err?.response?.data?.message ?? 'Lỗi gửi OTP.' });
    }
    setOtpLoading(false);
  };

  /* OTP Email Change Handlers */
  const handleRequestOtp = async () => {
    if (!newEmailInput.trim()) return;
    setOtpLoading(true); setOtpMsg(null);
    try {
      await userApi.requestEmailChange(newEmailInput.trim());
      setOtpMsg({ type: 'success', text: `Mã OTP đã gửi đến ${newEmailInput}. Kiểm tra hộp thư!` });
      setOtpStep('verifyOtp');
    } catch (err) {
      setOtpMsg({ type: 'error', text: err?.response?.data?.message ?? 'Lỗi gửi OTP.' });
    }
    setOtpLoading(false);
  };

  const handleConfirmOtp = async () => {
    if (!otpInput.trim()) return;
    setOtpLoading(true); setOtpMsg(null);
    try {
      await userApi.confirmEmailChange(otpInput.trim());
      setOtpMsg({ type: 'success', text: 'Email đã được cập nhật thành công!' });
      updateUserSession({ email: newEmailInput });
      dispatch(fetchProfile());
      setTimeout(() => { setOtpStep('idle'); setOtpInput(''); setNewEmailInput(''); setOtpMsg(null); }, 2500);
    } catch (err) {
      setOtpMsg({ type: 'error', text: err?.response?.data?.message ?? 'Mã OTP không đúng.' });
    }
    setOtpLoading(false);
  };

  const cancelOtp = () => { setOtpStep('idle'); setOtpInput(''); setNewEmailInput(''); setOtpMsg(null); };

  const executeSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    // Only send username (email changes require OTP)
    const payload = { username: editForm.username };
    const result = await dispatch(updateProfile(payload));
    setSaving(false);
    if (result.type?.endsWith('/fulfilled')) {
      setSaveMsg({ type: 'success', text: t('catUpdateSuccess') || 'Thành công' });
      updateUserSession({ username: editForm.username });
      setIsEditingProfile(false);
      setTimeout(() => setSaveMsg(null), 3000);
      return true;
    } else {
      setSaveMsg({ type: 'error', text: result.payload ?? t('errorOccurred') });
      return false;
    }
  };

  const cancelProfile = () => { setIsEditingProfile(false); setSaveMsg(null); };

  const startEditLinks = () => { setEditLinksForm([...links]); setIsEditingLinks(true); };
  const saveLinks = () => {
    setLinks(editLinksForm.filter(l => l.label.trim() && l.url.trim()));
    setIsEditingLinks(false);
  };
  const cancelLinks = () => setIsEditingLinks(false);
  const handleLinkChange = (id, field, value) =>
    setEditLinksForm(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  const addLink = () =>
    setEditLinksForm([...editLinksForm, { id: Date.now(), label: '', desc: '', url: '', type: 'web' }]);
  const removeLink = (id) => setEditLinksForm(prev => prev.filter(l => l.id !== id));

  /* ── Loading / Error states ── */
  if (userState.loading && !profile) {
    return (
      <div className="profile-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Loader size={32} className="spin" color="#7c3aed" />
      </div>
    );
  }

  const displayName  = user?.username ?? profile?.username ?? 'Student';
  const displayEmail = user?.email ?? profile?.email ?? '—';

  return (
    <div className="profile-page">
      {/* ── CUSTOM DIALOG ── */}
      {dialog.isOpen && (
        <div className="overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'var(--sidebar-bg)', padding: '24px 28px', borderRadius: '16px', width: '420px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700 }}>{dialog.title}</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.6 }}>{dialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {dialog.type === 'confirm' && (
                <button className="btn-outline" onClick={() => setDialog({ isOpen: false })} style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}>{t('cancel')}</button>
              )}
              <button className="btn-primary" onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); setDialog({ isOpen: false }); }} style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 600, background: '#7c3aed', color: 'white', border: 'none' }}>
                {t('okBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── OTP EMAIL CHANGE MODAL ── */}
      {otpStep !== 'idle' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--sidebar-bg)', padding: '32px 28px', borderRadius: '20px', width: '460px', maxWidth: '95%', boxShadow: '0 20px 60px rgba(124,58,237,0.2)', border: '1px solid #e9d5ff' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#ede9fe', borderRadius: '50%', padding: 10, display: 'flex' }}>
                <ShieldCheck size={24} color="#7c3aed" />
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700 }}>Xác minh đổi Email</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  {otpStep === 'newEmail' ? 'Nhập email mới' : `Mã OTP đã gửi đến ${newEmailInput}`}
                </p>
              </div>
            </div>

            {/* Step 1: Enter new email */}
            {otpStep === 'newEmail' && (
              <>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Email mới</label>
                <input
                  type="email" value={newEmailInput}
                  onChange={e => setNewEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRequestOtp()}
                  placeholder="ten@example.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
                  autoFocus
                />
              </>
            )}

            {/* Step 2: Enter OTP */}
            {otpStep === 'verifyOtp' && (
              <>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Mã OTP (6 số)</label>
                <input
                  type="text" value={otpInput} maxLength={6}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleConfirmOtp()}
                  placeholder="_ _ _ _ _ _"
                  style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '1.6rem', fontWeight: 900, letterSpacing: 10, textAlign: 'center', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
                  autoFocus
                />
                <button
                  type="button" onClick={() => { setOtpStep('newEmail'); setOtpInput(''); setOtpMsg(null); }}
                  style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.85rem', padding: 0, marginBottom: 16 }}
                >
                  ↺ Gửi lại mã OTP
                </button>
              </>
            )}

            {/* Messages */}
            {otpMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: '0.9rem', fontWeight: 500,
                background: otpMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                color:      otpMsg.type === 'success' ? '#166534' : '#991b1b' }}>
                {otpMsg.type === 'success' ? <CheckCircle2 size={16} style={{ marginRight: 4 }} /> : <X size={16} style={{ marginRight: 4 }} />}
                {otpMsg.text}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={cancelOtp} disabled={otpLoading}
                style={{ padding: '9px 20px', borderRadius: 10, fontWeight: 600, border: '1.5px solid #e2e8f0', background: 'transparent', cursor: 'pointer' }}>
                Hủy
              </button>
              <button
                onClick={otpStep === 'newEmail' ? handleRequestOtp : handleConfirmOtp}
                disabled={otpLoading || (otpStep === 'newEmail' ? !newEmailInput.trim() : otpInput.length < 6)}
                style={{ padding: '9px 22px', borderRadius: 10, fontWeight: 700, background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: otpLoading ? 0.7 : 1 }}>
                {otpLoading ? <Loader size={16} className="spin" /> : <Send size={16} />}
                {otpStep === 'newEmail' ? 'Gửi mã OTP' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-layout">

        {/* ── LEFT CARD ── */}
        <div className={`profile-left-card ${isEditingProfile ? 'editing' : ''}`}>

          {!isEditingProfile && (
            <button className="btn-edit-top" onClick={startEditProfile} title={t('editProfile')}>
              <Edit2 size={16} />
            </button>
          )}

          {/* Avatar */}
          <div className="profile-avatar-wrap" style={{ position: 'relative' }}>
            {/* Hiển thị avatar thực hoặc placeholder */}
            {displayAvatar
              ? (
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  style={{
                    width: 90, height: 90, borderRadius: '50%',
                    objectFit: 'cover', border: '3px solid #7c3aed',
                    flexShrink: 0,
                  }}
                  onError={() => setImgError(true)}
                />
              )
              : <AvatarPlaceholder name={displayName} size={90} />
            }
            {/* Nút upload avatar — luôn hiển */}
            <label style={{
              position: 'absolute', bottom: 0, right: 0, background: '#7c3aed', color: 'white',
              borderRadius: '50%', padding: 6, cursor: avatarUploading ? 'wait' : 'pointer',
              display: 'flex', boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
              opacity: avatarUploading ? 0.7 : 1,
            }} title="Cập nhật ảnh đại diện">
              {avatarUploading
                ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
                : <Edit2 size={12} />}
              <input
                type="file"
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={avatarUploading}
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          {/* Name & Title */}
          {isEditingProfile ? (
            <div className="profile-edit-group">
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{t('usernameLabel')}</label>
              <input
                type="text" className="edit-input name-input"
                value={editForm.username}
                onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                placeholder={t('usernameLabel')}
              />
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: 8 }}>{t('emailLabel')}</label>
              <input
                type="email" className="edit-input"
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                placeholder={t('emailLabel')}
              />
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Sẽ gửi OTP để xác minh nếu đổi Email</p>
              {saveMsg && (
                <div className={`profile-msg ${saveMsg.type}`}>
                  {saveMsg.type === 'success' ? <CheckCircle2 size={16} style={{ marginRight: 4 }} /> : <X size={16} style={{ marginRight: 4 }} />}
                  {saveMsg.text}
                </div>
              )}
            </div>
          ) : (
            <>
              <h2 className="profile-name">{displayName}</h2>
              <p className="profile-title">{t('studentRole')}</p>
            </>
          )}

          {/* Contact */}
          <div className="profile-contact-list">
            <div className="contact-item">
              <Mail size={16} color="#94a3b8" />
              <span>{displayEmail}</span>
            </div>
            <div className="contact-item">
              <User size={16} color="#94a3b8" />
              <span>{displayName}</span>
            </div>
          </div>

          {/* Joined */}
          {!isEditingProfile && (
            <div className="profile-section">
              <h4 className="section-label">{t('memberOf')}</h4>
              <div className="joined-row">
                <CalendarDays size={16} color="#94a3b8" />
                <span className="joined-date">StudentManage</span>
              </div>
              <p className="joined-sub">{t('systemDesc')}</p>
            </div>
          )}

          {/* Actions */}
          {isEditingProfile && (
            <div className="profile-actions">
              <button className="btn-cancel" onClick={cancelProfile} disabled={saving}>
                <X size={16} /> {t('cancel')}
              </button>
              <button className="btn-save" onClick={saveProfile} disabled={saving}>
                <Save size={16} /> {saving ? t('saving') : t('saveBtn')}
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="profile-right-col">

          {/* Stats */}
          <div className="profile-card">
            <div className="card-section-header">
              <Trophy size={18} color="#7c3aed" />
              <h3>{t('achievements')}</h3>
            </div>
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-trend">
                    <TrendingUp size={12} color="#10b981" />
                    <span>{t('fromRealData')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="profile-card">
            <div className="card-section-header header-with-action">
              <div className="header-title-wrap">
                <Link2 size={18} color="#7c3aed" />
                <h3>{t('linksAndDocs')}</h3>
              </div>
              {!isEditingLinks && (
                <button className="btn-edit-links" onClick={startEditLinks}>
                  <Edit2 size={15} /> {t('edit')}
                </button>
              )}
            </div>

            {isEditingLinks ? (
              <div className="links-edit-mode">
                <div className="links-edit-list">
                  {editLinksForm.map(link => (
                    <div key={link.id} className="link-edit-item">
                      <div className="link-edit-fields">
                        <input type="text" placeholder={t('linkName')} value={link.label} onChange={e => handleLinkChange(link.id, 'label', e.target.value)} />
                        <input type="text" placeholder={t('linkUrl')} value={link.url} onChange={e => handleLinkChange(link.id, 'url', e.target.value)} />
                        <input type="text" placeholder={t('linkDesc')} value={link.desc} onChange={e => handleLinkChange(link.id, 'desc', e.target.value)} />
                        <select value={link.type} onChange={e => handleLinkChange(link.id, 'type', e.target.value)}>
                          <option value="web">Web Icon</option>
                          <option value="github">GitHub Icon</option>
                          <option value="drive">Drive Icon</option>
                        </select>
                      </div>
                      <button className="btn-remove-link" onClick={() => removeLink(link.id)}><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
                <div className="links-edit-actions">
                  <button className="btn-add-link" onClick={addLink}><Plus size={16} /> {t('addLink')}</button>
                  <div className="action-group">
                    <button className="btn-cancel" onClick={cancelLinks}>{t('cancel')}</button>
                    <button className="btn-save" onClick={saveLinks}>{t('saveChanges')}</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="links-list">
                {links.length > 0 ? links.map(link => (
                  <div key={link.id} className="link-item">
                    <div className="link-info">
                      <h4>{link.label}</h4>
                      <p>{link.desc}</p>
                      <a href={link.url} target="_blank" rel="noreferrer" className="link-url">{link.url}</a>
                    </div>
                    <div className="link-actions">
                      <span className="link-icon-wrap">{renderLinkIcon(link.type)}</span>
                      <a href={link.url} target="_blank" rel="noreferrer" className="link-ext-btn">
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                )) : (
                  <p className="empty-links-text">{t('noLinks')}</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;