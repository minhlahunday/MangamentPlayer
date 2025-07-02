import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { accountApi } from '../api/accountApi';
import type { Account } from '../types/models';
import { User, Lock, Calendar, Save, Eye, EyeOff } from 'lucide-react';
import '../styles/UserProfile.css';

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', YOB: 0 });
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [message, setMessage] = useState({ type: '', text: '' });

    const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      setError('Bạn chưa đăng nhập hoặc thông tin tài khoản không hợp lệ.');
      return;
    }
        setLoading(true);
        try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Không tìm thấy token đăng nhập.');
        setLoading(false);
        return;
      }
      const data = await accountApi.getMemberDetail(user.id, token);
          setProfile(data);
          setFormData({ name: data.name, YOB: data.YOB });
    } catch {
      setError('Lỗi khi tải thông tin cá nhân.');
        } finally {
          setLoading(false);
      }
    };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'YOB' ? parseInt(value) : value,
    }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage({ type: '', text: '' });
    if (!user?.id) {
      setError('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
      return;
    }
    if (user.id === 'login' || user.id === 'undefined') {
      setError('ID người dùng không hợp lệ ("login" hoặc "undefined"). Vui lòng đăng nhập lại.');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Không tìm thấy token đăng nhập.');
        return;
      }
      await accountApi.updateMember(user.id, formData, token);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      await fetchProfile();
      setEditMode(false);
    } catch {
      setError('Lỗi khi cập nhật thông tin.');
      setMessage({ type: 'error', text: 'Lỗi khi cập nhật thông tin.' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp.' });
      return;
    }
    if (passwordData.newPassword.length < 4 || passwordData.newPassword.length > 8) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải từ 4 đến 8 ký tự.' });
      return;
    }
    if (passwordData.newPassword === passwordData.oldPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không được giống mật khẩu hiện tại.' });
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Không tìm thấy token đăng nhập.' });
        return;
      }
      const success = await accountApi.changePassword(user!.id, passwordData.oldPassword, passwordData.newPassword, token);
      if (success) {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Đang đăng xuất...'});
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          window.location.href = '/login';
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Mật khẩu hiện tại không đúng.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Lỗi khi đổi mật khẩu.' });
    }
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) return <div>Đang tải thông tin cá nhân...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return <div>Không tìm thấy thông tin cá nhân.</div>;

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.name?.charAt(0).toUpperCase() || profile.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <h1>{profile.name || profile.username}</h1>
          <p>@{profile.username}</p>
          <span className={`role-badge ${profile.isAdmin ? 'admin' : 'user'}`}>{profile.isAdmin ? 'Admin' : 'User'}</span>
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            Thông tin cá nhân
          </button>
          <button
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={20} />
            Đổi mật khẩu
          </button>
        </div>
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
        {activeTab === 'profile' && (
          <div className="tab-content">
      {!editMode ? (
        <div className="profile-details">
          <p><strong>Tên:</strong> {profile.name}</p>
          <p><strong>Năm sinh:</strong> {profile.YOB}</p>
          <p><strong>Vai trò:</strong> {profile.isAdmin ? 'Admin' : 'User'}</p>
          <button onClick={() => setEditMode(true)} className="btn-secondary">Chỉnh sửa</button>
               
        </div>
      ) : (
              <form onSubmit={handleProfileUpdate} className="profile-form">
          <div className="form-group">
                  <label htmlFor="name">
                    <User size={20} />
                    Tên
                  </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
                  <label htmlFor="YOB">
                    <Calendar size={20} />
                    Năm sinh
                  </label>
            <input
              type="number"
              id="YOB"
              name="YOB"
              value={formData.YOB}
              onChange={handleChange}
              required
            />
          </div>
                <button type="submit" className="btn-primary"><Save size={20} /> Lưu thay đổi</button>
          <button type="button" onClick={() => setEditMode(false)} className="btn-secondary ml-10">Hủy</button>
        </form>
      )}
          </div>
        )}
        {activeTab === 'password' && (
          <div className="tab-content">
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label htmlFor="oldPassword">
                  <Lock size={20} />
                  Mật khẩu hiện tại
                </label>
                <div className="password-input">
                  <input
                    id="oldPassword"
                    type={showPasswords.old ? 'text' : 'password'}
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('old')}
                  >
                    {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">
                  <Lock size={20} />
                  Mật khẩu mới
                </label>
                <div className="password-input">
                  <input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <Lock size={20} />
                  Xác nhận mật khẩu mới
                </label>
                <div className="password-input">
                  <input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary"><Lock size={20} /> Đổi mật khẩu</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;