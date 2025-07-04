import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { playerApi } from '../api/playerApi';
import type { Player } from '../types/models.ts'; // Đảm bảo kiểu Player có đủ các trường
import { useAuth } from '../contexts/useAuth';
import '../styles/PlayerDetail.css'; // Sử dụng file CSS đã hợp nhất

// Import icons from lucide-react
import { ArrowLeft, Star, Users, MessageSquare, Send, Edit, Trash2 } from 'lucide-react';

const PlayerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); // Hook để điều hướng
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [commentRating, setCommentRating] = useState(1); // Assuming rating is 1-3 based on your type, adjust to 1-5 for stars if needed
    const [commentError, setCommentError] = useState<string | null>(null);
    const [hasCommented, setHasCommented] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editRating, setEditRating] = useState(1); // Assuming rating is 1-3
    const [editError, setEditError] = useState<string | null>(null);

    const { user } = useAuth(); // Đảm bảo useAuth trả về đúng kiểu AuthContextType

    // Function to render stars (as in Code 2, adapted for 1-3 scale if applicable or 1-5)
    // For this example, I'll adapt it to render 3 stars, matching your rating scale (1-3)
    const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
        // Adapt the star rendering for a 1-3 scale.
        // If your rating system is truly 1-3, adjust the array.
        // If it should be 1-5 despite your select options, keep the [1,2,3,4,5] array.
        const maxRating = 3; // Based on your select options (1 Sao, 2 Sao, 3 Sao)
        const starsArray = Array.from({ length: maxRating }, (_, i) => i + 1);

        return (
            <div className="stars-container">
                {starsArray.map(star => (
                    <Star
                        key={star}
                        className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                        onClick={interactive && onChange ? () => onChange(star) : undefined}
                    />
                ))}
            </div>
        );
    };

    const fetchPlayerDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            if (id) {
                const data: Player = await playerApi.getPlayerDetail(id);
                setPlayer(data);

                // Kiểm tra xem user hiện tại đã bình luận về cầu thủ này chưa
                if (user && data.comments.some(c => c.author && c.author._id === user.id)) {
                    setHasCommented(true);
                } else {
                    setHasCommented(false);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Lỗi khi tải chi tiết cầu thủ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayerDetail();
    }, [id, user]); // Phụ thuộc vào `id` và `user` để cập nhật trạng thái bình luận

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setCommentError('Bạn cần đăng nhập để bình luận.');
            return;
        }
        if (user.isAdmin) {
            setCommentError('Admin không thể bình luận cầu thủ.');
            return;
        }
        if (hasCommented) {
            setCommentError('Bạn chỉ được bình luận 1 lần cho cầu thủ này.');
            return;
        }
        if (!commentContent.trim()) {
            setCommentError('Nội dung bình luận không được để trống.');
            return;
        }

        setCommentError(null);
        try {
            if (id) {
                await playerApi.addComment(id, commentRating, commentContent);
                setCommentContent('');
                setCommentRating(1);
                alert('Bình luận đã được thêm thành công!');
                fetchPlayerDetail(); // Tải lại chi tiết cầu thủ để hiển thị bình luận mới
            }
        } catch (err: any) {
            setCommentError(err.response?.data?.error || 'Lỗi khi thêm bình luận.');
        }
    };

    const handleEditComment = (comment: any) => {
        setEditingCommentId(comment._id);
        setEditContent(comment.content);
        setEditRating(comment.rating);
        setEditError(null);
    };

    const handleSaveEditComment = async (commentId: string) => {
        if (!id) return;
        if (!editContent.trim()) {
            setEditError('Nội dung bình luận không được để trống.');
            return;
        }
        try {
            await playerApi.updateComment(id, commentId, editRating, editContent);
            setEditingCommentId(null);
            alert('Bình luận đã được cập nhật thành công!');
            fetchPlayerDetail();
        } catch (err: any) {
            setEditError(err.response?.data?.msg || 'Lỗi khi cập nhật bình luận.');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!player || !id) return;
        if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
        try {
            await playerApi.deleteComment(id, commentId);
            alert('Đã xóa bình luận!');
            fetchPlayerDetail();
        } catch (err: any) {
            // Check if error response has a message
            const errorMessage = err.response?.data?.msg || 'Lỗi khi xóa bình luận.';
            alert(errorMessage);
        }
    };

    // Handler for "Back to Players" button
    const handleBack = () => {
        navigate('/players'); // Adjust this path if your players list is on a different route
    };

    if (loading) return <div className="loading-state">Đang tải chi tiết cầu thủ...</div>;
    if (error) return <div className="error-message">Lỗi: {error}</div>;
    if (!player) return <div className="info-message">Không tìm thấy cầu thủ này.</div>;

    // Determine the player's average rating from comments if available
    const averageRating = player.comments.length > 0
        ? player.comments.reduce((acc, comment) => acc + comment.rating, 0) / player.comments.length
        : 0;

    return (
        <div className="player-detail-page">
            <div className="player-detail-container">
                <div className="player-detail-header">
                <button className="back-gradient-button back-gradient-top-left" onClick={() => navigate('/') }>
        <span className="icon">&larr;</span>
        Quay lại trang Home
      </button>

                </div>
             
                <div className="player-hero">
                    {player.image ? (
                        <img src={player.image} alt={player.playerName} className="player-image" />
                    ) : (
                        <div className="player-avatar-large">
                            {player.playerName.charAt(0)}
                        </div>
                    )}
                    <div className="player-main-info">
                        <h1 className="player-title">{player.playerName}</h1>
                        <div className="player-rating-large">
                            {renderStars(Math.round(averageRating), false)}
                            <span className="rating-value">{averageRating.toFixed(1)}/3</span>
                        </div>
                        <div className="player-cost-detail">
                            Giá trị: <span className="player-cost-value">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 }).format(player.cost)}</span>
                        </div>
                        {player.information && (
                            <div className="player-info-extra-box">
                                <MessageSquare className="info-extra-icon" />
                                <div>
                                    <div className="info-extra-label">Thông tin thêm</div>
                                    <div className="info-extra-value">{player.information}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="player-content">
                    <div className="player-info-section">
                        <h2>Thông tin cầu thủ</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <Users className="info-icon" />
                                <div>
                                    <span className="info-label">Đội</span>
                                    <span className="info-value">{player.team?.teamName || 'Không rõ'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <Star className="info-icon" />
                                <div>
                                    <span className="info-label">Đội trưởng</span>
                                    <span className="info-value">{player.isCaptain ? 'Có' : 'Không'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="comments-section">
                        <h2>
                            <MessageSquare className="section-icon" />
                            Đánh giá cầu thủ ({player.comments.length})
                        </h2>

                        {user && user.isAdmin && (
                            <p className="info-message">Admin không thể bình luận cầu thủ.</p>
                        )}
                        {user && !user.isAdmin && !hasCommented && (
                            <form onSubmit={handleAddComment} className="comment-form">
                                <div className="rating-input">
                                    <label>Đánh giá của bạn:</label>
                                    {renderStars(commentRating, true, setCommentRating)}
                                </div>
                                <div className="comment-input-container">
                                    <textarea
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        placeholder="Chia sẻ suy nghĩ của bạn về cầu thủ này..."
                                        className="comment-input"
                                        rows={3}
                                        required
                                    />
                                    <button type="submit" className="submit-comment-btn">
                                        <Send size={16} />
                                        Đăng bình luận
                                    </button>
                                </div>
                                {commentError && <p className="error-message">{commentError}</p>}
                            </form>
                        )}
                        {user && !user.isAdmin && hasCommented && (
                            <p className="info-message">Bạn đã bình luận cho cầu thủ này rồi.</p>
                        )}
                        {!user && (
                            <p className="info-message">Đăng nhập để bình luận về cầu thủ này.</p>
                        )}


                        <div className="comments-list">
                            {player.comments.length === 0 ? (
                                <p className="no-comments">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                            ) : (
                                player.comments
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((comment) => (
                                        <div key={comment._id} className="comment-card">
                                            <div className="comment-header">
                                                <div className="comment-author">
                                                    <div className="author-avatar">
                                                        {comment.author?.name?.charAt(0).toUpperCase() || comment.author?.username?.charAt(0).toUpperCase() || 'A'}
                                                    </div>
                                                    <div>
                                                        <span className="author-name">{comment.author?.name || comment.author?.username || 'Người ẩn danh'}</span>
                                                        <span className="comment-date">
                                                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="comment-rating">
                                                    {renderStars(comment.rating)}
                                                </div>
                                            </div>
                                            {editingCommentId === comment._id ? (
                                                <form
                                                    onSubmit={e => {
                                                        e.preventDefault();
                                                        handleSaveEditComment(comment._id);
                                                    }}
                                                    className="edit-comment-form"
                                                >
                                                    <select
                                                        value={editRating}
                                                        onChange={e => setEditRating(Number(e.target.value))}
                                                    >
                                                        <option value={1}>1 Sao</option>
                                                        <option value={2}>2 Sao</option>
                                                        <option value={3}>3 Sao</option>
                                                    </select>
                                                    <textarea
                                                        value={editContent}
                                                        onChange={e => setEditContent(e.target.value)}
                                                        rows={2}
                                                        required
                                                    />
                                                    {editError && <p className="error-message">{editError}</p>}
                                                    <div className="comment-actions"> {/* Use comment-actions for button layout */}
                                                        <button type="submit" className="btn-primary">Lưu</button>
                                                        <button type="button" className="btn-secondary" onClick={() => setEditingCommentId(null)}>Hủy</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <p className="comment-text">{comment.content}</p>
                                                    {user && comment.author && comment.author._id === user.id && (
                                                        <div className="comment-actions">
                                                            <button onClick={() => handleEditComment(comment)} className="btn-secondary">
                                                                <Edit size={16} /> Sửa
                                                            </button>
                                                            <button onClick={() => handleDeleteComment(comment._id)} className="btn-danger">
                                                                <Trash2 size={16} /> Xóa
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerDetailPage;