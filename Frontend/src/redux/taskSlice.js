// src/redux/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskApi from '../api/taskApi';

// ── Enum mapping: BE (số) ↔ FE (string) ────────────────────────────────────────
export const STATUS_MAP = { 0: 'Pending', 1: 'In Progress', 2: 'Completed', Todo: 'Pending', InProgress: 'In Progress', Completed: 'Completed' };
export const STATUS_TO_NUM = { 'Pending': 0, 'In Progress': 1, 'Completed': 2 };
// BE uses JsonStringEnumConverter → PATCH /status must send string enum name (not number)
export const STATUS_TO_ENUM_NAME = { 'Pending': 'Todo', 'In Progress': 'InProgress', 'Completed': 'Completed' };
export const PRIORITY_MAP = { 0: 'Low', 1: 'Medium', 2: 'High', Low: 'Low', Medium: 'Medium', High: 'High' };
export const PRIORITY_TO_NUM = { 'Low': 0, 'Medium': 1, 'High': 2 };
export const PRIORITY_TO_ENUM_NAME = { 'Low': 'Low', 'Medium': 'Medium', 'High': 'High' };

// Chuẩn hoà task từ BE → FE (đổi tên field, đổi enum số/string → FE string)
const normalize = (t) => ({
  id:          t.taskId,
  title:       t.taskName,
  description: t.description ?? '',
  deadline:    t.dueDate ? t.dueDate.split('T')[0] : '',
  // BE may return number (0,1,2) or string enum name ("Todo","InProgress","Completed")
  status:      STATUS_MAP[t.status] ?? STATUS_MAP[String(t.status)] ?? 'Pending',
  // BE priority also may be number or string
  priority:    PRIORITY_MAP[t.priority] ?? PRIORITY_MAP[String(t.priority)] ?? 'Medium',
  categoryId:  t.categoryId ?? null,
  parentId:    t.parentId ?? null,
  tags:        t.tags ?? [],
  hasSubtasks: t.hasSubtasks ?? false,
  progress:    t.progress ?? 0,
  notes:       t.notes ?? [],
});

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Pass pageSize=1000 to get all tasks (BE default is only 10)
      const res = await taskApi.getAll({ pageSize: 1000, ...params });
      // BE returns: { data: [...], total, page, pageSize }
      const items = Array.isArray(res) ? res : (res.data ?? res.items ?? []);
      return items.map(normalize);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi tải danh sách task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (formData, { rejectWithValue }) => {
    try {
      const payload = {
        taskName:    formData.title,
        description: formData.description ?? '',
        dueDate:     formData.deadline ? new Date(formData.deadline).toISOString() : null,
        priority:    PRIORITY_TO_NUM[formData.priority] ?? 1,
        categoryId:  formData.categoryId ? Number(formData.categoryId) : null,
        parentId:    formData.parentId ?? null,
        tagNames:    formData.tags ?? [],
      };
      await taskApi.create(payload);
      // Re-fetch all tasks with large pageSize
      const allRes = await taskApi.getAll({ pageSize: 1000 });
      const items = Array.isArray(allRes) ? allRes : (allRes.data ?? allRes.items ?? []);
      return items.map(normalize);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi tạo task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = {
        taskName:    data.title,
        description: data.description,
        dueDate:     data.deadline ? new Date(data.deadline).toISOString() : null,
        // BE uses JsonStringEnumConverter → send enum name strings
        status:      STATUS_TO_ENUM_NAME[data.status] ?? 'Todo',
        priority:    PRIORITY_TO_ENUM_NAME[data.priority] ?? 'Medium',
        categoryId:  data.categoryId ? Number(data.categoryId) : null,
        progress:    data.progress ?? 0,
      };
      await taskApi.update(id, payload);
      // Re-fetch all with large pageSize
      const allRes = await taskApi.getAll({ pageSize: 1000 });
      const items = Array.isArray(allRes) ? allRes : (allRes.data ?? allRes.items ?? []);
      return items.map(normalize);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi cập nhật task');
    }
  }
);


export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // BE uses JsonStringEnumConverter → must send enum name string ("Todo", "InProgress", "Completed")
      const enumName = STATUS_TO_ENUM_NAME[status] ?? 'Todo';
      await taskApi.updateStatus(id, enumName);
      // Re-fetch full list with large pageSize to ensure all tasks are synced
      const allRes = await taskApi.getAll({ pageSize: 1000 });
      const items = Array.isArray(allRes) ? allRes : (allRes.data ?? allRes.items ?? []);
      return items.map(normalize);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi cập nhật trạng thái');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await taskApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi xóa task');
    }
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items:  [],
    status: 'idle',   // 'idle' | 'loading' | 'succeeded' | 'failed'
    error:  null,
  },
  reducers: {
    // Cập nhật notes cục bộ (chưa có API notes riêng)
    updateTaskNotes: (state, action) => {
      const { id, notes } = action.payload;
      const task = state.items.find(t => t.id === id);
      if (task) task.notes = notes;
    },
  },
  extraReducers: (builder) => {
    // fetchTasks
    builder
      .addCase(fetchTasks.pending,   (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, { payload }) => { state.status = 'succeeded'; state.items = payload; })
      .addCase(fetchTasks.rejected,  (state, { payload }) => { state.status = 'failed'; state.error = payload; });

    // createTask — trả về toàn bộ list mới
    builder
      .addCase(createTask.fulfilled, (state, { payload }) => { state.items = payload; });

    // updateTask — trả về toàn bộ list mới
    builder
      .addCase(updateTask.fulfilled, (state, { payload }) => {
        if (Array.isArray(payload)) {
          // Preserve notes which are local-only
          const notesMap = {};
          state.items.forEach(t => { notesMap[t.id] = t.notes; });
          state.items = payload.map(t => ({ ...t, notes: notesMap[t.id] ?? [] }));
        } else {
          const idx = state.items.findIndex(t => t.id === payload.id);
          if (idx !== -1) state.items[idx] = { ...state.items[idx], ...payload };
        }
      });

    // updateTaskStatus — DO NOT set loading state to avoid blocking UI
    builder
      .addCase(updateTaskStatus.fulfilled, (state, { payload }) => {
        if (Array.isArray(payload)) {
          // Preserve local-only notes
          const notesMap = {};
          state.items.forEach(t => { notesMap[t.id] = t.notes; });
          state.items = payload.map(t => ({ ...t, notes: notesMap[t.id] ?? [] }));
        } else {
          // Fallback: optimistic single update
          const task = state.items.find(t => t.id === payload.id);
          if (task) task.status = payload.status;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, { payload }) => {
        state.error = payload;
      });

    // deleteTask
    builder
      .addCase(deleteTask.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(t => t.id !== payload);
      });
  },
});

export const { updateTaskNotes } = taskSlice.actions;
export default taskSlice.reducer;