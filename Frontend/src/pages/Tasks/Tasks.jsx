import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchTasks, createTask, updateTask, deleteTask, updateTaskNotes } from '../../redux/taskSlice';
import { fetchCategories, createCategory } from '../../redux/categorySlice';
import { fetchTags } from '../../redux/tagSlice';
import taskFileApi from '../../api/taskFileApi';
import {
  Search, Plus, MoreVertical, CheckSquare, Square,
  ChevronLeft, ChevronRight, X, Calendar, Flag, AlignLeft,
  Tag, RefreshCw, LayoutGrid, List, FolderOpen, ChevronDown,
  ArrowUp, Clock, CheckCircle2, AlertCircle, Loader2, Edit2,
  Database, BookOpen, Code2, Zap, Layers, MessageSquare, Send,
  Paperclip, Trash2, Upload, Users, Trophy, Folder, FileText, Palette,
  FlaskConical, Settings2, Star, Heart, Globe, Award, Briefcase, Target, Lightbulb, Rocket, Music, Camera, ShieldCheck
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../context/AuthContext';
import './Tasks.css';

const ITEMS_PER_PAGE = 10;

// Icon map theo categoryId — dùng cùng bộ với mockData
const ALL_ICONS = {
  database: Database, bookopen: BookOpen, code2: Code2, zap: Zap, users: Users, trophy: Trophy, folder: Folder, filetext: FileText, palette: Palette, flask: FlaskConical, settings2: Settings2, star: Star, heart: Heart, globe: Globe, award: Award, briefcase: Briefcase, clock: Clock, target: Target, lightbulb: Lightbulb, rocket: Rocket, music: Music, camera: Camera, shield: ShieldCheck
};

const getCatIcon = (cat) => {
  if (!cat) return { Icon: Layers, color: '#64748b', bg: '#f1f5f9' };
  const Icon = ALL_ICONS[cat.iconKey] || Layers;
  const hex2rgba = (hex, alpha) => {
    if (!hex || hex.length < 7) return '#f1f5f9';
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  return { Icon, color: cat.color || '#64748b', bg: cat.color ? hex2rgba(cat.color, 0.15) : '#f1f5f9' };
};

const isOverdue = (deadline, status) =>
  status !== 'Completed' && new Date(deadline) < new Date();

const getDaysText = (deadline, status, t) => {
  if (status === 'Completed') return t('completedStatusStr');
  const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  if (diff < 0) return t('overdueStr');
  if (diff === 0) return t('todayStr');
  return `${diff} ${t('daysToCome')}`;
};

// ── Quick Create Category (no nested form — uses div + keydown) ─────────────
const QuickCategoryForm = ({ dispatch, onCreated, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    const result = await dispatch(createCategory({ name: name.trim() }));
    setSaving(false);
    if (result.payload?.length > 0) {
      const created = result.payload[result.payload.length - 1];
      onCreated(created);
    } else {
      onCancel();
    }
  };

  return (
    <div className="quick-cat-form">
      <p className="quick-cat-label">{t('createCategory')}</p>
      <div className="quick-cat-row">
        <input
          autoFocus
          type="text"
          placeholder={t('catName')}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="quick-cat-input"
        />
        <button
          type="button"
          className="btn-primary btn-sm"
          disabled={saving || !name.trim()}
          onClick={handleSave}
        >
          {saving ? '...' : t('create')}
        </button>
        <button type="button" className="btn-outline btn-sm" onClick={onCancel}>{t('cancel')}</button>
      </div>
    </div>
  );
};

// ── Modal tạo Task mới ──────────────────────────────────────────────────────
export const CreateTaskModal = ({ categories, tags, dispatch, onClose, onSave, initialData }) => {
  const { t } = useTranslation();
  const [showQuickCat, setShowQuickCat] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);
  const [tagInput, setTagInput]   = useState('');
  const [selectedTags, setSelectedTags] = useState(initialData?.tagNames || []);
  const [dialog, setDialog]       = useState({ isOpen: false, title: '', message: '' });
  const [form, setForm] = useState(initialData ? {
    title: initialData.title || '',
    description: initialData.description || '',
    categoryId: initialData.categoryId || (categories[0]?.id ?? ''),
    deadline: initialData.deadline ? initialData.deadline.split('T')[0] : new Date().toISOString().split('T')[0],
    priority: initialData.priority || 'Medium',
    status: initialData.status || 'Pending',
  } : {
    title: '', description: '',
    categoryId: categories[0]?.id ?? '',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'Medium', status: 'Pending',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Sync when redux categories update
  useEffect(() => {
    setLocalCategories(categories);
    if (!form.categoryId && categories.length > 0) set('categoryId', categories[0].id);
  }, [categories]);

  const handleCategoryCreated = (newCat) => { setShowQuickCat(false); set('categoryId', newCat.id); };

  // Tag helpers
  const filteredTags = tags.filter(t =>
    t.tagName.toLowerCase().includes(tagInput.toLowerCase()) &&
    !selectedTags.includes(t.tagName)
  );
  const toggleTag = (name) =>
    setSelectedTags(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  const removeTag = (name) => setSelectedTags(prev => prev.filter(n => n !== name));
  const addCustomTag = () => {
    const v = tagInput.trim();
    if (v && !selectedTags.includes(v)) { setSelectedTags(prev => [...prev, v]); setTagInput(''); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.categoryId) {
      setDialog({ isOpen: true, title: t('alertTitle') || 'Thông báo', message: t('noCategoryAlert') });
      return;
    }
    onSave(initialData ? { ...initialData, ...form, categoryId: Number(form.categoryId), tagNames: selectedTags } : { ...form, categoryId: Number(form.categoryId), tagNames: selectedTags });
    onClose();
  };

  return (
    <>
      {/* ── CUSTOM DIALOG ── */}
      {dialog.isOpen && (
        <div className="overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'var(--sidebar-bg)', padding: '24px 28px', borderRadius: '16px', width: '420px', maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700 }}>{dialog.title}</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.6 }}>{dialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-primary" onClick={() => setDialog({ isOpen: false })} style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 600, background: '#7c3aed', color: 'white', border: 'none' }}>
                {t('okBtn') || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="modal-backdrop" onClick={onClose}>
        <div className="create-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? t('editTaskBtn') : t('createNewTask')}</h3>
          <button type="button" className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('taskTitle')} *</label>
            <input type="text" placeholder={t('taskNameInput')} value={form.title}
              onChange={e => set('title', e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>{t('desc')}</label>
            <input type="text" placeholder={t('desc')} value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <div className="label-with-action">
                <label>{t('category')} *</label>
                <button type="button" className="btn-link-sm" onClick={() => setShowQuickCat(v => !v)}>
                  <Plus size={12} /> {t('create')}
                </button>
              </div>
              {localCategories.length === 0 ? (
                <div className="cat-empty-hint">
                  {t('noCategoryHint')}
                </div>
              ) : (
                <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} required>
                  <option value="">{t('selectCategory')}</option>
                  {localCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              {showQuickCat && (
                <QuickCategoryForm
                  dispatch={dispatch}
                  onCreated={handleCategoryCreated}
                  onCancel={() => setShowQuickCat(false)}
                />
              )}
            </div>
            <div className="form-group">
              <label>{t('deadline')} *</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('priority')}</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="High">🔴 {t('priorityHigh')}</option>
                <option value="Medium">🟡 {t('priorityMedium')}</option>
                <option value="Low">🟢 {t('priorityLow')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('status')}</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Pending">{t('statusTodo')}</option>
                <option value="In Progress">{t('statusInProgress')}</option>
                <option value="Completed">{t('statusCompleted')}</option>
              </select>
            </div>
          </div>
          {/* Tags */}
          <div className="form-group">
            <label><Tag size={13} /> {t('tags')}</label>
            <div className="tag-input-wrap">
              <input
                type="text" placeholder={t('searchTagPlaceholder')}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              />
              {tagInput && (
                <div className="tag-dropdown">
                  {filteredTags.map(t => (
                    <button key={t.tagId} type="button" className="tag-option"
                      onClick={() => { toggleTag(t.tagName); setTagInput(''); }}>
                      {t.tagName}
                    </button>
                  ))}
                  {!tags.find(t => t.tagName === tagInput.trim()) && tagInput.trim() && (
                    <button type="button" className="tag-option new" onClick={addCustomTag}>
                      + {t('createTag')} "{tagInput.trim()}"
                    </button>
                  )}
                </div>
              )}
            </div>
            {selectedTags.length > 0 && (
              <div className="tags-selected">
                {selectedTags.map(name => (
                  <span key={name} className="tag-chip">
                    {name}
                    <button type="button" onClick={() => removeTag(name)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose}>{t('cancel')}</button>
            <button type="submit" className="btn-primary">{initialData ? (t('saveChangesBtn') || 'Lưu') : t('create')}</button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const Tasks = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { isAuthenticated, showAuthModal } = useAuth();
  const tasks      = useSelector(s => s.tasks.items);
  const taskStatus = useSelector(s => s.tasks.status);
  const categories = useSelector(s => s.categories.items);
  const tags       = useSelector(s => s.tags.items);

  const [searchTerm, setSearchTerm]         = useState('');
  const [categoryFilter, setCategoryFilter]  = useState('All');
  const [statusFilter, setStatusFilter]      = useState('All');
  const [priorityFilter, setPriorityFilter]  = useState('All');
  const [selectedTasks, setSelectedTasks]    = useState([]);
  const [activeTask, setActiveTask]          = useState(null);
  const [editTask, setEditTask]              = useState(null);
  const [currentPage, setCurrentPage]        = useState(1);
  const [viewMode, setViewMode]              = useState('list');
  const [openMenuId, setOpenMenuId]          = useState(null);
  const [showCreate, setShowCreate]          = useState(false);
  const [newNote, setNewNote]                = useState('');
  const [saving, setSaving]                  = useState(false);
  // File upload state
  const [taskFiles, setTaskFiles]            = useState([]);
  const [uploading, setUploading]            = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Fetch tasks, categories, tags from API on mount
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTags());
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch]);

  // Open task details if navigated from Dashboard
  useEffect(() => {
    if (location.state?.openTaskId && tasks.length > 0) {
      const taskToOpen = tasks.find(t => t.id === location.state.openTaskId);
      if (taskToOpen) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveTask(taskToOpen);
        setEditTask({ ...taskToOpen });
        // Optional: clear state so it doesn't reopen on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, tasks, navigate, location.pathname]);

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
    const iconMeta = getCatIcon(cat);
    return { name: cat?.name ?? 'Khác', ...iconMeta };
  };

  // Label helpers for filter dropdowns
  const catLabel = (v) => v === 'All' ? t('allCategories') : (categories.find(c => c.id === Number(v))?.name ?? v);
  const statusLabel = (v) => v === 'All' ? t('allStatus') : v;
  const priorityLabel = (v) => v === 'All' ? t('allPriority') : v;

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

  const handleSaveDetail = async () => {
    if (!editTask) return;
    setSaving(true);
    await dispatch(updateTask({ id: editTask.id, data: editTask }));
    setActiveTask(editTask);
    setSaving(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !editTask) return;
    const note = {
      time: new Date().toLocaleString(locale, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
      text: newNote.trim()
    };
    const updatedNotes = [...(editTask.notes || []), note];
    const updatedTask  = { ...editTask, notes: updatedNotes };
    setEditTask(updatedTask);
    // Notes lưu local (chưa có API riêng)
    dispatch(updateTaskNotes({ id: editTask.id, notes: updatedNotes }));
    setNewNote('');
  };

  const handleCreateTask = (newTask) => { dispatch(createTask(newTask)); };

  const clearFilters = () => {
    setSearchTerm(''); setCategoryFilter('All');
    setStatusFilter('All'); setPriorityFilter('All'); setCurrentPage(1);
  };

  const openDetail = async (task) => {
    setActiveTask(task); setEditTask({ ...task }); setNewNote('');
    // Load files for this task
    try {
      const files = await taskFileApi.getFiles(task.id);
      setTaskFiles(Array.isArray(files) ? files : (files.data ?? []));
    } catch { setTaskFiles([]); }
  };
  const changePage = (p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)));

  // File handlers
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !activeTask) return;
    setUploading(true);
    try {
      await taskFileApi.upload(activeTask.id, files);
      const updated = await taskFileApi.getFiles(activeTask.id);
      setTaskFiles(Array.isArray(updated) ? updated : (updated.data ?? []));
    } catch (err) { console.error('Upload failed', err); }
    setUploading(false);
    e.target.value = '';
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await taskFileApi.delete(fileId);
      setTaskFiles(prev => prev.filter(f => f.id !== fileId && f.attachmentId !== fileId));
    } catch (err) { console.error('Delete file failed', err); }
  };

  return (
    <div className="tasks-page">

      {/* ── PAGE HEADER ── */}
      <div className="tasks-header-section">
        <div className="title-area">
          <h1>{t('taskListTitle')}</h1>
          <p>{t('manageTasks')}</p>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="summary-cards">
        {[
          { label: t('totalTasks'),       value: summary.total,      Icon: List,         bg: '#ede9fe', ic: '#7c3aed' },
          { label: t('statusCompleted'),  value: summary.completed,  Icon: CheckCircle2, bg: '#dcfce7', ic: '#16a34a' },
          { label: t('statusInProgress'), value: summary.inProgress, Icon: RefreshCw,    bg: '#dbeafe', ic: '#2563eb' },
          { label: t('statusPending'),    value: summary.pending,    Icon: Clock,        bg: '#fef3c7', ic: '#d97706' },
          { label: t('overdue'),          value: summary.overdue,    Icon: AlertCircle,  bg: '#fee2e2', ic: '#dc2626' },
        ].map(({ label, value, Icon, bg, ic }) => (
          <div className="summary-card" key={label}>
            <div className="card-icon-wrap" style={{ background: bg }}>
              <Icon size={22} color={ic} />
            </div>
            <div className="card-body">
              <span className="card-label">{label}</span>
              <span className="card-value">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        <div className="filter-left">
          {/* Category — dùng categories từ Redux */}
          <div className="filter-dropdown">
            <FolderOpen size={15} color="#64748b" />
            <span className="filter-val">{catLabel(categoryFilter)}</span>
            <ChevronDown size={14} color="#94a3b8" />
            <select className="filter-native-select" value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">{t('allCategories')}</option>
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
              <option value="All">{t('allStatus')}</option>
              <option value="Pending">{t('statusTodo')}</option>
              <option value="In Progress">{t('statusInProgress')}</option>
              <option value="Completed">{t('statusCompleted')}</option>
            </select>
          </div>

          {/* Priority */}
          <div className="filter-dropdown">
            <ArrowUp size={15} color="#64748b" />
            <span className="filter-val">{priorityLabel(priorityFilter)}</span>
            <ChevronDown size={14} color="#94a3b8" />
            <select className="filter-native-select" value={priorityFilter}
              onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">{t('allPriority')}</option>
              <option value="High">{t('priorityHigh')}</option>
              <option value="Medium">{t('priorityMedium')}</option>
              <option value="Low">{t('priorityLow')}</option>
            </select>
          </div>

          <button className="btn-clear-filter" onClick={clearFilters}>
            <RefreshCw size={14} /> {t('clearFilters')}
          </button>
        </div>

        <div className="filter-right">
          <button className="btn-primary" onClick={() => isAuthenticated ? setShowCreate(true) : showAuthModal()}>
            <Plus size={16} /> {t('createTaskBtn')}
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
              <th>{t('taskTitle')}</th>
              <th>{t('category')}</th>
              <th>{t('deadline')}</th>
              <th>{t('priority')}</th>
              <th>{t('status')}</th>
              <th>{t('progressLabel') || 'Progress'}</th>
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
                        <span style={{ color: overdue ? '#ef4444' : 'var(--text-main)' }}>
                          {new Date(task.deadline).toLocaleDateString(locale)}
                        </span>
                      </div>
                      <span className={`days-badge ${overdue ? 'overdue' : task.status === 'Completed' ? 'done' : 'normal'}`}>
                        {getDaysText(task.deadline, task.status, t)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge-priority ${task.priority}`}>
                      <ArrowUp size={11} />
                      {task.priority === 'High' ? t('priorityHigh') : task.priority === 'Low' ? t('priorityLow') : t('priorityMedium')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status ${task.status.replace(/\s/g, '')}`}>
                      {task.status === 'Completed'   && <CheckCircle2 size={12} />}
                      {task.status === 'In Progress' && <RefreshCw size={12} />}
                      {task.status === 'Pending'     && <Clock size={12} />}
                      {task.status === 'Completed'   ? t('statusCompleted')   :
                       task.status === 'In Progress' ? t('statusInProgress') : t('statusTodo')}
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
                          <button onClick={e => { e.stopPropagation(); openDetail(task); setOpenMenuId(null); }}><Edit2 size={14} style={{ marginRight: 6 }} /> {t('editTaskBtn')}</button>
                          <button className="danger" onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}><Trash2 size={14} style={{ marginRight: 6 }} /> {t('deleteTaskBtn')}</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="8" className="empty-state">{t('noTasksFound')}</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination-bar">
          <span className="page-info">
            {t('showing')} {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} {t('to')}{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} {t('of')} {filtered.length} {t('tasksWord')}
          </span>
          <div className="page-controls">
            <button className="btn-page" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft size={15} /> {t('prevPage')}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn-page num ${currentPage === p ? 'active' : ''}`} onClick={() => changePage(p)}>{p}</button>
            ))}
            <button className="btn-page" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
              {t('nextPage')} <ChevronRight size={15} />
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
              <h2>{t('taskDetails') || 'Task Details'}</h2>
              <button className="btn-close" onClick={() => setActiveTask(null)}><X size={20} /></button>
            </div>
            <div className="panel-content">
              <div className="detail-group">
                <input type="text" className="detail-title-input" value={editTask.title}
                  onChange={e => setEditTask({ ...editTask, title: e.target.value })} />
              </div>
              <div className="detail-meta-grid">
                <div className="meta-item">
                  <span className="meta-label"><Tag size={13} /> {t('category')}</span>
                  {/* ← Categories từ Redux */}
                  <select className="meta-select" value={editTask.categoryId}
                    onChange={e => setEditTask({ ...editTask, categoryId: Number(e.target.value) })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><Calendar size={13} /> {t('deadline')}</span>
                  <input type="date" className="detail-date-input"
                    value={editTask.deadline?.split('T')[0]}
                    onChange={e => setEditTask({ ...editTask, deadline: e.target.value })} />
                </div>
                <div className="meta-item">
                  <span className="meta-label"><Flag size={13} /> {t('priority')}</span>
                  <select className={`meta-select priority-sel ${editTask.priority}`}
                    value={editTask.priority}
                    onChange={e => setEditTask({ ...editTask, priority: e.target.value })}>
                    <option value="High">{t('priorityHigh')}</option>
                    <option value="Medium">{t('priorityMedium')}</option>
                    <option value="Low">{t('priorityLow')}</option>
                  </select>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><CheckSquare size={13} /> {t('status')}</span>
                  <select className={`meta-select status-sel ${editTask.status.replace(/\s/g, '')}`}
                    value={editTask.status}
                    onChange={e => setEditTask({ ...editTask, status: e.target.value })}>
                    <option value="Pending">{t('statusTodo')}</option>
                    <option value="In Progress">{t('statusInProgress')}</option>
                    <option value="Completed">{t('statusCompleted')}</option>
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
              {/* ── Files / Attachments ── */}
              <div className="detail-group">
                <div className="desc-header">
                  <Paperclip size={15} /><h3>{t('attachments')}</h3>
                  <button
                    type="button" className="btn-upload-file"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload size={13} /> {uploading ? t('uploadingFile') : t('uploadBtn')}
                  </button>
                  <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileUpload} />
                </div>
                <div className="files-list">
                  {taskFiles.length === 0 ? (
                    <p className="no-files">{t('noAttachments')}</p>
                  ) : taskFiles.map(f => (
                    <div key={f.id ?? f.attachmentId} className="file-item">
                      <Paperclip size={13} color="#7c3aed" />
                      <span className="file-name">{f.fileName ?? f.name}</span>
                      <button className="btn-del-file"
                        onClick={() => handleDeleteFile(f.id ?? f.attachmentId)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Notes ── */}
              <div className="detail-group notes-group">
                <div className="desc-header"><AlignLeft size={15} /><h3>{t('notesHeader')}</h3></div>
                <div className="notes-list">
                  {(editTask.notes || []).length > 0 ? (
                    editTask.notes.map((note, idx) => (
                      <div className="note-item" key={idx}>
                        <div className="note-bullet"></div>
                        <div className="note-content">
                          <span className="note-time">{note.time}</span>
                          <div className="note-text">{note.text}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notes">{t('noNotes')}</div>
                  )}
                </div>
                <div className="note-input-area">
                  <input
                    type="text" placeholder={t('addNotePlaceholder')}
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }}
                  />
                  <button className="btn-send" onClick={handleAddNote} disabled={!newNote.trim()}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="panel-footer">
              <button className="btn-outline" onClick={() => setActiveTask(null)}>{t('cancel')}</button>
              <button className="btn-primary" onClick={handleSaveDetail}>
                {saving ? '...' : (t('saveChangesBtn') || 'Save Changes')}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── CREATE TASK MODAL ── */}
      {showCreate && (
        <CreateTaskModal
          categories={categories}
          tags={tags}
          dispatch={dispatch}
          onClose={() => setShowCreate(false)}
          onSave={handleCreateTask}
        />
      )}
    </div>
  );
};

export default Tasks;