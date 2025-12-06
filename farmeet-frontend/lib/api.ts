const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// トークンの取得
const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

// トークンの保存
export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
};

// トークンの削除
export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }
};

// 認証ヘッダー
const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// APIクライアント
class ApiClient {
    // 認証
    async signup(data: { username: string; email: string; password: string; role?: string }) {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Signup failed');
        return response.json();
    }

    async login(email: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    }

    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get profile');
        return response.json();
    }

    async updateProfile(data: { username?: string; email?: string; role?: string }) {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    }

    // 農園
    async getFarms() {
        const response = await fetch(`${API_BASE_URL}/farms`);
        if (!response.ok) throw new Error('Failed to get farms');
        return response.json();
    }

    async getFarm(id: number) {
        const response = await fetch(`${API_BASE_URL}/farms/${id}`);
        if (!response.ok) throw new Error('Failed to get farm');
        return response.json();
    }

    async createFarm(data: { name: string; description: string; location: string; imageUrl?: string }) {
        const response = await fetch(`${API_BASE_URL}/farms`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async getMyFarms() {
        const response = await fetch(`${API_BASE_URL}/farms/my-farms`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get my farms');
        return response.json();
    }

    async searchFarms(keyword?: string, location?: string, date?: string, guests?: number, category?: string) {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (location) params.append('location', location);
        if (date) params.append('date', date);
        if (guests && guests > 0) params.append('guests', guests.toString());
        if (category) params.append('category', category);

        const response = await fetch(
            `${API_BASE_URL}/farms/search?${params.toString()}`,
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
        if (!response.ok) throw new Error('検索に失敗しました');
        return response.json();
    }

    async getLocations(): Promise<string[]> {
        const response = await fetch(`${API_BASE_URL}/farms/locations`);
        if (!response.ok) throw new Error('地域一覧の取得に失敗しました');
        return response.json();
    }

    async updateFarm(id: number, data: { name: string; description: string; location: string; imageUrl?: string }) {
        const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update farm');
        return response.json();
    }

    async deleteFarm(id: number) {
        const response = await fetch(`${API_BASE_URL}/farms/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete farm');
    }

    // イベント
    async getEvents() {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Failed to get events');
        return response.json();
    }

    async getEvent(id: number) {
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        if (!response.ok) throw new Error('Failed to get event');
        return response.json();
    }

    async getEventsByFarm(farmId: number) {
        const response = await fetch(`${API_BASE_URL}/events/farm/${farmId}`);
        if (!response.ok) throw new Error('Failed to get events');
        return response.json();
    }

    async createEvent(data: {
        title: string;
        description: string;
        eventDate: string;
        capacity: number;
        price: number;
        farm: { id: number };
    }) {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create event');
        return response.json();
    }

    async updateEvent(id: number, data: {
        title: string;
        description: string;
        eventDate: string;
        capacity: number;
        price: number;
    }) {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update event');
        return response.json();
    }

    async deleteEvent(id: number) {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete event');
    }

    // 予約
    async getReservations() {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get reservations');
        return response.json();
    }

    async getFarmerReservations() {
        const response = await fetch(`${API_BASE_URL}/reservations/farmer`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get farmer reservations');
        return response.json();
    }

    async createReservation(eventId: number, numberOfPeople: number) {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ eventId, numberOfPeople }),
        });
        if (!response.ok) throw new Error('Failed to create reservation');
        return response.json();
    }

    async cancelReservation(id: number) {
        const response = await fetch(`${API_BASE_URL}/reservations/${id}/cancel`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to cancel reservation');
    }

    // 管理者
    async adminGetUsers() {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get users');
        return response.json();
    }

    async adminDeleteUser(id: number) {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete user');
    }

    async adminGetFarms() {
        const response = await fetch(`${API_BASE_URL}/admin/farms`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get farms');
        return response.json();
    }

    async adminCreateFarm(data: { name: string; description: string; location: string; imageUrl?: string; ownerId: number }) {
        const response = await fetch(`${API_BASE_URL}/admin/farms`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create farm');
        return response.json();
    }

    async adminDeleteFarm(id: number) {
        const response = await fetch(`${API_BASE_URL}/admin/farms/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete farm');
    }

    async adminGetStats() {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get stats');
        return response.json();
    }

    removeToken() {
        removeToken();
    }
}

export const api = new ApiClient();
