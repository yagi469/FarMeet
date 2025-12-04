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
        if (!response.ok) throw new Error('Failed to create farm');
        return response.json();
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

    // 予約
    async getReservations() {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get reservations');
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
}

export const api = new ApiClient();
