import axios from 'axios';

// Cấu hình base URL (Sau này đổi thành localhost của .NET hoặc domain thật)
const axiosClient = axios.create({
  baseURL: 'https://localhost:7001/api', // Thay bằng port chạy Backend .NET của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Tự động gắn Token vào header nếu đã đăng nhập
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
      console.error("Hết hạn token, vui lòng đăng nhập lại!");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;