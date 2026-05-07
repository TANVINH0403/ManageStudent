// src/pages/Login/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import './Login.css';

const Register = () => {
  const navigate    = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError(t('pwdNotMatch'));
      return;
    }
    if (formData.password.length < 6) {
      setError(t('pwdMinLength'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]
        || t('registerFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="bg-shape shape-1" />
      <div className="bg-shape shape-2" />
      <div className="bg-shape shape-3" />

      <div className="login-card">
        <div className="login-header">
          <h2>{t('registerTitle')}</h2>
          <p>{t('registerSub')}</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="login-success">
            <CheckCircle2 size={16} />
            <span>Đăng ký thành công! Đang chuyển đến trang đăng nhập...</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="login-form">
          <div className="input-group">
            <label>{t('usernameLabelReg')}</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input type="text" name="username" placeholder={t('namePlaceholder')} value={formData.username} onChange={handleChange} required autoFocus />
            </div>
          </div>

          <div className="input-group">
            <label>{t('emailLabelReg')}</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input type="email" name="email" placeholder={t('emailPlaceholder')} value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>{t('pwdLabelReg')}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={t('pwdPlaceholderReg')}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="btn-toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>{t('confirmPwdLabelReg')}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder={t('confirmPwdPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading || success}>
            {loading ? t('registeringBtn') : t('registerBtn')}
          </button>
        </form>

        <p className="register-link">
          {t('alreadyHaveAccount')} <Link to="/login">{t('loginNow')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;