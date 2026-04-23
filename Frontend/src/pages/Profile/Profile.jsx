import React, { useState, useRef } from 'react';
import { mockUser, mockTasks } from '../../data/mockData';
import { Camera, Mail, Phone, MapPin, Link as LinkIcon, Edit3, Award, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const completedTasks = mockTasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = mockTasks.filter(t => t.status !== 'Completed').length;

  const [isEditing, setIsEditing] = useState(false);

  // State quản lý Avatar
  const [avatar, setAvatar] = useState(mockUser.avatar);
  const fileInputRef = useRef(null); // Ref để trigger thẻ input file ẩn

  // State quản lý thông tin chung
  const [profileData, setProfileData] = useState({
    username: mockUser.username,
    role: 'Sinh viên IT - Năm 3',
    bio: 'Đam mê lập trình Frontend, thích thiết kế UI/UX và tối ưu hóa trải nghiệm người dùng. Luôn sẵn sàng học hỏi công nghệ mới.',
    email: mockUser.email,
    phone: '0123 456 789',
    location: 'TP. Hồ Chí Minh',
  });

  // State quản lý danh sách Link (Dynamic Array)
  const [links, setLinks] = useState([
    { id: 1, name: 'GitHub Repository', url: 'https://github.com/student-pro' },
    { id: 2, name: 'Portfolio Cá Nhân', url: 'https://myportfolio.com' }
  ]);

  // --- CÁC HÀM XỬ LÝ TƯƠNG TÁC ---

  // 1. Xử lý đổi Avatar
  const handleCameraClick = () => {
    fileInputRef.current.click(); // Mở cửa sổ chọn file của máy tính
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL tạm thời để hiển thị ảnh ngay lập tức mà chưa cần upload lên server
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  // 2. Xử lý đổi Text
  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // 3. Xử lý phần Links
  const handleAddLink = () => {
    const newLink = { id: Date.now(), name: '', url: '' };
    setLinks([...links, newLink]);
    setIsEditing(true); // Bật chế độ sửa nếu đang tắt
  };

  const handleUpdateLink = (id, field, value) => {
    setLinks(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const handleRemoveLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  // 4. Xử lý Lưu
  const handleSave = () => {
    // Kiểm tra xem có link nào bị bỏ trống tên không
    const validLinks = links.filter(link => link.name.trim() !== '');
    setLinks(validLinks);

    setIsEditing(false);
    alert("Tuyệt vời! Đã lưu hồ sơ cá nhân thành công.");
  };

  return (
    <div className="profile-page">
      <div className="profile-grid">

        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
        <div className="profile-left">
          <div className="profile-card user-identity-card">

            <div className="avatar-section">
              <div className="avatar-wrapper">
                <img src={avatar} alt="User Avatar" className="profile-avatar" />
                <button className="btn-change-avatar" title="Thay đổi ảnh" onClick={handleCameraClick}>
                  <Camera size={16} />
                </button>
                {/* Thẻ input file bị ẩn đi */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <h2 className="profile-name">{profileData.username}</h2>
              <p className="profile-role">{profileData.role}</p>
            </div>

            <div className="bio-section">
              <div className="section-header">
                <h3>Giới thiệu</h3>
                <button className="btn-icon-tiny" onClick={() => setIsEditing(!isEditing)} title="Sửa thông tin">
                  <Edit3 size={16}/>
                </button>
              </div>
              {isEditing ? (
                <textarea name="bio" value={profileData.bio} onChange={handleChange} rows="4" className="edit-textarea" placeholder="Viết vài dòng giới thiệu về bạn..." />
              ) : (
                <p className="bio-text">{profileData.bio}</p>
              )}
            </div>

            <div className="contact-info">
              <div className="info-item">
                <Mail size={16} className="info-icon" />
                {isEditing ? <input type="email" name="email" value={profileData.email} onChange={handleChange} /> : <span>{profileData.email}</span>}
              </div>
              <div className="info-item">
                <Phone size={16} className="info-icon" />
                {isEditing ? <input type="text" name="phone" value={profileData.phone} onChange={handleChange} /> : <span>{profileData.phone}</span>}
              </div>
              <div className="info-item">
                <MapPin size={16} className="info-icon" />
                {isEditing ? <input type="text" name="location" value={profileData.location} onChange={handleChange} /> : <span>{profileData.location}</span>}
              </div>
            </div>

            {isEditing && (
              <button className="btn-primary w-full mt-16" onClick={handleSave}>Lưu Thay Đổi</button>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: TÀI LIỆU & THÀNH TỰU */}
        <div className="profile-right">

          <div className="profile-card">
            <h3 className="card-title"><Award size={20} color="#f59e0b"/> Thành Tựu Công Việc</h3>
            <div className="stats-container">
              <div className="stat-box success">
                <CheckCircle2 size={32} strokeWidth={1.5} />
                <div className="stat-text">
                  <h4>{completedTasks}</h4>
                  <p>Task đã hoàn thành</p>
                </div>
              </div>
              <div className="stat-box warning">
                <Clock size={32} strokeWidth={1.5} />
                <div className="stat-text">
                  <h4>{pendingTasks}</h4>
                  <p>Task đang chờ xử lý</p>
                </div>
              </div>
            </div>
          </div>

          {/* KHU VỰC QUẢN LÝ LINK ĐỘNG */}
          <div className="profile-card">
            <div className="section-header">
              <h3 className="card-title"><LinkIcon size={20} color="#3b82f6"/> Liên kết & Tài liệu</h3>
              {isEditing && (
                <button className="btn-outline-small" onClick={handleAddLink}>
                  <Plus size={14} style={{marginRight: '4px'}}/> Thêm Link
                </button>
              )}
            </div>

            <div className="links-list">
              {links.length > 0 ? (
                links.map(link => (
                  <div key={link.id} className="link-item">
                    {isEditing ? (
                      // Chế độ chỉnh sửa Link
                      <div className="link-edit-row">
                        <div className="link-inputs">
                          <input
                            type="text"
                            placeholder="Tên hiển thị (VD: Facebook)"
                            value={link.name}
                            onChange={(e) => handleUpdateLink(link.id, 'name', e.target.value)}
                          />
                          <input
                            type="url"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                          />
                        </div>
                        <button className="btn-delete-link" onClick={() => handleRemoveLink(link.id)} title="Xóa link">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      // Chế độ xem Link
                      <div className="link-info">
                        <span className="link-name">{link.name}</span>
                        <a href={link.url} target="_blank" rel="noreferrer" className="link-url">{link.url}</a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-links">Chưa có liên kết nào được thêm.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;