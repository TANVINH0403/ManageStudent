import axiosClient from '../api/axiosClient';

const dashboardService = {
  // Lấy dữ liệu thống kê chung cho dashboard
  getDashboardStats: async () => {
    try {
      const response = await axiosClient.get('/Dashboard');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

export default dashboardService;
