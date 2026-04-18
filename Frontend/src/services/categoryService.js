import axiosClient from '../api/axiosClient';

const categoryService = {
  // Lấy danh sách tất cả các category
  getAllCategories: async () => {
    try {
      const response = await axiosClient.get('/Category');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Lấy chi tiết category theo ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await axiosClient.get(`/Category/${categoryId}`);
      return response;
    } catch (error) {
      console.error('Error fetching category details:', error);
      throw error;
    }
  },

  // Tạo mới category
  createCategory: async (categoryData) => {
    try {
      const response = await axiosClient.post('/Category', categoryData);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Cập nhật category
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await axiosClient.put(`/Category/${categoryId}`, categoryData);
      return response;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Xóa category
  deleteCategory: async (categoryId) => {
    try {
      const response = await axiosClient.delete(`/Category/${categoryId}`);
      return response;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Đánh dấu hoàn thành category
  completeCategory: async (categoryId) => {
    try {
      const response = await axiosClient.patch(`/Category/${categoryId}/complete`);
      return response;
    } catch (error) {
      console.error('Error completing category:', error);
      throw error;
    }
  },
  
  // Cập nhật trạng thái hiển thị
  updateVisibility: async (categoryId, visibility) => {
    try {
      const response = await axiosClient.patch(`/Category/${categoryId}/visibility`, { visibility });
      return response;
    } catch (error) {
      console.error('Error updating category visibility:', error);
      throw error;
    }
  }
};

export default categoryService;
