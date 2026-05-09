import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tagApi from '../api/tagApi';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchTags = createAsyncThunk(
  'tags/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await tagApi.getAll();
      return Array.isArray(res) ? res : (res.data ?? res.items ?? []);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi tải tags');
    }
  }
);

export const createTag = createAsyncThunk(
  'tags/create',
  async (tagName, { rejectWithValue }) => {
    try {
      const res = await tagApi.create({ tagName });
      return res;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi tạo tag');
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/delete',
  async (id, { rejectWithValue }) => {
    try {
      await tagApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi xóa tag');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const tagSlice = createSlice({
  name: 'tags',
  initialState: {
    items: [],    // [{ tagId, tagName }]
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTags.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items   = payload;
      })
      .addCase(fetchTags.rejected,  (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      });

    builder
      .addCase(createTag.fulfilled, (state, { payload }) => {
        if (payload?.tagId && !state.items.find(t => t.tagId === payload.tagId)) {
          state.items.push(payload);
        }
      });

    builder
      .addCase(deleteTag.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(t => t.tagId !== payload);
      });
  },
});

export default tagSlice.reducer;
