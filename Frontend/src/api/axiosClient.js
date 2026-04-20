import axios from 'axios';

// Cấu hình base URL (Sau này đổi thành localhost của .NET hoặc domain thật)
const axiosClient = axios.create({
  baseURL: 'https://localhost:7016/api', // Thay bằng port chạy Backend .NET của bạn
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

// Biến để tránh refresh nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor cho Response: Xử lý lỗi chung (VD: hết hạn token)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Chỉ lấy phần data, bỏ qua các header rườm rà
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        // console.error("Không tìm thấy refresh token, chuyển về login");
        // window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        console.log("Token expired, attempting to refresh...");
        const response = await axios.post('https://localhost:7016/api/Auth/refresh', { refreshToken });

        if (response.data.success) {
          console.log("Token refresh successful.");
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          axiosClient.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
          processQueue(null, accessToken);

          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
          return axiosClient(originalRequest);
        } else {
          console.error("Token refresh failed:", response.data.message);
          processQueue(response.data, null);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(response.data);
        }
      } catch (refreshError) {
        console.error("Critical error during token refresh:", refreshError);
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;