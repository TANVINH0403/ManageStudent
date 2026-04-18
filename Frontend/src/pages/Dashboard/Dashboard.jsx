import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import taskService from '../../services/taskService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { LayoutDashboard, Clock, CheckCircle2, AlertTriangle, CheckSquare, MoreVertical, Tag, Trash2 } from 'lucide-react';
import './Dashboard.css';

const getStatusLabel = (statusValue) => {
    switch(statusValue) {
        case 0: return 'Pending';
        case 1: return 'In Progress';
        case 2: return 'Completed';
        default: return 'Pending';
    }
}

const getPriorityLabel = (priorityValue) => {
    switch(priorityValue) {
        case 0: return 'Low';
        case 1: return 'Medium';
        case 2: return 'High';
        default: return 'Low';
    }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [stats, setStats] = useState({
      total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          try {
              setLoading(true);
              // Gọi đồng thời 2 API
              const [dashboardRes, tasksRes] = await Promise.all([
                  dashboardService.getDashboardStats(),
                  taskService.getTasks({ PageSize: 50 })
              ]);
              
              if (dashboardRes?.statusOverview) {
                  const overview = dashboardRes.statusOverview;
                  setStats({
                      total: overview.total,
                      pending: overview.todo,
                      inProgress: overview.inProgress,
                      completed: overview.completed,
                      overdue: overview.overdue
                  });
              }

              if (tasksRes?.data) {
                  setTasks(tasksRes.data);
              }
          } catch (error) {
              console.error("Failed to fetch dashboard data:", error);
          } finally {
              setLoading(false);
          }
      }
      fetchData();
  }, []);

  const chartData = [
    { name: 'Pending', count: stats.pending, color: '#f59e0b', id: 'Pending' },
    { name: 'In Progress', count: stats.inProgress, color: '#3b82f6', id: 'In Progress' },
    { name: 'Completed', count: stats.completed, color: '#10b981', id: 'Completed' },
    { name: 'Overdue', count: stats.overdue, color: '#ef4444', id: 'Overdue' },
  ];

  const handleFilterClick = (statusId) => {
    setActiveFilter(prev => prev === statusId ? 'All' : statusId);
  };

  // Convert tasks and filter
  const displayTasks = tasks.map(t => ({
      ...t,
      statusStr: getStatusLabel(t.status),
      priorityStr: getPriorityLabel(t.priority)
  })).filter(task => {
    const isOverdue = task.status !== 2 && task.dueDate && new Date(task.dueDate) < new Date();
    if (activeFilter === 'Overdue') {
        return isOverdue;
    }
    if (activeFilter !== 'All') {
        return task.statusStr === activeFilter;
    }
    return task.status !== 2;
  }).sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0)).slice(0, 5);

  const handleTaskClick = (taskId) => {
    navigate('/tasks', { state: { openTaskId: taskId } });
  };

  const handleCategoryClick = (e, categoryId) => {
    e.stopPropagation();
    if(categoryId) {
        navigate('/categories', { state: { openCategoryId: categoryId } });
    }
  };

  const handleCompleteTask = async (e, taskId) => {
      e.stopPropagation();
      try {
          await taskService.updateTask(taskId, { Status: 2 });
          setTasks(tasks.map(t => t.taskId === taskId ? { ...t, status: 2 } : t));
          // Dashboard sẽ cần tải lại stats để biểu đồ chuẩn xác, bạn có thể gọi fetchData() tương tự
      } catch(err) {
          console.error("Lỗi cập nhật trạng thái:", err);
          alert("Lỗi: " + JSON.stringify(err.response?.data || err.message));
      }
  };

  const handleDeleteTask = async (e, taskId) => {
      e.stopPropagation();
      if(!window.confirm("Bạn có chắc chắn muốn xóa task này?")) return;
      try {
          await taskService.deleteTask(taskId);
          setTasks(tasks.filter(t => t.taskId !== taskId));
      } catch(err) {
          console.error("Lỗi xóa task:", err);
          alert("Lỗi: " + JSON.stringify(err.response?.data || err.message));
      }
  };

  return (
    <div className="sales-dashboard-wrapper">

      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-text">
            <h1>Dashboard Overview</h1>
            <p>Chào mừng bạn quay trở lại! Hôm nay bạn có <strong>{stats.pending + stats.inProgress}</strong> công việc cần xử lý.</p>
        </div>
        {activeFilter !== 'All' && (
            <button className="btn-reset" onClick={() => setActiveFilter('All')}>
                ✕ Bỏ lọc
            </button>
        )}
      </header>

      {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Đang tải dữ liệu...</div>
      ) : (
          <>
      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className={`stat-card blue ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>
          <div className="stat-header">
            <span className="stat-title">Total Tasks</span>
            <LayoutDashboard className="stat-icon" size={20} />
          </div>
          <div className="stat-value">{stats.total}</div>
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
          <div className="stat-value">{stats.pending}</div>
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
          <div className="stat-value">{stats.completed}</div>
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
          <div className="stat-value">{stats.overdue}</div>
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

        {/* UPCOMING DEADLINES */}
        <div className="upcoming-tasks dashboard-card">
          <div className="card-header">
              <h3>Upcoming Deadlines</h3>
              <span className="subtitle">{activeFilter === 'All' ? 'Các công việc cần làm' : activeFilter}</span>
          </div>

          <div className="task-mini-list">
            {displayTasks.length > 0 ? (
                displayTasks.map(task => (
                <div key={task.taskId} className="task-mini-item clickable-mini-item" onClick={() => handleTaskClick(task.taskId)}>
                    <div className={`task-priority-bar ${task.priorityStr}`}></div>

                    <div className="task-mini-content">
                        <div className="task-mini-header">
                            <h4 title={task.taskName}>{task.taskName}</h4>
                            {task.status !== 2 && (
                                <button className="btn-icon-tiny" title="Đánh dấu hoàn thành" onClick={(e) => handleCompleteTask(e, task.taskId)}>
                                    <CheckSquare size={18}/>
                                </button>
                            )}
                        </div>

                        <div className="task-mini-meta">
                            {task.categoryId && (
                                <span className="meta-tag clickable-tag" onClick={(e) => handleCategoryClick(e, task.categoryId)}>
                                  <Tag size={12}/> Danh mục {task.categoryId}
                                </span>
                            )}
                            {task.dueDate && (
                                <span className="meta-date">
                                  <Clock size={12}/> {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                </span>
                            )}
                        </div>

                        <div className="task-mini-footer">
                            <span className={`status-pill ${task.statusStr.replace(/\s/g, '')}`}>{task.statusStr}</span>
                            <button className="btn-icon-tiny text-red" title="Xóa task" onClick={(e) => handleDeleteTask(e, task.taskId)}>
                                <Trash2 size={16}/>
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
      </>
      )}
    </div>
  );
};

export default Dashboard;