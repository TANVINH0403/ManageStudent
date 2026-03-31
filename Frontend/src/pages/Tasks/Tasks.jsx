import React, { useState } from 'react';
import { mockTasks } from '../../data/mockData';
import './Tasks.css';

const Tasks = () => {
  // Quản lý state cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Logic lọc dữ liệu
  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tasks-page">
      {/* Header & Controls */}
      <header className="tasks-header">
        <div className="tasks-title-area">
          <h1>Task List</h1>
          <p>Quản lý và theo dõi tiến độ công việc của bạn.</p>
        </div>
        <div className="tasks-actions">
          <button className="btn-primary">+ Create Task</button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="tasks-controls-bar">
        <div className="search-input-wrapper">
          <span className="icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          {/* Sẽ thêm filter Category, Priority sau nếu cần */}
          <button className="btn-icon">↕ Sort</button>
        </div>
      </div>

      {/* Task Table */}
      <div className="task-table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Title</th>
              <th>Category</th>
              <th>Deadline</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <tr key={task.id} className="task-row">
                  <td><input type="checkbox" /></td>
                  <td className="col-title">
                    <h4>{task.title}</h4>
                    <p className="task-desc">{task.description}</p>
                  </td>
                  <td><span className="category-badge">{task.categoryId === 1 ? 'Chuyên ngành' : 'Bài tập'}</span></td>
                  <td className="col-deadline">{new Date(task.deadline).toLocaleDateString()}</td>
                  <td>
                    <span className={`priority-dot ${task.priority}`}></span>
                    {task.priority}
                  </td>
                  <td>
                    <span className={`status-pill ${task.status.replace(/\s/g, '')}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button className="action-btn edit" title="Edit">✏️</button>
                    <button className="action-btn delete" title="Delete">🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">Không tìm thấy công việc nào phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tasks;