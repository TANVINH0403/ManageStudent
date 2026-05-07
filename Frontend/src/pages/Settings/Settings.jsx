import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Globe, Monitor, Lock, Bell, Sun, Moon, Contrast,
  Save, ChevronDown, Check, Eye, EyeOff, Shield, AlertCircle
} from 'lucide-react';
import { changePassword } from '../../redux/userSlice';
import { fetchSettings, updateSettings, setLocalPreferences } from '../../redux/settingsSlice';
import { applyThemeVars } from '../../utils/themeUtils';
import { useTranslation } from '../../hooks/useTranslation';
import './Settings.css';

const Settings = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { preferences, loading } = useSelector(s => s.settings);

  const [activeTab, setActiveTab] = useState('language');
  const [general, setGeneral]     = useState({ ...preferences.general });
  const [theme, setTheme]         = useState(preferences.appearance?.theme || 'light');
  const [notifs, setNotifs]       = useState({ ...preferences.notifications });
  const [saved, setSaved]         = useState(false);
  const [showOld, setShowOld]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [pwdMsg, setPwdMsg]       = useState(null);
  const pwd = useRef({ old: '', next: '', confirm: '' });

  useEffect(() => { dispatch(fetchSettings()); }, [dispatch]);

  useEffect(() => {
    setGeneral({ ...preferences.general });
    setTheme(preferences.appearance?.theme || 'light');
    setNotifs({ ...preferences.notifications });
  }, [preferences]);

  // Apply theme ngay lập tức vào cả <html> và <body>
  const applyTheme = async (val) => {
    setTheme(val);
    applyThemeVars(val);
    const newPrefs = { ...preferences, appearance: { ...preferences.appearance, theme: val } };
    dispatch(setLocalPreferences(newPrefs));
    await dispatch(updateSettings(newPrefs));
  };

  const updateGeneral = async (field, value) => {
    const newGeneral = { ...general, [field]: value };
    setGeneral(newGeneral);
    const newPrefs = { ...preferences, general: newGeneral };
    dispatch(setLocalPreferences(newPrefs));
    await dispatch(updateSettings(newPrefs));
  };

  const updateNotifs = async (field, value) => {
    const newNotifs = { ...notifs, [field]: value };
    setNotifs(newNotifs);
    const newPrefs = { ...preferences, notifications: newNotifs };
    dispatch(setLocalPreferences(newPrefs));
    await dispatch(updateSettings(newPrefs));
  };

  const handleChangePwd = async () => {
    setPwdMsg(null);
    if (!pwd.current.old || !pwd.current.next) return setPwdMsg({ type: 'error', text: t('pwdFillAll') });
    if (pwd.current.next !== pwd.current.confirm) return setPwdMsg({ type: 'error', text: t('pwdMismatch') });
    if (pwd.current.next.length < 6) return setPwdMsg({ type: 'error', text: t('pwdTooShort') });
    const result = await dispatch(changePassword({ oldPassword: pwd.current.old, newPassword: pwd.current.next }));
    if (changePassword.fulfilled.match(result)) {
      setPwdMsg({ type: 'success', text: t('pwdSuccess') });
      pwd.current = { old: '', next: '', confirm: '' };
    } else {
      setPwdMsg({ type: 'error', text: result.payload || t('pwdError') });
    }
  };

  const TABS = [
    { key: 'language',      label: t('language'),      icon: Globe   },
    { key: 'appearance',    label: t('appearance'),    icon: Monitor },
    { key: 'security',      label: t('security'),      icon: Shield  },
    { key: 'notifications', label: t('notifications'), icon: Bell    },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>{t('settingsTitle')}</h1>
        <p>{t('settingsDesc')}</p>
      </div>

      <div className="set-layout">
        {/* LEFT TABS */}
        <div className="set-nav-panel">
          {TABS.map(({ key, icon: Icon, label }) => (
            <button key={key}
              className={`set-nav-item ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <div className="set-nav-icon-wrap"><Icon size={18} /></div>
              <span className="set-nav-label">{label}</span>
            </button>
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div className="set-right-panel">
          <div className="set-content">

            {/* ── NGÔN NGỮ ── */}
            {activeTab === 'language' && (
              <>
                <div className="set-content-header">
                  <div><h2>{t('language')}</h2><p>{t('languageSub')}</p></div>
                  <Globe size={40} color="#cbd5e1" strokeWidth={1} />
                </div>

                <div className="set-field">
                  <label>{t('sysLang')}</label>
                  <p className="set-field-sub">{t('sysLangSub')}</p>
                  <div className="set-select-wrap">
                    <select value={general.language} onChange={e => updateGeneral('language', e.target.value)}>
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English (US)</option>
                    </select>
                    <ChevronDown size={16} className="select-arrow" />
                  </div>
                </div>

                <div className="set-field">
                  <label>{t('timezone')}</label>
                  <p className="set-field-sub">{t('timezoneSub')}</p>
                  <div className="set-select-wrap">
                    <select value={general.timezone} onChange={e => updateGeneral('timezone', e.target.value)}>
                      <option value="Asia/Ho_Chi_Minh">Hà Nội, TP.HCM (GMT+7)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                    <ChevronDown size={16} className="select-arrow" />
                  </div>
                </div>
              </>
            )}

            {/* ── GIAO DIỆN ── */}
            {activeTab === 'appearance' && (
              <>
                <div className="set-content-header">
                  <div><h2>{t('appearance')}</h2><p>{t('appearanceSub')}</p></div>
                  <Monitor size={40} color="#cbd5e1" strokeWidth={1} />
                </div>

                <div className="set-field">
                  <label>{t('theme')}</label>
                  <p className="set-field-sub">{t('themeSub')}</p>
                  <div className="theme-options">
                    {[
                      { val: 'light',  Icon: Sun,      label: t('light')     },
                      { val: 'dark',   Icon: Moon,     label: t('dark')      },
                      { val: 'system', Icon: Contrast, label: t('system') },
                    ].map(({ val, Icon, label }) => (
                      <button key={val}
                        className={`theme-option ${theme === val ? 'active' : ''}`}
                        onClick={() => applyTheme(val)}
                      >
                        <Icon size={18} />
                        <span>{label}</span>
                        {theme === val && <Check size={14} className="theme-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── BẢO MẬT ── */}
            {activeTab === 'security' && (
              <>
                <div className="set-content-header">
                  <div><h2>{t('security')}</h2><p>{t('securitySub')}</p></div>
                  <Shield size={40} color="#cbd5e1" strokeWidth={1} />
                </div>

                <div className="set-field">
                  <label>{t('changePwd')}</label>
                  {pwdMsg && (
                    <div className={`set-pwd-msg ${pwdMsg.type}`}>
                      {pwdMsg.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                      {pwdMsg.text}
                    </div>
                  )}
                  <div className="pwd-input-wrap">
                    <input type={showOld ? 'text' : 'password'} placeholder={t('oldPwd')}
                      onChange={e => { pwd.current.old = e.target.value; }} />
                    <button className="pwd-toggle" type="button" onClick={() => setShowOld(v => !v)}>
                      {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="pwd-input-wrap" style={{ marginTop: 8 }}>
                    <input type={showNew ? 'text' : 'password'} placeholder={t('newPwd')}
                      onChange={e => { pwd.current.next = e.target.value; }} />
                    <button className="pwd-toggle" type="button" onClick={() => setShowNew(v => !v)}>
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="pwd-input-wrap" style={{ marginTop: 8, marginBottom: 16 }}>
                    <input type={showNew ? 'text' : 'password'} placeholder={t('confirmPwd')}
                      onChange={e => { pwd.current.confirm = e.target.value; }} />
                  </div>
                  <button className="set-change-pwd-btn" onClick={handleChangePwd}>
                    <Lock size={15} style={{ marginRight: 6 }} /> {t('changePwd')}
                  </button>
                </div>
              </>
            )}

            {/* ── THÔNG BÁO ── */}
            {activeTab === 'notifications' && (
              <>
                <div className="set-content-header">
                  <div><h2>{t('notifications')}</h2><p>{t('notificationsSub')}</p></div>
                  <Bell size={40} color="#cbd5e1" strokeWidth={1} />
                </div>

                {[
                  { key: 'deadlineReminder', label: t('deadlineReminder'),    sub: t('deadlineReminderSub')       },
                  { key: 'newTask',          label: t('newTask'),              sub: t('newTaskSub')       },
                  { key: 'weeklyReport',     label: t('weeklyReport'),          sub: t('weeklyReportSub')         },
                  { key: 'email',            label: t('emailNotif'),   sub: t('emailNotifSub') },
                ].map(({ key, label, sub }) => (
                  <div className="set-field" key={key}>
                    <div className="toggle-row">
                      <div>
                        <label>{label}</label>
                        <p className="set-field-sub">{sub}</p>
                      </div>
                      <button className={`toggle-switch ${notifs[key] ? 'on' : ''}`}
                        onClick={() => updateNotifs(key, !notifs[key])}>
                        <span className="toggle-knob" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;