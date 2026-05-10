import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateTaskStatus, createTask, updateTask, deleteTask, fetchTasks } from '../../redux/taskSlice';
import { fetchCategories } from '../../redux/categorySlice';
import {
  Plus, MoreHorizontal, Calendar, Clock, CheckCircle2, X,
  Filter, List, Settings2, Hash,
  GripVertical, ChevronRight, Edit2, Trash2
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../context/AuthContext';
import { CreateTaskModal } from '../Tasks/Tasks';
import './Kanban.css';

/* ─── Column config ─── */
const COLUMNS = [
  {
    id: 'Pending',
    dotColor: '#94a3b8',
    countBg: '#f1f5f9',
    countColor: '#64748b',
  },
  {
    id: 'In Progress',
    dotColor: '#f59e0b',
    countBg: '#fef3c7',
    countColor: '#d97706',
  },
  {
    id: 'Completed',
    dotColor: '#10b981',
    countBg: '#dcfce7',
    countColor: '#16a34a',
  },
];

// Removed QuickAddForm as user wants the full modal.

/* ─── Main Component ─── */
const Kanban = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { t, locale } = useTranslation();
  const { isAuthenticated, showAuthModal } = useAuth();
  const tasks      = useSelector(s => s.tasks.items);
  const categories = useSelector(s => s.categories.items);

  const [dragging, setDragging]         = useState(null);
  const [dragOver, setDragOver]         = useState(null);
  const [showCreate, setShowCreate]     = useState(false);
  const [editingTask, setEditingTask]   = useState(null);
  const [openMenuId, setOpenMenuId]     = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchCategories());
  }, [dispatch]);

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
      dispatch(updateTaskStatus({ id: dragging.id, status: newStatus }));
    }
    setDragging(null);
    setDragOver(null);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  /* ── Full modal create ── */
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', categoryId: '', deadline: '', status: 'Pending' });
  const handleCreate = (taskData) => {
    dispatch(createTask(taskData));
    setShowCreate(false);
  };

  const handleEdit = (taskData) => {
    dispatch(updateTask({ id: taskData.id, data: taskData }));
    setEditingTask(null);
  };

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="kanban-page">

      {/* ── PAGE HEADER ── */}
      <div className="kb-page-header">
        <div className="kb-title-area">
          <h1>{t('kanban')}</h1>
          <p>{t('manageTasks')}</p>
        </div>
        <div className="kb-toolbar">
          <button className="kb-tool-btn outline" onClick={() => navigate('/tasks')}>
            <Filter size={15} /> {t('filter')}
          </button>
          <button className="kb-tool-btn icon" title={t('listView') || 'List View'} onClick={() => navigate('/tasks')}><List size={17} /></button>
          <button className="kb-tool-btn icon" title={t('settings') || 'Settings'} onClick={() => navigate('/settings')}><Settings2 size={17} /></button>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="kb-summary-cards">
        <div className="kb-summary-card">
          <div className="kb-card-icon" style={{ background: '#ede9fe' }}>
            <Hash size={20} color="#7c3aed" />
          </div>
          <div className="kb-card-body">
            <span className="kb-card-label">{t('totalTasks')}</span>
            <span className="kb-card-value">{summary.total}</span>
            <span className="kb-card-sub">{t('all')}</span>
          </div>
        </div>
        <div className="kb-summary-card">
          <div className="kb-card-icon" style={{ background: '#f1f5f9' }}>
            <Clock size={20} color="#64748b" />
          </div>
          <div className="kb-card-body">
            <span className="kb-card-label">{t('statusPending')}</span>
            <span className="kb-card-value">{summary.pending}</span>
          </div>
        </div>
        <div className="kb-summary-card">
          <div className="kb-card-icon" style={{ background: '#fef3c7' }}>
            <Settings2 size={20} color="#d97706" />
          </div>
          <div className="kb-card-body">
            <span className="kb-card-label">{t('statusInProgress')}</span>
            <span className="kb-card-value">{summary.inProgress}</span>
          </div>
        </div>
        <div className="kb-summary-card">
          <div className="kb-card-icon" style={{ background: '#dcfce7' }}>
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div className="kb-card-body">
            <span className="kb-card-label">{t('statusCompleted')}</span>
            <span className="kb-card-value">{summary.completed}</span>
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
                  <h3>{t(col.id === 'In Progress' ? 'statusInProgress' : col.id === 'Completed' ? 'statusCompleted' : 'statusTodo')}</h3>
                  <span className="kb-col-count"
                    style={{ background: col.countBg, color: col.countColor }}>
                    {colTasks.length}
                  </span>
                </div>
                <button className="kb-col-add-btn" onClick={() => setShowCreate(col.id)}>
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
                    <div className="kb-card-top">
                      <span className={`kb-priority ${task.priority}`}>{(t(`priority${task.priority}`) || task.priority).toUpperCase()}</span>
                      <div className="kb-card-menu-wrap" ref={openMenuId === task.id ? menuRef : null}>
                        <button className="kb-card-menu-btn"
                          onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === task.id ? null : task.id); }}>
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenuId === task.id && (
                          <div className="kb-context-menu">
                            <button onClick={() => { setEditingTask(task); setOpenMenuId(null); }}>
                              <Edit2 size={13} style={{ marginRight: 6 }}/> {t('editTaskBtn')}
                            </button>
                            <button className="danger" onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa task "${task.title}" không?`)) {
                                dispatch(deleteTask(task.id));
                              }
                              setOpenMenuId(null);
                            }}>
                              <Trash2 size={13} style={{ marginRight: 6 }}/> {t('deleteTaskBtn')}
                            </button>
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
              </div>

              <div className="kb-col-footer">
                <button className="kb-add-card-btn" onClick={() => isAuthenticated ? setShowCreate(col.id) : showAuthModal()}>
                  <Plus size={15} /> {t('createTask')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CREATE/EDIT TASK MODAL ── */}
      {showCreate && (
        <CreateTaskModal
          categories={categories}
          tags={[]}
          dispatch={dispatch}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
          initialData={{ status: showCreate === true ? 'Pending' : showCreate }}
        />
      )}
      {editingTask && (
        <CreateTaskModal
          categories={categories}
          tags={[]}
          dispatch={dispatch}
          onClose={() => setEditingTask(null)}
          onSave={handleEdit}
          initialData={editingTask}
        />
      )}
    </div>
  );
};

export default Kanban;