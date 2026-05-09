// src/api/taskApi.js
import axiosClient from './axiosClient';

// BE Enum mapping:
// Status:   0=Todo, 1=InProgress, 2=Completed
// Priority: 0=Low,  1=Medium,     2=High

const taskApi = {
  getAll: (params = {}) => axiosClient.get('/task', { params: { ...params, _t: new Date().getTime() } }),
  // params: { status?, priority?, categoryId?, keyword?, page?, pageSize? }

  getById: (taskId) => axiosClient.get(`/task/${taskId}`),

  create: (data) => axiosClient.post('/task', data),
  // data: { taskName, description, dueDate, priority, categoryId, parentId, tagNames[] }

  update: (taskId, data) => axiosClient.put(`/task/${taskId}`, data),
  // data: { taskName?, description?, dueDate?, status?, priority?, categoryId? }

  updateStatus: (taskId, status) =>
    axiosClient.patch(`/task/${taskId}/status`, { status }),
  // status: 0|1|2

  delete: (taskId) => axiosClient.delete(`/task/${taskId}`),

  getByCategory: (categoryId) => axiosClient.get(`/task/${categoryId}/tasks`),
};

export default taskApi;
