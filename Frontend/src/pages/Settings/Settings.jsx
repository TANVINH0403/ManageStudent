import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings2, Monitor, Lock, Bell, Globe, Clock, Calendar,
  Save, ChevronDown, Home, ChevronRight, Check,
  Sun, Moon, Contrast, Eye, EyeOff, Shield, Smartphone
} from 'lucide-react';
import './Settings.css';

/* ── Tab definitions ── */
const TABS = [
  {
    key: 'general',
    label: 'Cài đặt chung',
    sub: 'Ngôn ngữ, múi giờ và các thiết lập cơ bản',
    icon: Settings2,
  },
  {
    key: 'appearance',
    label: 'Giao diện',
    sub: 'Tùy chỉnh giao diện hiển thị',
    icon: Monitor,
  },
  {
    key: 'security',
    label: 'Bảo mật & Mật khẩu',
    sub: 'Đổi mật khẩu và cài đặt bảo mật',
    icon: Lock,
  },
  {
    key: 'notifications',
    label: 'Thông báo',
    sub: 'Quản lý thông báo hệ thống',
    icon: Bell,
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  /* General settings state */
  const [general, setGeneral] = useState({
    language: 'vi', timezone: 'Asia/Ho_Chi_Minh', dateFormat: 'dd/mm/yyyy',
  });

  /* Appearance state */
  const [theme, setTheme]     = useState('light');
  const [density, setDensity] = useState('comfortable');
  const [fontSize, setFontSize] = useState('medium');

  /* Security state */
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow]       = useState({ current: false, next: false, confirm: false });
  const [twoFA, setTwoFA]     = useState(false);

  /* Notifications state */
  const [notifs, setNotifs] = useState({
    deadlineReminder: true,
    newTask: true,
    weeklyReport: false,
    email: false,
  });

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ── Render tab content ── */
  const renderContent = () => {
    switch (activeTab) {
      /* ── GENERAL ── */
      case 'general': return (
        <div className="set-content">
          <div className="set-content-header">
            <div>
              <h2>Cài Đặt Chung</h2>
              <p>Quản lý ngôn ngữ và khu vực của bạn.</p>
            </div>
            <div className="set-illus">
              <Settings2 size={64} color="#c4b5fd" strokeWidth={1} />
            </div>
          </div>

          <div className="set-field">
            <label><Globe size={15} /> Ngôn ngữ hệ thống</label>
            <p className="set-field-sub">Chọn ngôn ngữ bạn muốn sử dụng trong hệ thống.</p>
            <div className="set-select-wrap">
              <select value={general.language} onChange={e => setGeneral({ ...general, language: e.target.value })}>
                <option value="vi">🌐  Tiếng Việt</option>
                <option value="en">🌐  English</option>
                <option value="ja">🌐  日本語</option>
              </select>
              <ChevronDown size={16} className="select-arrow" />
            </div>
          </div>

          <div className="set-field">
            <label><Clock size={15} /> Múi giờ</label>
            <p className="set-field-sub">Chọn múi giờ phù hợp với khu vực của bạn.</p>
            <div className="set-select-wrap">
              <select value={general.timezone} onChange={e => setGeneral({ ...general, timezone: e.target.value })}>
                <option value="Asia/Ho_Chi_Minh">⏱  Giờ Đông Dương (GMT+7)</option>
                <option value="Asia/Bangkok">⏱  Giờ Bangkok (GMT+7)</option>
                <option value="Asia/Tokyo">⏱  Giờ Tokyo (GMT+9)</option>
                <option value="UTC">⏱  UTC (GMT+0)</option>
              </select>
              <ChevronDown size={16} className="select-arrow" />
            </div>
          </div>

          <div className="set-field">
            <label><Calendar size={15} /> Định dạng ngày</label>
            <p className="set-field-sub">Chọn định dạng hiển thị ngày tháng.</p>
            <div className="set-select-wrap">
              <select value={general.dateFormat} onChange={e => setGeneral({ ...general, dateFormat: e.target.value })}>
                <option value="dd/mm/yyyy">📅  dd/mm/yyyy (31/12/2024)</option>
                <option value="mm/dd/yyyy">📅  mm/dd/yyyy (12/31/2024)</option>
                <option value="yyyy-mm-dd">📅  yyyy-mm-dd (2024-12-31)</option>
              </select>
              <ChevronDown size={16} className="select-arrow" />
            </div>
          </div>
        </div>
      );

      /* ── APPEARANCE ── */
      case 'appearance': return (
        <div className="set-content">
          <div className="set-content-header">
            <div>
              <h2>Giao Diện</h2>
              <p>Tùy chỉnh giao diện theo sở thích của bạn.</p>
            </div>
            <div className="set-illus"><Monitor size={64} color="#c4b5fd" strokeWidth={1} /></div>
          </div>

          <div className="set-field">
            <label><Sun size={15} /> Chế độ hiển thị</label>
            <p className="set-field-sub">Chọn giao diện sáng hoặc tối.</p>
            <div className="theme-options">
              {[
                { value: 'light', Icon: Sun,      label: 'Sáng'  },
                { value: 'dark',  Icon: Moon,     label: 'Tối'   },
                { value: 'auto',  Icon: Contrast, label: 'Tự động' },
              ].map(({ value, Icon, label }) => (
                <button key={value}
                  className={`theme-option ${theme === value ? 'active' : ''}`}
                  onClick={() => setTheme(value)}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                  {theme === value && <Check size={14} className="theme-check" />}
                </button>
              ))}
            </div>
          </div>

          <div className="set-field">
            <label>Mật độ hiển thị</label>
            <p className="set-field-sub">Điều chỉnh khoảng cách giữa các phần tử.</p>
            <div className="density-options">
              {['compact','comfortable','spacious'].map(d => (
                <button key={d}
                  className={`density-btn ${density === d ? 'active' : ''}`}
                  onClick={() => setDensity(d)}
                >
                  {d === 'compact' ? 'Thu gọn' : d === 'comfortable' ? 'Thoải mái' : 'Rộng rãi'}
                </button>
              ))}
            </div>
          </div>

          <div className="set-field">
            <label>Cỡ chữ</label>
            <p className="set-field-sub">Chọn cỡ chữ phù hợp.</p>
            <div className="density-options">
              {['small','medium','large'].map(f => (
                <button key={f}
                  className={`density-btn ${fontSize === f ? 'active' : ''}`}
                  onClick={() => setFontSize(f)}
                >
                  {f === 'small' ? 'Nhỏ' : f === 'medium' ? 'Vừa' : 'Lớn'}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      /* ── SECURITY ── */
      case 'security': return (
        <div className="set-content">
          <div className="set-content-header">
            <div><h2>Bảo Mật &amp; Mật Khẩu</h2><p>Bảo vệ tài khoản của bạn.</p></div>
            <div className="set-illus"><Shield size={64} color="#c4b5fd" strokeWidth={1} /></div>
          </div>

          {['current','next','confirm'].map((field, i) => (
            <div className="set-field" key={field}>
              <label>{i === 0 ? 'Mật khẩu hiện tại' : i === 1 ? 'Mật khẩu mới' : 'Xác nhận mật khẩu mới'}</label>
              <div className="pwd-input-wrap">
                <input
                  type={show[field] ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={pwdForm[field]}
                  onChange={e => setPwdForm({ ...pwdForm, [field]: e.target.value })}
                />
                <button type="button" className="pwd-toggle" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}>
                  {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          <div className="set-field">
            <div className="toggle-row">
              <div>
                <label><Smartphone size={15} /> Xác thực 2 bước</label>
                <p className="set-field-sub">Tăng cường bảo mật với xác thực 2 yếu tố.</p>
              </div>
              <button className={`toggle-switch ${twoFA ? 'on' : ''}`} onClick={() => setTwoFA(v => !v)}>
                <span className="toggle-knob" />
              </button>
            </div>
          </div>
        </div>
      );

      /* ── NOTIFICATIONS ── */
      case 'notifications': return (
        <div className="set-content">
          <div className="set-content-header">
            <div><h2>Thông Báo</h2><p>Quản lý cách hệ thống thông báo cho bạn.</p></div>
            <div className="set-illus"><Bell size={64} color="#c4b5fd" strokeWidth={1} /></div>
          </div>

          {[
            { key: 'deadlineReminder', label: 'Nhắc nhở deadline',    sub: 'Nhận thông báo khi deadline sắp đến.' },
            { key: 'newTask',          label: 'Công việc mới',         sub: 'Thông báo khi có task được tạo mới.' },
            { key: 'weeklyReport',     label: 'Báo cáo hàng tuần',     sub: 'Nhận tổng kết công việc mỗi tuần.'  },
            { key: 'email',            label: 'Thông báo qua Email',   sub: 'Gửi thông báo đến email của bạn.'   },
          ].map(({ key, label, sub }) => (
            <div className="set-field" key={key}>
              <div className="toggle-row">
                <div>
                  <label>{label}</label>
                  <p className="set-field-sub">{sub}</p>
                </div>
                <button
                  className={`toggle-switch ${notifs[key] ? 'on' : ''}`}
                  onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
          ))}
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="settings-page">
      {/* ── HEADER ── */}
      <div className="set-page-header">
        <div>
          <div className="set-breadcrumb">
            <span className="bc-link" onClick={() => navigate('/')}>
              <Home size={13} /> Trang chủ
            </span>
            <ChevronRight size={13} />
            <span className="bc-active">Settings</span>
          </div>
          <h1>Settings</h1>
          <p>Cấu hình hệ thống theo ý muốn của bạn.</p>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="set-layout">

        {/* LEFT NAV */}
        <div className="set-nav-panel">
          {TABS.map(({ key, label, sub, icon: Icon }) => (
            <button key={key}
              className={`set-nav-item ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <div className="set-nav-icon-wrap">
                <Icon size={18} />
              </div>
              <div className="set-nav-text">
                <span className="set-nav-label">{label}</span>
                <span className="set-nav-sub">{sub}</span>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div className="set-right-panel">
          {renderContent()}

          {/* Save button */}
          <div className="set-footer">
            <button className={`set-save-btn ${saved ? 'saved' : ''}`} onClick={handleSave}>
              {saved ? <><Check size={16} /> Đã lưu!</> : <><Save size={16} /> Lưu thay đổi</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;