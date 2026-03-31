import React, { useState } from 'react';
import { mockTasks } from '../../data/mockData'; // Import mock data task
import { FolderKanban, Edit2, Trash2, AlertCircle, Check, X, PlusCircle, Circle, CheckCircle2 } from 'lucide-react';
import './Categories.css';

const Categories = () => {
  // Dữ liệu danh mục
  const [categories, setCategories] = useState([
    { id: 1, name: 'Đồ án chuyên ngành', color: '#3b82f6', taskCount: 2 },
    { id: 2, name: 'Bài tập về nhà', color: '#f59e0b', taskCount: 1 },
    { id: 3, name: 'Việc làm thêm', color: '#10b981', taskCount: 0 },
    { id: 4, name: 'Sinh hoạt cá nhân', color: '#8b5cf6', taskCount: 0 },
  ]);

  // Dữ liệu Task cục bộ (để mô phỏng việc tạo thêm task mới)
  const [localTasks, setLocalTasks] = useState(mockTasks);

  const presetColors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  const [formData, setFormData] = useState({ id: null, name: '', color: presetColors[0] });
  const [isEditing, setIsEditing] = useState(false);

  // STATE MỚI: Quản lý danh mục đang được mở chi tiết
  const [activeCategory, setActiveCategory] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // --- LOGIC CRUD DANH MỤC ---
  const handleEdit = (e, cat) => {
    e.stopPropagation(); // Ngăn click lan ra thẻ card
    setIsEditing(true);
    setFormData({ id: cat.id, name: cat.name, color: cat.color });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ id: null, name: '', color: presetColors[0] });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEditing) {
      setCategories(categories.map(c => c.id === formData.id ? { ...c, name: formData.name, color: formData.color } : c));
    } else {
      setCategories([...categories, { id: Date.now(), name: formData.name, color: formData.color, taskCount: 0 }]);
    }
    handleCancel();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setCategories(categories.filter(c => c.id !== id));
  };

  // --- LOGIC CHI TIẾT DANH MỤC (WOW FACTOR) ---
  const openCategoryDetail = (cat) => {
    setActiveCategory(cat);
  };

  const closeCategoryDetail = () => {
    setActiveCategory(null);
    setNewTaskTitle('');
  };

  // Tạo task nhanh bằng cách bấm Enter
  const handleQuickAddTask = (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      const newTask = {
        id: Date.now(),
        title: newTaskTitle,
        description: 'Được tạo nhanh từ danh mục',
        categoryId: activeCategory.id,
        status: 'Pending',
        priority: 'Medium',
        deadline: new Date().toISOString()
      };

      // 1. Thêm task vào danh sách
      setLocalTasks([newTask, ...localTasks]);
      setNewTaskTitle('');

      // 2. Cập nhật số đếm task của danh mục đó lên 1
      setCategories(categories.map(c =>
        c.id === activeCategory.id ? { ...c, taskCount: c.taskCount + 1 } : c
      ));
    }
  };

  // Lấy các task thuộc danh mục đang mở
  const currentCategoryTasks = activeCategory
    ? localTasks.filter(t => t.categoryId === activeCategory.id)
    : [];

  return (
    <div className="categories-page">
      <div className="page-header">
        <div className="title-area">
          <h1>Manage Categories</h1>
          <p>Phân loại công việc giúp bạn quản lý thời gian hiệu quả hơn.</p>
        </div>
      </div>

      <div className="categories-layout">
        {/* PANEL TRÁI: FORM */}
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

        {/* PANEL PHẢI: DANH SÁCH */}
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
                        <AlertCircle size={12} style={{marginRight: '4px'}}/> Đang chứa task, không thể xóa
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

      {/* --- WOW FACTOR: OVERLAY & NGĂN KÉO CHI TIẾT --- */}
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
              {/* Ô TẠO TASK SIÊU TỐC */}
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

              {/* DANH SÁCH TASK TRONG DANH MỤC */}
              <div className="cat-task-list">
                <h4 className="list-title">Công việc ({currentCategoryTasks.length})</h4>
                {currentCategoryTasks.length > 0 ? (
                  currentCategoryTasks.map(task => (
                    <div key={task.id} className="cat-task-item">
                      {task.status === 'Completed' ? (
                        <CheckCircle2 size={18} color="#10b981" className="task-icon"/>
                      ) : (
                        <Circle size={18} color="#cbd5e1" className="task-icon"/>
                      )}
                      <span className={`task-name ${task.status === 'Completed' ? 'completed' : ''}`}>
                        {task.title}
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