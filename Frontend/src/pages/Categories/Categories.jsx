import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import taskService from '../../services/taskService';
import { FolderKanban, Edit2, Trash2, AlertCircle, Check, X, PlusCircle, Circle, CheckCircle2 } from 'lucide-react';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [localTasks, setLocalTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const presetColors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  const [formData, setFormData] = useState({ id: null, name: '', color: presetColors[0] });
  const [isEditing, setIsEditing] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const fetchCategoriesAndTasks = async () => {
      try {
          setLoading(true);
          const [catRes, taskRes] = await Promise.all([
              categoryService.getAllCategories(),
              taskService.getTasks({ PageSize: 100 })
          ]);
          
          let fetchedTasks = taskRes?.data || [];
          setLocalTasks(fetchedTasks);

          if (Array.isArray(catRes)) {
              setCategories(catRes.map(c => ({
                  id: c.categoryId,
                  name: c.categoryName,
                  color: presetColors[c.categoryId % presetColors.length],
                  taskCount: fetchedTasks.filter(t => t.categoryId === c.categoryId).length
              })));
          }
      } catch(err) {
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
    setFormData({ id: cat.id, name: cat.name, color: cat.color });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ id: null, name: '', color: presetColors[0] });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
        if (isEditing) {
            await categoryService.updateCategory(formData.id, { CategoryName: formData.name });
            setCategories(categories.map(c => c.id === formData.id ? { ...c, name: formData.name, color: formData.color } : c));
        } else {
            const result = await categoryService.createCategory({ CategoryName: formData.name });
            // API returns { categoryId, categoryName }
            if (result && result.categoryId) {
                setCategories([...categories, { 
                    id: result.categoryId, 
                    name: result.categoryName, 
                    color: formData.color, 
                    taskCount: 0 
                }]);
            } else {
               await fetchCategoriesAndTasks();
            }
        }
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
    } catch(err) {
        console.error("Xóa thất bại", err);
    }
  };

  // --- LOGIC CHI TIẾT DANH MỤC ---
  const openCategoryDetail = (cat) => {
    setActiveCategory(cat);
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
          
          if(result) {
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
            <h3>{isEditing ? 'Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</h3>
          </div>
          <form onSubmit={handleSave} className="category-form">
            <div className="form-group">
              <label>Tên danh mục <span className="text-red">*</span></label>
              <input
                type="text"
                placeholder="VD: Môn Cấu trúc dữ liệu..."
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Màu sắc nhận diện</label>
              <div className="color-picker">
                {presetColors.map(color => (
                  <div
                    key={color}
                    className={`color-swatch ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({...formData, color})}
                  >
                    {formData.color === color && <Check size={14} color="#fff" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-actions">
              {isEditing && <button type="button" className="btn-outline" onClick={handleCancel}>Hủy</button>}
              <button type="submit" className="btn-primary w-full">{isEditing ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </form>
        </div>

        <div className="list-panel">
          <div className="list-header">
            <h3>Danh sách hiện tại ({categories.length})</h3>
          </div>
          <div className="category-grid">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="category-card clickable-card"
                onClick={() => openCategoryDetail(cat)}
              >
                <div className="cat-card-left">
                  <div className="cat-color-indicator" style={{ backgroundColor: cat.color }}></div>
                  <div className="cat-info">
                    <h4>{cat.name}</h4>
                    <span className="task-count-badge">{cat.taskCount} tasks</span>
                  </div>
                </div>
                <div className="cat-card-actions">
                  <button className="btn-icon-edit" onClick={(e) => handleEdit(e, cat)} title="Sửa">
                    <Edit2 size={16} />
                  </button>
                  {cat.taskCount > 0 ? (
                    <div className="tooltip-wrapper">
                      <button className="btn-icon-delete disabled" disabled>
                        <Trash2 size={16} />
                      </button>
                      <span className="tooltip-text">
                        <AlertCircle size={12} style={{marginRight: '4px'}}/> Đang chứa task
                      </span>
                    </div>
                  ) : (
                    <button className="btn-icon-delete" onClick={(e) => handleDelete(e, cat.id)} title="Xóa">
                      <Trash2 size={16} />
                    </button>
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
                        <CheckCircle2 size={18} color="#10b981" className="task-icon"/>
                      ) : (
                        <Circle size={18} color="#cbd5e1" className="task-icon"/>
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