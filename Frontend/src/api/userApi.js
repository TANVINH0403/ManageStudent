import axiosClient from './axiosClient';

const userApi = {
  // GET /api/user — get current user profile
  getProfile: () => axiosClient.get('/user'),

  // PUT /api/user — update username/email
  updateProfile: (data) => axiosClient.put('/user', data),
  // data: { username, email }

  // PUT /api/user/password — change password
  changePassword: (data) => axiosClient.put('/user/password', data),
  // data: { oldPassword, newPassword }

  // GET /api/user/settings — get preferences
  getSettings: () => axiosClient.get('/user/settings'),

  // PUT /api/user/settings — update preferences
  updateSettings: (data) => axiosClient.put('/user/settings', data),

  // POST /api/user/request-email-change — send OTP to new email
  requestEmailChange: (newEmail) => axiosClient.post('/user/request-email-change', { newEmail }),

  // POST /api/user/confirm-email-change — verify OTP and apply new email
  confirmEmailChange: (otp) => axiosClient.post('/user/confirm-email-change', { otp }),
};

export default userApi;
