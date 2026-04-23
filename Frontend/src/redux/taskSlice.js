// src/redux/taskSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { mockTasks } from '../data/mockData';

const taskSlice = createSlice({
  name: 'tasks',
  // Lấy dữ liệu mock ban đầu làm State khởi điểm để ứng dụng không bị rỗng
  initialState: {
    items: mockTasks,
  },
  reducers: {
    // Logic 1: Thêm task mới
    addTask: (state, action) => {
      state.items.push(action.payload);
    },
    // Logic 2: Cập nhật trạng thái (Dùng cho Kéo thả Kanban hoặc Đánh dấu hoàn thành)
    updateTaskStatus: (state, action) => {
      const { id, newStatus } = action.payload;
      const existingTask = state.items.find(task => task.id === id);
      if (existingTask) {
        existingTask.status = newStatus;
      }
    },
    // Logic 3: Xóa Task
    deleteTask: (state, action) => {
      state.items = state.items.filter(task => task.id !== action.payload);
    }
  }
});

// Xuất các hàm hành động để các trang khác gọi (Dispatch)
export const { addTask, updateTaskStatus, deleteTask } = taskSlice.actions;

// Xuất reducer để bỏ vào store.js
export default taskSlice.reducer;