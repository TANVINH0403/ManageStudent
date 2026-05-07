import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../api/userApi';

const DEFAULT_SETTINGS = {
  general: {
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'dd/mm/yyyy',
  },
  appearance: {
    theme: 'light',
    density: 'comfortable',
    fontSize: 'medium',
  },
  notifications: {
    deadlineReminder: true,
    newTask: true,
    weeklyReport: false,
    email: false,
  }
};

// Lấy cài đặt từ API
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getSettings();
      if (response.preferences) {
        return JSON.parse(response.preferences);
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy cài đặt');
    }
  }
);

// Cập nhật cài đặt lên API
export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (preferencesObj, { rejectWithValue }) => {
    try {
      const jsonStr = JSON.stringify(preferencesObj);
      await userApi.updateSettings({ preferences: jsonStr });
      return preferencesObj;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lưu cài đặt');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    preferences: DEFAULT_SETTINGS,
    loading: false,
    error: null,
  },
  reducers: {
    // Để có thể update nhanh UI (local state) trước khi lưu
    setLocalPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Merge payload with default settings to ensure no missing keys
          state.preferences = { 
            general: { ...DEFAULT_SETTINGS.general, ...action.payload.general },
            appearance: { ...DEFAULT_SETTINGS.appearance, ...action.payload.appearance },
            notifications: { ...DEFAULT_SETTINGS.notifications, ...action.payload.notifications },
          };
        }
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLocalPreferences } = settingsSlice.actions;
export default settingsSlice.reducer;
