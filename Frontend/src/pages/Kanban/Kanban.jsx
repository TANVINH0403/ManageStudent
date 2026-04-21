import React, { useState, useEffect } from 'react';
import taskService from '../../services/taskService';
import boardService from '../../services/boardService';
import { Trash2, Calendar, Clock, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import './Kanban.css';

const getPriorityLabel = (p) => {
  switch (p) {
    case 0: return 'Low';
    case 1: return 'Medium';
    case 2: return 'High';
    default: return 'Low';
  }
}

const Kanban = () => {
  const [tasks, setTasks] = useState([]); // Chúng ta vẫn giữ tasks phẳng để dễ quản lý update
  const [loading, setLoading] = useState(true);

  // Định nghĩa các cột (Status)
  const columns = [
    { id: 0, title: 'Pending', color: '#f59e0b', cssClass: 'pending' },
    { id: 1, title: 'In Progress', color: '#3b82f6', cssClass: 'in-progress' },
    { id: 2, title: 'Completed', color: '#10b981', cssClass: 'completed' }
  ];

  // --- FETCH DATA ---
  const fetchBoard = async () => {
    try {
      setLoading(true);
      const res = await boardService.getBoardData();
      // Flatten data from todo, inProgress, completed into a single array
      if (res) {
        const allTasks = [
          ...(res.todo?.items || []),
          ...(res.inProgress?.items || []),
          ...(res.completed?.items || [])
        ];
        setTasks(allTasks);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu Board:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBoard();
  }, []);

  const getTasksByStatus = (statusId) => {
    return tasks.filter(task => task.status === statusId);
  };

  const handleUpdateStatus = async (task, newStatus) => {
    try {
      await taskService.updateStatus(task.taskId, newStatus);
      setTasks(tasks.map(t => t.taskId === task.taskId ? { ...t, status: newStatus } : t));

      // If completed, recursive BE logic might have updated others
      if (newStatus === 2) {
        fetchBoard();
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Lỗi: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  const handleUpdateField = async (task, field, value) => {
    try {
      const dtoField = field.charAt(0).toUpperCase() + field.slice(1);
      await taskService.updateTask(task.taskId, { [dtoField]: value });
      setTasks(tasks.map(t => t.taskId === task.taskId ? { ...t, [field]: value } : t));
    } catch (err) {
      console.error(`Lỗi cập nhật ${field}:`, err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa task này?")) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.taskId !== taskId));
    } catch (err) {
      console.error("Lỗi xóa task:", err);
      alert("Lỗi: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="kanban-page">
      <header className="kanban-header">
        <div>
          <h1>Kanban Board</h1>
          <p>Quản lý trạng thái công việc.</p>
        </div>
        <button className="btn-icon-tiny" onClick={fetchBoard} title="Làm mới">
          <RefreshCw size={20} />
        </button>
      </header>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Đang tải dữ liệu Kanban...</div>
      ) : (
        <div className="kanban-board">
          {columns.map(col => (
            <div key={col.id} className="kanban-column">
              <div className={`column-header ${col.cssClass}`}>
                <h3>{col.title}</h3>
                <span className="task-count">{getTasksByStatus(col.id).length}</span>
              </div>

              <div className="column-content">
                {getTasksByStatus(col.id).map(task => (
                  <div key={task.taskId} className="kanban-card">
                    <div className="card-header">
                      <span className={`priority-badge ${getPriorityLabel(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      <button className="btn-icon-small text-red" title="Xóa" onClick={() => handleDeleteTask(task.taskId)}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h4 className="card-title">{task.taskName}</h4>
                    <p className="card-desc">{task.description}</p>

                    <div className="card-footer" style={{ marginTop: '12px' }}>
                      <div className="deadline">
                        <Calendar size={14} />
                        <input
                          type="date"
                          className="inline-date-input-kanban"
                          value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleUpdateField(task, 'dueDate', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="card-actions" style={{ display: 'flex', gap: '4px' }}>
                        {task.status === 0 && (
                          <button className="btn-icon-tiny" title="Chuyển sang In Progress" onClick={() => handleUpdateStatus(task, 1)}>
                            <ChevronRight size={18} color="#3b82f6" />
                          </button>
                        )}
                        {task.status === 1 && (
                          <button className="btn-icon-tiny" title="Hoàn thành" onClick={() => handleUpdateStatus(task, 2)}>
                            <CheckCircle2 size={18} color="#10b981" />
                          </button>
                        )}
                        {task.status === 2 && (
                          <CheckCircle2 size={18} color="#10b981" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Kanban;