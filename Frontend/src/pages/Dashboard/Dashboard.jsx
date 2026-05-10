import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories } from '../../redux/categorySlice';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
  CheckCircle2, Clock, AlertTriangle, ListTodo,
  ChevronRight, TrendingUp, Layers, Calendar,
  FolderOpen, RefreshCw, ArrowUp
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchTasks } from '../../redux/taskSlice';
import dashboardApi from '../../api/dashboardApi';
import './Dashboard.css';

const STATUS_COLORS = {
  Completed: '#10b981',
  InProgress: '#f59e0b',
  Todo: '#818cf8',
  Overdue: '#ef4444',
};

const PRIORITY_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, locale } = useTranslation();

  const categories = useSelector(s => s.categories.items);
  const reduxTasks = useSelector(s => s.tasks.items);

  const statusLabel = (val) => {
    if (val === 'Completed' || val === 2) return t('statusCompleted');
    if (val === 'In Progress' || val === 'InProgress' || val === 1) return t('statusInProgress');
    if (val === 'Pending' || val === 'Todo' || val === 0) return t('statusTodo');
    return val;
  };

  const priorityLabel = (val) => {
    if (val === 'High' || val === 2) return t('priorityHigh');
    if (val === 'Medium' || val === 1) return t('priorityMedium');
    if (val === 'Low' || val === 0) return t('priorityLow');
    return val;
  };

  const statusBadgeClass = (statusNum) => {
    if (statusNum === 2) return 'bg-green';
    if (statusNum === 1) return 'bg-amber';
    return 'bg-purple';
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'numeric', year: 'numeric' });
  };

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Compute upcomingTasks from Redux store — always in sync with Kanban/Tasks
  const upcomingTasks = reduxTasks
    .filter(t => t.status !== 'Completed' && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    dispatch(fetchTasks());

    const fetchAll = async () => {
      try {
        const dashData = await dashboardApi.getDashboard();
        setStats(dashData);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Derived safe values
  const overview = stats?.statusOverview ?? {};
  const total = overview.total || 0;
  const completed = overview.completed || 0;
  const inProgress = overview.inProgress || 0;
  const todo = overview.todo || 0;
  const overdue = overview.overdue || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const activity = stats?.recentActivity ?? {};
  const dueSoon = activity.dueSoon || 0;
  const completedLast7 = activity.completedLastDays || 0;

  // Pie chart data for status
  const pieData = [
    { name: t('statusCompleted') || 'Completed', value: completed, color: STATUS_COLORS.Completed },
    { name: t('statusInProgress') || 'In Progress', value: inProgress, color: STATUS_COLORS.InProgress },
    { name: t('statusTodo') || 'Todo', value: todo, color: STATUS_COLORS.Todo },
    { name: t('overdueTasks') || 'Overdue', value: overdue, color: STATUS_COLORS.Overdue },
  ].filter(d => d.value > 0);

  // Bar chart for priority breakdown
  const priorityData = (stats?.priorityBreakdown ?? []).map(p => ({
    name: priorityLabel(p.priority),
    count: p.count,
  }));

  // Category bar chart
  const categoryData = (stats?.typesOfWork ?? []).map(c => ({
    name: c.category,
    count: c.count,
  }));

  // Sparkline trend for completion rate card
  const sparkline = [
    { v: Math.max(0, completionRate - 15) },
    { v: Math.max(0, completionRate - 10) },
    { v: Math.max(0, completionRate - 5) },
    { v: completionRate },
  ];

  if (loading) {
    return (
      <div className="sales-dashboard-wrapper" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="db-loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="sales-dashboard-wrapper">

      {/* HEADER */}
      <div className="dashboard-topbar">
        <div className="title-area">
          <h2>{t('dashboardTitle')}</h2>
          <span className="subtitle-date">{t('realtimeData')}</span>
        </div>
        <div className="date-picker-mock">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-row">
        {/* Tổng Task → /tasks không filter */}
        <div className="kpi-card clickable" onClick={() => navigate('/tasks', { state: { filter: 'All' } })}>
          <div className="kpi-info">
            <span className="kpi-label">{t('totalTasks')}</span>
            <span className="kpi-value">{total}</span>
            <span className="kpi-sub"><Layers size={12} /> {t('allTasks')}</span>
          </div>
          <div className="kpi-icon-box" style={{ background: '#eef2ff', color: '#818cf8' }}>
            <ListTodo size={22} />
          </div>
        </div>

        {/* Hoàn thành → /tasks filter Completed */}
        <div className="kpi-card clickable" onClick={() => navigate('/tasks', { state: { filter: 'Completed' } })}>
          <div className="kpi-info">
            <span className="kpi-label">{t('completedTasks')}</span>
            <span className="kpi-value">{completed}</span>
            <span className="kpi-sub kpi-green"><CheckCircle2 size={12} /> {completionRate}{t('completionRate')}</span>
          </div>
          <div className="kpi-icon-box" style={{ background: '#d1fae5', color: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Đang thực hiện → /tasks filter In Progress */}
        <div className="kpi-card clickable" onClick={() => navigate('/tasks', { state: { filter: 'In Progress' } })}>
          <div className="kpi-info">
            <span className="kpi-label">{t('inProgress')}</span>
            <span className="kpi-value">{inProgress}</span>
            <span className="kpi-sub kpi-amber"><Clock size={12} /> {t('activeTasks')}</span>
          </div>
          <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
        </div>

        {/* Quá hạn → /tasks filter overdue */}
        <div className="kpi-card clickable" onClick={() => navigate('/tasks', { state: { filter: 'Overdue' } })}>
          <div className="kpi-info">
            <span className="kpi-label">{t('overdueTasks')}</span>
            <span className="kpi-value">{overdue}</span>
            <span className="kpi-sub kpi-red"><AlertTriangle size={12} /> {t('needAttention')}</span>
          </div>
          <div className="kpi-icon-box" style={{ background: '#fee2e2', color: '#ef4444' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">{t('dueSoon')}</span>
            <span className="kpi-value">{dueSoon}</span>
            <span className="kpi-sub">{completedLast7} {t('doneLast7d')}</span>
          </div>
          <div className="kpi-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkline}>
                <Area type="monotone" dataKey="v" stroke="var(--sales-primary)" fill="var(--sales-primary-light)" fillOpacity={0.6} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="charts-row-3">

        {/* Status Pie */}
        <div className="chart-card">
          <h3 className="chart-title">{t('statusOverview')}</h3>
          {pieData.length > 0 ? (
            <div className="chart-wrapper-h200">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="db-empty">{t('noTaskData')}</div>
          )}
        </div>

        {/* Priority Breakdown */}
        <div className="chart-card">
          <h3 className="chart-title">{t('priorityBreakdown')}</h3>
          {priorityData.length > 0 ? (
            <div className="chart-wrapper-h200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--sales-text-light)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--sales-text-light)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  {priorityData.map((entry, index) => (
                    <Bar key={entry.name} dataKey="count" fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} radius={[6, 6, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="db-empty">{t('noData')}</div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="chart-card clickable-card" onClick={() => navigate('/categories')}>
          <div className="card-header-with-link">
            <h3 className="chart-title">{t('tasksByCategory')}</h3>
            <TrendingUp size={16} color="var(--sales-text-light)" />
          </div>
          {categoryData.length > 0 ? (
            <div className="chart-wrapper-h200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} barSize={28} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--sales-text-light)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--sales-text-main)' }} axisLine={false} tickLine={false} width={90} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="var(--sales-primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="db-empty">{t('noCategories')}</div>
          )}
        </div>
      </div>

      {/* UPCOMING DEADLINES TABLE */}
      <div className="chart-card">
        <div className="card-header-with-link">
          <h3 className="chart-title">{t('upcomingDeadlines')}</h3>
          <button className="btn-view-all" onClick={() => navigate('/tasks')}>
            {t('viewAll')} <ChevronRight size={14} />
          </button>
        </div>
        <div className="table-responsive">
          <table className="sales-table student-table">
            <thead>
              <tr>
                <th>{t('taskTitle') || t('taskName')}</th>
                <th>{t('category') || t('categories')}</th>
                <th>{t('deadline') || t('dueDate')}</th>
                <th className="align-right">{t('status')}</th>
                <th className="align-right">{t('priority')}</th>
              </tr>
            </thead>
            <tbody>
              {upcomingTasks.length > 0 ? upcomingTasks.map((task) => {
                // Redux normalized tasks use string status/priority
                const isCompleted = task.status === 'Completed';
                const isInProgress = task.status === 'In Progress';
                const statusStr = isCompleted ? 'Completed' : isInProgress ? 'InProgress' : 'Pending';
                const priorityStr = task.priority ?? 'Medium';

                return (
                  <tr
                    key={task.id}
                    className="clickable-row"
                    onClick={() => navigate('/tasks', { state: { openTaskId: task.id } })}
                  >
                    <td className="fw-500 dash-task-name">{task.title}</td>
                    <td>
                      <span className="cell-category" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500 }}>
                        <FolderOpen size={13} color="#94a3b8" />
                        {categories.find(c => c.id === task.categoryId)?.name ?? '—'}
                      </span>
                    </td>
                    <td>
                      <div className="deadline-date" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                        <Calendar size={13} color={task.deadline && new Date(task.deadline) < new Date() ? '#ef4444' : '#94a3b8'} />
                        <span style={{ color: task.deadline && new Date(task.deadline) < new Date() ? '#ef4444' : 'var(--text-main)' }}>
                          {formatDate(task.deadline)}
                        </span>
                      </div>
                    </td>
                    <td className="align-right">
                      <span className={`badge-status ${statusStr}`}>
                        {isCompleted && <CheckCircle2 size={12} />}
                        {isInProgress && <RefreshCw size={12} />}
                        {(!isCompleted && !isInProgress) && <Clock size={12} />}
                        {statusLabel(task.status)}
                      </span>
                    </td>
                    <td className="align-right fw-600">
                      <span className={`badge-priority ${priorityStr}`}>
                        <ArrowUp size={11} />
                        {priorityLabel(task.priority)}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--sales-text-light)' }}>
                    {t('noDeadlines')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;