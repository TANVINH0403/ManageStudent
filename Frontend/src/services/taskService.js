import axiosClient from '../api/axiosClient';

const taskService = {
  // Lấy danh sách task kèm phân trang/lọc
  getTasks: async (params = {}) => {
    try {
      const response = await axiosClient.get('/Task', { params });
      return response;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Tạo mới task
  createTask: async (taskData) => {
    try {
      const response = await axiosClient.post('/Task', taskData);
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Cập nhật task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await axiosClient.put(`/Task/${taskId}`, taskData);
      return response;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Xóa task
  deleteTask: async (taskId) => {
    try {
      const response = await axiosClient.delete(`/Task/${taskId}`);
      return response;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Lấy chi tiết một task
  getTaskById: async (taskId) => {
    try {
      const response = await axiosClient.get(`/Task/${taskId}`);
      return response;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái (Patch)
  updateStatus: async (taskId, status) => {
    try {
      const response = await axiosClient.patch(`/Task/${taskId}/status`, { status: status });
      return response;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  // Lấy task theo danh mục
  getTasksByCategory: async (categoryId) => {
    try {
      const response = await axiosClient.get(`/Task/${categoryId}/tasks`);
      return response;
    } catch (error) {
      console.error('Error fetching tasks by category:', error);
      throw error;
    }
  },

  // Lấy subtasks
  getSubTasks: async (parentId) => {
    try {
      const response = await axiosClient.get(`/Task/${parentId}/subtasks`);
      return response;
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      throw error;
    }
  }
};

export default taskService;
