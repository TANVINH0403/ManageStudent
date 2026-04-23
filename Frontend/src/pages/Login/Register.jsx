import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css'; // Dùng chung CSS với trang Login

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    console.log("Đăng ký với:", formData);

    setTimeout(() => {
      setLoading(false);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* Background giống Login */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>

      <div className="login-card">
        <div className="login-header">
          <h2>Register</h2>
          <p>Tạo tài khoản mới để trải nghiệm hệ thống.</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <div className="input-group">
            <label>Họ và Tên</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input type="text" name="username" placeholder="VD: Nguyễn Văn A" value={formData.username} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input type="email" name="email" placeholder="Nhập email của bạn" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Tạo mật khẩu" value={formData.password} onChange={handleChange} required />
              <button type="button" className="btn-toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Xác nhận Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Đang xử lý..." : "Create Account"}
          </button>
        </form>

        <p className="register-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;