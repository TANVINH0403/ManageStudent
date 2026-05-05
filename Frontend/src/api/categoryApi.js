// src/api/categoryApi.js
import axiosClient from './axiosClient';

const categoryApi = {
  getAll: () => axiosClient.get('/category'),
  // response: [{ categoryId, categoryName, description, visibility, priority, status, createdAt, endDate }]

  getById: (categoryId) => axiosClient.get(`/category/${categoryId}`),

  create: (data) => axiosClient.post('/category', data),
  // data: { categoryName, description, priority, status, endDate }

  update: (categoryId, data) => axiosClient.put(`/category/${categoryId}`, data),

  delete: (categoryId) => axiosClient.delete(`/category/${categoryId}`),

  complete: (categoryId) => axiosClient.patch(`/category/${categoryId}/complete`),

  updateVisibility: (categoryId, visibility) =>
    axiosClient.patch(`/category/${categoryId}/visibility`, { visibility }),
};

export default categoryApi;
