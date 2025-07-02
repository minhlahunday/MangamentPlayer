import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Save, X, CheckCircle2 } from 'lucide-react';
import { playerApi } from '../api/playerApi';
import type { Player, Team } from '../types/models.ts';
import { TeamService } from '../api/TeamService';
import '../styles/AdminTable.css';

const AdminPlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    playerName: '',
    image: '',
    cost: 0,
    isCaptain: false,
    information: '',
    teamId: '',
  });
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');

  const fetchPlayersAndTeams = async () => {
    setLoading(true);
    try {
      const playerData = await playerApi.getAllPlayers();
      setPlayers(playerData.players);
      const teamData = await TeamService.getAllTeams();
      setTeams(teamData);
    } catch (err) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(errorMsg || 'Lỗi khi tải dữ liệu quản lý cầu thủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersAndTeams();
    // eslint-disable-next-line
  }, []);

  const resetForm = () => {
    setFormData({ playerName: '', image: '', cost: 0, isCaptain: false, information: '', teamId: '' });
    setEditingPlayer(null);
    setIsAddingNew(false);
    setError(null);
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
    setIsAddingNew(false);
    setFormData({
      playerName: player.playerName,
      image: player.image,
      cost: player.cost,
      isCaptain: player.isCaptain,
      information: player.information,
      teamId: player.team._id,
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa cầu thủ này không?')) {
      try {
        await playerApi.deletePlayer(id);
        alert('Xóa cầu thủ thành công!');
        fetchPlayersAndTeams();
      } catch (err) {
        if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response) {
          setError((err as any).response?.data?.error || 'Lỗi khi xóa cầu thủ.');
        } else {
          setError((err as Error).message || 'Lỗi khi xóa cầu thủ.');
        }
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'cost' ? parseInt(value) : value),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isAddingNew) {
        await playerApi.createPlayer(formData);
        alert('Thêm cầu thủ thành công!');
        resetForm();
        fetchPlayersAndTeams();
      } else if (editingPlayer) {
        await playerApi.updatePlayer(editingPlayer._id, formData);
        alert('Cập nhật cầu thủ thành công!');
        resetForm();
        fetchPlayersAndTeams();
      }
    } catch (err) {
      let errorMsg = 'Lỗi khi lưu cầu thủ.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
      ) {
        errorMsg =
          (err as { response: { data: { msg?: string; error?: string } } }).response.data.msg ||
          (err as { response: { data: { msg?: string; error?: string } } }).response.data.error ||
          errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      alert(errorMsg);
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(team => team._id === teamId)?.teamName || 'Unknown Team';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(price);
  };

  const filteredPlayers = players.filter(player =>
    player.playerName.toLowerCase().includes(search.toLowerCase()) &&
    (!teamFilter || player.team?._id === teamFilter)
  );

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="player-management">
      <div className="management-header">
        <h2>Player Management</h2>
        <button className="add-button" onClick={() => { setIsAddingNew(true); setEditingPlayer(null); setFormData({ playerName: '', image: '', cost: 0, isCaptain: false, information: '', teamId: '' }); }}>
          <Plus size={20} />
          Add Player
        </button>
      </div>
      <div className="search-section" style={{ display: 'flex', gap: 16 }}>
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="search-box-team">
        <select
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
          style={{ minWidth: 180, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}
        >
          <option value="">Tất cả đội</option>
          {teams.map(team => (
            <option key={team._id} value={team._id}>{team.teamName}</option>
          ))}
        </select>
        </div>
      </div>
      <div style={{ margin: '16px 0', fontWeight: 600, color: '#1e40af', fontSize: '1.1rem' }}>
        Tổng số cầu thủ: {filteredPlayers.length}
      </div>
      {(editingPlayer || isAddingNew) && (
        <div className="form-overlay">
          <div className="player-form">
            <div className="form-header">
              <h3>{isAddingNew ? 'Add New Player' : 'Edit Player'}</h3>
              <button className="close-button" onClick={resetForm}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Player Name</label>
                  <input
                    type="text"
                    name="playerName"
                    value={formData.playerName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Team</label>
                  <select
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Team</option>
                    {teams.map(team => (
                      <option key={team._id} value={team._id}>{team.teamName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (€)</label>
                  <input
                    type="number"
                    name="cost"
                    min="0"
                    value={formData.cost}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    name="isCaptain"
                    checked={formData.isCaptain}
                    onChange={handleFormChange}
                  />
                  <label>Is Captain</label>
                </div>
                <div className="form-group">
                  <label>Information</label>
                  <textarea
                    name="information"
                    value={formData.information}
                    onChange={handleFormChange}
                    rows={3}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  <Save size={20} />
                  {isAddingNew ? 'Add Player' : 'Update Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="players-table">
        <div className="table-header">
          <div className="header-cell">Player</div>
          <div className="header-cell">Team</div>
          <div className="header-cell">Price</div>
          <div className="header-cell">Captain</div>
          <div className="header-cell">Actions</div>
        </div>
        <div className="table-body">
          {filteredPlayers.map(player => (
            <div key={player._id} className="table-row">
              <div className="table-cell player-info">
                <div className="player-avatar-small">
                  <img src={player.image} alt={player.playerName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div className="player-name">{player.playerName}</div>
                </div>
              </div>
              <div className="table-cell">{getTeamName(player.team._id)}</div>
              <div className="table-cell price-cell">{formatPrice(player.cost)}</div>
              <div className="table-cell">{
                player.isCaptain ? <CheckCircle2 size={20} color="#22c55e" /> : null
              }</div>
              <div className="table-cell actions-cell">
                <button
                  className="action-button edit"
                  onClick={() => handleEditClick(player)}
                  title="Edit Player"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="action-button delete"
                  onClick={() => handleDeleteClick(player._id)}
                  title="Delete Player"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredPlayers.length === 0 && (
          <div className="no-results">
            <p>No players found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPlayersPage;