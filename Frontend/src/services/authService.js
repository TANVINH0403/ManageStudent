import axiosClient from '../api/axiosClient';

const authService = {
  /**
   * Đăng nhập
   * POST /api/auth/login
   * Body: { userName, password }
   * Response: { username, token }
   */
  login: async (userName, password) => {
    const response = await axiosClient.post('/auth/login', { userName, password });
    return response; // axiosClient trả về response.data trực tiếp
  },

  /**
   * Đăng ký
   * POST /api/auth/register
   * Body: { username, email, password, confirmPassword }
   */
  register: async (username, email, password, confirmPassword) => {
    const response = await axiosClient.post('/auth/register', {
      username,
      email,
      password,
      confirmPassword,
    });
    return response;
  },

  /**
   * Lấy thông tin user hiện tại
   * GET /api/auth/me  (yêu cầu Bearer token)
   */
  getMe: async () => {
    const response = await axiosClient.get('/auth/me');
    return response;
  },

  /** Lưu token và username vào localStorage */
  saveSession: (token, username) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('username', username);
  },

  /** Xoá phiên đăng nhập */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
  },

  /** Kiểm tra đã đăng nhập chưa */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  /** Lấy username đang đăng nhập */
  getUsername: () => {
    return localStorage.getItem('username') || '';
  },
};

export default authService;
