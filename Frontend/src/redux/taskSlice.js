// src/redux/taskSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { mockTasks } from '../data/mockData';

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: mockTasks,
  },
  reducers: {
    addTask: (state, action) => {
      state.items.push(action.payload);
    },
    updateTask: (state, action) => {
      const idx = state.items.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    updateTaskStatus: (state, action) => {
      const { id, newStatus } = action.payload;
      const task = state.items.find(t => t.id === id);
      if (task) task.status = newStatus;
    },
    deleteTask: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
  },
});

export const { addTask, updateTask, updateTaskStatus, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;