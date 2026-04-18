import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  Calendar,
  Tag,
  Flag,
  CheckSquare,
  AlignLeft,
  Subtitles,
  Download
} from 'lucide-react';

import taskService from '../../services/taskService';
import categoryService from '../../services/categoryService';
import './Tasks.css';

const Tasks = () => {
  // --- CORE STATE ---
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subtasksMap, setSubtasksMap] = useState({});
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTask, setActiveTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    taskName: '',
    categoryId: '',
    priority: 1,
    description: ''
  });

  // --- DATA NORMALIZATION ---
  const mapStatus = (statusValue) => {
    if (statusValue === undefined || statusValue === null || statusValue === '') return 0;
    if (typeof statusValue === 'number') return statusValue;
    if (typeof statusValue === 'string') {
        const lower = statusValue.toLowerCase().trim();
        if (lower === 'todo' || lower === 'pending' || lower === '0') return 0;
        if (lower === 'inprogress' || lower === 'in_progress' || lower === '1') return 1;
        if (lower === 'completed' || lower === 'done' || lower === '2') return 2;
        const parsed = parseInt(statusValue);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const normalizeTask = (t) => {
    if (!t) return null;
    return {
      taskId: t.taskId ?? t.TaskId,
      taskName: t.taskName ?? t.TaskName,
      description: t.description ?? t.Description,
      status: mapStatus(t.status ?? t.Status),
      priority: (t.priority !== undefined && t.priority !== null) ? t.priority : (t.Priority ?? 1),
      categoryId: t.categoryId ?? t.CategoryId,
      dueDate: t.dueDate ?? t.DueDate,
      parentId: (t.parentId !== undefined && t.parentId !== null) ? t.parentId : (t.ParentId ?? null)
    };
  };

  // --- API OPERATIONS ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch a larger set to ensure we see newly created subtasks in the main list
      const [taskRes, catRes] = await Promise.all([
        taskService.getTasks({ PageSize: 500 }), 
        categoryService.getAllCategories()
      ]);
      
      if (taskRes) {
        let rawTasks = [];
        if (Array.isArray(taskRes)) rawTasks = taskRes;
        else if (taskRes.data && Array.isArray(taskRes.data)) rawTasks = taskRes.data;
        else if (taskRes.result && Array.isArray(taskRes.result)) rawTasks = taskRes.result;
        else if (taskRes.items && Array.isArray(taskRes.items)) rawTasks = taskRes.items;
        
        const allNormalized = rawTasks.map(normalizeTask);
        
        // Root tasks: tasks that strictly have no parent
        const roots = allNormalized.filter(t => t.parentId === null || t.parentId === undefined);
        
        // Subtasks: tasks that have pointers to a parent
        const subs = allNormalized.filter(t => t.parentId !== null && t.parentId !== undefined);
        
        // PROACTIVE RECOVERY: Rebuild the subtasks map from the general list
        const recoveredSubMap = {};
        subs.forEach(s => {
          const pid = s.parentId.toString();
          if (!recoveredSubMap[pid]) recoveredSubMap[pid] = [];
          recoveredSubMap[pid].push(s);
        });
        
        setTasks(roots);
        setSubtasksMap(recoveredSubMap);
      }
      
      if (catRes) {
        if (Array.isArray(catRes)) setCategories(catRes);
        else if (catRes.data && Array.isArray(catRes.data)) setCategories(catRes.data);
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleSubtasks = async (parentId) => {
    const parentIdStr = parentId.toString();
    const newExpanded = new Set(expandedTasks);
    
    if (newExpanded.has(parentIdStr)) {
      newExpanded.delete(parentIdStr);
    } else {
      newExpanded.add(parentIdStr);
      
      // Data is usually now pre-populated, but we check if we need an extra API hit
      if (!subtasksMap[parentIdStr] || subtasksMap[parentIdStr].length === 0) {
        try {
          const res = await taskService.getSubTasks(parentId);
          let rawSubtasks = [];
          if (res) {
            if (Array.isArray(res)) rawSubtasks = res;
            else if (res.data && Array.isArray(res.data)) rawSubtasks = res.data;
            else if (res.result && Array.isArray(res.result)) rawSubtasks = res.result;
            else if (res.items && Array.isArray(res.items)) rawSubtasks = res.items;
          }
          
          if (rawSubtasks.length > 0) {
            const normalized = rawSubtasks.map(normalizeTask);
            setSubtasksMap(prev => ({ ...prev, [parentIdStr]: normalized }));
          }
        } catch (err) {
          console.error("Get Subtasks Error:", err);
        }
      }
    }
    setExpandedTasks(newExpanded);
  };

  const handleQuickUpdate = async (e, task, field, value) => {
    if (e) e.stopPropagation();
    try {
      const intValue = parseInt(value);
      const updatedTaskData = { ...task, [field]: intValue };

      // Optimistic state update
      if (task.parentId !== null && task.parentId !== undefined) {
          const pid = task.parentId;
          setSubtasksMap(prev => ({
              ...prev,
              [pid]: (prev[pid] || []).map(s => s.taskId === task.taskId ? updatedTaskData : s)
          }));
      } else {
          setTasks(prev => prev.map(t => t.taskId === task.taskId ? updatedTaskData : t));
      }

      // API persistence
      if (field === 'status') {
        await taskService.updateStatus(task.taskId, intValue);
      } else {
        await taskService.updateTask(task.taskId, { Priority: intValue });
      }

      if (activeTask && activeTask.taskId === task.taskId) {
        setActiveTask(prev => ({ ...prev, [field]: intValue }));
      }
    } catch (err) {
      console.error("Quick Update Error:", err);
      fetchData(); // Rollback on error
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.taskId !== taskId));
      setSubtasksMap(prev => {
        const newMap = { ...prev };
        Object.keys(newMap).forEach(key => {
          newMap[key] = newMap[key].filter(s => s.taskId !== taskId);
        });
        return newMap;
      });
      if (activeTask?.taskId === taskId) setActiveTask(null);
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const handleAddSubtaskSubmit = async (parentTask) => {
    if (!newSubtaskName.trim()) { setAddingSubtaskTo(null); return; }
    try {
      const parentIdInt = parseInt(parentTask.taskId);
      const categoryIdInt = parseInt(parentTask.categoryId);
      const pidStr = parentIdInt.toString();

      const res = await taskService.createTask({
        TaskName: newSubtaskName,
        taskName: newSubtaskName,
        Description: `Subtask of ${parentTask.taskName}`,
        description: `Subtask of ${parentTask.taskName}`,
        ParentId: parentIdInt,
        parentId: parentIdInt,
        CategoryId: categoryIdInt, 
        categoryId: categoryIdInt,
        Priority: 1,
        priority: 1,
        Status: 0,
        status: 0,
        DueDate: parentTask.dueDate || new Date().toISOString()
      });

      if (res) {
        // UNWRAP the axios response to reach the real task data
        const savedData = res.data || res.result || res;
        const normalizedChild = normalizeTask(savedData);
        
        // RECOVERY FALLBACK: Force-link if the server return is ambiguous
        if (!normalizedChild.parentId) { normalizedChild.parentId = parentIdInt; }

        setSubtasksMap(prev => ({
          ...prev,
          [pidStr]: [...(prev[pidStr] || []), normalizedChild]
        }));
        
        if (!expandedTasks.has(pidStr)) {
          setExpandedTasks(prev => new Set(prev).add(pidStr));
        }
      }
      setNewSubtaskName('');
      setAddingSubtaskTo(null);
    } catch (err) {
      console.error("Create Subtask Error:", err);
      alert("Failed to save subtask. Please check if Parent Task exists.");
    }
  };

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await taskService.createTask({
        TaskName: newTaskData.taskName,
        Description: newTaskData.description || '',
        Priority: parseInt(newTaskData.priority),
        CategoryId: parseInt(newTaskData.categoryId),
        DueDate: new Date().toISOString()
      });
      if (res) {
          setTasks([normalizeTask(res), ...tasks]);
          setShowCreateModal(false);
          setNewTaskData({ taskName: '', categoryId: '', priority: 1, description: '' });
      }
    } catch (err) {
      alert("Creation failed.");
    }
  };

  const handleActiveTaskSave = async () => {
    try {
      await taskService.updateTask(activeTask.taskId, {
        TaskName: activeTask.taskName,
        Description: activeTask.description,
        Priority: activeTask.priority,
        Status: activeTask.status,
        CategoryId: activeTask.categoryId,
        DueDate: activeTask.dueDate || undefined,
      });

      if (activeTask.parentId !== null && activeTask.parentId !== undefined) {
          const pid = activeTask.parentId;
          setSubtasksMap(prev => ({
              ...prev,
              [pid]: (prev[pid] || []).map(s => s.taskId === activeTask.taskId ? activeTask : s)
          }));
      } else {
          setTasks(tasks.map(t => t.taskId === activeTask.taskId ? activeTask : t));
      }
      setActiveTask(null);
    } catch (err) {
      console.error("Save Changes Error:", err);
    }
  };

  // --- FILTERS ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.taskName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status.toString() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const getStatusLabel = (s) => ['Pending', 'In Progress', 'Completed', 'Accepted'][mapStatus(s)] || 'Pending';
  const getPriorityLabel = (p) => ['Low', 'Medium', 'High'][parseInt(p)] || 'Medium';
  const getCategoryName = (id) => categories.find(c => (c.categoryId === id || c.id === id))?.categoryName || 'General';

  return (
    <div className="tasks-container">
      {/* HEADER */}
      <header className="tasks-header">
        <div className="header-left">
          <h1>Work Management</h1>
          <div className="header-badges">
            <span className="badge">Total Tasks: {tasks.length}</span>
            <span className="badge badge-blue">Done: {tasks.filter(t => t.status === 2).length}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-secondary"><Download size={18} /> Export CSV</button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={18} /> New Project Task</button>
        </div>
      </header>

      {/* FILTERS */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Every status</option>
            <option value="0">Pending</option>
            <option value="1">In Progress</option>
            <option value="2">Completed</option>
          </select>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="task-list-wrapper">
        <table className="task-table">
          <thead>
            <tr>
              <th width="40"><input type="checkbox" /></th>
              <th>TASK NAME & DESCRIPTION</th>
              <th>CATEGORY</th>
              <th>DEADLINE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th width="120">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
             {filteredTasks.map((task) => (
               <React.Fragment key={task.taskId}>
                  <tr className={`task-row-main clickable-row ${expandedTasks.has(task.taskId.toString()) ? 'active-parent' : ''}`} onClick={() => setActiveTask(task)}>
                    <td><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                    <td>
                      <div className="task-name-cell">
                        <button className="btn-expander" onClick={(e) => { e.stopPropagation(); toggleSubtasks(task.taskId); }}>
                           {expandedTasks.has(task.taskId.toString()) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <div className="task-info">
                          <div style={{display:'flex', alignItems:'center'}}>
                            <span className="task-title">{task.taskName}</span>
                            {/* DYNAMIC PROGRESS BADGE */}
                            {((subtasksMap[task.taskId.toString()] || []).length > 0) && (
                              <span className={`progress-badge ${(subtasksMap[task.taskId.toString()].filter(s => s.status === 2).length === subtasksMap[task.taskId.toString()].length) ? 'all-done' : ''}`}>
                                {(subtasksMap[task.taskId.toString()].filter(s => s.status === 2).length === subtasksMap[task.taskId.toString()].length) ? '✔ ' : ''}
                                {subtasksMap[task.taskId.toString()].filter(s => s.status === 2).length}/{subtasksMap[task.taskId.toString()].length} DONE
                              </span>
                            )}
                          </div>
                          <div className="task-desc-sub">{task.description || 'No additional details provided'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="cell-category">{getCategoryName(task.categoryId)}</span></td>
                    <td><span className="cell-date">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '---'}</span></td>
                    <td><span className={`priority-tag ${getPriorityLabel(task.priority)}`}>{getPriorityLabel(task.priority)}</span></td>
                    <td>
                      <select className={`status-dropdown ${getStatusLabel(task.status).replace(/\s/g, '')}`} value={task.status} onClick={(e)=>e.stopPropagation()} onChange={(e)=>handleQuickUpdate(e, task, 'status', e.target.value)}>
                        <option value="0">Pending</option>
                        <option value="1">In Progress</option>
                        <option value="2">Completed</option>
                        <option value="3">Accepted</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button className="action-btn plus" title="Add Subtask" onClick={(e) => { e.stopPropagation(); setAddingSubtaskTo(task.taskId); }}><Plus size={16} /></button>
                        <button className="action-btn delete" title="Delete Task" onClick={(e) => { e.stopPropagation(); handleDelete(task.taskId); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>

                  {addingSubtaskTo === task.taskId && (
                    <tr className="subtask-input-row" key={`input-${task.taskId}`}>
                      <td></td>
                      <td colSpan="6" className="subtask-connector-cell">
                        <div className="inline-input-wrapper">
                           <Plus size={18} color="#4f46e5" strokeWidth={3} />
                           <input autoFocus className="inline-subtask-input" placeholder="What needs to be done?" value={newSubtaskName} onChange={(e)=>setNewSubtaskName(e.target.value)} onKeyDown={(e)=> { if (e.key === 'Enter') handleAddSubtaskSubmit(task); if (e.key === 'Escape') setAddingSubtaskTo(null); }} onBlur={()=>!newSubtaskName.trim() && setAddingSubtaskTo(null)} />
                           <div className="input-actions-hint">
                              <span className="kdb-badge save">Enter to Save</span>
                              <span className="kdb-badge">Esc</span>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {expandedTasks.has(task.taskId.toString()) && (
                    (subtasksMap[task.taskId.toString()] || []).length > 0 ? (
                      subtasksMap[task.taskId.toString()].map(sub => (
                        <tr key={`sub-${sub.taskId}`} className="subtask-row clickable-row" onClick={() => setActiveTask(sub)}>
                          <td></td>
                          <td className="subtask-connector-cell">
                            <div className="task-name-cell">
                               <div className="subtask-icon-wrapper"><Subtitles size={12} /></div>
                               <span className="task-title">{sub.taskName}</span>
                            </div>
                          </td>
                          <td style={{opacity:0.6}}>{getCategoryName(sub.categoryId)}</td>
                          <td style={{opacity:0.6}}>{sub.dueDate ? new Date(sub.dueDate).toLocaleDateString('vi-VN') : '---'}</td>
                          <td><span className={`priority-tag ${getPriorityLabel(sub.priority)}`}>{getPriorityLabel(sub.priority)}</span></td>
                          <td>
                            <select className={`status-dropdown ${getStatusLabel(sub.status).replace(/\s/g, '')}`} value={sub.status} onClick={(e)=>e.stopPropagation()} onChange={(e)=>handleQuickUpdate(e, sub, 'status', e.target.value)}>
                              <option value="0">Pending</option>
                              <option value="1">In Progress</option>
                              <option value="2">Completed</option>
                              <option value="3">Accepted</option>
                            </select>
                          </td>
                          <td><button className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(sub.taskId); }}><Trash2 size={16} /></button></td>
                        </tr>
                      ))
                    ) : (
                      !addingSubtaskTo && (
                        <tr className="subtask-input-row" key={`empty-${task.taskId}`}>
                          <td></td>
                          <td colSpan="6" className="subtask-connector-cell">
                             <div className="empty-subtask-placeholder">
                               <AlignLeft size={14} /> No detailed subtasks yet. Click '+' to add one.
                             </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
               </React.Fragment>
             ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL SIDE PANEL */}
      <div className={`task-detail-panel ${activeTask ? 'open' : ''}`}>
        {activeTask && (
          <>
            <div className="panel-header"><h2>Task Analysis</h2><button className="btn-close" onClick={() => setActiveTask(null)}><X size={24} /></button></div>
            <div className="panel-content">
              <input type="text" className="detail-title-input" value={activeTask.taskName || ''} onChange={(e) => setActiveTask({ ...activeTask, taskName: e.target.value })} />
              <div className="detail-meta-grid">
                <div className="meta-item"><span className="meta-label"><Tag size={16} /> Category</span><select className="detail-select-input" value={activeTask.categoryId || ''} onChange={(e) => setActiveTask({ ...activeTask, categoryId: parseInt(e.target.value) })}><option value="">Select Project</option>{categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}</select></div>
                <div className="meta-item"><span className="meta-label"><Calendar size={16} /> Timeline</span><input type="datetime-local" className="detail-date-input" value={activeTask.dueDate ? new Date(activeTask.dueDate).toISOString().slice(0, 16) : ''} onChange={(e) => setActiveTask({ ...activeTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })} /></div>
                <div className="meta-item"><span className="meta-label"><Flag size={16} /> Priority</span><select className="detail-select-input" value={activeTask.priority} onChange={(e)=>setActiveTask({...activeTask, priority:parseInt(e.target.value)})}>{['Low','Medium','High'].map((l,i)=><option key={i} value={i}>{l}</option>)}</select></div>
                <div className="meta-item"><span className="meta-label"><CheckSquare size={16} /> Current Status</span><select className="detail-select-input" value={activeTask.status} onChange={(e)=>setActiveTask({...activeTask, status:parseInt(e.target.value)})}>{['Pending','In Progress','Completed'].map((l,i)=><option key={i} value={i}>{l}</option>)}</select></div>
              </div>
              <div className="detail-group desc-group">
                <div className="desc-header"><AlignLeft size={20} /> <span style={{fontWeight:800, fontSize:'1.1rem'}}>Strategic Description</span></div>
                <textarea className="detail-desc-input" rows="8" value={activeTask.description || ''} onChange={(e) => setActiveTask({ ...activeTask, description: e.target.value })} placeholder="Document guidelines..."></textarea>
              </div>
            </div>
            <div className="panel-footer"><button className="btn-secondary" onClick={() => setActiveTask(null)}>Discard</button><button className="btn-primary" onClick={handleActiveTaskSave}>Apply Changes</button></div>
          </>
        )}
      </div>
      {activeTask && <div className="overlay" onClick={() => setActiveTask(null)}></div>}

      {/* CREATE MODAL OVERLAY */}
      {showCreateModal && (
        <>
          <div className="overlay" onClick={() => setShowCreateModal(false)}></div>
          <div className="task-detail-panel open" style={{ maxWidth: '500px', height: 'auto', bottom: 'auto', top: '50%', transform: 'translate(-50%, -50%)', left: '50%', right: 'auto', borderRadius: '20px' }}>
            <div className="panel-header"><h2>Create New Project Task</h2><button className="btn-close" onClick={() => setShowCreateModal(false)}><X size={24} /></button></div>
            <form className="panel-content" onSubmit={handleCreateTaskSubmit}>
              <div className="meta-item" style={{marginBottom:'20px'}}><label className="meta-label">Task Name</label><input type="text" className="detail-title-input" style={{fontSize:'1.2rem', marginBottom:0}} placeholder="Task Title..." value={newTaskData.taskName} onChange={(e) => setNewTaskData({ ...newTaskData, taskName: e.target.value })} required /></div>
              <div className="meta-item"><label className="meta-label">Project Category</label><select className="detail-select-input" value={newTaskData.categoryId} onChange={(e) => setNewTaskData({ ...newTaskData, categoryId: e.target.value })} required><option value="" disabled>Select Category</option>{categories.map(c => <option key={c.categoryId || c.id} value={c.categoryId || c.id}>{c.categoryName || c.name}</option>)}</select></div>
              <div className="panel-footer" style={{padding:'20px 0 0 0', background:'transparent'}}><button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button><button type="submit" className="btn-primary">Create Task</button></div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Tasks;