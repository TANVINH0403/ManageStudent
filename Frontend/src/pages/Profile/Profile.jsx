import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Mail, Phone, MapPin, CalendarDays, Edit2, Camera,
  CheckCircle2, Clock, RefreshCw, CalendarClock,
  TrendingUp, Trophy, Link2, Globe, ExternalLink,
  Save, X, Plus, Trash2
} from 'lucide-react';
import './Profile.css';

/* ── GitHub SVG icon (official mark) ── */
const GithubIcon = ({ size = 22, color = '#1e293b' }) => (
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

/* ── Static data ── */
const PROFILE_INIT = {
  name: 'Student',
  title: 'Sinh viên IT - Năm 3',
  bio: 'Đam mê lập trình Frontend, thích thiết kế UI/UX và tối ưu hóa trải nghiệm người dùng. Luôn sẵn sàng học hỏi công nghệ mới và hoàn thiện bản thân.',
  email: 'student@example.com',
  phone: '0123 456 789',
  location: 'TP. Hồ Chí Minh, Việt Nam',
  joined: '01/09/2023',
  avatar: 'https://i.pravatar.cc/150?u=student_pro',
};

const LINKS_INIT = [
  { id: 1, label: 'GitHub Repository', desc: 'Kho lưu trữ mã nguồn và các dự án cá nhân.', url: 'https://github.com/student-pro', type: 'github' },
  { id: 2, label: 'Portfolio Cá Nhân', desc: 'Dự án, kỹ năng và thông tin về bản thân.', url: 'https://myportfolio.com', type: 'web' },
  { id: 3, label: 'Google Drive', desc: 'Tài liệu học tập và các file quan trọng.', url: 'https://drive.google.com/drive/u/0/my-drive', type: 'drive' },
];

const renderLinkIcon = (type) => {
  if (type === 'github') return <GithubIcon size={22} color="#1e293b" />;
  if (type === 'drive') return <DriveIcon size={22} />;
  return <Globe size={22} color="#3b82f6" />;
};

const Profile = () => {
  const tasks = useSelector(s => s.tasks.items);

  /* Profile state */
  const [profile, setProfile] = useState(PROFILE_INIT);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(PROFILE_INIT);

  /* Links state */
  const [links, setLinks] = useState(LINKS_INIT);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [editLinksForm, setEditLinksForm] = useState([]);

  /* Stats */
  const completed   = tasks.filter(t => t.status === 'Completed').length;
  const pending     = tasks.filter(t => t.status === 'Pending').length;
  const inProgress  = tasks.filter(t => t.status === 'In Progress').length;
  const upcoming    = tasks.filter(t => {
    const d = new Date(t.deadline);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const stats = [
    { value: completed,  label: 'Task đã hoàn thành',   trend: '+25%', icon: <CheckCircle2 size={20} color="#10b981" />, bg: '#dcfce7' },
    { value: pending,    label: 'Task đang chờ xử lý',  trend: '+10%', icon: <Clock size={20} color="#f59e0b" />,        bg: '#fef3c7' },
    { value: inProgress, label: 'Task đang thực hiện',  trend: '+5%',  icon: <RefreshCw size={20} color="#3b82f6" />,   bg: '#dbeafe' },
    { value: upcoming,   label: 'Deadline sắp tới',     trend: '+15%', icon: <CalendarClock size={20} color="#8b5cf6" />, bg: '#ede9fe' },
  ];

  /* Handlers */
  const startEditProfile = () => {
    setEditForm(profile);
    setIsEditingProfile(true);
  };
  const saveProfile = () => {
    setProfile(editForm);
    setIsEditingProfile(false);
  };
  const cancelProfile = () => setIsEditingProfile(false);

  const startEditLinks = () => {
    setEditLinksForm([...links]);
    setIsEditingLinks(true);
  };
  const saveLinks = () => {
    setLinks(editLinksForm.filter(l => l.label.trim() && l.url.trim()));
    setIsEditingLinks(false);
  };
  const cancelLinks = () => setIsEditingLinks(false);

  const handleLinkChange = (id, field, value) => {
    setEditLinksForm(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };
  const addLink = () => {
    setEditLinksForm([...editLinksForm, { id: Date.now(), label: '', desc: '', url: '', type: 'web' }]);
  };
  const removeLink = (id) => {
    setEditLinksForm(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="profile-page">
      <div className="profile-layout">

        {/* ── LEFT CARD ── */}
        <div className={`profile-left-card ${isEditingProfile ? 'editing' : ''}`}>
          
          {/* Edit Toggle Button */}
          {!isEditingProfile && (
            <button className="btn-edit-top" onClick={startEditProfile} title="Chỉnh sửa hồ sơ">
              <Edit2 size={16} />
            </button>
          )}

          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <img src={profile.avatar} alt="avatar" className="profile-avatar" />
            {isEditingProfile && <button className="avatar-camera-btn"><Camera size={14} /></button>}
          </div>

          {/* Name & Title */}
          {isEditingProfile ? (
            <div className="profile-edit-group">
              <input type="text" className="edit-input name-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Họ và tên" />
              <input type="text" className="edit-input title-input" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Chức danh" />
            </div>
          ) : (
            <>
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-title">{profile.title}</p>
            </>
          )}

          {/* Bio */}
          <div className="profile-section">
            <div className="section-row">
              <h4 className="section-label">Giới thiệu</h4>
            </div>
            {isEditingProfile ? (
              <textarea rows={4} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="edit-textarea" placeholder="Viết vài dòng giới thiệu về bản thân..." />
            ) : (
              <p className="bio-text">{profile.bio || 'Chưa có thông tin giới thiệu.'}</p>
            )}
          </div>

          {/* Contact info */}
          <div className="profile-contact-list">
            <div className="contact-item">
              <Mail size={16} color="#94a3b8" />
              {isEditingProfile ? (
                <input type="email" className="edit-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email" />
              ) : (<span>{profile.email || '—'}</span>)}
            </div>
            <div className="contact-item">
              <Phone size={16} color="#94a3b8" />
              {isEditingProfile ? (
                <input type="text" className="edit-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Số điện thoại" />
              ) : (<span>{profile.phone || '—'}</span>)}
            </div>
            <div className="contact-item">
              <MapPin size={16} color="#94a3b8" />
              {isEditingProfile ? (
                <input type="text" className="edit-input" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="Vị trí" />
              ) : (<span>{profile.location || '—'}</span>)}
            </div>
          </div>

          {/* Joined */}
          {!isEditingProfile && (
            <div className="profile-section">
              <h4 className="section-label">Tham gia từ</h4>
              <div className="joined-row">
                <CalendarDays size={16} color="#94a3b8" />
                <span className="joined-date">{profile.joined}</span>
              </div>
              <p className="joined-sub">Hơn 1 năm đồng hành cùng bạn</p>
            </div>
          )}

          {/* Save/Cancel Actions */}
          {isEditingProfile && (
            <div className="profile-actions">
              <button className="btn-cancel" onClick={cancelProfile}><X size={16} /> Hủy</button>
              <button className="btn-save" onClick={saveProfile}><Save size={16} /> Lưu</button>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="profile-right-col">

          {/* Thành tựu */}
          <div className="profile-card">
            <div className="card-section-header">
              <Trophy size={18} color="#7c3aed" />
              <h3>Thành Tựu Công Việc</h3>
            </div>
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon-wrap" style={{ background: s.bg }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-trend">
                    <TrendingUp size={12} color="#10b981" />
                    <span>{s.trend} so với tháng trước</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liên kết & Tài liệu */}
          <div className="profile-card">
            <div className="card-section-header header-with-action">
              <div className="header-title-wrap">
                <Link2 size={18} color="#7c3aed" />
                <h3>Liên kết &amp; Tài liệu</h3>
              </div>
              {!isEditingLinks && (
                <button className="btn-edit-links" onClick={startEditLinks}>
                  <Edit2 size={15} /> Chỉnh sửa
                </button>
              )}
            </div>

            {isEditingLinks ? (
              <div className="links-edit-mode">
                <div className="links-edit-list">
                  {editLinksForm.map(link => (
                    <div key={link.id} className="link-edit-item">
                      <div className="link-edit-fields">
                        <input type="text" placeholder="Tên liên kết (VD: GitHub)" value={link.label} onChange={e => handleLinkChange(link.id, 'label', e.target.value)} />
                        <input type="text" placeholder="Đường dẫn URL" value={link.url} onChange={e => handleLinkChange(link.id, 'url', e.target.value)} />
                        <input type="text" placeholder="Mô tả ngắn" value={link.desc} onChange={e => handleLinkChange(link.id, 'desc', e.target.value)} />
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
                  <button className="btn-add-link" onClick={addLink}><Plus size={16} /> Thêm liên kết</button>
                  <div className="action-group">
                    <button className="btn-cancel" onClick={cancelLinks}>Hủy</button>
                    <button className="btn-save" onClick={saveLinks}>Lưu thay đổi</button>
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
                  <p className="empty-links-text">Chưa có liên kết nào. Hãy thêm vào nhé!</p>
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