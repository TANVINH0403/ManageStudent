import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import taskService from '../../services/taskService';
import {
  FolderKanban, Edit2, Trash2, AlertCircle, Check, X,
  PlusCircle, Circle, CheckCircle2, Globe, Lock, Trophy
} from 'lucide-react';
import './Categories.css';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [localTasks, setLocalTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const presetColors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    priority: 1,
    status: 1,
    endDate: '',
    color: presetColors[0]
  });
  const [isEditing, setIsEditing] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const fetchCategoriesAndTasks = async () => {
    try {
      setLoading(true);
      const [catRes, taskRes] = await Promise.all([
        categoryService.getAllCategories(),
        taskService.getTasks({ PageSize: 500 }) // Fetch more for better progress tracking
      ]);

      let fetchedTasks = taskRes?.data || taskRes || [];
      setLocalTasks(fetchedTasks);

      if (Array.isArray(catRes)) {
        setCategories(catRes.map(c => {
          const categoryTasks = fetchedTasks.filter(t => (t.categoryId || t.CategoryId) === (c.categoryId || c.CategoryId));
          const completedCount = categoryTasks.filter(t => (t.status === 2 || t.Status === 2)).length;

          return {
            id: c.categoryId || c.CategoryId,
            name: c.categoryName || c.CategoryName,
            description: c.description || c.Description || '',
            priority: c.priority ?? c.Priority ?? 1,
            status: c.status ?? c.Status ?? 1,
            createdAt: c.createdAt || c.CreatedAt,
            endDate: c.endDate || c.EndDate || '',
            visibility: (c.visibility !== undefined) ? c.visibility : (c.Visibility === 'Public' ? 1 : (c.Visibility === 'Private' ? 0 : (parseInt(c.Visibility) || 0))),
            color: presetColors[(c.categoryId || c.CategoryId) % presetColors.length],
            taskCount: categoryTasks.length,
            completedCount: completedCount,
            progress: categoryTasks.length > 0 ? Math.round((completedCount / categoryTasks.length) * 100) : 0
          };
        }));
      }
    } catch (err) {
      console.error("Error loading categories", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategoriesAndTasks();
  }, []);

  // --- LOGIC CRUD DANH MỤC ---
  const handleEdit = (e, cat) => {
    e.stopPropagation();
    setIsEditing(true);
    setFormData({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      priority: cat.priority,
      status: cat.status,
      endDate: cat.endDate ? cat.endDate.slice(0, 10) : '',
      color: cat.color
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      name: '',
      description: '',
      priority: 1,
      status: 1,
      endDate: '',
      color: presetColors[0]
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      CategoryName: formData.name,
      Description: formData.description,
      Priority: parseInt(formData.priority),
      Status: parseInt(formData.status),
      EndDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
    };

    try {
      if (isEditing) {
        await categoryService.updateCategory(formData.id, payload);
      } else {
        await categoryService.createCategory(payload);
      }
      await fetchCategoriesAndTasks();
      handleCancel();
    } catch (err) {
      console.error("Lỗi khi lưu danh mục", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error("Xóa thất bại", err);
      const msg = err.response?.data?.message || err.message;
      alert("Xóa thất bại: " + msg);
    }
  };

  const handleToggleVisibility = async (e, cat) => {
    e.stopPropagation();
    try {
      // visibility: 0 = Private, 1 = Public (Dựa trên Enum của API)
      const newVisibility = cat.visibility === 1 ? 0 : 1;
      await categoryService.updateVisibility(cat.id, newVisibility);
      setCategories(categories.map(c => c.id === cat.id ? { ...c, visibility: newVisibility } : c));
    } catch (err) {
      console.error("Lỗi khi chuyển đổi quyền riêng tư", err);
      const msg = err.response?.data?.message || err.message;
      alert("Lỗi: " + msg);
    }
  };

  const handleCompleteCategory = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn hoàn thành danh mục này? Tất cả các task sẽ được chuyển sang trạng thái đã hoàn tất.")) return;
    try {
      await categoryService.completeCategory(id);
      alert("Danh mục đã được hoàn tất thành công!");
      fetchCategoriesAndTasks(); // Reload to get updated task statuses
    } catch (err) {
      console.error("Lỗi khi hoàn tất danh mục", err);
    }
  };

  // --- LOGIC CHI TIẾT DANH MỤC ---
  const openCategoryDetail = (cat) => {
    // Điều hướng sang trang Task List và lọc theo CategoryId
    navigate('/tasks', { state: { filterCategoryId: cat.id } });
  };

  const closeCategoryDetail = () => {
    setActiveCategory(null);
    setNewTaskTitle('');
  };

  // Tạo task nhanh
  const handleQuickAddTask = async (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      try {
        const newTaskRequest = {
          TaskName: newTaskTitle,
          Description: 'Được tạo nhanh từ danh mục',
          CategoryId: activeCategory.id,
          Priority: 1, // Medium
          DueDate: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
        };

        const result = await taskService.createTask(newTaskRequest);

        if (result) {
          // Update local state temporarily to avoid full reload
          const addedTask = {
            taskId: result.taskId || Date.now(),
            taskName: result.taskName || newTaskTitle,
            categoryId: activeCategory.id,
            status: result.status || 0,
            priority: 1
          };
          setLocalTasks([addedTask, ...localTasks]);
          setCategories(categories.map(c =>
            c.id === activeCategory.id ? { ...c, taskCount: c.taskCount + 1 } : c
          ));
          setNewTaskTitle('');
        }
      } catch (err) {
        console.error("Failed to add task", err);
      }
    }
  };

  const currentCategoryTasks = activeCategory
    ? localTasks.filter(t => t.categoryId === activeCategory.id)
    : [];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Đang tải danh mục...</div>;
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div className="title-area">
          <h1>Manage Categories</h1>
          <p>Phân loại công việc giúp bạn quản lý thời gian hiệu quả hơn.</p>
        </div>
      </div>

      <div className="categories-layout">
        <div className="form-panel">
          <div className="form-header">
            <FolderKanban size={20} color="#3b82f6" />
            <h3>{isEditing ? 'Sửa Dự Án' : 'Thiết Lập Dự Án Mới'}</h3>
          </div>
          <form onSubmit={handleSave} className="category-form">
            <div className="form-group">
              <label>Tên dự án <span className="text-red">*</span></label>
              <input
                type="text"
                placeholder="VD: Nghiên cứu AI, Đồ án tốt nghiệp..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Mục tiêu & Mô tả</label>
              <textarea
                placeholder="Mô tả ngắn gọn về dự án này..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Độ ưu tiên</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="0">Thấp</option>
                  <option value="1">Trung bình</option>
                  <option value="2">Cao</option>
                </select>
              </div>
              <div className="form-group">
                <label>Thời hạn (Deadline)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Màu sắc dự án</label>
              <div className="color-picker">
                {presetColors.map(color => (
                  <div
                    key={color}
                    className={`color-swatch ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  >
                    {formData.color === color && <Check size={14} color="#fff" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-actions">
              {isEditing && <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={handleCancel}>Hủy</button>}
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>{isEditing ? 'Cập nhật' : 'Khởi tạo Dự án'}</button>
            </div>
          </form>
        </div>

        <div className="list-panel">
          <div className="list-header">
            <h3>Dự án hiện có ({categories.length})</h3>
          </div>
          <div className="category-grid">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="category-card clickable-card"
                onClick={() => openCategoryDetail(cat)}
              >
                <div className="cat-card-top">
                  <div className="cat-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="cat-color-dot" style={{ backgroundColor: cat.color }}></div>
                      <h4>{cat.name}</h4>
                    </div>
                    {cat.description && <p className="cat-desc-short">{cat.description}</p>}
                  </div>
                  <div className="cat-card-actions">
                    <button className="btn-icon-action" onClick={(e) => handleToggleVisibility(e, cat)} title={cat.visibility === 1 ? "Công khai" : "Riêng tư"}>
                      {cat.visibility === 1 ? <Globe size={14} /> : <Lock size={14} />}
                    </button>
                    <button className="btn-icon-edit" onClick={(e) => handleEdit(e, cat)} title="Sửa">
                      <Edit2 size={14} />
                    </button>
                    <button className="btn-icon-delete" onClick={(e) => handleDelete(e, cat.id)} disabled={cat.taskCount > 0} title={cat.taskCount > 0 ? "Chứa task" : "Xóa"}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="cat-progress-area">
                  <div className="progress-text">
                    <span>Tiến độ: {cat.progress}%</span>
                    <span>{cat.completedCount}/{cat.taskCount} tasks</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${cat.progress}%`, backgroundColor: cat.color }}></div>
                  </div>
                </div>

                <div className="cat-card-footer">
                  <span className={`priority-lite p-${cat.priority}`}>
                    {['Thấp', 'Trung bình', 'Cao'][cat.priority]}
                  </span>
                  {cat.endDate && (
                    <span className="deadline-lite">
                      <AlertCircle size={12} /> {new Date(cat.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeCategory && <div className="overlay" onClick={closeCategoryDetail}></div>}

      <div className={`category-detail-panel ${activeCategory ? 'open' : ''}`}>
        {activeCategory && (
          <>
            <div className="panel-header" style={{ borderBottomColor: activeCategory.color }}>
              <div className="cat-detail-title">
                <div className="color-dot" style={{ backgroundColor: activeCategory.color }}></div>
                <h2>{activeCategory.name}</h2>
              </div>
              <button className="btn-close" onClick={closeCategoryDetail}><X size={20} /></button>
            </div>

            <div className="panel-content">
              <div className="quick-add-task">
                <PlusCircle size={18} color={activeCategory.color} />
                <input
                  type="text"
                  placeholder={`Thêm task vào "${activeCategory.name}" (Bấm Enter)`}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleQuickAddTask}
                  autoFocus
                />
              </div>

              <div className="cat-task-list">
                <h4 className="list-title">Công việc ({currentCategoryTasks.length})</h4>
                {currentCategoryTasks.length > 0 ? (
                  currentCategoryTasks.map(task => (
                    <div key={task.taskId} className="cat-task-item">
                      {task.status === 2 ? (
                        <CheckCircle2 size={18} color="#10b981" className="task-icon" />
                      ) : (
                        <Circle size={18} color="#cbd5e1" className="task-icon" />
                      )}
                      <span className={`task-name ${task.status === 2 ? 'completed' : ''}`}>
                        {task.taskName}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="empty-tasks">
                    Chưa có công việc nào. Hãy gõ vào ô trên để thêm mới!
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default Categories;