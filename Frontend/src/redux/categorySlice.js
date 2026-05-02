// src/redux/categorySlice.js
import { createSlice } from '@reduxjs/toolkit';
import { mockCategories } from '../data/mockData';

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: mockCategories,
  },
  reducers: {
    addCategory: (state, action) => {
      state.items.push(action.payload);
    },
    updateCategory: (state, action) => {
      const idx = state.items.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    deleteCategory: (state, action) => {
      state.items = state.items.filter(c => c.id !== action.payload);
    },
  },
});

export const { addCategory, updateCategory, deleteCategory } = categorySlice.actions;
export default categorySlice.reducer;
