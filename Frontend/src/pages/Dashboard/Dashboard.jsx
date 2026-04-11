import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ComposedChart, Bar, Line
} from 'recharts';
import { Calendar, ChevronRight, ExternalLink } from 'lucide-react';
import { mockTasks } from '../../data/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const tasks = mockTasks || [];

  const totalTasks = tasks.length || 1;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  // eslint-disable-next-line no-unused-vars
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && new Date(t.deadline) < new Date()).length;
  const focusHours = 124;

  const sparklineUp = [{v: 10}, {v: 15}, {v: 25}, {v: 20}, {v: 30}, {v: 40}, {v: 45}];
  const sparklineDown = [{v: 40}, {v: 35}, {v: 38}, {v: 25}, {v: 20}, {v: 15}, {v: 10}];

  const taskProgressData = [
    { month: 'Oct', assigned: 20, completed: 15 },
    { month: 'Nov', assigned: 25, completed: 20 },
    { month: 'Dec', assigned: 30, completed: 22 },
    { month: 'Jan', assigned: 15, completed: 15 },
    { month: 'Feb', assigned: 40, completed: 30 },
    { month: 'Mar', assigned: 45, completed: 40 },
    { month: 'Apr', assigned: 25, completed: 10 },
  ];

  const performanceData = [
    { week: 'W1', done: 10, overdue: 2, score: 85 },
    { week: 'W2', done: 15, overdue: 1, score: 90 },
    { week: 'W3', done: 8, overdue: 4, score: 70 },
    { week: 'W4', done: 20, overdue: 0, score: 95 },
  ];

  const categoryData = [
    { month: 'Oct', major: 10, general: 10 },
    { month: 'Nov', major: 15, general: 10 },
    { month: 'Dec', major: 20, general: 10 },
    { month: 'Jan', major: 10, general: 5 },
    { month: 'Feb', major: 25, general: 15 },
    { month: 'Mar', major: 30, general: 15 },
  ];

  const upcomingDeadlines = [...tasks]
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const goToTasks = () => navigate('/tasks');
  const goToKanban = () => navigate('/kanban');
  const goToTaskDetail = (taskId) => navigate('/tasks', { state: { openTaskId: taskId } });
  const goToCategory = () => navigate('/categories');

  return (
    <div className="sales-dashboard-wrapper">

      {/* HEADER */}
      <div className="dashboard-topbar">
        <div className="title-area">
          <h2>Student Performance Dashboard</h2>
          <span className="subtitle-date">Năm học 2023 - 2024</span>
        </div>
        <div className="date-picker-mock">
          <span>Học kỳ Hiện tại</span>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-row">
        <div className="kpi-card clickable" onClick={goToTasks}>
          <div className="kpi-info">
            <span className="kpi-label">Tổng bài tập</span>
            <span className="kpi-value">{totalTasks}</span>
            <span className="kpi-change negative">▼ 12% <span className="kpi-compare">so với kỳ trước</span></span>
          </div>
          <div className="kpi-chart">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={sparklineUp}><Area type="monotone" dataKey="v" stroke="var(--sales-primary)" fill="var(--sales-primary-light)" fillOpacity={0.6} strokeWidth={2} /></AreaChart></ResponsiveContainer>
          </div>
        </div>

        <div className="kpi-card clickable" onClick={goToKanban}>
          <div className="kpi-info">
            <span className="kpi-label">Đang chờ / Đang làm</span>
            <span className="kpi-value">{pendingTasks}</span>
            <span className="kpi-change negative">▼ Cần xử lý</span>
          </div>
          <div className="kpi-chart">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={sparklineUp}><Area type="monotone" dataKey="v" stroke="var(--sales-primary)" fill="var(--sales-primary-light)" fillOpacity={0.6} strokeWidth={2} /></AreaChart></ResponsiveContainer>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Đã hoàn thành</span>
            <span className="kpi-value">{completedTasks}</span>
            <span className="kpi-change negative">▼ 48.83% <span className="kpi-compare">so với kỳ trước</span></span>
          </div>
          <div className="kpi-chart">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={sparklineUp}><Area type="monotone" dataKey="v" stroke="var(--sales-primary)" fill="var(--sales-primary-light)" fillOpacity={0.6} strokeWidth={2} /></AreaChart></ResponsiveContainer>
          </div>
        </div>

        <div className="kpi-card clickable" onClick={goToTasks}>
          <div className="kpi-info">
            <span className="kpi-label">Tỷ lệ trễ hạn</span>
            <span className="kpi-value">32.75%</span>
            <span className="kpi-change positive">▲ 6.43% <span className="kpi-compare">so với tháng trước</span></span>
          </div>
          <div className="kpi-chart">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={sparklineDown}><Area type="monotone" dataKey="v" stroke="var(--sales-primary)" fill="var(--sales-primary-light)" fillOpacity={0.6} strokeWidth={2} /></AreaChart></ResponsiveContainer>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Giờ tập trung</span>
            <span className="kpi-value">{focusHours}h</span>
            <span className="kpi-change negative">▼ 6.11% <span className="kpi-compare">so với tháng trước</span></span>
          </div>
          <div className="kpi-chart">
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={sparklineUp}><Area type="monotone" dataKey="v" stroke="var(--sales-primary)" fill="var(--sales-primary-light)" fillOpacity={0.6} strokeWidth={2} /></AreaChart></ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3 BIỂU ĐỒ CHÍNH */}
      <div className="charts-row-3">
        <div className="chart-card">
          <h3 className="chart-title">Tiến độ làm bài (Assigned vs Done)</h3>
          <div className="chart-legend-custom">
            {/* Sử dụng CSS Class thay vì inline style */}
            <span><span className="dot bg-gray-dot"></span> Được giao</span>
            <span><span className="dot bg-primary-dot"></span> Hoàn thành</span>
          </div>
          <div className="chart-wrapper-h200">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskProgressData}>
                <XAxis dataKey="month" tick={{fontSize: 10, fill: 'var(--sales-text-light)'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{stroke: 'var(--sales-border)', strokeWidth: 1, strokeDasharray: '4 4'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                {/* Dùng thẳng biến CSS var(--tên_biến) */}
                <Area type="monotone" dataKey="assigned" stackId="1" stroke="var(--sales-text-light)" fill="var(--sales-border)" fillOpacity={0.8} />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="var(--sales-primary)" fill="var(--sales-primary)" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Hiệu suất & Trễ hạn hàng tuần</h3>
          <div className="chart-legend-custom">
            <span><span className="dot bg-gray-dot"></span> Trễ hạn</span>
            <span><span className="dot bg-primary-dot"></span> Hoàn thành</span>
            <span><span className="dot bg-dark-dot"></span> Điểm năng suất</span>
          </div>
          <div className="chart-wrapper-h200">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <XAxis dataKey="week" tick={{fontSize: 10, fill: 'var(--sales-text-light)'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" hide />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: 'var(--sales-text-light)'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'var(--sales-bg)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar yAxisId="left" dataKey="overdue" stackId="a" fill="var(--sales-text-light)" barSize={24} fillOpacity={0.8} />
                <Bar yAxisId="left" dataKey="done" stackId="a" fill="var(--sales-primary)" barSize={24} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="score" stroke="var(--sales-text-main)" strokeWidth={2} dot={{r: 4, fill: 'var(--sales-text-main)'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card clickable-card" onClick={goToCategory}>
          <div className="card-header-with-link">
            <h3 className="chart-title">Khối lượng bài tập theo Phân loại</h3>
            <ExternalLink size={14} color="var(--sales-text-light)" />
          </div>
          <div className="chart-legend-custom">
            <span><span className="dot bg-primary-dot"></span> Chuyên ngành</span>
            <span><span className="dot bg-gray-dot"></span> Đại cương</span>
          </div>
          <div className="chart-wrapper-h200">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={categoryData}>
                <XAxis dataKey="month" tick={{fontSize: 10, fill: 'var(--sales-text-light)'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: 'var(--sales-text-light)'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'var(--sales-bg)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar yAxisId="right" dataKey="major" stackId="a" fill="var(--sales-primary)" barSize={24} fillOpacity={0.8} />
                <Bar yAxisId="right" dataKey="general" stackId="a" fill="var(--sales-text-light)" barSize={24} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DÒNG 3: BOTTOM SECTION */}
      <div className="charts-row-bottom">
        <div className="chart-card area-bottom">
          <h3 className="chart-title">Phân bổ thời gian (Giờ học vs Giờ nghỉ)</h3>
          <div className="chart-legend-custom">
            <span><span className="dot bg-primary-dot"></span> Focus</span>
            <span><span className="dot bg-gray-dot"></span> Break</span>
          </div>
          <div className="chart-wrapper-h250">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={categoryData}>
                <XAxis dataKey="month" tick={{fontSize: 10, fill: 'var(--sales-text-light)'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fill: 'var(--sales-text-light)'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{stroke: 'var(--sales-border)', strokeWidth: 1, strokeDasharray: '4 4'}} />
                <Area type="monotone" dataKey="general" stackId="1" stroke="var(--sales-text-light)" fill="var(--sales-border)" fillOpacity={0.8} />
                <Area type="monotone" dataKey="major" stackId="1" stroke="var(--sales-primary)" fill="var(--sales-primary-light)" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BẢNG DATA */}
        <div className="chart-card table-bottom">
          <div className="card-header-with-link">
             <h3 className="chart-title">Upcoming Deadlines (Cần xử lý gấp)</h3>
             <button className="btn-view-all" onClick={goToTasks}>Xem tất cả <ChevronRight size={14}/></button>
          </div>
          <div className="table-responsive">
            <table className="sales-table student-table">
              <thead>
                <tr>
                  <th>Tên công việc</th>
                  <th>Phân loại</th>
                  <th>Hạn chót</th>
                  <th className="align-right">Trạng thái</th>
                  <th className="align-right">Ưu tiên</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((task, idx) => (
                  <tr key={task.id} onClick={() => goToTaskDetail(task.id)} className="clickable-row">
                    <td className="fw-500 task-name-cell">{task.title}</td>
                    <td className="text-gray">{task.categoryId === 1 ? 'Chuyên ngành' : 'Bài tập'}</td>
                    <td className={new Date(task.deadline) < new Date() ? 'text-red fw-600' : ''}>
                        {new Date(task.deadline).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="align-right">
                      <span className={`status-badge-custom ${idx % 2 === 0 ? 'bg-purple' : 'bg-red'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="align-right fw-600">
                       {task.priority}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Tuyệt vời! Không có deadline nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;