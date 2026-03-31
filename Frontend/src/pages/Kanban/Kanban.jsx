import React, { useState } from 'react';
import { mockTasks } from '../../data/mockData';
import { MoreHorizontal, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import './Kanban.css';

const Kanban = () => {
  // Tạm thời lấy dữ liệu từ mockData
  const [tasks] = useState(mockTasks);

  // Định nghĩa các cột (Status)
  const columns = [
    { id: 'Pending', title: 'Pending', color: '#f59e0b' },
    { id: 'In Progress', title: 'In Progress', color: '#3b82f6' },
    { id: 'Completed', title: 'Completed', color: '#10b981' }
  ];

  // Hàm lọc task theo trạng thái
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="kanban-page">
      <header className="kanban-header">
        <div>
          <h1>Kanban Board</h1>
          <p>Kéo thả để cập nhật trạng thái công việc (UI Preview).</p>
        </div>
        <button className="btn-primary-gradient">+ Add Task</button>
      </header>

      <div className="kanban-board">
        {columns.map(col => (
          <div key={col.id} className="kanban-column">
            <div className="column-header" style={{ borderTopColor: col.color }}>
              <h3>{col.title}</h3>
              <span className="task-count">{getTasksByStatus(col.id).length}</span>
            </div>

            <div className="column-content">
              {getTasksByStatus(col.id).map(task => (
                <div key={task.id} className="kanban-card">
                  <div className="card-header">
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                    <button className="btn-icon-small"><MoreHorizontal size={16} /></button>
                  </div>

                  <h4 className="card-title">{task.title}</h4>
                  <p className="card-desc">{task.description}</p>

                  <div className="card-footer">
                    <div className="deadline">
                      <Calendar size={14} />
                      <span>{new Date(task.deadline).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {/* Icon hiển thị trạng thái hoàn thành nếu ở cột Completed */}
                    {task.status === 'Completed' ? (
                      <CheckCircle2 size={18} color="#10b981" />
                    ) : (
                      <Clock size={18} color="#94a3b8" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kanban;