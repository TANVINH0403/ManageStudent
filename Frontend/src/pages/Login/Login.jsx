import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'error'|'success', message }

  const [formData, setFormData] = useState({
    userName: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi người dùng bắt đầu gõ lại
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (alert) setAlert(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = 'Vui lòng nhập tên đăng nhập.';
    if (!formData.password)        newErrors.password = 'Vui lòng nhập mật khẩu.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      await login(formData.userName, formData.password);
      setAlert({ type: 'success', message: 'Đăng nhập thành công! Đang chuyển trang...' });
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Animated blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      {/* Branding (desktop left panel) */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">🎓</div>
            <span className="auth-logo-text">ManagerStudent</span>
          </div>
          <h1>Quản lý sinh viên thông minh</h1>
          <p>Nền tảng theo dõi tiến độ, nhiệm vụ và lịch học dành cho sinh viên hiện đại.</p>
          <ul className="auth-features">
            <li className="auth-feature-item">
              <span className="auth-feature-icon">📋</span>
              Quản lý nhiệm vụ theo thời gian thực
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-icon">📊</span>
              Dashboard thống kê trực quan
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-icon">🗓️</span>
              Lịch học & nhắc nhở thông minh
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-icon">🔒</span>
              Bảo mật dữ liệu tốt nhất
            </li>
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Chào mừng trở lại 👋</h2>
            <p>Đăng nhập để tiếp tục hành trình học tập của bạn</p>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`auth-alert auth-alert-${alert.type}`}>
              {alert.type === 'error'
                ? <AlertCircle size={18} />
                : <CheckCircle2 size={18} />
              }
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div className="auth-input-group">
              <label htmlFor="login-username">Tên đăng nhập</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={18} />
                <input
                  id="login-username"
                  type="text"
                  name="userName"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.userName}
                  onChange={handleChange}
                  className={errors.userName ? 'input-error' : ''}
                  autoComplete="username"
                />
              </div>
              {errors.userName && (
                <p className="auth-field-error">
                  <AlertCircle size={13} /> {errors.userName}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <label htmlFor="login-password">Mật khẩu</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="auth-field-error">
                  <AlertCircle size={13} /> {errors.password}
                </p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="auth-form-options">
              <label className="auth-remember-me">
                <input type="checkbox" /> Ghi nhớ đăng nhập
              </label>
              <a href="#" className="auth-forgot-link">Quên mật khẩu?</a>
            </div>

            {/* Submit */}
            <button type="submit" className="auth-btn-submit" disabled={loading}>
              {loading && <span className="btn-spinner" />}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-bottom-link">
            Chưa có tài khoản?{' '}
            <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;