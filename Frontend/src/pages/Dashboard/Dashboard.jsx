import React from 'react';
import { mockTasks } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  // Dữ liệu giả lập cho biểu đồ
  const data = [
    { name: 'Pending', count: 5, color: '#f59e0b' },
    { name: 'In Progress', count: 8, color: '#3b82f6' },
    { name: 'Completed', count: 12, color: '#10b981' },
    { name: 'Overdue', count: 2, color: '#ef4444' },
  ];

  return (
    <div className="dashboard-content">
      <header className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Chào mừng bạn quay trở lại! Hôm nay bạn có 3 deadline cần xử lý.</p>
      </header>

      {/* 4 WIDGETS THỐNG KÊ */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-info">
            <p>Total Tasks</p>
            <h3>27</h3>
          </div>
          <div className="stat-icon">📚</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-info">
            <p>Pending</p>
            <h3>05</h3>
          </div>
          <div className="stat-icon">⏳</div>
        </div>
        <div className="stat-card green">
          <div className="stat-info">
            <p>Completed</p>
            <h3>12</h3>
          </div>
          <div className="stat-icon">✅</div>
        </div>
        <div className="stat-card red">
          <div className="stat-info">
            <p>Overdue</p>
            <h3>02</h3>
          </div>
          <div className="stat-icon">⚠️</div>
        </div>
      </div>

      {/* KHU VỰC BIỂU ĐỒ VÀ TODAY TASKS */}
      <div className="dashboard-lower-grid">
        <div className="chart-section">
          <h3>Task Analytics</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}}/>
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="upcoming-tasks">
          <h3>Upcoming Deadlines</h3>
          <div className="task-mini-list">
            {mockTasks.map(task => (
              <div key={task.id} className="task-mini-item">
                <div className={`priority-indicator ${task.priority}`}></div>
                <div className="task-mini-info">
                  <h4>{task.title}</h4>
                  <p>{new Date(task.deadline).toLocaleDateString()}</p>
                </div>
                <span className={`status-pill ${task.status.replace(/\s/g, '')}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;