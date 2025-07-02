// src/services/TeamService.ts

// Định nghĩa base URL của API của bạn
// Đảm bảo rằng port này khớp với port bạn đang chạy backend Express (ví dụ: 3000)
const API_BASE_URL = 'http://localhost:5000';

// --- Interfaces (nên khớp với interface từ backend của bạn) ---
export interface TeamMember {
    userId: string;
    role: 'member' | 'leader' | 'admin';
}

export interface Team {
    _id: string;
    teamName: string;
    logo: string;
    createdAt: string;
    updatedAt: string;
}

// Kiểu dữ liệu cho việc tạo Team mới (không cần ID, createdAt, updatedAt)
export interface CreateTeamPayload {
    teamName: string;
    logo: string;
    initialMemberIds?: string[]; // Optional: để thêm thành viên ban đầu
}

// Kiểu dữ liệu cho việc cập nhật Team
export interface UpdateTeamPayload {
    teamName?: string;
    logo?: string;
}

// Helper to get token
function getAuthHeaders(): HeadersInit | undefined {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : undefined;
}

/**
 * TeamService chứa các phương thức để tương tác với Team API.
 */
export const TeamService = {

    /**
     * Lấy tất cả các đội.
     * GET /teams
     * @returns Promise<Team[]>
     */
    getAllTeams: async (): Promise<Team[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/api`);
            if (!response.ok) {
                // Xử lý lỗi từ server (ví dụ: 404, 500)
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi khi lấy danh sách đội: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Lỗi khi lấy tất cả các đội:', error);
            throw error; // Ném lỗi để component có thể xử lý
        }
    },

    /**
     * Lấy thông tin một đội cụ thể theo ID.
     * GET /teams/:id
     * @param id ID của đội
     * @returns Promise<Team>
     */
    getTeamById: async (id: string): Promise<Team> => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${id}`, { headers: getAuthHeaders() });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi khi lấy thông tin đội ${id}: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Lỗi khi lấy đội có ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tạo một đội mới.
     * POST /teams
     * @param payload Dữ liệu đội mới (name, description, initialMemberIds)
     * @returns Promise<Team>
     */
    createTeam: async (payload: CreateTeamPayload): Promise<Team> => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi khi tạo đội: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Lỗi khi tạo đội:', error);
            throw error;
        }
    },

    /**
     * Cập nhật thông tin một đội.
     * PUT /teams/:id
     * @param id ID của đội cần cập nhật
     * @param payload Dữ liệu cần cập nhật (name, description)
     * @returns Promise<Team>
     */
    updateTeam: async (id: string, payload: UpdateTeamPayload): Promise<Team> => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi khi cập nhật đội ${id}: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Lỗi khi cập nhật đội ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa một đội.
     * DELETE /teams/:id
     * @param id ID của đội cần xóa
     * @returns Promise<void> (không trả về nội dung)
     */
    deleteTeam: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                // Đối với 204 No Content, response.json() sẽ lỗi, nên kiểm tra status
                if (response.status === 204) {
                    return; // Xóa thành công
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi khi xóa đội ${id}: ${response.status}`);
            }
            // Không cần return gì nếu status là 204
        } catch (error) {
            console.error(`Lỗi khi xóa đội ${id}:`, error);
            throw error;
        }
    },

    /**
     * Thêm thành viên vào đội.
     * POST /teams/:id/members
     * @param teamId ID của đội
     * @param userId ID của người dùng cần thêm
     * @param role Vai trò của người dùng (mặc định là 'member')
     * @returns Promise<Team> Đội đã được cập nhật
     */
    addTeamMember: async (teamId: string, userId: string, role: 'member' | 'leader' | 'admin' = 'member'): Promise<Team> => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ userId, role }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi khi thêm thành viên ${userId} vào đội ${teamId}: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Lỗi khi thêm thành viên ${userId} vào đội ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Xóa thành viên khỏi đội.
     * DELETE /teams/:id/members/:userId
     * @param teamId ID của đội
     * @param userId ID của người dùng cần xóa
     * @returns Promise<void>
     */
    removeTeamMember: async (teamId: string, userId: string): Promise<void> => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                if (response.status === 204) {
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Lỗi khi xóa thành viên ${userId} khỏi đội ${teamId}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Lỗi khi xóa thành viên ${userId} khỏi đội ${teamId}:`, error);
            throw error;
        }
    },
};