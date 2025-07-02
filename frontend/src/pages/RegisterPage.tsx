// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi } from '../api/accountApi';
import { UserPlus, User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import '../styles/RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Chỉ dùng chữ, số, dấu gạch dưới';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 5 || formData.password.length > 8) {
      newErrors.password = 'Mật khẩu phải từ 5 đến 8 ký tự';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      await accountApi.signUp(formData.username, formData.password, formData.fullName, 2000); // YOB tạm 2000
      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setFormData({ username: '', fullName: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
      setErrors({ general: errorMsg || 'Đăng ký thất bại. Vui lòng thử lại.' });
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="register-container" style={{ position: 'relative' }}>
      <button className="back-gradient-button back-gradient-top-left" onClick={() => navigate('/login')}>
        <ArrowLeft size={20} style={{marginRight: 12}} />
        Quay lại đăng nhập
      </button>
      <div className="register-card">
        <div className="register-header">
          <UserPlus className="register-icon" />
          <h1>Tạo tài khoản</h1>
          <p>Tham gia cộng đồng bóng đá</p>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">
                <User size={20} />
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={e => handleInputChange('username', e.target.value)}
                className={errors.username ? 'error' : ''}
                placeholder="Nhập tên đăng nhập"
                required
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="fullName">
              <User size={20} />
              Họ tên
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={e => handleInputChange('fullName', e.target.value)}
              className={errors.fullName ? 'error' : ''}
              placeholder="Nhập họ tên"
              required
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                <Lock size={20} />
                Mật khẩu
              </label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPasswords.password ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'error' : ''}
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('password')}
                >
                  {showPasswords.password ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={20} />
                Nhập lại mật khẩu
              </label>
              <div className="password-input">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                >
                  {showPasswords.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>
          {errors.general && <div className="error-message">{errors.general}</div>}
          {success && <div className="info-message">{success}</div>}
          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>
        <div className="register-footer">
          <p>Đã có tài khoản?</p>
          <button onClick={() => navigate('/login')} className="login-link">
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;