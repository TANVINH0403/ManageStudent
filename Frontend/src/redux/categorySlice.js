// src/redux/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryApi from '../api/categoryApi';

// Chuẩn hoá category từ BE → FE
const normalize = (c) => ({
  id:          c.categoryId,
  name:        c.categoryName,
  description: c.description ?? '',
  color:       c.color ?? '#7c3aed',   // BE chưa có trường color → dùng mặc định
  iconKey:     c.iconKey ?? 'database', // BE chưa có trường iconKey → dùng mặc định
  status:      c.status ?? 0,
  priority:    c.priority ?? 0,
  endDate:     c.endDate ?? null,
  visibility:  c.visibility ?? 'Public',
});

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await categoryApi.getAll();
      const items = Array.isArray(res) ? res : (res.items ?? res.data ?? []);
      return items.map(normalize);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi tải danh mục');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (formData, { rejectWithValue }) => {
    try {
      const payload = {
        categoryName: formData.name,
        description:  formData.description ?? '',
        priority:     formData.priority ?? 0,
        status:       formData.status ?? 0,
        endDate:      formData.endDate ?? null,
      };
      const res = await categoryApi.create(payload);
      // Fetch lại toàn bộ list để sync với DB
      const allRes = await categoryApi.getAll();
      const items = Array.isArray(allRes) ? allRes : (allRes.items ?? allRes.data ?? []);
      return items.map(normalize);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi tạo danh mục');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const payload = {
        categoryName: data.name,
        description:  data.description ?? '',
        priority:     data.priority ?? 0,
        status:       data.status ?? 0,
        endDate:      data.endDate ?? null,
      };
      await categoryApi.update(id, payload);
      // Fetch full list to sync
      const allRes = await categoryApi.getAll();
      const items = Array.isArray(allRes) ? allRes : (allRes.items ?? allRes.data ?? []);
      return items.map(normalize);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi cập nhật danh mục');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await categoryApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi xóa danh mục');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items:  [],
    status: 'idle',
    error:  null,
  },
  reducers: {
    // Cập nhật color/iconKey cục bộ (BE chưa có 2 trường này)
    updateCategoryUI: (state, action) => {
      const idx = state.items.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // fetchCategories
    builder
      .addCase(fetchCategories.pending,   (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => { state.status = 'succeeded'; state.items = payload; })
      .addCase(fetchCategories.rejected,  (state, { payload }) => { state.status = 'failed'; state.error = payload; });

    // createCategory
    builder
      .addCase(createCategory.fulfilled, (state, { payload }) => { state.items = payload; });

    // updateCategory — now returns full list
    builder
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        // payload is now a full list
        if (Array.isArray(payload)) {
          state.items = payload;
        } else {
          // fallback: update single item
          const idx = state.items.findIndex(c => c.id === payload.id);
          if (idx !== -1) state.items[idx] = { ...state.items[idx], ...payload };
        }
      });

    // deleteCategory
    builder
      .addCase(deleteCategory.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(c => c.id !== payload);
      });
  },
});

export const { updateCategoryUI } = categorySlice.actions;
export default categorySlice.reducer;
