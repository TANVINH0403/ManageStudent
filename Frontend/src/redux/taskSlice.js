// src/redux/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskApi from '../api/taskApi';

// ── Enum mapping: BE (số) ↔ FE (string) ──────────────────────────────────────
export const STATUS_MAP = { 0: 'Pending', 1: 'In Progress', 2: 'Completed' };
export const STATUS_TO_NUM = { 'Pending': 0, 'In Progress': 1, 'Completed': 2 };
export const PRIORITY_MAP = { 0: 'Low', 1: 'Medium', 2: 'High' };
export const PRIORITY_TO_NUM = { 'Low': 0, 'Medium': 1, 'High': 2 };

// Chuẩn hoá task từ BE → FE (đổi tên field, đổi enum số → string)
const normalize = (t) => ({
  id:          t.taskId,
  title:       t.taskName,
  description: t.description ?? '',
  deadline:    t.dueDate ? t.dueDate.split('T')[0] : '',
  status:      STATUS_MAP[t.status] ?? 'Pending',
  priority:    PRIORITY_MAP[t.priority] ?? 'Medium',
  categoryId:  t.categoryId ?? null,
  parentId:    t.parentId ?? null,
  tags:        t.tags ?? [],
  hasSubtasks: t.hasSubtasks ?? false,
  progress:    t.status === 2 ? 100 : t.status === 1 ? 50 : 0,
  notes:       t.notes ?? [],
});

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await taskApi.getAll(params);
      // BE trả về { items, totalCount, page, pageSize } hoặc array
      const items = Array.isArray(res) ? res : (res.items ?? res.data ?? []);
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
      const res = await taskApi.create(payload);
      // Sau khi tạo, fetch lại toàn bộ để lấy đúng ID từ DB
      const allRes = await taskApi.getAll();
      const items = Array.isArray(allRes) ? allRes : (allRes.items ?? allRes.data ?? []);
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
        status:      STATUS_TO_NUM[data.status] ?? 0,
        priority:    PRIORITY_TO_NUM[data.priority] ?? 1,
        categoryId:  data.categoryId ? Number(data.categoryId) : null,
      };
      await taskApi.update(id, payload);
      return normalize({ taskId: id, ...payload, ...data });
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi cập nhật task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const statusNum = STATUS_TO_NUM[status] ?? 0;
      await taskApi.updateStatus(id, statusNum);
      return { id, status };
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

    // updateTask
    builder
      .addCase(updateTask.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(t => t.id === payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...payload };
      });

    // updateTaskStatus
    builder
      .addCase(updateTaskStatus.fulfilled, (state, { payload }) => {
        const task = state.items.find(t => t.id === payload.id);
        if (task) task.status = payload.status;
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