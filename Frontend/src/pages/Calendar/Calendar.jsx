import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createTask, fetchTasks } from '../../redux/taskSlice';
import { fetchCategories } from '../../redux/categorySlice';
import {
  ChevronLeft, ChevronRight, Plus, X,
  Filter, MoreHorizontal, CalendarDays,
  AlertCircle, CheckCircle2, Clock, RefreshCw
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import './Calendar.css';

const COLOR_PALETTE = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];
const BG_PALETTE    = ['#dbeafe', '#dcfce7', '#fef3c7', '#fee2e2', '#ede9fe', '#cffafe'];

const Calendar = () => {
  const dispatch        = useDispatch();
  const { t, locale }  = useTranslation();
  const tasks           = useSelector(s => s.tasks.items);
  const categories      = useSelector(s => s.categories.items);

  const catColorMap = {};
  const catBgMap    = {};
  categories.forEach((cat, i) => {
    catColorMap[cat.id] = COLOR_PALETTE[i % COLOR_PALETTE.length];
    catBgMap[cat.id]    = BG_PALETTE[i % BG_PALETTE.length];
  });

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchCategories());
  }, [dispatch]);

  const today = new Date();
  const [viewDate, setViewDate]       = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickTitle, setQuickTitle]   = useState('');
  const [quickError, setQuickError]   = useState('');
  const [modalForm, setModalForm]     = useState({ title: '', deadline: '', categoryId: '', priority: 'Medium' });

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday   = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(null); };

  const firstWeekDay = new Date(year, month, 1).getDay();
  const startOffset  = firstWeekDay === 0 ? 6 : firstWeekDay - 1;
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const daysInPrev   = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    cells.push({ day: d, month: month === 0 ? 11 : month - 1, year: month === 0 ? year - 1 : year, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, current: true });
  }
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: month === 11 ? 0 : month + 1, year: month === 11 ? year + 1 : year, current: false });
  }

  const getTasksForCell = (cell) =>
    tasks.filter(task => {
      const td = new Date(task.deadline);
      return td.getFullYear() === cell.year && td.getMonth() === cell.month && td.getDate() === cell.day;
    });

  const isToday    = (cell) => cell.year === today.getFullYear() && cell.month === today.getMonth() && cell.day === today.getDate();
  const isSelected = (cell) => selectedDay && cell.year === selectedDay.year && cell.month === selectedDay.month && cell.day === selectedDay.day;

  const handleQuickAdd = (e) => {
    if (e.key !== 'Enter' || !quickTitle.trim() || !selectedDay) return;
    if (categories.length === 0) {
      setQuickError(t('noCategoryHint') || 'Vui lòng tạo danh mục trước');
      return;
    }
    setQuickError('');
    const pad = (n) => String(n).padStart(2, '0');
    dispatch(createTask({
      title:      quickTitle,
      description: '',
      categoryId:  categories[0].id,
      priority:   'Medium',
      status:     'Pending',
      progress:   0,
      deadline:   `${selectedDay.year}-${pad(selectedDay.month + 1)}-${pad(selectedDay.day)}`,
    }));
    setQuickTitle('');
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!modalForm.title.trim() || !modalForm.deadline || categories.length === 0) return;
    dispatch(createTask({
      title:       modalForm.title,
      description: '',
      categoryId:  Number(modalForm.categoryId) || categories[0].id,
      priority:    modalForm.priority,
      status:      'Pending',
      progress:    0,
      deadline:    modalForm.deadline,
    }));
    setModalForm({ title: '', deadline: '', categoryId: '', priority: 'Medium' });
    setIsModalOpen(false);
  };

  const selectedDayTasks = selectedDay ? getTasksForCell(selectedDay) : [];

  const catName = (id) => {
    const found = categories.find(c => c.id === id);
    return found ? found.name : (t('otherCategory') || 'Khác');
  };

  const weekDayNames = [1, 2, 3, 4, 5, 6, 7].map(d =>
    new Date(2024, 0, d).toLocaleDateString(locale, { weekday: 'short' })
  );

  const statusIcon = (status) => {
    if (status === 'Completed')  return <CheckCircle2 size={11} />;
    if (status === 'In Progress') return <RefreshCw size={11} />;
    return <Clock size={11} />;
  };

  const statusClass = (status) => {
    if (status === 'Completed')   return 'Completed';
    if (status === 'In Progress') return 'InProgress';
    return 'Pending';
  };

  return (
    <div className="calendar-page">

      <div className="cal-header">
        <div className="cal-title-area">
          <h1>{t('calendar')}</h1>
          <p>{t('manageTasks')}</p>
        </div>
        <button
          className="cal-btn-add"
          onClick={() => setIsModalOpen(true)}
          disabled={categories.length === 0}
          title={categories.length === 0 ? (t('noCategoryHint') || 'Tạo danh mục trước') : ''}
        >
          <Plus size={17} /> {t('add')}
        </button>
      </div>

      {categories.length === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fef3c7', border: '1px solid #fde68a',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          color: '#92400e', fontSize: '0.9rem'
        }}>
          <AlertCircle size={16} color="#d97706" />
          {t('noCategoryHint') || 'Bạn cần tạo ít nhất một danh mục để thêm task vào lịch.'}
        </div>
      )}

      <div className="cal-card">
        <div className="cal-nav-bar">
          <div className="cal-nav-left">
            <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <span className="cal-month-label">
              {new Date(year, month).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
              <CalendarDays size={16} color="#7c3aed" style={{ marginLeft: 8, verticalAlign: 'middle' }} />
            </span>
            <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>
          <div className="cal-nav-right">
            <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
            <button className="cal-today-btn" onClick={goToday}>{t('todayStr') || 'Hôm nay'}</button>
            <div className="cal-view-dropdown">
              {t('month') || 'Tháng'} <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
            </div>
            <button className="cal-icon-btn"><Filter size={16} /></button>
            <button className="cal-icon-btn"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        <div className="cal-weekday-row">
          {weekDayNames.map((name, i) => (
            <div key={i} className="cal-weekday-cell">{name}</div>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((cell, idx) => {
            const cellTasks  = getTasksForCell(cell);
            const maxVisible = 3;
            return (
              <div
                key={idx}
                className={`cal-day${!cell.current ? ' other-month' : ''}${isToday(cell) ? ' is-today' : ''}${isSelected(cell) ? ' is-selected' : ''}`}
                onClick={() => setSelectedDay({ year: cell.year, month: cell.month, day: cell.day })}
              >
                <span className={`cal-day-num${isToday(cell) ? ' today-circle' : ''}`}>{cell.day}</span>
                <div className="cal-day-tasks">
                  {cellTasks.slice(0, maxVisible).map(task => (
                    <div key={task.id} className="cal-task-pill" title={task.title}
                      style={{ background: catBgMap[task.categoryId] || 'var(--bg-main)' }}>
                      <span className="cal-dot" style={{ background: catColorMap[task.categoryId] || '#64748b' }} />
                      <span className="cal-pill-text" style={{ color: catColorMap[task.categoryId] || 'var(--text-main)' }}>{task.title}</span>
                    </div>
                  ))}
                  {cellTasks.length > maxVisible && (
                    <div className="cal-more-pill">+{cellTasks.length - maxVisible} {t('more') || 'thêm'}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="cal-legend">
          {categories.map((cat) => (
            <div key={cat.id} className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: catColorMap[cat.id] || '#64748b' }} />
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedDay && <div className="cal-overlay" onClick={() => setSelectedDay(null)} />}
      <div className={`cal-day-panel${selectedDay ? ' open' : ''}`}>
        {selectedDay && (
          <>
            <div className="cdp-header">
              <div>
                <h2>
                  {new Date(selectedDay.year, selectedDay.month, selectedDay.day)
                    .toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
                <p>{selectedDayTasks.length} {t('tasksWord') || 'công việc'}</p>
              </div>
              <button className="cal-close-btn" onClick={() => setSelectedDay(null)}><X size={20} /></button>
            </div>
            <div className="cdp-body">
              <div className="cdp-quick-add">
                <Plus size={16} color="#7c3aed" />
                <input
                  type="text"
                  placeholder={
                    categories.length === 0
                      ? (t('noCategoryHint') || 'Tạo danh mục trước...')
                      : (t('quickAddPlaceholder') || 'Thêm công việc (Enter)...')
                  }
                  value={quickTitle}
                  onChange={e => { setQuickTitle(e.target.value); setQuickError(''); }}
                  onKeyDown={handleQuickAdd}
                  autoFocus
                  disabled={categories.length === 0}
                />
              </div>
              {quickError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontSize: '0.82rem', padding: '4px 8px' }}>
                  <AlertCircle size={13} /> {quickError}
                </div>
              )}

              <div className="cdp-task-list">
                {selectedDayTasks.length > 0 ? selectedDayTasks.map(task => (
                  <div key={task.id} className="cdp-task-item">
                    <span className="cdp-dot" style={{ background: catColorMap[task.categoryId] || '#64748b' }} />
                    <div className="cdp-task-info">
                      <span className={`cdp-task-title${task.status === 'Completed' ? ' done' : ''}`}>{task.title}</span>
                      <div className="cdp-task-meta">
                        <span className={`cdp-badge ${task.priority}`}>
                          {(t(`priority${task.priority}`) || task.priority).toUpperCase()}
                        </span>
                        <span className="cdp-cat">{catName(task.categoryId)}</span>
                        <span className={`cdp-status ${statusClass(task.status)}`}>
                          {statusIcon(task.status)}
                          {task.status === 'Completed' ? (t('statusCompleted') || 'Hoàn thành') :
                           task.status === 'In Progress' ? (t('statusInProgress') || 'Đang làm') :
                           (t('statusPending') || 'Chờ')}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="cdp-empty">
                    {t('noTasksForDay') || 'Không có công việc. Thêm mới bên trên!'}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="create-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('createNewTask') || 'Tạo Sự Kiện Mới'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form className="modal-body" onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label>{t('taskTitle') || 'Tên công việc'} *</label>
                <input
                  type="text"
                  placeholder={t('taskNameInput') || 'Nhập tên...'}
                  required
                  value={modalForm.title}
                  onChange={e => setModalForm({ ...modalForm, title: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('deadline') || 'Ngày'} *</label>
                  <input
                    type="date"
                    required
                    value={modalForm.deadline}
                    onChange={e => setModalForm({ ...modalForm, deadline: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('category') || 'Danh mục'}</label>
                  <select
                    value={modalForm.categoryId}
                    onChange={e => setModalForm({ ...modalForm, categoryId: e.target.value })}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('priority') || 'Mức ưu tiên'}</label>
                <select
                  value={modalForm.priority}
                  onChange={e => setModalForm({ ...modalForm, priority: e.target.value })}
                >
                  <option value="High">{t('priorityHigh') || 'Cao'}</option>
                  <option value="Medium">{t('priorityMedium') || 'Trung bình'}</option>
                  <option value="Low">{t('priorityLow') || 'Thấp'}</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>
                  {t('cancel') || 'Hủy'}
                </button>
                <button type="submit" className="btn-primary" disabled={categories.length === 0}>
                  {t('create') || 'Lưu Sự Kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;