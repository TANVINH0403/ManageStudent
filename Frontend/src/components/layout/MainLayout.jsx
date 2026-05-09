import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings } from '../../redux/settingsSlice';
import { applyPreferences } from '../../utils/themeUtils';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthModal from '../auth/AuthModal';
import './MainLayout.css';

const MainLayout = () => {
  const dispatch = useDispatch();
  const preferences = useSelector(s => s.settings?.preferences);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (preferences) applyPreferences(preferences);
  }, [preferences]);

  // Lắng nghe thay đổi OS dark mode khi dùng 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (preferences?.appearance?.theme === 'system') applyPreferences(preferences);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preferences]);

  return (
    <div className="layout-wrapper">
      <Sidebar />
      <main className="main-container">
        <Header />
        <section className="content-body">
          <Outlet />
        </section>
      </main>
      <AuthModal />
    </div>
  );
};

export default MainLayout;