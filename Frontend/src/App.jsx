import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

import Dashboard from './pages/Dashboard/Dashboard';
import Tasks from './pages/Tasks/Tasks';
import Login from './pages/Login/Login';
import Kanban from './pages/Kanban/Kanban';
import Categories from './pages/Categories/Categories';
import Calendar from './pages/Calendar/Calendar';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="categories" element={<Categories />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          {/* Các route khác sẽ thêm sau */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;