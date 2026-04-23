import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

// Kiểm tra độ mạnh mật khẩu
const getPasswordStrength = (pwd) => {
  if (!pwd) return null;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNum   = /[0-9]/.test(pwd);
  const hasSpec  = /[^A-Za-z0-9]/.test(pwd);
  const score = [hasUpper, hasLower, hasNum, hasSpec, pwd.length >= 8].filter(Boolean).length;
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

const strengthLabel = { weak: 'Yếu', medium: 'Trung bình', strong: 'Mạnh' };

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState(null);

  const [formData, setFormData] = useState({
    username:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (alert) setAlert(null);
  };

  const validate = () => {
    const e = {};
    if (!formData.username.trim())
      e.username = 'Vui lòng nhập tên đăng nhập.';
    else if (formData.username.trim().length < 3)
      e.username = 'Tên đăng nhập phải có ít nhất 3 ký tự.';

    if (!formData.email.trim())
      e.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Email không hợp lệ.';

    if (!formData.password)
      e.password = 'Vui lòng nhập mật khẩu.';
    else if (formData.password.length < 6)
      e.password = 'Mật khẩu phải có ít nhất 6 ký tự.';

    if (!formData.confirmPassword)
      e.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    else if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Mật khẩu xác nhận không khớp.';

    return e;
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
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.confirmPassword,
      );
      setAlert({ type: 'success', message: 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      {/* Branding panel */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">🎓</div>
            <span className="auth-logo-text">ManagerStudent</span>
          </div>
          <h1>Bắt đầu hành trình học tập</h1>
          <p>Tạo tài khoản miễn phí và trải nghiệm nền tảng quản lý sinh viên thông minh ngay hôm nay.</p>
          <ul className="auth-features">
            <li className="auth-feature-item">
              <span className="auth-feature-icon">✅</span>
              Đăng ký miễn phí, không giới hạn
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-icon">🚀</span>
              Bắt đầu theo dõi tiến độ ngay lập tức
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-icon">🤝</span>
              Cộng tác nhóm dễ dàng
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-icon">🔒</span>
              Dữ liệu được bảo mật tuyệt đối
            </li>
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Tạo tài khoản mới ✨</h2>
            <p>Điền thông tin bên dưới để bắt đầu</p>
          </div>

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
              <label htmlFor="reg-username">Tên đăng nhập</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={18} />
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  placeholder="Tên đăng nhập (min. 3 ký tự)"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? 'input-error' : ''}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="auth-field-error"><AlertCircle size={13} /> {errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="auth-input-group">
              <label htmlFor="reg-email">Email</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={18} />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'input-error' : ''}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="auth-field-error"><AlertCircle size={13} /> {errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <label htmlFor="reg-password">Mật khẩu</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Ít nhất 6 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                  autoComplete="new-password"
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
              {/* Password strength indicator */}
              {formData.password && pwdStrength && (
                <>
                  <div className="password-strength-bar">
                    <div className={`password-strength-fill strength-${pwdStrength}`} />
                  </div>
                  <p className={`password-strength-label strength-label-${pwdStrength}`}>
                    Độ mạnh: {strengthLabel[pwdStrength]}
                  </p>
                </>
              )}
              {errors.password && (
                <p className="auth-field-error"><AlertCircle size={13} /> {errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-input-group">
              <label htmlFor="reg-confirm-password">Xác nhận mật khẩu</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="auth-field-error"><AlertCircle size={13} /> {errors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" className="auth-btn-submit" disabled={loading}>
              {loading && <span className="btn-spinner" />}
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="auth-bottom-link">
            Đã có tài khoản?{' '}
            <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
