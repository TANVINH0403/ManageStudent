import axiosClient from './axiosClient';

const dashboardApi = {
  getDashboard: () => axiosClient.get('/Dashboard'),
};

export default dashboardApi;
