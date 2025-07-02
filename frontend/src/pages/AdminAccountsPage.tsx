import React, { useEffect, useState } from 'react';
import { Search, UserCheck, Shield, Calendar } from 'lucide-react';
import accountApi from '../api/accountApi';
import type { Account } from '../types/models';
import '../styles/AccountManagement.css';

const AdminAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountApi.getAllMembersAPI();
        if (data && Array.isArray(data.members)) {
          setAccounts(data.members);
        } else if (Array.isArray(data)) {
          setAccounts(data);
        } else {
          setAccounts([]);
        }
      } catch {
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(account =>
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.name && account.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="account-management">
      <div className="management-header">
        <h2>Account Management</h2>
        <div className="stats-summary">
          <div className="stat-item">
            <UserCheck className="stat-icon" />
            <span>{accounts.filter(u => !u.isAdmin).length} Users</span>
          </div>
          <div className="stat-item">
            <Shield className="stat-icon" />
            <span>{accounts.filter(u => u.isAdmin).length} Admins</span>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="accounts-grid">
        {filteredAccounts.map(account => (
          <div key={account._id} className="account-card">
            <div className="account-header">
              <div className="account-avatar">
                {account.name?.charAt(0).toUpperCase() || account.username.charAt(0).toUpperCase()}
              </div>
              <div className="account-info">
                <h3 className="account-name">{account.name || account.username}</h3>
                <p className="account-username">@{account.username}</p>
                <span className={`role-badge ${account.isAdmin ? 'admin' : 'user'}`}>
                  {account.isAdmin ? <Shield size={14} /> : <UserCheck size={14} />}
                  {account.isAdmin ? 'admin' : 'user'}
                </span>
              </div>
            </div>

            <div className="account-details">
              {/* Nếu có email thì hiện, nếu không thì bỏ */}
              {/* <div className="detail-item">
                <Mail className="detail-icon" />
                <span>{account.email}</span>
              </div> */}
              <div className="detail-item">
                <Calendar className="detail-icon" />
                <span>Joined {new Date(account.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span>Năm sinh: {account.YOB}</span>
              </div>
            </div>

           
          </div>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="no-results">
          <p>No accounts found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminAccountsPage; 