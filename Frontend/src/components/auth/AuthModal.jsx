import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import './AuthModal.css';

const AuthModal = () => {
  const { login, register, isAuthModalOpen, closeAuthModal } = useAuth();
  const { t } = useTranslation();

  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLoginView) {
        if (!formData.username.trim() || !formData.password.trim()) {
          setError(t('loginErrorEmpty'));
          setLoading(false);
          return;
        }
        await login(formData.username, formData.password);
        closeAuthModal();
      } else {
        if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
          setError(t('registerErrorEmpty'));
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError(t('registerErrorMismatch'));
          setLoading(false);
          return;
        }
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });
        setIsLoginView(true);
        setError(t('registerSuccess'));
      }
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]
        || (isLoginView ? t('loginErrorFailed') : t('registerErrorFailed'));
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal}>
      <div className="auth-modal-container" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={closeAuthModal}><X size={20} /></button>
        
        <div className="auth-modal-header">
          <h2>{isLoginView ? t('loginTitle') : t('registerTitle')}</h2>
          <p>{isLoginView ? t('loginSub') : t('registerSub')}</p>
        </div>

        {error && (
          <div className={`auth-modal-error ${error === t('registerSuccess') ? 'success' : ''}`}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-modal-form">
          <div className="input-group">
            <label>{isLoginView ? t('loginUsernameLabel') : t('usernameLabelReg')}</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                name="username"
                placeholder={isLoginView ? t('loginUsernamePlaceholder') : t('namePlaceholder')}
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
          </div>

          {!isLoginView && (
            <div className="input-group">
              <label>{t('email')}</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder={t('emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>{t('password')}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={t('passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn-toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {!isLoginView && (
            <div className="input-group">
              <label>{t('confirmPwd')}</label>
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
          )}

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? <div className="spinner"></div> : (isLoginView ? t('loginBtn') : t('registerBtn'))}
          </button>
        </form>

        <div className="auth-modal-footer">
          <p>
            {isLoginView ? t('noAccountText') : t('hasAccountText')}{' '}
            <span className="auth-switch-link" onClick={() => { setIsLoginView(!isLoginView); setError(''); }}>
              {isLoginView ? t('registerNow') : t('loginNow')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
