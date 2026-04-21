import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MoreVertical,
  X,
  Trash2,
  Calendar,
  Tag,
  Flag,
  CheckSquare,
  AlignLeft,
  Subtitles,
  Download,
  AlertCircle,
  CheckCircle2,
  Circle,
  FolderKanban,
  Edit2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

import taskService from '../../services/taskService';
import categoryService from '../../services/categoryService';
import './Tasks.css';

const Tasks = () => {
  // --- CORE STATE ---
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subtasksMap, setSubtasksMap] = useState({});
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [addingTaskToGroup, setAddingTaskToGroup] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [groupBy, setGroupBy] = useState('category'); // 'category' or 'status'
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [subtaskDisplayMode, setSubtaskDisplayMode] = useState('nested'); // 'nested', 'expanded', 'hidden'
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  // Listen for navigation state (from Categories or Dashboard)
  useEffect(() => {
    // Filter by Category
    if (location.state?.filterCategoryId) {
      setCategoryFilter(location.state.filterCategoryId.toString());
    }

    // Open specific Task detail (from Dashboard)
    if (location.state?.openTaskId && tasks.length > 0) {
      const taskToOpen = tasks.find(t => t.taskId == location.state.openTaskId);
      if (taskToOpen) setActiveTask(taskToOpen);
    }

    // Clean up state
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location, tasks]);


  const [activeTask, setActiveTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    taskName: '',
    categoryId: location.state?.categoryId || '',
    priority: 1,
    description: ''
  });

  // Sync newTaskData category with filter if filter is active
  useEffect(() => {
    if (categoryFilter !== 'all') {
      setNewTaskData(prev => ({ ...prev, categoryId: categoryFilter }));
    }
  }, [categoryFilter]);

  // --- DATA NORMALIZATION ---
  const toggleGroup = (groupId) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) newCollapsed.delete(groupId);
    else newCollapsed.add(groupId);
    setCollapsedGroups(newCollapsed);
  };

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

  const mapPriority = (priorityValue) => {
    if (priorityValue === undefined || priorityValue === null || priorityValue === '') return 0;
    if (typeof priorityValue === 'number') return priorityValue;
    if (typeof priorityValue === 'string') {
      const lower = priorityValue.toLowerCase().trim();
      if (lower === 'low' || lower === '0') return 0;
      if (lower === 'medium' || lower === '1') return 1;
      if (lower === 'high' || lower === '2') return 2;
      const parsed = parseInt(priorityValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const normalizeTask = (t) => {
    if (!t) return null;
    const priorityVal = (t.priority !== undefined && t.priority !== null) ? t.priority : (t.Priority !== undefined && t.Priority !== null ? t.Priority : 1);
    return {
      taskId: t.taskId ?? t.TaskId,
      taskName: t.taskName ?? t.TaskName,
      description: t.description ?? t.Description,
      status: mapStatus(t.status ?? t.Status),
      priority: mapPriority(priorityVal),
      categoryId: t.categoryId ?? t.CategoryId,
      dueDate: t.dueDate ?? t.DueDate,
      parentId: (t.parentId !== undefined && t.parentId !== null) ? t.parentId : (t.ParentId ?? null),
      hasSubtasks: t.hasSubtasks ?? t.HasSubtasks ?? t.hasChildren ?? t.HasChildren ?? false,
    };
  };

  // --- API OPERATIONS ---
  const toggleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTaskIds);
    if (newSelected.has(taskId.toString())) newSelected.delete(taskId.toString());
    else newSelected.add(taskId.toString());
    setSelectedTaskIds(newSelected);
  };

  const selectAllInGroup = (groupTasks) => {
    const newSelected = new Set(selectedTaskIds);
    const someUnselected = groupTasks.some(t => !newSelected.has(t.taskId.toString()));
    groupTasks.forEach(t => {
      if (someUnselected) newSelected.add(t.taskId.toString());
      else newSelected.delete(t.taskId.toString());
    });
    setSelectedTaskIds(newSelected);
  };

  const handleBulkAction = async (action, value) => {
    try {
      const intValue = parseInt(value);
      if (isNaN(intValue) && action !== 'taskName') return;

      // Update frontend state immediately for all selected
      const updatedTasks = tasks.map(t => {
        if (selectedTaskIds.has(t.taskId.toString())) {
          return { ...t, [action]: action === 'status' ? intValue : value };
        }
        return t;
      });
      setTasks(updatedTasks);

      // API persistence for each selected task
      const promises = Array.from(selectedTaskIds).map(id => {
        if (action === 'status') {
          return taskService.updateStatus(id, intValue);
        } else if (action === 'priority') {
          return taskService.updateTask(id, { Priority: intValue });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      // If we bulk-completed tasks, re-fetch to get recursive updates
      if (action === 'status' && intValue === 2) {
        fetchTasks();
      }

      // Clear selection after action
      setSelectedTaskIds(new Set());
    } catch (err) {
      console.error("Bulk Action Error:", err);
      fetchTasks();
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedTaskIds.size} tasks?`)) return;
    const filterIds = Array.from(selectedTaskIds);
    setTasks(tasks.filter(t => !selectedTaskIds.has(t.taskId.toString())));
    setSelectedTaskIds(new Set());
  };

  const fetchTasks = async () => {
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
        // MERGE instead of REPLACE to preserve lazy-loaded subtasks
        setSubtasksMap(prev => {
          const merged = { ...prev };
          Object.keys(recoveredSubMap).forEach(pid => {
            merged[pid] = recoveredSubMap[pid];
          });
          return merged;
        });
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

  useEffect(() => { fetchTasks(); }, []);

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
            const normalized = rawSubtasks.map(s => {
              const nt = normalizeTask(s);
              if (!nt.parentId) nt.parentId = parentId;
              return nt;
            });
            setSubtasksMap(prev => ({ ...prev, [parentIdStr]: normalized }));
          } else {
            // Set to empty array to indicate we've checked and it's empty
            setSubtasksMap(prev => ({ ...prev, [parentIdStr]: [] }));
          }
        } catch (err) {
          console.error("Get Subtasks Error:", err);
        }
      }
    }
    setExpandedTasks(newExpanded);
  };

  const expandAllSubtasks = async () => {
    const rootsWithSubs = tasks.filter(t => t.hasSubtasks);
    const newExpanded = new Set(expandedTasks);

    // Proactively expand all roots with subs
    rootsWithSubs.forEach(t => newExpanded.add(t.taskId.toString()));
    setExpandedTasks(newExpanded);

    // Fetch subtasks for any that aren't already loaded
    for (const task of rootsWithSubs) {
      const pidStr = task.taskId.toString();
      if (!subtasksMap[pidStr] || subtasksMap[pidStr].length === 0) {
        try {
          const res = await taskService.getSubTasks(task.taskId);
          let raw = [];
          if (Array.isArray(res)) raw = res;
          else if (res.data && Array.isArray(res.data)) raw = res.data;
          else if (res.result && Array.isArray(res.result)) raw = res.result;

          const normalized = raw.map(s => {
            const nt = normalizeTask(s);
            if (!nt.parentId) nt.parentId = task.taskId;
            return nt;
          });

          setSubtasksMap(prev => ({ ...prev, [pidStr]: normalized }));
        } catch (err) {
          console.error("Expand All Fetch Error:", err);
        }
      }
    }
  };

  const collapseAllSubtasks = () => {
    setExpandedTasks(new Set());
  };

  const handleQuickUpdate = async (e, task, field, value) => {
    if (e) e.stopPropagation();
    try {
      console.log(`[QuickUpdate] Task ${task.taskId} | Field: ${field} | Value: ${value}`);

      let finalValue = value;
      if (field === 'status' || field === 'priority') {
        finalValue = parseInt(value);
        if (isNaN(finalValue)) return;
      }

      const updatedTaskData = { ...task, [field]: finalValue };

      // Optimistic state update
      let foundInRoot = tasks.some(t => t.taskId == task.taskId);
      let foundInSubs = false;
      let parentIdStr = null;

      if (task.parentId) {
        parentIdStr = task.parentId.toString();
        if (subtasksMap[parentIdStr]?.some(s => s.taskId == task.taskId)) {
          foundInSubs = true;
        }
      }

      if (foundInSubs) {
        console.log(`[QuickUpdate] Updating subtask in map for parent: ${parentIdStr}`);
        setSubtasksMap(prev => ({
          ...prev,
          [parentIdStr]: (prev[parentIdStr] || []).map(s => s.taskId == task.taskId ? updatedTaskData : s)
        }));
      } else if (foundInRoot) {
        console.log(`[QuickUpdate] Updating root task`);
        setTasks(prev => prev.map(t => t.taskId == task.taskId ? updatedTaskData : t));
      } else {
        console.warn(`[QuickUpdate] WARNING: Task ${task.taskId} not found in state. Re-fetching...`);
        fetchTasks();
      }

      // API persistence
      if (field === 'status') {
        const res = await taskService.updateStatus(task.taskId, finalValue);
        console.log("[QuickUpdate] API Status OK:", res);

        // OPTIMISTIC: If root task becomes completed, mark all its descendants in state
        if (finalValue === 2) {
          const taskIdStr = task.taskId.toString();
          setSubtasksMap(prev => {
            const next = { ...prev };
            const processQueue = [taskIdStr];
            const seen = new Set();
            while (processQueue.length > 0) {
              const pid = processQueue.shift();
              if (seen.has(pid)) continue;
              seen.add(pid);
              if (next[pid]) {
                next[pid] = next[pid].map(child => {
                  processQueue.push(child.taskId.toString());
                  return { ...child, status: 2 };
                });
              }
            }
            return next;
          });
          fetchTasks();
        }
      } else {
        // Minimal camelCase payload for .NET CamelCase policy
        const payload = {
          [field]: finalValue
        };

        console.log(`[QuickUpdate] Calling updateTask API with minimal payload:`, payload);
        await taskService.updateTask(task.taskId, payload);
      }

      // Success: update active task if it's the same one
      if (activeTask && activeTask.taskId == task.taskId) {
        setActiveTask(prev => ({ ...prev, [field]: finalValue }));
      }

      // Force sync with server after a short delay since DB confirmed updated
      setTimeout(() => fetchTasks(), 500);
      console.log(`[QuickUpdate] Task ${task.taskId} ${field} updated successfully.`);
    } catch (err) {
      console.error("[QuickUpdate] ERROR:", err);
      alert("Cập nhật thất bại.");
      fetchTasks();
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
      let categoryIdInt = parseInt(parentTask.categoryId);

      // Fallback nếu CategoryId không hợp lệ (NaN hoặc 0)
      if (isNaN(categoryIdInt) || categoryIdInt <= 0) {
        // Thử lấy category đầu tiên nếu có
        categoryIdInt = categories.length > 0 ? (categories[0].categoryId || categories[0].id) : 1;
      }

      const pidStr = parentIdInt.toString();

      // Đảm bảo DueDate không ở quá khứ (Validator API yêu cầu)
      let dueDate = parentTask.dueDate ? new Date(parentTask.dueDate) : new Date();
      if (dueDate < new Date().setHours(0, 0, 0, 0)) {
        dueDate = new Date();
      }

      const payload = {
        TaskName: newSubtaskName,
        Description: `Subtask của ${parentTask.taskName}`,
        ParentId: parentIdInt,
        CategoryId: categoryIdInt,
        Priority: 1,
        DueDate: dueDate.toISOString()
      };

      console.log("Creating subtask with payload:", payload);

      const res = await taskService.createTask(payload);

      if (res) {
        console.log("Create subtask API success:", res);
        // UNWRAP the axios response
        const savedData = res.data || res.result || res;
        const normalizedChild = normalizeTask(savedData);

        // RECOVERY FALLBACK: Force-link if the server return is ambiguous
        if (!normalizedChild.parentId) {
          normalizedChild.parentId = parentIdInt;
        }

        console.log("Newly added subtask normalized:", normalizedChild);

        setSubtasksMap(prev => {
          const pid = normalizedChild.parentId.toString();
          const currentSubs = prev[pid] || [];
          return {
            ...prev,
            [pid]: [...currentSubs, normalizedChild]
          };
        });

        if (!expandedTasks.has(pidStr)) {
          setExpandedTasks(prev => new Set(prev).add(pidStr));
        }

        // Update parent task in state to show the expand/collapse toggle
        setTasks(prev => prev.map(t =>
          t.taskId === parentIdInt ? { ...t, hasSubtasks: true } : t
        ));
      }
      setNewSubtaskName('');
      setAddingSubtaskTo(null);
    } catch (err) {
      console.error("Create Subtask Error:", err);
      // alert("Failed to save subtask. " + (err.response?.data || ""));
    }
  };

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      let categoryIdInt = parseInt(newTaskData.categoryId);
      if (isNaN(categoryIdInt)) {
        categoryIdInt = categories.length > 0 ? (categories[0].categoryId || categories[0].id) : 1;
      }

      const payload = {
        TaskName: newTaskData.taskName,
        Description: newTaskData.description || '',
        Priority: parseInt(newTaskData.priority),
        CategoryId: categoryIdInt,
        DueDate: new Date().toISOString()
      };

      console.log("Creating main task with payload:", payload);
      const res = await taskService.createTask(payload);
      if (res) {
        setTasks([normalizeTask(res), ...tasks]);
        setShowCreateModal(false);
        setNewTaskData({ taskName: '', categoryId: '', priority: 1, description: '' });
      }
    } catch (err) {
      alert("Creation failed.");
    }
  };

  const handleQuickAddRootTask = async (groupId) => {
    const nameToSave = newTaskName.trim();
    if (!nameToSave) {
      setAddingTaskToGroup(null);
      return;
    }

    // Prevent double submission if already processing
    setNewTaskName('');
    setAddingTaskToGroup(null);

    const categoryId = (groupId === 'uncategorized' || !groupId) ? null : parseInt(groupId);

    try {
      const payload = {
        TaskName: nameToSave,
        Status: 0,
        Priority: 1,
        CategoryId: categoryId || (categories.length > 0 ? (categories[0].categoryId || categories[0].id) : null),
        Description: '',
        DueDate: new Date().toISOString()
      };

      console.log("Quick adding task:", payload);
      const res = await taskService.createTask(payload);

      if (res) {
        const savedData = res.data || res.result || res;
        const normalized = normalizeTask(savedData);

        // Optimistic update
        setTasks(prev => [normalized, ...prev]);

        // Final sync with server to ensure all relations (like project name) are correct
        fetchTasks();
      }
    } catch (err) {
      console.error("Lỗi tạo task nhanh:", err);
      alert("Không thể tạo task: " + (err.response?.data || err.message));
      // Revert states if failed so user can try again
      setNewTaskName(nameToSave);
      setAddingTaskToGroup(groupId);
    }
  };

  const handleActiveTaskSave = async () => {
    try {
      // Find original to check if status changed
      const original = tasks.find(t => t.taskId === activeTask.taskId) ||
        Object.values(subtasksMap).flat().find(s => s && s.taskId === activeTask.taskId);

      const statusChanged = original && original.status !== activeTask.status;

      await taskService.updateTask(activeTask.taskId, {
        TaskName: activeTask.taskName,
        Description: activeTask.description,
        Priority: activeTask.priority,
        // We still send Status for consistency, but we'll call updateStatus next if changed
        Status: activeTask.status,
        CategoryId: activeTask.categoryId,
        DueDate: activeTask.dueDate || undefined,
      });

      // If status changed, call dedicated API to trigger tree completion logic
      if (statusChanged) {
        await taskService.updateStatus(activeTask.taskId, activeTask.status);

        // OPTIMISTIC: Recursive completion for the whole tree in local state
        if (activeTask.status === 2) {
          const tidStr = activeTask.taskId.toString();
          setSubtasksMap(prev => {
            const next = { ...prev };
            const processQueue = [tidStr];
            const seen = new Set();
            while (processQueue.length > 0) {
              const pid = processQueue.shift();
              if (seen.has(pid)) continue;
              seen.add(pid);
              if (next[pid]) {
                next[pid] = next[pid].map(child => {
                  processQueue.push(child.taskId.toString());
                  return { ...child, status: 2 };
                });
              }
            }
            return next;
          });
          fetchTasks();
        }
      }

      if (activeTask.parentId !== null && activeTask.parentId !== undefined) {
        const pid = activeTask.parentId;
        setSubtasksMap(prev => ({
          ...prev,
          [pid]: (prev[pid] || []).map(s => s.taskId === activeTask.taskId ? activeTask : s)
        }));
      } else {
        setTasks(tasks.map(t => t.taskId === activeTask.taskId ? activeTask : t));
      }

      // If marked as completed, re-fetch to get recursive updates
      if (statusChanged && activeTask.status === 2) {
        fetchTasks();
      }

      setActiveTask(null);
    } catch (err) {
      console.error("Save Changes Error:", err);
      fetchTasks();
    }
  };

  // --- FILTERS ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.taskName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || mapStatus(t.status).toString() === statusFilter;
      const matchesCategory = categoryFilter === 'all' || (t.categoryId && t.categoryId.toString() === categoryFilter);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tasks, searchTerm, statusFilter, categoryFilter]);

  // logic grouping: ClickUp Style (Project or Status)
  const groupedTasks = useMemo(() => {
    if (groupBy === 'status') {
      const statuses = [
        { id: '0', name: 'TO DO', color: '#64748b', icon: <Circle size={18} /> },
        { id: '1', name: 'IN PROGRESS', color: '#0055cc', icon: <AlertCircle size={18} /> },
        { id: '2', name: 'DONE', color: '#006644', icon: <CheckCircle2 size={18} /> }
      ];
      return statuses.map(s => ({
        id: s.id,
        categoryName: s.name,
        color: s.color,
        icon: s.icon,
        tasks: filteredTasks.filter(t => t.status.toString() === s.id)
      })).filter(g => g.tasks.length > 0);
    }

    const groups = {};
    filteredTasks.forEach(task => {
      const catId = task.categoryId?.toString() || 'uncategorized';
      if (!groups[catId]) {
        const cat = categories.find(c => (c.categoryId || c.id).toString() === catId);
        groups[catId] = {
          id: catId,
          categoryName: cat?.categoryName || cat?.name || (catId === 'uncategorized' ? 'Uncategorized' : 'General'),
          color: cat?.color || '#94a3b8',
          icon: <FolderKanban size={18} color={cat?.color || '#94a3b8'} />,
          tasks: []
        };
      }
      groups[catId].tasks.push(task);
    });

    return Object.values(groups).sort((a, b) => {
      if (a.id === 'uncategorized') return 1;
      if (b.id === 'uncategorized') return -1;
      return a.categoryName.localeCompare(b.categoryName);
    });
  }, [filteredTasks, categories, groupBy]);

  const getStatusLabel = (s) => ['Pending', 'In Progress', 'Completed'][mapStatus(s)] || 'Pending';
  const getPriorityLabel = (p) => ['Low', 'Medium', 'High'][parseInt(p)] || 'Medium';

  const getCategoryName = (id) => {
    if (!id) return 'General';
    const cat = categories.find(c =>
      (c.categoryId == id || c.CategoryId == id || c.id == id)
    );
    return cat ? (cat.categoryName || cat.CategoryName || cat.name) : 'General';
  };

  const getCategoryColor = (id) => {
    const cat = categories.find(c => (c.categoryId == id || c.id == id));
    return cat?.color || '#94a3b8';
  };

  const getSubtaskStats = (parentId) => {
    const list = subtasksMap[parentId.toString()] || [];
    if (list.length === 0) return null;
    const done = list.filter(s => mapStatus(s.status) === 2).length;
    return { total: list.length, done };
  };

  const currentProjectName = useMemo(() => {
    if (categoryFilter === 'all') return 'Work Management';
    const cat = categories.find(c => (c.categoryId || c.id || '').toString() === categoryFilter);
    return cat ? (cat.categoryName || cat.name || 'Project') : 'Work Management';
  }, [categoryFilter, categories]);

  return (
    <div className="tasks-container">
      {/* HEADER: Integration style */}
      <header className="tasks-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1>{currentProjectName}</h1>
          <div className="header-badges">
            <span className="badge">
              <strong>{tasks.length}</strong> Parent Tasks
            </span>
            <span className="badge badge-blue">
              <strong>{tasks.filter(t => t.status === 2).length}</strong> Completed
            </span>
            <span className="badge badge-purple">
              <strong>{Object.values(subtasksMap).reduce((acc, list) => acc + list.length, 0)}</strong> Total Subtasks
            </span>
          </div>
        </div>
      </header>

      {/* FILTERS */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <div className="filter-item">
            <Filter size={18} color="#94a3b8" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="0">Pending</option>
              <option value="1">In Progress</option>
              <option value="2">Completed</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Projects</option>
              {categories.map(cat => (
                <option key={cat.categoryId || cat.id} value={cat.categoryId || cat.id}>
                  {cat.categoryName || cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <span className="label-hint">GROUP BY</span>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
              <option value="category">Project</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="filter-item">
            <span className="label-hint">SUBTASKS</span>
            <select value={subtaskDisplayMode} onChange={(e) => setSubtaskDisplayMode(e.target.value)}>
              <option value="nested">Collapsed</option>
              <option value="expanded">Expanded</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <button
            className={`btn-toggle-expand ${expandedTasks.size > 0 ? 'active' : ''}`}
            onClick={expandedTasks.size > 0 ? collapseAllSubtasks : expandAllSubtasks}
          >
            <ChevronDown size={18} />
            {expandedTasks.size > 0 ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="task-list-wrapper">
        <table className="task-table">
          <thead>
            <tr>
              <th style={{ width: '4px', padding: 0 }}></th>
              <th width="40">
                <input
                  type="checkbox"
                  checked={tasks.length > 0 && selectedTaskIds.size === tasks.length}
                  onChange={() => {
                    if (selectedTaskIds.size === tasks.length) setSelectedTaskIds(new Set());
                    else setSelectedTaskIds(new Set(tasks.map(t => t.taskId.toString())));
                  }}
                />
              </th>
              <th>TASK NAME & DESCRIPTION</th>
              <th>LIST / PROJECT</th>
              <th>DEADLINE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th width="120">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {groupedTasks.map((group) => (
              <React.Fragment key={group.id}>
                <tr className={`project-group-header ${collapsedGroups.has(group.id) ? 'collapsed' : ''}`} onClick={() => toggleGroup(group.id)}>
                  <td colSpan="8">
                    <div className="group-header-content" style={{ borderLeft: `6px solid ${group.color}` }}>
                      <div className="group-header-left" onClick={() => toggleGroup(group.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}>
                        {collapsedGroups.has(group.id) ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                        {group.icon}
                        <span className="group-title">{group.categoryName}</span>
                      </div>

                      <div className="group-header-actions">
                        <button
                          className="btn-add-group-task"
                          title={`Add task to ${group.categoryName}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingTaskToGroup(group.id);
                            setNewTaskName('');
                          }}
                        >
                          <Plus size={16} />
                          <span>Add Task</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                {addingTaskToGroup === group.id && (
                  <tr className="subtask-input-row">
                    <td></td>
                    <td colSpan="7">
                      <div className="inline-input-wrapper">
                        <Plus size={18} color="var(--primary)" />
                        <input
                          autoFocus
                          className="inline-subtask-input"
                          placeholder={`Add parent task to ${group.categoryName}...`}
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleQuickAddRootTask(group.id);
                            if (e.key === 'Escape') setAddingTaskToGroup(null);
                          }}
                          onBlur={() => handleQuickAddRootTask(group.id)}
                        />
                        <div className="input-actions-hint">
                          <span className="kdb-badge save">Enter</span>
                          <span className="kdb-badge">Esc</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {!collapsedGroups.has(group.id) && group.tasks.map((task) => (
                  <React.Fragment key={task.taskId}>
                    <tr
                      className={`task-row-main clickable-row ${expandedTasks.has(task.taskId.toString()) ? 'active-parent' : ''}`}
                      onClick={() => setActiveTask(task)}
                      style={{ '--project-color': group.color }}
                    >
                      <td className="project-indicator-cell">
                        <div className="project-indicator-bar" style={{ backgroundColor: 'var(--project-color)' }}></div>
                      </td>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.has(task.taskId.toString())}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleSelectTask(task.taskId)}
                        />
                      </td>
                      <td>
                        <div className="task-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {(task.hasSubtasks || (subtasksMap[task.taskId.toString()]?.length > 0)) && (
                              <div
                                className={`row-expander inline ${expandedTasks.has(task.taskId.toString()) ? 'expanded' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubtasks(task.taskId.toString());
                                }}
                              >
                                <ChevronRight size={16} />
                              </div>
                            )}
                            <input
                              key={`tname-${task.taskId}-${task.taskName}`}
                              className="inline-name-input task-title"
                              defaultValue={task.taskName}
                              onBlur={(e) => {
                                if (e.target.value.trim() !== task.taskName && e.target.value.trim() !== '') {
                                  handleQuickUpdate(e, task, 'taskName', e.target.value.trim());
                                } else {
                                  e.target.value = task.taskName;
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') e.target.blur();
                              }}
                            />
                            {getSubtaskStats(task.taskId) && (
                              <div className="subtask-progress-mini" title="Subtask Progress">
                                <CheckSquare size={12} />
                                {getSubtaskStats(task.taskId).done}/{getSubtaskStats(task.taskId).total}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="project-tag"
                          style={{
                            backgroundColor: `${group.color}15`,
                            color: group.color,
                            borderColor: `${group.color}30`
                          }}
                        >
                          <FolderKanban size={12} style={{ marginRight: '6px' }} />
                          {getCategoryName(task.categoryId)}
                        </span>
                      </td>
                      <td>
                        <div className="deadline-cell inline-edit">
                          <Calendar size={14} />
                          <input
                            type="date"
                            className="inline-date-input"
                            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleQuickUpdate(null, task, 'dueDate', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>
                      <td>
                        <select
                          className={`priority-select p-${task.priority}`}
                          value={task.priority}
                          onChange={(e) => handleQuickUpdate(e, task, 'priority', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="0">Low</option>
                          <option value="1">Medium</option>
                          <option value="2">High</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className={`status-select s-${task.status}`}
                          value={task.status}
                          onChange={(e) => handleQuickUpdate(e, task, 'status', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="0">TO DO</option>
                          <option value="1">IN PROGRESS</option>
                          <option value="2">DONE</option>
                        </select>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-action plus"
                          title="Add Subtask"
                          onClick={(e) => { e.stopPropagation(); setAddingSubtaskTo(task.taskId.toString()); }}
                        >
                          <Plus size={16} />
                        </button>
                        <button className="btn-action" onClick={(e) => { e.stopPropagation(); setActiveTask(task); }}><Edit2 size={16} /></button>
                        <button className="btn-action delete" onClick={(e) => { e.stopPropagation(); handleDelete(task.taskId); }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                    {addingSubtaskTo === task.taskId.toString() && (
                      <tr className="subtask-input-row" onClick={(e) => e.stopPropagation()}>
                        <td className="project-indicator-cell">
                          <div className="project-indicator-bar small" style={{ backgroundColor: 'var(--project-color)', opacity: 0.8 }}></div>
                        </td>
                        <td></td>
                        <td colSpan="6" className="subtask-connector-cell">
                          <div className="inline-input-wrapper">
                            <Plus size={14} className="input-icon" />
                            <input
                              className="inline-subtask-input"
                              placeholder="New subtask name..."
                              autoFocus
                              value={newSubtaskName}
                              onChange={(e) => setNewSubtaskName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddSubtaskSubmit(task);
                                if (e.key === 'Escape') {
                                  setAddingSubtaskTo(null);
                                  setNewSubtaskName('');
                                }
                              }}
                            />
                            <div className="input-actions-hint">
                              <span className="kdb-badge save">Enter</span>
                              <span className="kdb-badge">Esc</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {(subtaskDisplayMode === 'expanded' || (subtaskDisplayMode === 'nested' && expandedTasks.has(task.taskId.toString()))) &&
                      (subtasksMap[task.taskId.toString()] || []).map(sub => (
                        <tr key={`sub-${sub.taskId}`} className="subtask-row clickable-row" onClick={() => setActiveTask(sub)} style={{ '--project-color': group.color }}>
                          <td className="project-indicator-cell">
                            <div className="project-indicator-bar small" style={{ backgroundColor: 'var(--project-color)', opacity: 0.6 }}></div>
                          </td>
                          <td className="checkbox-cell">
                            <input
                              type="checkbox"
                              checked={selectedTaskIds.has(sub.taskId.toString())}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleSelectTask(sub.taskId)}
                            />
                          </td>
                          <td className="subtask-connector-cell">
                            <div className="task-name-cell" style={{ marginLeft: '24px' }}>
                              <input
                                key={`sname-${sub.taskId}-${sub.taskName}`}
                                className="inline-name-input task-title subtask-title"
                                defaultValue={sub.taskName}
                                onBlur={(e) => {
                                  if (e.target.value.trim() !== sub.taskName && e.target.value.trim() !== '') {
                                    handleQuickUpdate(e, sub, 'taskName', e.target.value.trim());
                                  } else {
                                    e.target.value = sub.taskName;
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.target.blur();
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <span
                              className="project-tag"
                              style={{
                                backgroundColor: `${group.color}15`,
                                color: group.color,
                                borderColor: `${group.color}30`
                              }}
                            >
                              <FolderKanban size={12} style={{ marginRight: '6px' }} />
                              {getCategoryName(sub.categoryId)}
                            </span>
                          </td>
                          <td>
                            <div className="deadline-cell inline-edit">
                              <input
                                type="date"
                                className="inline-date-input"
                                value={sub.dueDate ? new Date(sub.dueDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleQuickUpdate(null, sub, 'dueDate', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </td>
                          <td>
                            <select
                              className={`priority-select p-${sub.priority}`}
                              value={sub.priority}
                              onChange={(e) => handleQuickUpdate(e, sub, 'priority', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="0">Low</option>
                              <option value="1">Medium</option>
                              <option value="2">High</option>
                            </select>
                          </td>
                          <td>
                            <select
                              className={`status-select s-${sub.status}`}
                              value={sub.status}
                              onChange={(e) => handleQuickUpdate(e, sub, 'status', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="0">TO DO</option>
                              <option value="1">IN PROGRESS</option>
                              <option value="2">DONE</option>
                            </select>
                          </td>
                          <td className="actions-cell">
                            <button className="btn-action" onClick={(e) => { e.stopPropagation(); setActiveTask(sub); }}><Edit2 size={16} /></button>
                            <button className="btn-action delete" onClick={(e) => { e.stopPropagation(); handleDelete(sub.taskId); }}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* CLICKUP STYLE TASK BAR (MULTI-SELECT TOOLBAR) */}
      {selectedTaskIds.size > 0 && (
        <div className="clickup-task-bar">
          <div className="task-bar-content">
            <div className="selection-info">
              <span className="count">{selectedTaskIds.size}</span>
              <span className="label">Tasks Selected</span>
              <button className="btn-text-clear" onClick={() => setSelectedTaskIds(new Set())}>Deselect</button>
            </div>

            <div className="task-bar-actions">
              <div className="action-item">
                <CheckCircle2 size={16} />
                <span>Status</span>
                <select onChange={(e) => handleBulkAction('status', parseInt(e.target.value))} defaultValue="">
                  <option value="" disabled>Set...</option>
                  <option value="0">TO DO</option>
                  <option value="1">IN PROGRESS</option>
                  <option value="2">DONE</option>
                </select>
              </div>

              <div className="action-item">
                <Flag size={16} />
                <span>Priority</span>
                <select onChange={(e) => handleBulkAction('priority', parseInt(e.target.value))} defaultValue="">
                  <option value="" disabled>Set...</option>
                  <option value="0">LOW</option>
                  <option value="1">MEDIUM</option>
                  <option value="2">HIGH</option>
                </select>
              </div>

              <button className="btn-bulk-delete" onClick={handleBulkDelete}>
                <Trash2 size={18} />
                Delete
              </button>
            </div>

            <button className="btn-close-bar" onClick={() => setSelectedTaskIds(new Set())}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* DETAIL SIDE PANEL: Only render if activeTask exists */}
      {
        activeTask && (
          <>
            <div className="overlay" onClick={() => setActiveTask(null)}></div>
            <div className="task-detail-panel open">
              <div className="panel-header">
                <h2>Task Analysis</h2>
                <button className="btn-close" onClick={() => setActiveTask(null)}><X size={24} /></button>
              </div>
              <div className="panel-content">
                <input
                  type="text"
                  className="detail-title-input"
                  value={activeTask.taskName || ''}
                  onChange={(e) => setActiveTask({ ...activeTask, taskName: e.target.value })}
                />
                <div className="detail-meta-grid">
                  <div className="meta-item">
                    <span className="meta-label"><Tag size={16} /> Category</span>
                    <select
                      className="detail-select-input"
                      value={activeTask.categoryId || ''}
                      onChange={(e) => setActiveTask({ ...activeTask, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                          {c.categoryName || c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label"><Calendar size={16} /> Timeline</span>
                    <input
                      type="datetime-local"
                      className="detail-date-input"
                      value={(() => {
                        if (!activeTask.dueDate) return '';
                        try {
                          const d = new Date(activeTask.dueDate);
                          return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
                        } catch { return ''; }
                      })()}
                      onChange={(e) => setActiveTask({ ...activeTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                  <div className="meta-item">
                    <span className="meta-label"><Flag size={16} /> Priority</span>
                    <select
                      className="detail-select-input"
                      value={activeTask.priority}
                      onChange={(e) => setActiveTask({ ...activeTask, priority: parseInt(e.target.value) })}
                    >
                      {['Low', 'Medium', 'High'].map((l, i) => <option key={i} value={i}>{l}</option>)}
                    </select>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label"><CheckSquare size={16} /> Current Status</span>
                    <select
                      className={`detail-select-input status-select s-${activeTask.status}`}
                      value={activeTask.status}
                      onChange={(e) => setActiveTask({ ...activeTask, status: parseInt(e.target.value) })}
                    >
                      <option value="0">TO DO</option>
                      <option value="1">IN PROGRESS</option>
                      <option value="2">DONE</option>
                    </select>
                  </div>
                </div>
                <div className="detail-group desc-group">
                  <div className="desc-header">
                    <AlignLeft size={20} />
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Strategic Description</span>
                  </div>
                  <textarea
                    className="detail-desc-input"
                    rows="8"
                    value={activeTask.description || ''}
                    onChange={(e) => setActiveTask({ ...activeTask, description: e.target.value })}
                    placeholder="Document guidelines..."
                  ></textarea>
                </div>

                {/* SIDE PANEL SUBTASKS SECTION */}
                <div className="detail-group subtasks-group" style={{ marginTop: '32px' }}>
                  <div className="desc-header" style={{ marginBottom: '16px' }}>
                    <Subtitles size={20} />
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Subtasks</span>
                  </div>

                  <div className="side-panel-subtasks-list">
                    {subtasksMap[activeTask.taskId.toString()]?.map(s => (
                      <div key={s.taskId} className="side-subtask-item">
                        <CheckCircle2 size={16} className={s.status === 2 ? 'done' : ''} />
                        <span className={`side-subtask-title ${s.status === 2 ? 'strike' : ''}`}>{s.taskName}</span>
                        <span className={`status-pill s-${s.status} mini`}>{['TODO', 'WORK', 'DONE'][s.status]}</span>
                      </div>
                    ))}

                    <div className="side-quick-add">
                      <input
                        type="text"
                        placeholder="+ Add a subtask..."
                        className="side-subtask-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSubtaskSubmit(activeTask);
                            e.target.value = '';
                          }
                        }}
                        onChange={(e) => setNewSubtaskName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="panel-footer">
                <button className="btn-secondary" onClick={() => setActiveTask(null)}>Discard</button>
                <button className="btn-primary" onClick={handleActiveTaskSave}>Apply Changes</button>
              </div>
            </div>
          </>
        )
      }

      {/* CREATE MODAL OVERLAY */}
      {
        showCreateModal && (
          <>
            <div className="overlay" onClick={() => setShowCreateModal(false)}></div>
            <div className="task-detail-panel open" style={{ maxWidth: '500px', height: 'auto', bottom: 'auto', top: '50%', transform: 'translate(-50%, -50%)', left: '50%', right: 'auto', borderRadius: '20px' }}>
              <div className="panel-header"><h2>Create New Project Task</h2><button className="btn-close" onClick={() => setShowCreateModal(false)}><X size={24} /></button></div>
              <form className="panel-content" onSubmit={handleCreateTaskSubmit}>
                <div className="meta-item" style={{ marginBottom: '20px' }}><label className="meta-label">Task Name</label><input type="text" className="detail-title-input" style={{ fontSize: '1.2rem', marginBottom: 0 }} placeholder="Task Title..." value={newTaskData.taskName} onChange={(e) => setNewTaskData({ ...newTaskData, taskName: e.target.value })} required /></div>
                <div className="meta-item"><label className="meta-label">Assign to Project</label><select className="detail-select-input" value={newTaskData.categoryId} onChange={(e) => setNewTaskData({ ...newTaskData, categoryId: e.target.value })} required><option value="" disabled>Select Project</option>{categories.map(c => <option key={c.categoryId || c.id} value={c.categoryId || c.id}>{c.categoryName || c.name}</option>)}</select></div>
                <div className="panel-footer" style={{ padding: '20px 0 0 0', background: 'transparent' }}><button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button><button type="submit" className="btn-primary">Create Task</button></div>
              </form>
            </div>
          </>
        )
      }
    </div >
  );
};

export default Tasks;