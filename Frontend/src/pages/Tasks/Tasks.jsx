import React, { useState } from 'react';
import { mockTasks } from '../../data/mockData';
import {
  Search, Filter, Plus, MoreVertical, CheckSquare, Square,
  ChevronLeft, ChevronRight, X, Calendar, Flag, AlignLeft, Tag
} from 'lucide-react';
import './Tasks.css';

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTasks, setSelectedTasks] = useState([]);

  // State mới: Quản lý Task đang được chọn để xem chi tiết
  const [activeTask, setActiveTask] = useState(null);

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectTask = (e, id) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra hàng
    if (selectedTasks.includes(id)) {
      setSelectedTasks(selectedTasks.filter(taskId => taskId !== id));
    } else {
      setSelectedTasks([...selectedTasks, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
  };

  // Mở panel chi tiết
  const openTaskDetail = (task) => {
    setActiveTask(task);
  };

  // Đóng panel chi tiết
  const closeTaskDetail = () => {
    setActiveTask(null);
  };

  // Xử lý thay đổi Priority/Status (Giả lập gọi API)
  const handleQuickUpdate = (e, taskId, field, value) => {
    e.stopPropagation();
    console.log(`Cập nhật Task ${taskId}: ${field} -> ${value}`);
    // Sau này: axiosClient.patch(`/tasks/${taskId}`, { [field]: value })
  };

  return (
    <div className="tasks-page">
      {/* HEADER & SUMMARY - Giữ nguyên */}
      <div className="tasks-header-section">
        <div className="title-area">
          <h1>Task List</h1>
          <p>Quản lý danh sách công việc của bạn.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} style={{ marginRight: '6px' }}/> Create Task
        </button>
      </div>

      {/* Tạm ẩn Summary Cards cho gọn code, bạn giữ nguyên nhé */}

      {/* FILTER BAR - Giữ nguyên */}
      <div className="filter-bar">
        <div className="search-box-list">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
           {selectedTasks.length > 0 && (
            <div className="bulk-actions">
              <span className="selected-count">{selectedTasks.length} selected</span>
              <button className="btn-bulk complete">Mark Completed</button>
              <button className="btn-bulk delete">Delete</button>
            </div>
          )}
          <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* TASK TABLE */}
      <div className="table-container">
        <table className="flat-table">
          <thead>
            <tr>
              <th width="40">
                <div className="checkbox-wrapper" onClick={toggleSelectAll}>
                  {selectedTasks.length === filteredTasks.length && filteredTasks.length > 0
                    ? <CheckSquare size={18} color="#3b82f6"/>
                    : <Square size={18} color="#cbd5e1"/>}
                </div>
              </th>
              <th>Task Name</th>
              <th>Category</th>
              <th>Deadline</th>
              <th>Priority</th>
              <th>Status</th>
              <th width="40"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <tr
                  key={task.id}
                  className={`clickable-row ${selectedTasks.includes(task.id) ? 'selected-row' : ''}`}
                  onClick={() => openTaskDetail(task)} // Click vào hàng để mở chi tiết
                >
                  <td>
                    <div className="checkbox-wrapper" onClick={(e) => toggleSelectTask(e, task.id)}>
                      {selectedTasks.includes(task.id)
                        ? <CheckSquare size={18} color="#3b82f6"/>
                        : <Square size={18} color="#cbd5e1"/>}
                    </div>
                  </td>
                  <td>
                    <div className="task-name-cell">
                      <span className="task-title">{task.title}</span>
                      <span className="task-desc">{task.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className="cell-category">
                      {task.categoryId === 1 ? 'Chuyên ngành' : 'Bài tập'}
                    </span>
                  </td>
                  <td>
                    <span className="cell-date">
                      {new Date(task.deadline).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td>
                    {/* UI MỚI: Priority có thể chọn nhanh */}
                    <select
                      className={`quick-select priority-select ${task.priority}`}
                      defaultValue={task.priority}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleQuickUpdate(e, task.id, 'priority', e.target.value)}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </td>
                  <td>
                    {/* UI MỚI: Status có thể chọn nhanh */}
                    <select
                      className={`quick-select status-select ${task.status.replace(/\s/g, '')}`}
                      defaultValue={task.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleQuickUpdate(e, task.id, 'status', e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-more" onClick={(e) => {e.stopPropagation(); /* Mở menu xóa/sửa */}}>
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="empty-state">No tasks found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* HIỆU ỨNG OVERLAY LÀM MỜ NỀN KHI MỞ PANEL */}
      {activeTask && (
        <div className="overlay" onClick={closeTaskDetail}></div>
      )}

      {/* SLIDE-OVER PANEL CHI TIẾT TASK */}
      <div className={`task-detail-panel ${activeTask ? 'open' : ''}`}>
        {activeTask && (
          <>
            <div className="panel-header">
              <h2>Task Details</h2>
              <button className="btn-close" onClick={closeTaskDetail}><X size={20} /></button>
            </div>

            <div className="panel-content">
              {/* Tiêu đề có thể click vào để sửa (Inline Edit mô phỏng) */}
              <div className="detail-group">
                <input type="text" className="detail-title-input" defaultValue={activeTask.title} />
              </div>

              <div className="detail-meta-grid">
                <div className="meta-item">
                  <span className="meta-label"><Tag size={14}/> Category</span>
                  <span className="meta-value">{activeTask.categoryId === 1 ? 'Chuyên ngành' : 'Bài tập'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><Calendar size={14}/> Deadline</span>
                  <input type="date" className="detail-date-input" defaultValue={activeTask.deadline.split('T')[0]} />
                </div>
                <div className="meta-item">
                  <span className="meta-label"><Flag size={14}/> Priority</span>
                  <select className={`quick-select priority-select ${activeTask.priority}`} defaultValue={activeTask.priority}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="meta-item">
                  <span className="meta-label"><CheckSquare size={14}/> Status</span>
                  <select className={`quick-select status-select ${activeTask.status.replace(/\s/g, '')}`} defaultValue={activeTask.status}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="detail-group desc-group">
                <div className="desc-header">
                  <AlignLeft size={16}/> <h3>Description</h3>
                </div>
                <textarea
                  className="detail-desc-input"
                  rows="5"
                  defaultValue={activeTask.description}
                  placeholder="Thêm mô tả chi tiết cho công việc..."
                ></textarea>
              </div>

            </div>

            <div className="panel-footer">
              <button className="btn-outline" onClick={closeTaskDetail}>Cancel</button>
              <button className="btn-primary">Save Changes</button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default Tasks;