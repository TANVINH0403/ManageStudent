import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCategory, updateCategory, deleteCategory } from '../../redux/categorySlice';
import { addTask } from '../../redux/taskSlice';
import {
  Edit2, Trash2, AlertCircle, Check, X, Plus,
  PlusCircle, Circle, CheckCircle2,
  Database, BookOpen, Code2, Zap, Users, Trophy,
  Folder, FileText, Palette, FlaskConical, Settings2,
  Star, Heart, Globe, Award, Briefcase, Clock,
  Target, Lightbulb, Rocket, Music, Camera, ShieldCheck,
  ChevronUp,
  GripVertical, ArrowUpDown, FolderKanban, ChevronRight
} from 'lucide-react';
import './Categories.css';

/* ─── Color presets ─── */
const COLORS = ['#7c3aed','#3b82f6','#10b981','#059669','#f59e0b','#ef4444','#ec4899','#475569'];

/* ─── Icon presets: first 11 shown by default ─── */
const ICONS_DEFAULT = [
  { key: 'database',  Icon: Database     },
  { key: 'bookopen',  Icon: BookOpen     },
  { key: 'code2',     Icon: Code2        },
  { key: 'zap',       Icon: Zap          },
  { key: 'users',     Icon: Users        },
  { key: 'trophy',    Icon: Trophy       },
  { key: 'folder',    Icon: Folder       },
  { key: 'filetext',  Icon: FileText     },
  { key: 'palette',   Icon: Palette      },
  { key: 'flask',     Icon: FlaskConical },
  { key: 'settings2', Icon: Settings2    },
];

/* Extra icons revealed when "..." is clicked */
const ICONS_MORE = [
  { key: 'star',      Icon: Star        },
  { key: 'heart',     Icon: Heart       },
  { key: 'globe',     Icon: Globe       },
  { key: 'award',     Icon: Award       },
  { key: 'briefcase', Icon: Briefcase   },
  { key: 'clock',     Icon: Clock       },
  { key: 'target',    Icon: Target      },
  { key: 'lightbulb', Icon: Lightbulb   },
  { key: 'rocket',    Icon: Rocket      },
  { key: 'music',     Icon: Music       },
  { key: 'camera',    Icon: Camera      },
  { key: 'shield',    Icon: ShieldCheck },
];

const ALL_ICONS = [...ICONS_DEFAULT, ...ICONS_MORE];

/* Get icon component by category id or key */
const ICON_BY_ID = { 1: Database, 2: BookOpen, 3: Code2, 4: Zap };
const getIconById  = (id)  => ICON_BY_ID[id] || FolderKanban;
const getIconByKey = (key) => ALL_ICONS.find(i => i.key === key)?.Icon ?? FolderKanban;

const Categories = () => {
  const dispatch   = useDispatch();
  const categories = useSelector(s => s.categories.items);
  const tasks      = useSelector(s => s.tasks.items);

  const taskCountFor = (catId) => tasks.filter(t => t.categoryId === catId).length;

  /* Form state */
  const defaultForm = { id: null, name: '', color: COLORS[0], iconKey: 'database' };
  const [form, setForm]           = useState(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showAllIcons, setShowAllIcons] = useState(false);

  /* Side panel state */
  const [activeCategory, setActiveCategory] = useState(null);
  const [newTaskTitle, setNewTaskTitle]     = useState('');

  /* ── CRUD ── */
  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (isEditing) {
      dispatch(updateCategory({ id: form.id, name: form.name, color: form.color, iconKey: form.iconKey }));
    } else {
      dispatch(addCategory({ id: Date.now(), name: form.name, color: form.color, iconKey: form.iconKey }));
    }
    setForm(defaultForm);
    setIsEditing(false);
  };

  const handleEdit = (e, cat) => {
    e.stopPropagation();
    setIsEditing(true);
    setForm({ id: cat.id, name: cat.name, color: cat.color, iconKey: cat.iconKey ?? 'database' });
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (taskCountFor(id) > 0) return;
    dispatch(deleteCategory(id));
  };

  const handleCancel = () => { setForm(defaultForm); setIsEditing(false); };

  /* ── Quick-add task ── */
  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      dispatch(addTask({
        id: Date.now(), title: newTaskTitle, description: '',
        categoryId: activeCategory.id, status: 'Pending', priority: 'Medium',
        progress: 0, deadline: new Date().toISOString().split('T')[0],
      }));
      setNewTaskTitle('');
    }
  };

  const activeTasks = activeCategory ? tasks.filter(t => t.categoryId === activeCategory.id) : [];

  return (
    <div className="cat-page">

      {/* ── PAGE HEADER ── */}
      <div className="cat-page-header">
        <div>
          <h1>Manage Categories</h1>
          <p>Phân loại công việc giúp bạn quản lý thời gian hiệu quả hơn.</p>
        </div>
        <nav className="cat-breadcrumb">
          <span>Manage Categories</span>
          <ChevronRight size={14} />
          <span className="bc-active">Danh sách</span>
        </nav>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="cat-layout">

        {/* LEFT: CREATE FORM */}
        <div className="cat-form-panel">
          <div className="cfp-header">
            <div className="cfp-header-icon">
              <FolderKanban size={22} color="#7c3aed" />
            </div>
            <div>
              <h3>{isEditing ? 'Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</h3>
              <p>Thêm danh mục mới để phân loại công việc.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="cfp-form">
            {/* Name */}
            <div className="cfp-field">
              <label>Tên danh mục <span className="required">*</span></label>
              <input
                type="text"
                placeholder="VD: Môn Cấu trúc dữ liệu, Bài tập, Đồ án..."
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Color picker */}
            <div className="cfp-field">
              <label>Màu sắc</label>
              <div className="cfp-color-row">
                {COLORS.map(c => (
                  <button key={c} type="button"
                    className={`cfp-color-dot ${form.color === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setForm({ ...form, color: c })}
                  >
                    {form.color === c && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon picker */}
            <div className="cfp-field">
              <label>Biểu tượng</label>
              <div className="cfp-icon-grid">
                {/* Default 11 icons always visible */}
                {ICONS_DEFAULT.map(({ key, Icon }) => (
                  <button key={key} type="button"
                    className={`cfp-icon-btn ${form.iconKey === key ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, iconKey: key })}
                    title={key}
                  >
                    <Icon size={18} />
                  </button>
                ))}
                {/* Toggle button — last slot */}
                <button type="button"
                  className={`cfp-icon-btn cfp-icon-toggle ${showAllIcons ? 'expanded' : ''}`}
                  onClick={() => setShowAllIcons(v => !v)}
                  title={showAllIcons ? 'Thu gọn' : 'Xem thêm'}
                >
                  {showAllIcons ? <ChevronUp size={18} /> : <span className="more-dots">···</span>}
                </button>
              </div>

              {/* Extra icons — animated expand */}
              <div className={`cfp-icon-extra ${showAllIcons ? 'open' : ''}`}>
                {ICONS_MORE.map(({ key, Icon }) => (
                  <button key={key} type="button"
                    className={`cfp-icon-btn ${form.iconKey === key ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, iconKey: key })}
                    title={key}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="cfp-actions">
              {isEditing && (
                <button type="button" className="cfp-btn-cancel" onClick={handleCancel}>Hủy</button>
              )}
              <button type="submit" className="cfp-btn-submit">
                {isEditing ? 'Cập nhật' : 'Tạo danh mục'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: CATEGORY LIST */}
        <div className="cat-list-panel">
          <div className="clp-header">
            <div>
              <h3>Danh sách danh mục ({categories.length})</h3>
              <p>Quản lý các danh mục hiện có.</p>
            </div>
            <button className="clp-sort-btn"><ArrowUpDown size={15} /> Sắp xếp</button>
          </div>

          <div className="clp-list">
            {categories.map(cat => {
              const count = taskCountFor(cat.id);
              const Icon  = cat.iconKey ? getIconByKey(cat.iconKey) : getIconById(cat.id);
              return (
                <div key={cat.id} className="clp-card" onClick={() => setActiveCategory(cat)}>
                  {/* Drag handle */}
                  <GripVertical size={16} className="clp-drag-handle" />

                  {/* Icon */}
                  <div className="clp-icon-wrap" style={{ background: cat.color + '22' }}>
                    <Icon size={20} color={cat.color} />
                  </div>

                  {/* Info */}
                  <div className="clp-info">
                    <span className="clp-name">{cat.name}</span>
                    <span className="clp-count" style={{ background: cat.color + '22', color: cat.color }}>
                      {count} tasks
                    </span>
                  </div>

                  {/* Color indicator */}
                  <div className="clp-color-section">
                    <span className="clp-color-label">Màu sắc</span>
                    <span className="clp-color-dot" style={{ background: cat.color }} />
                  </div>

                  {/* Actions */}
                  <div className="clp-actions">
                    <button className="clp-btn-edit" onClick={e => handleEdit(e, cat)} title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    {count > 0 ? (
                      <div className="tooltip-wrap">
                        <button className="clp-btn-delete disabled" disabled><Trash2 size={16} /></button>
                        <span className="tooltip-tip"><AlertCircle size={11} /> Đang chứa task</span>
                      </div>
                    ) : (
                      <button className="clp-btn-delete" onClick={e => handleDelete(e, cat.id)} title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add button at bottom */}
          <button className="clp-add-btn" onClick={() => { setIsEditing(false); setForm(defaultForm); }}>
            <Plus size={16} /> Thêm danh mục mới
          </button>
        </div>
      </div>

      {/* ── SIDE PANEL: CATEGORY DETAIL ── */}
      {activeCategory && <div className="cat-overlay" onClick={() => { setActiveCategory(null); setNewTaskTitle(''); }} />}
      <div className={`cat-detail-panel ${activeCategory ? 'open' : ''}`}>
        {activeCategory && (() => {
          const Icon = activeCategory.iconKey ? getIconByKey(activeCategory.iconKey) : getIconById(activeCategory.id);
          return (
            <>
              <div className="cdp-header" style={{ borderBottomColor: activeCategory.color }}>
                <div className="cdp-title">
                  <div className="cdp-icon" style={{ background: activeCategory.color + '22' }}>
                    <Icon size={20} color={activeCategory.color} />
                  </div>
                  <div>
                    <h2>{activeCategory.name}</h2>
                    <p>{activeTasks.length} công việc</p>
                  </div>
                </div>
                <button className="cdp-close" onClick={() => { setActiveCategory(null); setNewTaskTitle(''); }}>
                  <X size={20} />
                </button>
              </div>

              <div className="cdp-body">
                <div className="cdp-quick-add">
                  <PlusCircle size={17} color={activeCategory.color} />
                  <input type="text"
                    placeholder={`Thêm task vào "${activeCategory.name}" (Enter)...`}
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleQuickAdd} autoFocus
                  />
                </div>

                <div className="cdp-task-list">
                  <p className="cdp-list-label">Công việc ({activeTasks.length})</p>
                  {activeTasks.length > 0 ? activeTasks.map(task => (
                    <div key={task.id} className="cdp-task-item">
                      {task.status === 'Completed'
                        ? <CheckCircle2 size={17} color="#10b981" />
                        : <Circle size={17} color="#cbd5e1" />}
                      <div className="cdp-task-info">
                        <span className={`cdp-task-name ${task.status === 'Completed' ? 'done' : ''}`}>{task.title}</span>
                        <span className={`cdp-badge ${task.status.replace(/\s/g,'')}`}>{task.status}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="cdp-empty">Chưa có công việc nào. Gõ vào ô trên để thêm! 🎉</div>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default Categories;