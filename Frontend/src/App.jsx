import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Dashboard    from './pages/Dashboard/Dashboard';
import Tasks        from './pages/Tasks/Tasks';
import Login        from './pages/Login/Login';
import Register     from './pages/Login/Register';
import Kanban       from './pages/Kanban/Kanban';
import Categories   from './pages/Categories/Categories';
import Calendar     from './pages/Calendar/Calendar';
import Profile      from './pages/Profile/Profile';
import Settings     from './pages/Settings/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes – cần đăng nhập */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index             element={<Dashboard />} />
          <Route path="tasks"      element={<Tasks />} />
          <Route path="kanban"     element={<Kanban />} />
          <Route path="categories" element={<Categories />} />
          <Route path="calendar"   element={<Calendar />} />
          <Route path="profile"    element={<Profile />} />
          <Route path="settings"   element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;