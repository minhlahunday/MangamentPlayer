// src/components/Navbar.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { LogOut, User, Settings, Users } from 'lucide-react';
import '../styles/Navbar.css'; // Sẽ tạo file CSS này

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand" onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users className="brand-icon" />
          <h1>Football Manager</h1>
        </div>
        {user ? (
          <>
            <nav className="header-nav">
              <button
                className={`nav-item${location.pathname.startsWith('/players') ? ' active' : ''}`}
                onClick={() => navigate('/players')}
              >
                <Users size={20} />
                Players
              </button>
              {user.isAdmin && (
                <button
                  className={`nav-item${location.pathname.startsWith('/admin') ? ' active' : ''}`}
                  onClick={() => navigate('/admin/players')}
                >
                  <Settings size={20} />
                  Admin
                </button>
              )}
              <button
                className={`nav-item${location.pathname.startsWith('/profile') ? ' active' : ''}`}
                onClick={() => navigate('/profile')}
              >
                <User size={20} />
                Profile
              </button>
            </nav>
            <div className="header-user">
              <div className="user-info">
                <div className="user-avatar">
                  {(user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.username}</span>
                  <span className={`user-role ${user.isAdmin ? 'admin' : 'user'}`}>{user.isAdmin ? 'admin' : 'user'}</span>
                </div>
              </div>
              <button className="logout-button" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="header-auth-buttons">
            <button className="nav-item" onClick={() => navigate('/login')}>Đăng nhập</button>
            <button className="nav-item" onClick={() => navigate('/register')}>Đăng ký</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;