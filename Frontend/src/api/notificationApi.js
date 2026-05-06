import axiosClient from './axiosClient';

const notificationApi = {
  getAll: (page = 1, pageSize = 20) => {
    return axiosClient.get(`/Notification?page=${page}&pageSize=${pageSize}`);
  },
  
  getUnreadCount: () => {
    return axiosClient.get('/Notification/unread-count');
  },
  
  markAsRead: (id) => {
    return axiosClient.patch(`/Notification/${id}/read`);
  }
};

export default notificationApi;
