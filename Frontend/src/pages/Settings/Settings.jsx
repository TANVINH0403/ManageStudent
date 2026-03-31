import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  Globe,
  Palette,
  Monitor,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  // Quản lý tab đang mở (Mặc định mở tab General)
  const [activeTab, setActiveTab] = useState('general');

  // State lưu trữ các cấu hình
  const [settings, setSettings] = useState({
    language: 'vi',
    timezone: 'GMT+7',
    theme: 'light',
    emailNotif: true,
    pushNotif: false,
    weeklyReport: true,
  });

  // State cho form đổi mật khẩu
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSelectChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    alert("Đổi mật khẩu thành công!");
    setPasswords({ current: '', new: '', confirm: '' });
  };

  // --- CÁC COMPONENT CON (RENDER TỪNG TAB) ---

  const renderGeneral = () => (
    <div className="settings-section animate-fade-in">
      <div className="section-header">
        <h2>Cài Đặt Chung</h2>
        <p>Quản lý ngôn ngữ và khu vực của bạn.</p>
      </div>
      <div className="section-content">
        <div className="setting-group">
          <label>Ngôn ngữ hệ thống</label>
          <div className="setting-input-wrapper">
            <Globe size={18} className="input-icon" />
            <select name="language" value={settings.language} onChange={handleSelectChange}>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English (US)</option>
            </select>
          </div>
        </div>
        <div className="setting-group">
          <label>Múi giờ</label>
          <div className="setting-input-wrapper">
            <Clock size={18} className="input-icon" />
            <select name="timezone" value={settings.timezone} onChange={handleSelectChange}>
              <option value="GMT+7">Giờ Đông Dương (GMT+7)</option>
              <option value="GMT+8">Giờ Singapore (GMT+8)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="settings-section animate-fade-in">
      <div className="section-header">
        <h2>Giao Diện</h2>
        <p>Tùy chỉnh cách StudentManage hiển thị trên thiết bị của bạn.</p>
      </div>
      <div className="section-content">
        <div className="theme-options">
          <div
            className={`theme-card ${settings.theme === 'light' ? 'active' : ''}`}
            onClick={() => setSettings({...settings, theme: 'light'})}
          >
            <div className="theme-preview light-preview"><Sun size={24} color="#f59e0b"/></div>
            <p>Sáng (Light)</p>
          </div>
          <div
            className={`theme-card ${settings.theme === 'dark' ? 'active' : ''}`}
            onClick={() => setSettings({...settings, theme: 'dark'})}
          >
            <div className="theme-preview dark-preview"><Moon size={24} color="#60a5fa"/></div>
            <p>Tối (Dark)</p>
          </div>
          <div
            className={`theme-card ${settings.theme === 'system' ? 'active' : ''}`}
            onClick={() => setSettings({...settings, theme: 'system'})}
          >
            <div className="theme-preview system-preview"><Monitor size={24} color="#64748b"/></div>
            <p>Theo hệ thống</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="settings-section animate-fade-in">
      <div className="section-header">
        <h2>Bảo Mật & Mật Khẩu</h2>
        <p>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
      </div>
      <div className="section-content">
        <form className="password-form" onSubmit={handleSavePassword}>
          <div className="form-group">
            <label>Mật khẩu hiện tại</label>
            <input type="password" name="current" value={passwords.current} onChange={handlePasswordChange} required placeholder="Nhập mật khẩu cũ"/>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input type="password" name="new" value={passwords.new} onChange={handlePasswordChange} required placeholder="Mật khẩu mới"/>
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input type="password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} required placeholder="Nhập lại mật khẩu mới"/>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Cập Nhật Mật Khẩu</button>
          </div>
        </form>

        <div className="security-alert">
          <ShieldCheck size={20} color="#10b981" />
          <div className="alert-text">
            <h4>Bảo mật hai lớp (2FA)</h4>
            <p>Tài khoản của bạn hiện chưa bật xác thực hai bước. (Tính năng sắp ra mắt)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="settings-section animate-fade-in">
      <div className="section-header">
        <h2>Thông Báo</h2>
        <p>Chọn những thông tin bạn muốn nhận từ hệ thống.</p>
      </div>
      <div className="section-content">
        <div className="toggle-group">
          <div className="toggle-info">
            <h4>Thông báo qua Email</h4>
            <p>Nhận email nhắc nhở khi có deadline sắp tới.</p>
          </div>
          <button className={`toggle-btn ${settings.emailNotif ? 'on' : 'off'}`} onClick={() => handleToggle('emailNotif')}>
            <div className="toggle-circle"></div>
          </button>
        </div>

        <div className="toggle-group">
          <div className="toggle-info">
            <h4>Thông báo Đẩy (Push)</h4>
            <p>Nhận thông báo trực tiếp trên trình duyệt khi có cập nhật mới.</p>
          </div>
          <button className={`toggle-btn ${settings.pushNotif ? 'on' : 'off'}`} onClick={() => handleToggle('pushNotif')}>
            <div className="toggle-circle"></div>
          </button>
        </div>

        <div className="toggle-group">
          <div className="toggle-info">
            <h4>Báo cáo tuần</h4>
            <p>Gửi tóm tắt tiến độ công việc vào mỗi sáng Thứ Hai.</p>
          </div>
          <button className={`toggle-btn ${settings.weeklyReport ? 'on' : 'off'}`} onClick={() => handleToggle('weeklyReport')}>
            <div className="toggle-circle"></div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="title-area">
          <h1>Settings</h1>
          <p>Cấu hình hệ thống theo ý muốn của bạn.</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* MENU DỌC BÊN TRÁI */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <button className={`nav-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
              <SettingsIcon size={18} /> Cài đặt chung
            </button>
            <button className={`nav-btn ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>
              <Palette size={18} /> Giao diện
            </button>
            <button className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Lock size={18} /> Bảo mật & Mật khẩu
            </button>
            <button className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Bell size={18} /> Thông báo
            </button>
          </nav>
        </aside>

        {/* NỘI DUNG BÊN PHẢI */}
        <main className="settings-content-area">
          {activeTab === 'general' && renderGeneral()}
          {activeTab === 'appearance' && renderAppearance()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'notifications' && renderNotifications()}
        </main>
      </div>
    </div>
  );
};

// Component phụ mô phỏng icon Clock (do Lucide không export thẳng tên này đôi khi bị lỗi, tạo icon custom cho an toàn)
const Clock = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

export default Settings;