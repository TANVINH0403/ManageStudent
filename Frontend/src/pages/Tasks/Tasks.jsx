import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTask, updateTask, deleteTask } from '../../redux/taskSlice';
import {
  Search, Plus, MoreVertical, CheckSquare, Square,
  ChevronLeft, ChevronRight, X, Calendar, Flag, AlignLeft,
  Tag, RefreshCw, LayoutGrid, List, FolderOpen, ChevronDown,
  ArrowUp, Clock, CheckCircle2, AlertCircle,
  Database, BookOpen, Code2, Zap, Layers
} from 'lucide-react';
import './Tasks.css';

const ITEMS_PER_PAGE = 10;

// Icon map theo categoryId — dùng cùng bộ với mockData
const ICON_MAP = {
  1: { Icon: Database, color: '#7c3aed', bg: '#ede9fe' },
  2: { Icon: BookOpen, color: '#10b981', bg: '#d1fae5' },
  3: { Icon: Code2,    color: '#f59e0b', bg: '#fef3c7' },
  4: { Icon: Zap,      color: '#3b82f6', bg: '#dbeafe' },
};
const getCatIcon = (id) => ICON_MAP[id] || { Icon: Layers, color: '#64748b', bg: '#f1f5f9' };

const isOverdue = (deadline, status) =>
  status !== 'Completed' && new Date(deadline) < new Date();

const getDaysText = (deadline, status) => {
  if (status === 'Completed') return 'Đã hoàn thành';
  const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  if (diff < 0) return 'Quá hạn';
  if (diff === 0) return 'Hôm nay';
  return `${diff} ngày tới`;
};

// ── Modal tạo Task mới ──────────────────────────────────────────────────────
const CreateTaskModal = ({ categories, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: '', description: '', categoryId: categories[0]?.id || 1,
    deadline: new Date().toISOString().split('T')[0],
    priority: 'Medium', status: 'Pending', progress: 0,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, id: Date.now(), categoryId: Number(form.categoryId), progress: Number(form.progress) });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Tạo công việc mới</h3>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên công việc *</label>
            <input type="text" placeholder="Nhập tên công việc..." value={form.title}
              onChange={e => set('title', e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <input type="text" placeholder="Mô tả ngắn..." value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Danh mục</label>
              <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mức ưu tiên</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Tiến độ: {form.progress}%</label>
            <input type="range" min="0" max="100" value={form.progress}
              className="progress-slider" onChange={e => set('progress', e.target.value)} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary">Tạo công việc</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const Tasks = () => {
  const dispatch = useDispatch();
  // ← Lấy dữ liệu từ Redux Store (dùng chung với Kanban, Calendar, Categories)
  const tasks      = useSelector(s => s.tasks.items);
  const categories = useSelector(s => s.categories.items);

  const [searchTerm, setSearchTerm]       = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter]    = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTasks, setSelectedTasks]  = useState([]);
  const [activeTask, setActiveTask]        = useState(null);
  const [editTask, setEditTask]            = useState(null);
  const [currentPage, setCurrentPage]      = useState(1);
  const [viewMode, setViewMode]            = useState('list');
  const [openMenuId, setOpenMenuId]        = useState(null);
  const [showCreate, setShowCreate]        = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Category name & icon lookup từ Redux categories
  const getCatMeta = (id) => {
    const cat = categories.find(c => c.id === id);
    const iconMeta = getCatIcon(id);
    return { name: cat?.name ?? 'Khác', ...iconMeta };
  };

  // Label helpers for filter dropdowns
  const catLabel = (v) => v === 'All' ? 'All Categories' : (categories.find(c => c.id === Number(v))?.name ?? v);
  const statusLabel = (v) => v === 'All' ? 'All Status' : v;
  const priorityLabel = (v) => v === 'All' ? 'All Priority' : v;

  // Filtering
  const filtered = tasks.filter(t => {
    const s = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const c = categoryFilter === 'All' || t.categoryId === Number(categoryFilter);
    const st = statusFilter   === 'All' || t.status    === statusFilter;
    const p  = priorityFilter === 'All' || t.priority  === priorityFilter;
    return s && c && st && p;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Summary
  const summary = {
    total:      tasks.length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    pending:    tasks.filter(t => t.status === 'Pending').length,
    overdue:    tasks.filter(t => isOverdue(t.deadline, t.status)).length,
  };

  // Handlers
  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelectedTasks(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleSelectAll = () =>
    setSelectedTasks(prev => prev.length === paginated.length ? [] : paginated.map(t => t.id));

  const handleDeleteTask = (id) => {
    dispatch(deleteTask(id));
    setOpenMenuId(null);
    if (activeTask?.id === id) setActiveTask(null);
  };

  const handleSaveDetail = () => {
    if (!editTask) return;
    dispatch(updateTask(editTask));
    setActiveTask(editTask);
  };

  const handleCreateTask = (newTask) => {
    dispatch(addTask(newTask));
  };

  const clearFilters = () => {
    setSearchTerm(''); setCategoryFilter('All');
    setStatusFilter('All'); setPriorityFilter('All'); setCurrentPage(1);
  };

  const openDetail = (task) => { setActiveTask(task); setEditTask({ ...task }); };
  const changePage = (p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="tasks-page">

      {/* ── PAGE HEADER ── */}
      <div className="tasks-header-section">
        <div className="title-area">
          <h1>Task List</h1>
          <p>Quản lý danh sách công việc của bạn.</p>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="summary-cards">
        {[
          { label: 'Tổng công việc',  value: summary.total,      Icon: List,         bg: '#ede9fe', ic: '#7c3aed', trend: '↑ 8 so với tuần trước',  dir: 'up'   },
          { label: 'Hoàn thành',      value: summary.completed,  Icon: CheckCircle2, bg: '#dcfce7', ic: '#16a34a', trend: '↑ 3 so với tuần trước',  dir: 'up'   },
          { label: 'Đang thực hiện',  value: summary.inProgress, Icon: RefreshCw,    bg: '#dbeafe', ic: '#2563eb', trend: '↑ 2 so với tuần trước',  dir: 'up'   },
          { label: 'Đang chờ',        value: summary.pending,    Icon: Clock,        bg: '#fef3c7', ic: '#d97706', trend: '↓ 2 so với tuần trước',  dir: 'down' },
          { label: 'Quá hạn',         value: summary.overdue,    Icon: AlertCircle,  bg: '#fee2e2', ic: '#dc2626', trend: '↓ 1 so với tuần trước',  dir: 'down' },
        ].map(({ label, value, Icon, bg, ic, trend, dir }) => (
          <div className="summary-card" key={label}>
            <div className="card-icon-wrap" style={{ background: bg }}>
              <Icon size={22} color={ic} />
            </div>
            <div className="card-body">
              <span className="card-label">{label}</span>
              <span className="card-value">{value}</span>
              <span className={`card-trend ${dir}`}>{trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <div className="filter-left">
          <div className="search-box-list">
            <Search size={16} color="#94a3b8" />
            <input type="text" placeholder="Search tasks..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>

          {/* Category — dùng categories từ Redux */}
          <div className="filter-dropdown">
            <FolderOpen size={15} color="#64748b" />
            <span className="filter-val">{catLabel(categoryFilter)}</span>
            <ChevronDown size={14} color="#94a3b8" />
            <select className="filter-native-select" value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="filter-dropdown">
            <CheckCircle2 size={15} color="#64748b" />
            <span className="filter-val">{statusLabel(statusFilter)}</span>
            <ChevronDown size={14} color="#94a3b8" />
            <select className="filter-native-select" value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div className="filter-dropdown">
            <ArrowUp size={15} color="#64748b" />
            <span className="filter-val">{priorityLabel(priorityFilter)}</span>
            <ChevronDown size={14} color="#94a3b8" />
            <select className="filter-native-select" value={priorityFilter}
              onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <button className="btn-clear-filter" onClick={clearFilters}>
            <RefreshCw size={14} /> Clear filters
          </button>
        </div>

        <div className="filter-right">
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Tạo Task
          </button>
          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <LayoutGrid size={16} />
            </button>
            <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── TASK TABLE ── */}
      <div className="table-container">
        <table className="flat-table">
          <thead>
            <tr>
              <th width="48">
                <div className="checkbox-wrapper" onClick={toggleSelectAll}>
                  {selectedTasks.length === paginated.length && paginated.length > 0
                    ? <CheckSquare size={17} color="#7c3aed" />
                    : <Square size={17} color="#cbd5e1" />}
                </div>
              </th>
              <th>Task Name</th>
              <th>Category</th>
              <th>Deadline</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Progress</th>
              <th width="44"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? paginated.map(task => {
              const cat = getCatMeta(task.categoryId);
              const CatIcon = cat.Icon;
              const overdue = isOverdue(task.deadline, task.status);

              return (
                <tr key={task.id}
                  className={`task-row ${selectedTasks.includes(task.id) ? 'selected-row' : ''}`}
                  onClick={() => openDetail(task)}
                >
                  <td>
                    <div className="checkbox-wrapper" onClick={e => toggleSelect(e, task.id)}>
                      {selectedTasks.includes(task.id)
                        ? <CheckSquare size={17} color="#7c3aed" />
                        : <Square size={17} color="#cbd5e1" />}
                    </div>
                  </td>
                  <td>
                    <div className="task-name-cell">
                      <div className="task-icon-title">
                        <span className="task-cat-icon" style={{ background: cat.bg }}>
                          <CatIcon size={17} color={cat.color} />
                        </span>
                        <span className="task-title">{task.title}</span>
                      </div>
                      <span className="task-desc">{task.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className="cell-category">
                      <FolderOpen size={13} color="#94a3b8" />
                      {cat.name}
                    </span>
                  </td>
                  <td>
                    <div className="deadline-cell">
                      <div className="deadline-date">
                        <Calendar size={13} color={overdue ? '#ef4444' : '#94a3b8'} />
                        <span style={{ color: overdue ? '#ef4444' : '#334155' }}>
                          {new Date(task.deadline).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <span className={`days-badge ${overdue ? 'overdue' : task.status === 'Completed' ? 'done' : 'normal'}`}>
                        {getDaysText(task.deadline, task.status)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-priority ${task.priority}`}>
                      <ArrowUp size={11} />{task.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status ${task.status.replace(/\s/g, '')}`}>
                      {task.status === 'Completed'   && <CheckCircle2 size={12} />}
                      {task.status === 'In Progress' && <RefreshCw size={12} />}
                      {task.status === 'Pending'     && <Clock size={12} />}
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <div className="progress-cell">
                      <span className="progress-pct">{task.progress ?? 0}%</span>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{
                          width: `${task.progress ?? 0}%`,
                          background: (task.progress ?? 0) === 100 ? '#16a34a' : '#7c3aed',
                        }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="more-menu-wrap" ref={openMenuId === task.id ? menuRef : null}>
                      <button className="btn-more"
                        onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === task.id ? null : task.id); }}>
                        <MoreVertical size={17} />
                      </button>
                      {openMenuId === task.id && (
                        <div className="context-menu">
                          <button onClick={e => { e.stopPropagation(); openDetail(task); setOpenMenuId(null); }}>✏️ Chỉnh sửa</button>
                          <button className="danger" onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}>🗑️ Xóa</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="8" className="empty-state">Không tìm thấy công việc nào.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination-bar">
          <span className="page-info">
            Hiển thị {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} đến{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} của {filtered.length} công việc
          </span>
          <div className="page-controls">
            <button className="btn-page" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft size={15} /> Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn-page num ${currentPage === p ? 'active' : ''}`} onClick={() => changePage(p)}>{p}</button>
            ))}
            <button className="btn-page" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
              Sau <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── OVERLAY ── */}
      {activeTask && <div className="overlay" onClick={() => setActiveTask(null)} />}

      {/* ── DETAIL SLIDE PANEL ── */}
      <div className={`task-detail-panel ${activeTask ? 'open' : ''}`}>
        {activeTask && editTask && (
          <>
            <div className="panel-header">
              <h2>Task Details</h2>
              <button className="btn-close" onClick={() => setActiveTask(null)}><X size={20} /></button>
            </div>
            <div className="panel-content">
              <div className="detail-group">
                <input type="text" className="detail-title-input" value={editTask.title}
                  onChange={e => setEditTask({ ...editTask, title: e.target.value })} />
              </div>
              <div className="detail-meta-grid">
                <div className="meta-item">
                  <span className="meta-label"><Tag size={13} /> Category</span>
                  {/* ← Categories từ Redux */}
                  <select className="meta-select" value={editTask.categoryId}
                    onChange={e => setEditTask({ ...editTask, categoryId: Number(e.target.value) })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><Calendar size={13} /> Deadline</span>
                  <input type="date" className="detail-date-input"
                    value={editTask.deadline?.split('T')[0]}
                    onChange={e => setEditTask({ ...editTask, deadline: e.target.value })} />
                </div>
                <div className="meta-item">
                  <span className="meta-label"><Flag size={13} /> Priority</span>
                  <select className={`meta-select priority-sel ${editTask.priority}`}
                    value={editTask.priority}
                    onChange={e => setEditTask({ ...editTask, priority: e.target.value })}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><CheckSquare size={13} /> Status</span>
                  <select className={`meta-select status-sel ${editTask.status.replace(/\s/g, '')}`}
                    value={editTask.status}
                    onChange={e => setEditTask({ ...editTask, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="detail-group">
                <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlignLeft size={13} /> Progress: {editTask.progress ?? 0}%
                </span>
                <input type="range" min="0" max="100" value={editTask.progress ?? 0}
                  className="progress-slider"
                  onChange={e => setEditTask({ ...editTask, progress: Number(e.target.value) })} />
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill"
                    style={{ width: `${editTask.progress ?? 0}%`, background: (editTask.progress ?? 0) === 100 ? '#16a34a' : '#7c3aed' }} />
                </div>
              </div>
              <div className="detail-group desc-group">
                <div className="desc-header"><AlignLeft size={15} /><h3>Description</h3></div>
                <textarea className="detail-desc-input" rows="4"
                  value={editTask.description ?? ''}
                  onChange={e => setEditTask({ ...editTask, description: e.target.value })}
                  placeholder="Thêm mô tả..." />
              </div>
            </div>
            <div className="panel-footer">
              <button className="btn-outline" onClick={() => setActiveTask(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveDetail}>Save Changes</button>
            </div>
          </>
        )}
      </div>

      {/* ── CREATE TASK MODAL ── */}
      {showCreate && (
        <CreateTaskModal
          categories={categories}
          onClose={() => setShowCreate(false)}
          onSave={handleCreateTask}
        />
      )}
    </div>
  );
};

export default Tasks;