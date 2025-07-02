import api from './axiosConfig';
import type { Player } from '../types/models.ts';

export const playerApi = {
  // Lấy danh sách cầu thủ (dành cho Public/User)
  getAllPlayers: async (search?: string, team?: string, page: number = 1) => {
    try {
      const response = await api.get('/players', {
        params: { search, team, page },
        headers: { 'Accept': 'application/json' } // Yêu cầu JSON
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  // Lấy chi tiết cầu thủ
  getPlayerDetail: async (id: string) => {
    try {
      const response = await api.get(`/players/${id}`, {
        headers: { 'Accept': 'application/json' } // Yêu cầu JSON
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching player ${id}:`, error);
      throw error;
    }
  },

  // Thêm bình luận (User)
  addComment: async (playerId: string, rating: number, content: string) => {
    try {
      const response = await api.post(`/players/${playerId}/comments`, { rating, content });
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to player ${playerId}:`, error);
      throw error;
    }
  },

  // Xóa bình luận (User)
  deleteComment: async (playerId: string, commentId: string) => {
    try {
      const response = await api.delete(`/players/${playerId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId} for player ${playerId}:`, error);
      throw error;
    }
  },

  // Admin: Lấy dữ liệu cầu thủ cho form chỉnh sửa
  getAdminPlayerJsonData: async (id: string) => {
    try {
      const response = await api.get(`/players/api/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching admin player data ${id}:`, error);
      throw error;
    }
  },

  // Admin: Tạo cầu thủ mới
  createPlayer: async (playerData: { playerName: string; image: string; cost: number; isCaptain: boolean; information: string; teamId: string }) => {
    try {
      const response = await api.post('/players', playerData);
      return response.data;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  },

  // Admin: Cập nhật cầu thủ
  updatePlayer: async (id: string, playerData: Partial<Player>) => {
    try {
      // Sử dụng phương thức PUT đúng như API của bạn
      const response = await api.put(`/players/${id}`, playerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating player ${id}:`, error);
      throw error;
    }
  },

  // Admin: Xóa cầu thủ (soft delete)
  deletePlayer: async (id: string) => {
    try {
      const response = await api.delete(`/players/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting player ${id}:`, error);
      throw error;
    }
  },

  updateComment: async (playerId: string, commentId: string, rating: number, content: string) => {
    try {
      const response = await api.put(`/players/${playerId}/comments/${commentId}`, { rating, content });
      return response.data;
    } catch (error) {
      console.error(`Error updating comment ${commentId} for player ${playerId}:`, error);
      throw error;
    }
  },
};

// ... tương tự cho accountApi.ts và teamApi.ts