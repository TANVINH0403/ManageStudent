import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State quản lý dữ liệu form để sau này gửi API
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // MÔ PHỎNG GỌI API (Sau này thay bằng axiosClient.post('/login', formData))
    console.log("Dữ liệu gửi lên Backend:", formData);

    setTimeout(() => {
      setLoading(false);
      alert("Giả lập: Đăng nhập thành công! (Chờ tích hợp Backend)");
      // window.location.href = '/'; // Chuyển hướng sau khi login
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* Background trang trí giống thiết kế */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>

      <div className="login-card">
        <div className="login-header">
          <h2>Login</h2>
          <p>Điền thông tin tài khoản để tiếp tục.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn-toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-pass">Forgot Password?</a>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Đang xử lý..." : "Login"}
          </button>
        </form>

        <p className="register-link">
          Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
};

export default Login;