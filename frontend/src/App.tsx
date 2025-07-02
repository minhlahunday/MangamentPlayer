import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import type { ReactNode } from 'react';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlayerListPage from './pages/PlayerListPage';
import UserProfilePage from './pages/UserProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
// import AdminDashboardPage from './pages/AdminDashboardPage';
// import AdminPlayersPage from './pages/AdminPlayersPage';
import AdminAccountsPage from './pages/AdminAccountsPage';
import AdminTeamsPage from './pages/AdminTeamsPage';
import Navbar from './components/Navbar'; // Component Navbar
import AdminDashboard from './pages/AdminDashboard';
import PlayerDetailPage from './pages/PlayerDetailPage';



// Component để bảo vệ Route cho người dùng đã đăng nhập
const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading authentication...</div>; // Hoặc một spinner
  return user ? children : <Navigate to="/login" />;
};

// Component để bảo vệ Route cho Admin
const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading authentication...</div>;
  if (!user) return <Navigate to="/login" />;
  return user.isAdmin ? children : <Navigate to="/" />; // Redirect về trang chủ nếu không phải admin
};

function AppLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';
  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={hideNavbar ? '' : 'container'}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/players" />} /> {/* Redirect mặc định */}
          <Route path="/players" element={<PlayerListPage/>} />
          <Route path="/players/:id" element={<PlayerDetailPage/>}/>

          {/* User & Staff Routes (Authenticated) */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/change-password"
            element={
              <PrivateRoute>
                <ChangePasswordPage />
              </PrivateRoute>
            }
          />

          {/* Staff (Admin) Routes */}
          <Route
            path="/admin/players"
            element={
              <AdminRoute>
                <AdminDashboard/>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/accounts"
            element={
              <AdminRoute>
                <AdminAccountsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <AdminRoute>
                <AdminTeamsPage />
              </AdminRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;