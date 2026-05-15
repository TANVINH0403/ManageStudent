import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../api/userApi';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.getProfile();
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi tải profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      await userApi.updateProfile(data);
      // Fetch fresh profile after update
      const res = await userApi.getProfile();
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi cập nhật profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      await userApi.changePassword(data);
      return true;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message ?? 'Lỗi đổi mật khẩu');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,   // { username, email, userId }
    loading: false,
    error: null,
  },
  reducers: {
    clearUser: (state) => {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProfile
    builder
      .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.profile = payload;
      })
      .addCase(fetchProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // updateProfile
    builder
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.profile = payload;
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    // changePassword
    builder
      .addCase(changePassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(changePassword.fulfilled, (state) => { state.loading = false; })
      .addCase(changePassword.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
