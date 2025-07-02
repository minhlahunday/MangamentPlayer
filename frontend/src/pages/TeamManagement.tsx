// src/components/TeamManagement.tsx
import React, { useEffect, useState } from 'react';
import type { CreateTeamPayload, Team } from '../api/TeamService';
import { TeamService } from '../api/TeamService';
import { Plus, Edit2, Trash2, Search, Save, X, Shield } from 'lucide-react';
import '../styles/TeamManagement.css';

const TeamManagement: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [formData, setFormData] = useState({
        teamName: '',
        logo: '',
    });

    // Fetch teams
    const fetchTeams = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await TeamService.getAllTeams();
            setTeams(data);
        } catch (err) {
            setError((err as Error).message || 'Không thể tải danh sách đội.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const filteredTeams = teams.filter(team =>
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setFormData({ teamName: '', logo: '' });
        setEditingTeam(null);
        setShowForm(false);
        setError(null);
    };

    const handleEdit = (team: Team) => {
        setEditingTeam(team);
        setFormData({
            teamName: team.teamName,
            logo: team.logo || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (teamId: string) => {
        if (window.confirm('Are you sure you want to delete this team?')) {
            try {
                await TeamService.deleteTeam(teamId);
                setTeams(teams.filter(t => t._id !== teamId));
            } catch (err) {
                setError((err as Error).message || 'Không thể xóa đội.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: CreateTeamPayload = {
                teamName: formData.teamName,
                logo: formData.logo,
            };
            if (editingTeam) {
                await TeamService.updateTeam(editingTeam._id, payload);
                fetchTeams();
            } else {
                await TeamService.createTeam(payload);
                fetchTeams();
            }
            resetForm();
        } catch (err) {
            setError((err as Error).message || 'Không thể lưu đội.');
        }
    };

    if (loading) return <div>Đang tải danh sách đội...</div>;
    if (error) return <div className="error">Lỗi: {error}</div>;

    return (
        <div className="team-management">
            <div className="management-header">
                <h2>Team Management</h2>
                <button className="add-button" onClick={() => { setShowForm(true); setEditingTeam(null); setFormData({ teamName: '', logo: '' }); }}>
                    <Plus size={20} />
                    Add Team
                </button>
            </div>
            <div className="search-section">
                <div className="search-box">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div style={{ margin: '16px 0', fontWeight: 600, color: '#1e40af', fontSize: '1.1rem' }}>
                Total teams: {filteredTeams.length}
            </div>
            {showForm && (
                <div className="form-overlay">
                    <div className="team-form">
                        <div className="form-header">
                            <h3>{editingTeam ? 'Edit Team' : 'Add New Team'}</h3>
                            <button className="close-button" onClick={resetForm}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Team Name</label>
                                    <input
                                        type="text"
                                        value={formData.teamName}
                                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Logo URL</label>
                                    <input
                                        type="text"
                                        value={formData.logo}
                                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-button">
                                    <Save size={20} />
                                    {editingTeam ? 'Update Team' : 'Add Team'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="teams-grid">
                {filteredTeams.map(team => (
                    <div key={team._id} className="team-card">
                        <div className="team-header">
                            <div className="team-logo">
                                {team.logo ? (
                                    <img src={team.logo} alt={team.teamName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
                                ) : (
                                    <Shield size={32} />
                                )}
                            </div>
                            <div className="team-actions">
                                <button
                                    className="action-button edit"
                                    onClick={() => handleEdit(team)}
                                    title="Edit Team"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="action-button delete"
                                    onClick={() => handleDelete(team._id)}
                                    title="Delete Team"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="team-info">
                            <h3 className="team-name">{team.teamName}</h3>
                            <div className="team-details">
                                <div className="detail-row">
                                    <span className="detail-label">Updated:</span>
                                    <span className="detail-value">{new Date(team.updatedAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredTeams.length === 0 && (
                <div className="no-results">
                    <p>No teams found.</p>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;