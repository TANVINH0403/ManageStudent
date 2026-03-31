import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockTasks } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { LayoutDashboard, Clock, CheckCircle2, AlertTriangle, CheckSquare, MoreVertical, Tag } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // --- TÍNH TOÁN DỮ LIỆU ---
  const totalTasks = mockTasks.length;
  const pendingTasks = mockTasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = mockTasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = mockTasks.filter(t => t.status === 'Completed').length;
  const overdueTasks = mockTasks.filter(t => {
      return t.status !== 'Completed' && new Date(t.deadline) < new Date();
  }).length;

  // Dữ liệu cho biểu đồ
  const chartData = [
    { name: 'Pending', count: pendingTasks, color: '#f59e0b', id: 'Pending' },
    { name: 'In Progress', count: inProgressTasks, color: '#3b82f6', id: 'In Progress' },
    { name: 'Completed', count: completedTasks, color: '#10b981', id: 'Completed' },
    { name: 'Overdue', count: overdueTasks, color: '#ef4444', id: 'Overdue' },
  ];

  // --- STATE QUẢN LÝ TƯƠNG TÁC LỌC DỮ LIỆU ---
  const [activeFilter, setActiveFilter] = useState('All');

  const handleFilterClick = (statusId) => {
    setActiveFilter(prev => prev === statusId ? 'All' : statusId);
  };

  // Lọc danh sách Upcoming Deadlines
  const displayTasks = mockTasks.filter(task => {
    if (activeFilter === 'Overdue') {
        return task.status !== 'Completed' && new Date(task.deadline) < new Date();
    }
    if (activeFilter !== 'All') {
        return task.status === activeFilter;
    }
    return task.status !== 'Completed';
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);

  // --- UX WOW: ĐIỀU HƯỚNG NGỮ CẢNH ---
  const handleTaskClick = (taskId) => {
    navigate('/tasks', { state: { openTaskId: taskId } });
  };

  const handleCategoryClick = (e, categoryId) => {
    e.stopPropagation();
    navigate('/categories', { state: { openCategoryId: categoryId } });
  };

  return (
    <div className="dashboard-content">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-text">
            <h1>Dashboard Overview</h1>
            <p>Chào mừng bạn quay trở lại! Hôm nay bạn có <strong>{pendingTasks + inProgressTasks}</strong> công việc cần xử lý.</p>
        </div>
        {activeFilter !== 'All' && (
            <button className="btn-reset" onClick={() => setActiveFilter('All')}>
                ✕ Bỏ lọc
            </button>
        )}
      </header>

      {/* STAT CARDS - Thẻ thống kê */}
      <div className="stats-grid">
        <div className={`stat-card blue ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>
          <div className="stat-header">
            <span className="stat-title">Total Tasks</span>
            <LayoutDashboard className="stat-icon" size={20} />
          </div>
          <div className="stat-value">{totalTasks}</div>
        </div>

        <div className={`stat-card orange ${activeFilter === 'Pending' ? 'active' : ''}`} onClick={() => handleFilterClick('Pending')}>
          <div className="stat-header">
            <span className="stat-title">Pending</span>
            <Clock className="stat-icon" size={20} />
          </div>
          <div className="stat-value">{pendingTasks}</div>
        </div>

        <div className={`stat-card green ${activeFilter === 'Completed' ? 'active' : ''}`} onClick={() => handleFilterClick('Completed')}>
          <div className="stat-header">
            <span className="stat-title">Completed</span>
            <CheckCircle2 className="stat-icon" size={20} />
          </div>
          <div className="stat-value">{completedTasks}</div>
        </div>

        <div className={`stat-card red ${activeFilter === 'Overdue' ? 'active' : ''}`} onClick={() => handleFilterClick('Overdue')}>
          <div className="stat-header">
            <span className="stat-title">Overdue</span>
            <AlertTriangle className="stat-icon" size={20} />
          </div>
          <div className="stat-value">{overdueTasks}</div>
        </div>
      </div>

      <div className="dashboard-lower-grid">
        {/* CHART SECTION */}
        <div className="chart-section dashboard-card">
          <div className="card-header">
              <h3>Task Analytics</h3>
              <span className="subtitle">Thống kê theo trạng thái</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}/>
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40} onClick={(data) => handleFilterClick(data.id)} cursor="pointer">
                  {chartData.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={activeFilter === 'All' || activeFilter === entry.id ? 1 : 0.3}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* UPCOMING DEADLINES */}
        <div className="upcoming-tasks dashboard-card">
          <div className="card-header">
              <h3>Upcoming Deadlines</h3>
              <span className="subtitle">{activeFilter === 'All' ? 'Các công việc cần làm' : activeFilter}</span>
          </div>

          <div className="task-mini-list">
            {displayTasks.length > 0 ? (
                displayTasks.map(task => (
                <div key={task.id} className="task-mini-item clickable-mini-item" onClick={() => handleTaskClick(task.id)}>
                    {/* Đường màu hiển thị mức độ ưu tiên */}
                    <div className={`task-priority-bar ${task.priority}`}></div>

                    <div className="task-mini-content">
                        <div className="task-mini-header">
                            <h4 title={task.title}>{task.title}</h4>
                            <button className="btn-icon-tiny" title="Đánh dấu hoàn thành" onClick={(e) => {e.stopPropagation();}}>
                                <CheckSquare size={18}/>
                            </button>
                        </div>

                        <div className="task-mini-meta">
                            <span className="meta-tag clickable-tag" onClick={(e) => handleCategoryClick(e, task.categoryId)}>
                              <Tag size={12}/> {task.categoryId === 1 ? 'Chuyên ngành' : 'Bài tập'}
                            </span>
                            <span className="meta-date">
                              <Clock size={12}/> {new Date(task.deadline).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        <div className="task-mini-footer">
                            <span className={`status-pill ${task.status.replace(/\s/g, '')}`}>{task.status}</span>
                            <button className="btn-icon-tiny" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
                ))
            ) : (
                <div className="empty-state-mini">
                    <CheckCircle2 size={32} color="#e5e7eb" />
                    <p>Không có công việc nào.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;