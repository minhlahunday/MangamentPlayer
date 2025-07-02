// src/pages/AdminTeamsPage.tsx
import React, { useEffect, useState } from 'react';
import { TeamService } from '../api/TeamService';
import type { Team } from '../types/models.ts';
import '../styles/AdminTable.css'; // Reuse AdminTable CSS

const AdminTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
  });
  const [search, setSearch] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const allTeams = await TeamService.getAllTeams();
      setTeams(allTeams);
    } catch (err: unknown) {
      let errorMsg = 'Lỗi khi tải danh sách đội.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
      ) {
        const data = (err as { response: { data: { msg?: string; error?: string } } }).response.data;
        errorMsg = data.msg || data.error || errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line
  }, []);

  const handleEditClick = (team: Team) => {
    setEditingTeam(team);
    setIsAddingNew(false);
    setFormData({
      name: team.teamName,
      logo: team.logo,
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa đội này không? Thao tác này không thể hoàn tác và sẽ xóa cả cầu thủ thuộc đội này.')) {
      try {
        await TeamService.deleteTeam(id);
        alert('Xóa đội thành công!');
        fetchTeams(); // Reload the list
      } catch (err: unknown) {
        let errorMsg = 'Lỗi khi xóa đội. Đảm bảo không có cầu thủ nào thuộc đội này.';
        if (
          err &&
          typeof err === 'object' &&
          'response' in err &&
          err.response &&
          typeof err.response === 'object' &&
          'data' in err.response
        ) {
          const data = (err as { response: { data: { msg?: string; error?: string } } }).response.data;
          errorMsg = data.msg || data.error || errorMsg;
        } else if (err instanceof Error) {
          errorMsg = err.message;
        }
        alert(errorMsg);
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name.trim() || !formData.logo.trim()) {
        alert('Tên đội và logo là bắt buộc.');
        return;
      }
      if (isAddingNew) {
        await TeamService.createTeam({
          teamName: formData.name,
          logo: formData.logo,
        });
        alert('Thêm đội thành công!');
        setEditingTeam(null);
        setIsAddingNew(false);
        setFormData({ name: '', logo: '' });
        fetchTeams(); // Reload the list
      } else if (editingTeam) {
        await TeamService.updateTeam(editingTeam._id, {
          teamName: formData.name,
          logo: formData.logo,
        });
        alert('Cập nhật đội thành công!');
        setEditingTeam(null);
        setIsAddingNew(false);
        setFormData({ name: '', logo: '' });
        fetchTeams(); // Reload the list
      }
    } catch (err: unknown) {
      let errorMsg = 'Lỗi khi lưu đội.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
      ) {
        const data = (err as { response: { data: { msg?: string; error?: string } } }).response.data;
        errorMsg = data.msg || data.error || errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      alert(errorMsg);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.teamName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Đang tải dữ liệu đội...</div>;

  return (
    <div className="admin-page">
      <h1>Quản lý đội bóng</h1>
      <input
        type="text"
        placeholder="Tìm kiếm theo tên đội..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="admin-search-input"
        style={{ marginBottom: 20, padding: 8, width: 300 }}
        autoComplete="off"
      />

      <button onClick={() => { setIsAddingNew(true); setEditingTeam(null); setFormData({ name: '', logo: '' }); }} className="btn-primary mb-20">
        Thêm đội mới
      </button>

      {(editingTeam || isAddingNew) && (
        <div className="form-overlay">
          <div className="player-form" style={{ maxWidth: 500 }}>
            <div className="form-header">
              <h3>{isAddingNew ? 'Thêm đội mới' : 'Chỉnh sửa đội'}</h3>
              <button className="close-button" onClick={() => { setEditingTeam(null); setIsAddingNew(false); }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Tên đội:</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="logo">URL Logo:</label>
                  <input type="text" id="logo" name="logo" value={formData.logo} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => { setEditingTeam(null); setIsAddingNew(false); }}>
                  Hủy
                </button>
                <button type="submit" className="save-button">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="players-table">
        <thead className="table-header">
          <tr>
            <th>ID</th>
            <th>Tên đội</th>
            <th>Logo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {filteredTeams.map((team) => (
            <tr key={team._id} className="table-row">
              <td className="table-cell">{team._id}</td>
              <td className="table-cell">{team.teamName}</td>
              <td className="table-cell"><img src={team.logo} alt={team.teamName} style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: 8 }} /></td>
              <td className="table-cell actions-cell">
                <button onClick={() => handleEditClick(team)} className="action-button edit">Chỉnh sửa</button>
                <button onClick={() => handleDeleteClick(team._id)} className="action-button delete">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTeamsPage;