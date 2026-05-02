import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTask } from '../../redux/taskSlice';
import {
  ChevronLeft, ChevronRight, Plus, X,
  Filter, MoreHorizontal, CalendarDays
} from 'lucide-react';
import './Calendar.css';

// Category dot color
const CAT_COLORS = {
  1: '#2563eb',  // Chuyên ngành → blue
  2: '#16a34a',  // Học tập      → green
  3: '#d97706',  // Đồ án        → amber
  4: '#dc2626',  // Hoạt động    → red
};
// Category pill background (light tint)
const CAT_BG = {
  1: '#dbeafe',
  2: '#dcfce7',
  3: '#fef3c7',
  4: '#fee2e2',
};

const MONTH_NAMES = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];
const DAY_NAMES = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'];

const Calendar = () => {
  const dispatch   = useDispatch();
  const tasks      = useSelector(s => s.tasks.items);
  const categories = useSelector(s => s.categories.items);

  const today = new Date();
  const [viewDate, setViewDate]         = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay]   = useState(null);   // { year, month, day }
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [quickTitle, setQuickTitle]     = useState('');
  const [modalForm, setModalForm]       = useState({
    title: '', deadline: '', categoryId: '', priority: 'Medium',
  });

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday   = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(null); };

  /* Build calendar grid: 6 rows × 7 cols (Mon…Sun) */
  const firstWeekDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset  = firstWeekDay === 0 ? 6 : firstWeekDay - 1; // Mon-based offset
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const daysInPrev   = new Date(year, month, 0).getDate();

  // Build cells: { day, month, year, isCurrentMonth }
  const cells = [];
  // Prev month tail
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    cells.push({ day: d, month: month - 1 < 0 ? 11 : month - 1, year: month - 1 < 0 ? year - 1 : year, current: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, current: true });
  }
  // Next month fill to complete rows
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: month + 1 > 11 ? 0 : month + 1, year: month + 1 > 11 ? year + 1 : year, current: false });
  }

  const getTasksForCell = (cell) =>
    tasks.filter(t => {
      const td = new Date(t.deadline);
      return td.getFullYear() === cell.year && td.getMonth() === cell.month && td.getDate() === cell.day;
    });

  const isToday = (cell) =>
    cell.year === today.getFullYear() && cell.month === today.getMonth() && cell.day === today.getDate();

  const isSelected = (cell) =>
    selectedDay && cell.year === selectedDay.year && cell.month === selectedDay.month && cell.day === selectedDay.day;

  /* Quick add */
  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && quickTitle.trim() && selectedDay) {
      const pad = (n) => String(n).padStart(2, '0');
      dispatch(addTask({
        id: Date.now(),
        title: quickTitle,
        description: '',
        categoryId: categories[0]?.id ?? 1,
        priority: 'Medium',
        status: 'Pending',
        progress: 0,
        deadline: `${selectedDay.year}-${pad(selectedDay.month + 1)}-${pad(selectedDay.day)}`,
      }));
      setQuickTitle('');
    }
  };

  /* Modal add */
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!modalForm.title.trim() || !modalForm.deadline) return;
    dispatch(addTask({
      id: Date.now(),
      title: modalForm.title,
      description: '',
      categoryId: Number(modalForm.categoryId) || (categories[0]?.id ?? 1),
      priority: modalForm.priority,
      status: 'Pending',
      progress: 0,
      deadline: modalForm.deadline,
    }));
    setModalForm({ title: '', deadline: '', categoryId: '', priority: 'Medium' });
    setIsModalOpen(false);
  };

  const selectedDayTasks = selectedDay ? getTasksForCell(selectedDay) : [];
  const catName = (id) => categories.find(c => c.id === id)?.name ?? 'Khác';

  return (
    <div className="calendar-page">

      {/* ── PAGE HEADER ── */}
      <div className="cal-header">
        <div className="cal-title-area">
          <h1>Calendar</h1>
          <p>Theo dõi deadline và lịch trình công việc của bạn.</p>
        </div>
        <button className="cal-btn-add" onClick={() => setIsModalOpen(true)}>
          <Plus size={17} /> Thêm sự kiện
        </button>
      </div>

      {/* ── CALENDAR CARD ── */}
      <div className="cal-card">

        {/* Month nav bar */}
        <div className="cal-nav-bar">
          <div className="cal-nav-left">
            <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <span className="cal-month-label">
              {MONTH_NAMES[month]} {year}
              <CalendarDays size={16} color="#7c3aed" style={{ marginLeft: 8, verticalAlign: 'middle' }} />
            </span>
            <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>

          <div className="cal-nav-right">
            <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
            <button className="cal-today-btn" onClick={goToday}>Hôm nay</button>
            <div className="cal-view-dropdown">
              Tháng <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
            </div>
            <button className="cal-icon-btn"><Filter size={16} /></button>
            <button className="cal-icon-btn"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="cal-weekday-row">
          {DAY_NAMES.map(d => (
            <div key={d} className="cal-weekday-cell">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="cal-grid">
          {cells.map((cell, idx) => {
            const cellTasks  = getTasksForCell(cell);
            const todayCell  = isToday(cell);
            const selCell    = isSelected(cell);
            const maxVisible = 3;

            return (
              <div
                key={idx}
                className={`cal-day ${!cell.current ? 'other-month' : ''} ${todayCell ? 'is-today' : ''} ${selCell ? 'is-selected' : ''}`}
                onClick={() => setSelectedDay({ year: cell.year, month: cell.month, day: cell.day })}
              >
                <span className={`cal-day-num ${todayCell ? 'today-circle' : ''}`}>{cell.day}</span>
                <div className="cal-day-tasks">
                  {cellTasks.slice(0, maxVisible).map(task => (
                    <div key={task.id} className="cal-task-pill" title={task.title}
                      style={{ background: CAT_BG[task.categoryId] ?? '#f1f5f9' }}>
                      <span className="cal-dot" style={{ background: CAT_COLORS[task.categoryId] ?? '#64748b' }} />
                      <span className="cal-pill-text" style={{ color: CAT_COLORS[task.categoryId] ?? '#334155' }}>{task.title}</span>
                    </div>
                  ))}
                  {cellTasks.length > maxVisible && (
                    <div className="cal-more-pill">+{cellTasks.length - maxVisible} thêm</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── LEGEND ── */}
        <div className="cal-legend">
          {[
            { label: 'Công việc', color: '#3b82f6' },
            { label: 'Học tập',   color: '#10b981' },
            { label: 'Cuộc họp', color: '#ef4444' },
            { label: 'Khác',     color: '#f59e0b' },
          ].map(l => (
            <div key={l.label} className="cal-legend-item">
              <span className="cal-legend-dot" style={{ background: l.color }} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── DAY DETAIL SIDE PANEL ── */}
      {selectedDay && <div className="cal-overlay" onClick={() => setSelectedDay(null)} />}
      <div className={`cal-day-panel ${selectedDay ? 'open' : ''}`}>
        {selectedDay && (
          <>
            <div className="cdp-header">
              <div>
                <h2>Ngày {selectedDay.day} {MONTH_NAMES[selectedDay.month]}</h2>
                <p>{selectedDayTasks.length} công việc</p>
              </div>
              <button className="cal-close-btn" onClick={() => setSelectedDay(null)}><X size={20} /></button>
            </div>
            <div className="cdp-body">
              {/* Quick add */}
              <div className="cdp-quick-add">
                <Plus size={16} color="#7c3aed" />
                <input
                  type="text" placeholder="Thêm công việc (Enter)..."
                  value={quickTitle}
                  onChange={e => setQuickTitle(e.target.value)}
                  onKeyDown={handleQuickAdd}
                  autoFocus
                />
              </div>

              {/* Task list */}
              <div className="cdp-task-list">
                {selectedDayTasks.length > 0 ? selectedDayTasks.map(task => (
                  <div key={task.id} className="cdp-task-item">
                    <span className="cdp-dot" style={{ background: CAT_COLORS[task.categoryId] ?? '#64748b' }} />
                    <div className="cdp-task-info">
                      <span className={`cdp-task-title ${task.status === 'Completed' ? 'done' : ''}`}>{task.title}</span>
                      <div className="cdp-task-meta">
                        <span className={`cdp-badge ${task.priority}`}>{task.priority}</span>
                        <span className="cdp-cat">{catName(task.categoryId)}</span>
                        <span className={`cdp-status ${task.status.replace(/\s/g,'')}`}>{task.status}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="cdp-empty">Không có công việc. Thêm mới bên trên! 🎉</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── MODAL THÊM SỰ KIỆN ── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="create-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo Sự Kiện Mới</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form className="modal-body" onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label>Tên công việc *</label>
                <input type="text" placeholder="Nhập tên..." required
                  value={modalForm.title}
                  onChange={e => setModalForm({ ...modalForm, title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày *</label>
                  <input type="date" required value={modalForm.deadline}
                    onChange={e => setModalForm({ ...modalForm, deadline: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select value={modalForm.categoryId}
                    onChange={e => setModalForm({ ...modalForm, categoryId: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Mức ưu tiên</label>
                <select value={modalForm.priority}
                  onChange={e => setModalForm({ ...modalForm, priority: e.target.value })}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu Sự Kiện</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;