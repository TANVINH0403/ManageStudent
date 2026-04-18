import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../../services/taskService';
import categoryService from '../../services/categoryService';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, X, CheckCircle2, Circle, PlusCircle } from 'lucide-react';
import './Calendar.css';

const getPriorityLabel = (p) => {
    switch(p) {
        case 0: return 'Low';
        case 1: return 'Medium';
        case 2: return 'High';
        default: return 'Low';
    }
}

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [localTasks, setLocalTasks] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal "Thêm sự kiện" tổng
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState(''); // Cho Quick Add trong panel
  const [formData, setFormData] = useState({ taskName: '', categoryId: '', priority: 1, dueDate: '' });

  useEffect(() => {
     const fetchData = async () => {
         try {
             setLoading(true);
             const [taskRes, catRes] = await Promise.all([
                 taskService.getTasks({ PageSize: 100 }),
                 categoryService.getAllCategories()
             ]);
             if(taskRes?.data) setLocalTasks(taskRes.data);
             if(catRes) {
                 if (Array.isArray(catRes)) setCategories(catRes);
                 else if (catRes.data && Array.isArray(catRes.data)) setCategories(catRes.data);
             }
         } catch(err) {
             console.error(err);
         } finally {
             setLoading(false);
         }
     }
     fetchData();
  }, []);

  // Tính toán ngày tháng
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  // Lấy task cho ngày
  const getTasksForDate = (day) => {
    return localTasks.filter(task => {
      if(!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.getDate() === day && taskDate.getMonth() === month && taskDate.getFullYear() === year;
    });
  };

  const tasksOnSelectedDate = selectedDate ? getTasksForDate(selectedDate) : [];

  // UX: Tạo Task nhanh cho đúng ngày đang mở
  const handleQuickAdd = async (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      if (categories.length === 0) {
          alert('Bạn cần tạo Project (Danh mục) trước khi tạo sự kiện!');
          navigate('/categories');
          return;
      }
      try {
          const formattedMonth = String(month + 1).padStart(2, '0');
          const formattedDay = String(selectedDate).padStart(2, '0');
          const isoDate = `${year}-${formattedMonth}-${formattedDay}T12:00:00.000Z`;

          const res = await taskService.createTask({
            taskName: newTaskTitle,
            description: 'Được tạo nhanh từ Lịch',
            categoryId: categories[0].categoryId || categories[0].id, 
            status: 0, 
            priority: 1, 
            dueDate: isoDate 
          });
          
          if(res) setLocalTasks([...localTasks, res]);
          setNewTaskTitle('');
      } catch(err) {
          alert("Lỗi tạo: " + JSON.stringify(err.response?.data || err.message));
      }
    }
  };

  const handleOpenAddModal = () => {
      if (categories.length === 0) {
          alert('Bạn cần tạo Project (Danh mục) trước khi tạo sự kiện!');
          navigate('/categories');
          return;
      }
      setFormData({
          taskName: '',
          categoryId: categories[0].categoryId || categories[0].id,
          priority: 1,
          dueDate: ''
      });
      setIsAddModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.taskName.trim() || !formData.categoryId || !formData.dueDate) return;
    try {
        const res = await taskService.createTask({
            taskName: formData.taskName,
            categoryId: parseInt(formData.categoryId),
            status: 0,
            priority: parseInt(formData.priority),
            dueDate: new Date(formData.dueDate).toISOString()
        });
        if(res) setLocalTasks([...localTasks, res]);
        setIsAddModalOpen(false);
    } catch(err) {
        alert("Lỗi tạo: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="calendar-page">
      <div className="cal-page-header">
        <div className="title-area">
          <h1>Calendar</h1>
          <p>Theo dõi deadline và lịch trình công việc của bạn.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} style={{ marginRight: '6px' }} /> Thêm Sự kiện
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Đang tải lịch...</div>
      ) : (
      <div className="calendar-container">
        {/* CONTROLS LỊCH */}
        <div className="calendar-controls">
          <h2 className="current-month">{monthNames[month]} {year}</h2>
          <div className="month-nav">
            <button className="btn-nav" onClick={prevMonth}><ChevronLeft size={20} /></button>
            <button className="btn-nav today-btn" onClick={() => setCurrentDate(new Date())}>Hôm nay</button>
            <button className="btn-nav" onClick={nextMonth}><ChevronRight size={20} /></button>
          </div>
        </div>

        {/* LƯỚI LỊCH */}
        <div className="calendar-grid">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
            <div key={d} className="weekday-header">{d}</div>
          ))}

          {blanks.map((_, i) => <div key={`blank-${i}`} className="calendar-day empty"></div>)}

          {days.map(day => {
            const dayTasks = getTasksForDate(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`calendar-day ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="day-number">{day}</div>
                <div className="day-tasks">
                  {dayTasks.map(task => (
                    <div key={task.taskId} className={`task-pill ${getPriorityLabel(task.priority)}`} title={task.taskName}>
                      {task.taskName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* --- PANEL CHI TIẾT NGÀY & TẠO NHANH --- */}
      {selectedDate && <div className="overlay" onClick={() => setSelectedDate(null)}></div>}

      <div className={`date-detail-panel ${selectedDate ? 'open' : ''}`}>
        {selectedDate && (
          <>
            <div className="panel-header">
              <div className="date-detail-title">
                <CalendarIcon size={20} color="#3b82f6" />
                <h2>Ngày {selectedDate} {monthNames[month]}</h2>
              </div>
              <button className="btn-close" onClick={() => setSelectedDate(null)}><X size={20} /></button>
            </div>

            <div className="panel-content">
              {/* UX: Ô TẠO NHANH */}
              <div className="quick-add-event">
                <PlusCircle size={18} color="#3b82f6" />
                <input
                  type="text"
                  placeholder={`Thêm việc cho ngày ${selectedDate} (Bấm Enter)`}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleQuickAdd}
                  autoFocus
                />
              </div>

              <h4 className="list-title">Công việc trong ngày ({tasksOnSelectedDate.length})</h4>
              <div className="cat-task-list">
                {tasksOnSelectedDate.length > 0 ? (
                  tasksOnSelectedDate.map(task => (
                    <div key={task.taskId} className="cat-task-item">
                      {task.status === 2 ? (
                        <CheckCircle2 size={18} color="#10b981" className="task-icon"/>
                      ) : (
                        <Circle size={18} color="#cbd5e1" className="task-icon"/>
                      )}
                      <div className="task-info">
                        <span className={`task-name ${task.status === 2 ? 'completed' : ''}`}>
                          {task.taskName}
                        </span>
                        <div className="task-meta">
                          <span className={`badge-priority ${getPriorityLabel(task.priority)}`}>{getPriorityLabel(task.priority)}</span>
                          <span className="task-time"><Clock size={12}/> {new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-tasks">Trống lịch! Bạn có thể nghỉ ngơi. 🎉</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- MODAL THÊM SỰ KIỆN TỔNG --- */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="event-modal">
            <div className="modal-header">
              <h3>Tạo Sự Kiện Mới</h3>
              <button className="btn-close" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            <form className="modal-body" onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label>Tên công việc</label>
                <input type="text" placeholder="Nhập tên..." value={formData.taskName} onChange={e => setFormData({...formData, taskName: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mốc Deadline</label>
                  <input type="datetime-local" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Danh mục</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                     {categories.map(c => <option key={c.categoryId || c.id} value={c.categoryId || c.id}>{c.categoryName || c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mức ưu tiên</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                      <option value={2}>High</option>
                      <option value={1}>Medium</option>
                      <option value={0}>Low</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsAddModalOpen(false)}>Hủy</button>
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