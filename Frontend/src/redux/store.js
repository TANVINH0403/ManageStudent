// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import categoryReducer from './categorySlice';
import taskReducer from './taskSlice';
import tagReducer from './tagSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    categories: categoryReducer,
    tasks: taskReducer,
    tags: tagReducer,
    settings: settingsReducer,
  },
});