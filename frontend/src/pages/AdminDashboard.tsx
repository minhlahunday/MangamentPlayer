import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Shield, TrendingUp } from 'lucide-react';
// import { mockUsers, mockPlayers, mockTeams } from './mockData'
// import type { Player } from './mockData'
import AdminPlayersPage from './AdminPlayersPage'
import TeamManagement from './TeamManagement';
import AdminAccountsPage from './AdminAccountsPage'
import '../styles/AdminDashboard.css'
import { playerApi } from '../api/playerApi';
import { TeamService } from '../api/TeamService';
import { accountApi } from '../api/accountApi';


const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'players' | 'teams' | 'accounts'>('overview');
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const playerRes = await playerApi.getAllPlayers();
        const players = Array.isArray(playerRes) ? playerRes : playerRes.players || [];
        setTotalPlayers(players.length);

        const teamRes = await TeamService.getAllTeams();
        setTotalTeams(teamRes.length);

        const userRes = await accountApi.getAllMembersAPI('', 1);
        setTotalUsers(userRes.total || (userRes.members ? userRes.members.length : Array.isArray(userRes) ? userRes.length : 0));
      } catch {
        // Có thể thêm xử lý lỗi nếu muốn
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      title: 'Total Players',
      value: totalPlayers,
      icon: Users,
      color: 'blue',
      section: 'players',
    },
    {
      title: 'Total Teams',
      value: totalTeams,
      icon: Shield,
      color: 'green',
      section: 'teams',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      icon: UserCheck,
      color: 'orange',
      section: 'accounts',
    },
  ] as const;

  const renderContent = () => {
    switch (activeSection) {
      case 'players':
        return <AdminPlayersPage/>;
      case 'teams':
        return <TeamManagement />;
      case 'accounts':
        return <AdminAccountsPage/>;
      default:
        return (
          <div className="overview-content">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`stat-card ${stat.color}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveSection(stat.section)}
                >
                  <div className="stat-icon">
                    <stat.icon size={32} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-title">{stat.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your football database</p>
      </div>

      <div className="dashboard-nav">
        <button
          className={`nav-button ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          <TrendingUp size={20} />
          Overview
        </button>
        <button
          className={`nav-button ${activeSection === 'players' ? 'active' : ''}`}
          onClick={() => setActiveSection('players')}
        >
          <Users size={20} />
          Players
        </button>
        <button
          className={`nav-button ${activeSection === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveSection('teams')}
        >
          <Shield size={20} />
          Teams
        </button>
        <button
          className={`nav-button ${activeSection === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveSection('accounts')}
        >
          <UserCheck size={20} />
          Accounts
        </button>
      </div>

      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 