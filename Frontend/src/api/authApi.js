// src/api/authApi.js
import axiosClient from './axiosClient';

const authApi = {
  login: (data) => axiosClient.post('/auth/login', data),
  // data: { UserName, Password }
  // response: { username, accessToken, refreshToken, accessTokenExpiry, success }

  register: (data) => axiosClient.post('/auth/register', data),
  // data: { username, email, password, confirmPassword }

  logout: () => axiosClient.post('/auth/logout'),

  refresh: (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken }),

  getMe: () => axiosClient.get('/auth/me'),
};

export default authApi;
