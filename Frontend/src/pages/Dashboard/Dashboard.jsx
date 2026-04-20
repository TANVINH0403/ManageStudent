import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import taskService from '../../services/taskService';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid, AreaChart, Area, ComposedChart, Line } from 'recharts';
import { LayoutDashboard, Clock, CheckCircle2, AlertTriangle, CheckSquare, MoreVertical, Tag, Trash2, ExternalLink } from 'lucide-react';
import './Dashboard.css';

// Mock data for charts
const sparklineUp = [{ v: 10 }, { v: 25 }, { v: 15 }, { v: 30 }, { v: 22 }];
const taskProgressData = [
  { month: 'Jan', assigned: 10, completed: 8 },
  { month: 'Feb', assigned: 15, completed: 12 },
  { month: 'Mar', assigned: 20, completed: 18 },
];
const performanceData = [
  { week: 'W1', overdue: 2, done: 10, score: 85 },
  { week: 'W2', overdue: 1, done: 12, score: 90 },
];
const categoryData = [
  { month: 'Jan', major: 30, general: 20 },
  { month: 'Feb', major: 35, general: 15 },
];
const focusHours = 42;
const goToCategory = () => { };

const getStatusLabel = (statusValue) => {
  switch (statusValue) {
    case 0: return 'Pending';
    case 1: return 'In Progress';
    case 2: return 'Completed';
    default: return 'Pending';
  }
}

const getPriorityLabel = (priorityValue) => {
  switch (priorityValue) {
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
    if (categoryId) {
      navigate('/categories', { state: { openCategoryId: categoryId } });
    }
  };

  const handleCompleteTask = async (e, taskId) => {
    e.stopPropagation();
    try {
      await taskService.updateTask(taskId, { Status: 2 });
      setTasks(tasks.map(t => t.taskId === taskId ? { ...t, status: 2 } : t));
      // Dashboard sẽ cần tải lại stats để biểu đồ chuẩn xác, bạn có thể gọi fetchData() tương tự
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Lỗi: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa task này?")) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.taskId !== taskId));
    } catch (err) {
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
          <div className="stats-grid">
            <div className={`stat-card blue ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>
              <div className="stat-header">
                <p>Total Tasks</p>
                <LayoutDashboard className="stat-icon" size={20} />
              </div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
              </div>
            </div>

            <div className={`stat-card orange ${activeFilter === 'Pending' ? 'active' : ''}`} onClick={() => setActiveFilter('Pending')}>
              <div className="stat-header">
                <p>Pending</p>
                <AlertTriangle className="stat-icon" size={20} />
              </div>
              <div className="stat-info">
                <h3>{stats.pending}</h3>
              </div>
            </div>

            <div className={`stat-card blue ${activeFilter === 'In Progress' ? 'active' : ''}`} onClick={() => setActiveFilter('In Progress')}>
              <div className="stat-header">
                <p>In Progress</p>
                <Clock className="stat-icon" size={20} />
              </div>
              <div className="stat-info">
                <h3>{stats.inProgress}</h3>
              </div>
            </div>

            <div className={`stat-card green ${activeFilter === 'Completed' ? 'active' : ''}`} onClick={() => setActiveFilter('Completed')}>
              <div className="stat-header">
                <p>Completed</p>
                <CheckCircle2 className="stat-icon" size={20} />
              </div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
              </div>
            </div>
          </div>

          <div className="dashboard-lower-grid">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Trạng thái công việc</h3>
                <span className="subtitle">Thống kê theo trạng thái</span>
              </div>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

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
                              <CheckSquare size={18} />
                            </button>
                          )}
                        </div>

                        <div className="task-mini-meta">
                          {task.categoryId && (
                            <span className="meta-tag clickable-tag" onClick={(e) => handleCategoryClick(e, task.categoryId)}>
                              <Tag size={12} /> Danh mục {task.categoryId}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="meta-date">
                              <Clock size={12} /> {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>

                        <div className="task-mini-footer">
                          <span className={`status-pill ${task.statusStr.replace(/\s/g, '')}`}>{task.statusStr}</span>
                          <button className="btn-icon-tiny text-red" title="Xóa task" onClick={(e) => handleDeleteTask(e, task.taskId)}>
                            <Trash2 size={16} />
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