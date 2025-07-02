import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { accountApi } from '../api/accountApi';
import '../styles/Auth.css';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from 'jwt-decode';
import { LogIn, User, Lock, UserPlus } from 'lucide-react';
import '../styles/Login.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await accountApi.signIn(username, password);
      if (!data.accessToken) {
        setError('Không nhận được accessToken từ server.');
        setLoading(false);
        return;
      }
      const decoded = jwtDecode<JwtPayload & {
        accountID?: string;
        id?: string;
        userId?: string;
        accountName?: string;
        username?: string;
        fullName?: string;
      }>(String(data.accessToken));
      login(
        data.accessToken,
        data.isAdmin,
        decoded.accountID || decoded.id || decoded.userId || '',
        decoded.accountName || decoded.username || decoded.fullName || ''
      );
      navigate(data.isAdmin ? '/admin/players' : '/players');
    } catch {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ position: 'relative' }}>
      <button className="back-gradient-button back-gradient-top-left" onClick={() => navigate('/') }>
        <span className="icon">&larr;</span>
        Quay lại trang Home
      </button>
      <div className="login-card">
        <div className="login-header">
          <LogIn className="login-icon" />
          <h1>Football Manager</h1>
          <p>Đăng nhập vào tài khoản của bạn</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
            <label htmlFor="username">
              <User size={20} />
              Tên đăng nhập
            </label>
          <input
              id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
            <label htmlFor="password">
              <Lock size={20} />
              Mật khẩu
            </label>
          <input
              id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
      </form>
        <div className="auth-divider">
          <span>hoặc</span>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="register-link-button"
        >
          <UserPlus size={20} />
          Tạo tài khoản mới
        </button>
      </div>
    </div>
  );
};

export default LoginPage;