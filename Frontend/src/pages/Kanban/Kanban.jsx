import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateTaskStatus, addTask, deleteTask, updateTask } from '../../redux/taskSlice';
import {
  Plus, MoreHorizontal, Calendar, Clock, CheckCircle2, X,
  Filter, LayoutGrid, List, Settings2, Hash,
  GripVertical, ChevronRight
} from 'lucide-react';
import './Kanban.css';

/* ─── Column config ─── */
const COLUMNS = [
  {
    id: 'Pending',
    title: 'Chưa bắt đầu',
    dotColor: '#94a3b8',
    countBg: '#f1f5f9',
    countColor: '#64748b',
  },
  {
    id: 'In Progress',
    title: 'Đang thực hiện',
    dotColor: '#f59e0b',
    countBg: '#fef3c7',
    countColor: '#d97706',
  },
  {
    id: 'Completed',
    title: 'Hoàn thành',
    dotColor: '#10b981',
    countBg: '#dcfce7',
    countColor: '#16a34a',
  },
];

/* ─── Quick-add inline form per column ─── */
const QuickAddForm = ({ columnStatus, categories, onAdd, onCancel }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: Date.now(),
      title,
      description: '',
      categoryId: categories[0]?.id ?? 1,
      priority,
      status: columnStatus,
      progress: 0,
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
    setTitle('');
  };

  return (
    <form className="quick-add-form" onSubmit={submit}>
      <input
        autoFocus
        type="text"
        placeholder="Tên công việc..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="qa-input"
      />
      <div className="qa-row">
        <select className="qa-select" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <div className="qa-actions">
          <button type="submit" className="qa-btn-add">Thêm</button>
          <button type="button" className="qa-btn-cancel" onClick={onCancel}><X size={14} /></button>
        </div>
      </div>
    </form>
  );
};

/* ─── Main Component ─── */
const Kanban = () => {
  const dispatch   = useDispatch();
  const tasks      = useSelector(s => s.tasks.items);
  const categories = useSelector(s => s.categories.items);

  const [dragging, setDragging]         = useState(null);
  const [dragOver, setDragOver]         = useState(null);
  const [showCreate, setShowCreate]     = useState(false);
  const [quickAddCol, setQuickAddCol]   = useState(null);   // column id showing inline form
  const [openMenuId, setOpenMenuId]     = useState(null);
  const menuRef = useRef(null);

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  const summary = {
    total:      tasks.length,
    pending:    tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
  };

  /* ── Drag & Drop ── */
  const handleDragStart = (e, task) => {
    setDragging(task);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOver(colId);
  };
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (dragging && dragging.status !== newStatus) {
      dispatch(updateTaskStatus({ id: dragging.id, newStatus }));
    }
    setDragging(null);
    setDragOver(null);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  /* ── Quick add ── */
  const handleQuickAdd = (task) => {
    dispatch(addTask(task));
    setQuickAddCol(null);
  };

  /* ── Full modal create ── */
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', categoryId: '', deadline: '', status: 'Pending' });
  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    dispatch(addTask({
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      categoryId: Number(newTask.categoryId) || (categories[0]?.id ?? 1),
      priority: newTask.priority,
      status: newTask.status,
      progress: 0,
      deadline: newTask.deadline || new Date().toISOString().split('T')[0],
    }));
    setNewTask({ title: '', description: '', priority: 'Medium', categoryId: '', deadline: '', status: 'Pending' });
    setShowCreate(false);
  };

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="kanban-page">

      {/* ── PAGE HEADER ── */}
      <div className="kb-page-header">
        <div className="kb-title-area">
          <h1>Kanban Board</h1>
          <p>Kéo thả để cập nhật trạng thái công việc.</p>
        </div>
        <div className="kb-toolbar">
          <button className="kb-tool-btn outline">
            <Filter size={15} /> Bộ lọc
          </button>
          <button className="kb-tool-btn icon"><LayoutGrid size={17} /></button>
          <button className="kb-tool-btn icon"><List size={17} /></button>
          <button className="kb-tool-btn icon"><Settings2 size={17} /></button>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="kb-summary-cards">
        <div className="kb-summary-card">
          <div className="kb-card-icon" style={{ background: '#ede9fe' }}>
            <Hash size={20} color="#7c3aed" />
          </div>
          <div className="kb-card-body">
            <span className="kb-card-label">Tổng công việc</span>
            <span className="kb-card-value">{summary.total}</span>
            <span className="kb-card-sub">Tất cả</span>
          </div>
        </div>
        <div className="kb-summary-card">
          <div className="kb-card-icon" style={{ background: '#f1f5f9' }}>
            <Clock size={20} color="#64748b" />
          </div>
          <div className="kb-card-body">
            <span className="kb-card-label">Chưa bắt đầu</span>
            <span className="kb-card-value">{summary.pending}</span>
            <span className="kb-card-sub">Chờ xử lý</span>
          </div>
        </div>
        <div className="kb-summary-card">
          <div className="kb-card-icon" style={{ background: '#fef3c7' }}>
            <Settings2 size={20} color="#d97706" />
          </div>
          <div className="kb-card-body">
            <span className="kb-card-label">Đang thực hiện</span>
            <span className="kb-card-value">{summary.inProgress}</span>
            <span className="kb-card-sub">Đang làm</span>
          </div>
        </div>
        <div className="kb-summary-card">
          <div className="kb-card-icon" style={{ background: '#dcfce7' }}>
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div className="kb-card-body">
            <span className="kb-card-label">Hoàn thành</span>
            <span className="kb-card-value">{summary.completed}</span>
            <span className="kb-card-sub">Đã xong</span>
          </div>
        </div>
      </div>

      {/* ── KANBAN BOARD ── */}
      <div className="kb-board">
        {COLUMNS.map(col => {
          const colTasks = getTasksByStatus(col.id);
          const isOver   = dragOver === col.id;

          return (
            <div
              key={col.id}
              className={`kb-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={e => handleDragOver(e, col.id)}
              onDrop={e => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="kb-col-header">
                <div className="kb-col-title">
                  <span className="kb-col-dot" style={{ background: col.dotColor }} />
                  <h3>{col.title}</h3>
                  <span className="kb-col-count"
                    style={{ background: col.countBg, color: col.countColor }}>
                    {colTasks.length}
                  </span>
                </div>
                <button className="kb-col-add-btn" onClick={() => setQuickAddCol(col.id)}>
                  <Plus size={16} />
                </button>
              </div>

              {/* Cards */}
              <div className="kb-col-body">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className={`kb-card ${dragging?.id === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={e => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Card top */}
                    <div className="kb-card-top">
                      <span className={`kb-priority ${task.priority}`}>{task.priority.toUpperCase()}</span>
                      <div className="kb-card-menu-wrap" ref={openMenuId === task.id ? menuRef : null}>
                        <button className="kb-card-menu-btn"
                          onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === task.id ? null : task.id); }}>
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenuId === task.id && (
                          <div className="kb-context-menu">
                            <button onClick={() => setOpenMenuId(null)}>✏️ Chỉnh sửa</button>
                            <button className="danger" onClick={() => { dispatch(deleteTask(task.id)); setOpenMenuId(null); }}>🗑️ Xóa</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title & desc */}
                    <h4 className="kb-card-title">{task.title}</h4>
                    {task.description && <p className="kb-card-desc">{task.description}</p>}

                    {/* Progress bar – only for In Progress */}
                    {task.status === 'In Progress' && task.progress != null && task.progress > 0 && (
                      <div className="kb-progress-row">
                        <div className="kb-progress-bg">
                          <div className="kb-progress-fill" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="kb-progress-pct">{task.progress}%</span>
                      </div>
                    )}

                    {/* Card footer */}
                    <div className="kb-card-footer">
                      <div className="kb-footer-date">
                        <Calendar size={13} color="#94a3b8" />
                        <span>{formatDate(task.deadline)}</span>
                      </div>
                      {task.status === 'Completed'
                        ? <CheckCircle2 size={18} color="#10b981" />
                        : <Clock size={16} color="#94a3b8" />
                      }
                    </div>
                  </div>
                ))}

                {/* Inline quick-add form */}
                {quickAddCol === col.id ? (
                  <QuickAddForm
                    columnStatus={col.id}
                    categories={categories}
                    onAdd={handleQuickAdd}
                    onCancel={() => setQuickAddCol(null)}
                  />
                ) : (
                  <button className="kb-add-card-btn" onClick={() => setQuickAddCol(col.id)}>
                    <Plus size={15} /> Thêm công việc
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CREATE TASK MODAL ── */}
      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="create-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo Task mới</h3>
              <button className="btn-close" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <form className="modal-body" onSubmit={handleCreate}>
              <div className="form-group">
                <label>Tên công việc *</label>
                <input type="text" placeholder="Nhập tên..." value={newTask.title} autoFocus required
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <input type="text" placeholder="Mô tả ngắn..." value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Danh mục</label>
                  <select value={newTask.categoryId} onChange={e => setNewTask({ ...newTask, categoryId: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mức ưu tiên</label>
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                    <option value="Pending">Chưa bắt đầu</option>
                    <option value="In Progress">Đang thực hiện</option>
                    <option value="Completed">Hoàn thành</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowCreate(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Tạo Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanban;