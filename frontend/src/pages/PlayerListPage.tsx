import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import { Search, Star, Users, TrendingUp } from 'lucide-react';
import type { Player } from '../types/models'; // Ensure this path and type definition are correct
import { playerApi } from '../api/playerApi'; // Assume you have a playerApi for fetching data
import '../styles/PlayerList.css'; // Your combined CSS file

const PlayerListPage: React.FC = () => {
    const navigate = useNavigate(); // Hook for navigation

    const [players, setPlayers] = useState<Player[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [teamFilter, setTeamFilter] = useState('');

    // --- Data Fetching (Replacing TODO) ---
    useEffect(() => {
        const fetchPlayers = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await playerApi.getAllPlayers();
                console.log('API data:', data); // Debug API response
                const playerArray = Array.isArray(data) ? data : data.players || [];
                setPlayers(playerArray);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load players.');
                setPlayers([]); // Đảm bảo luôn là mảng
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []); // Empty dependency array means this runs once on mount

    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.playerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeam = !teamFilter || (player.team && player.team.teamName === teamFilter);
        return matchesSearch && matchesTeam;
    });

    // Extract unique teams from the fetched players
    const teams = [...new Set(players.map(p => p.team?.teamName).filter(Boolean))];

    // Helper to get team name (assuming player.team is an object with teamName)
    const getTeamName = (team: any) => team?.teamName || 'Unknown Team';

    // Handler for clicking on a player card
    const handlePlayerClick = (playerId: string) => {
        // Navigate to the PlayerDetail page using the player's ID
        navigate(`/players/${playerId}`); // Adjust this route if your PlayerDetail page has a different path
    };

    // --- Loading and Error States ---
    if (loading) {
        return <div className="loading-state">Đang tải danh sách cầu thủ...</div>;
    }

    if (error) {
        return <div className="error-message">Lỗi: {error}</div>;
    }

    return (
        <div className="player-list-container">
            <div className="player-list-header">
                <h1>Cầu thủ bóng đá</h1>
                <p>Khám phá và đánh giá những tài năng bóng đá xuất sắc nhất</p>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm cầu thủ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="position-filter"
                >
                    <option value="">Tất cả đội</option>
                    {teams.map(team => (
                        <option key={team} value={team}>{team}</option>
                    ))}
                </select>
            </div>

            <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '1.1rem', marginBottom: '1rem' }}>
                Tổng số cầu thủ: {filteredPlayers.length}
            </div>

            <div className="players-grid">
                {filteredPlayers.length === 0 && !loading && (
                    <div className="no-results">
                        <p>Không tìm thấy cầu thủ nào phù hợp với tiêu chí của bạn.</p>
                    </div>
                )}
                {filteredPlayers.map(player => (
                    <div key={player._id} className="player-card" onClick={() => handlePlayerClick(player._id)}>
                        <div className="player-card-header">
                            <div className="player-avatar">
                                {player.image ? (
                                    <img src={player.image} alt={player.playerName} />
                                ) : (
                                    player.playerName.charAt(0)
                                )}
                            </div>
                            <div className="player-rating">
                                <Star className="star-icon" />
                                {/* Assuming player.rating is direct, otherwise calculate average from comments */}
                                {/* For consistency with PlayerDetail, let's calculate average if comments are available */}
                                <span>
                                    {player.comments && player.comments.length > 0
                                        ? (player.comments.reduce((acc, c) => acc + c.rating, 0) / player.comments.length).toFixed(1)
                                        : 'N/A' /* Or default rating if no comments */}
                                </span>
                            </div>
                        </div>

                        <div className="player-info">
                            <h3 className="player-name">
                                {player.playerName}
                                {player.isCaptain && (
                                    <Star className="captain-star" style={{ color: '#fbbf24', marginLeft: 8, verticalAlign: 'middle' }} fill="#fbbf24" />
                                )}
                            </h3>
                            <p className="player-position">{player.position}</p>

                            <div className="player-details">
                                <div className="detail-item">
                                    <Users size={16} />
                                    <span>{getTeamName(player.team)}</span>
                                </div>
                                <div className="detail-item">
                                    <TrendingUp size={16} />
                                    <span className="player-list-cost-value">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 }).format(player.cost)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPlayers.length === 0 && !loading && (
                <div className="no-results">
                    <p>Không tìm thấy cầu thủ nào phù hợp với tiêu chí của bạn.</p>
                </div>
            )}
        </div>
    );
};

export default PlayerListPage;