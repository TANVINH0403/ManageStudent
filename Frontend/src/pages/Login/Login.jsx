// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import './Login.css';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError(t('loginErrorEmpty'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(formData.username, formData.password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]
        || t('loginErrorFailed');
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
          <h2>{t('loginTitle')}</h2>
          <p>{t('loginSub')}</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>{t('usernameLabel')}</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="text"
                name="username"
                placeholder={t('usernamePlaceholder')}
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
          </div>

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
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? t('loggingIn') : t('loginBtn')}
          </button>
        </form>

        <p className="register-link">
          {t('noAccount')} <Link to="/register">{t('registerNow')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;