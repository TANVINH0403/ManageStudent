import axios from 'axios';

// Cấu hình base URL (Sau này đổi thành localhost của .NET hoặc domain thật)
const axiosClient = axios.create({
  baseURL: 'http://localhost:5050/api', // Port backend .NET đang chạy
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

// Interceptor cho Request: Tự động gắn Token vào header nếu đã đăng nhập
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Prevent GET request caching aggressively
    if (config.method === 'get') {
      config.params = { ...config.params, _t: new Date().getTime() };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý lỗi chung (VD: hết hạn token)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Chỉ lấy phần data, bỏ qua các header rườm rà
  },
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý logout hoặc refresh token ở đây
      console.error("Hết hạn token hoặc chưa đăng nhập!");
      if (error.config?.method !== 'get') {
        window.dispatchEvent(new Event('auth_required'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;