import { AuthRequest, AuthResponse, PhoneVerificationResponse, Review, SignupRequest } from "../types";

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
    async signup(data: SignupRequest) {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Signup failed');
        return response.json();
    }

    async login(data: AuthRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'ログインに失敗しました');
        }
        return response.json();
    }

    async checkEmail(email: string): Promise<{ exists: boolean; isAdmin: boolean }> {
        const response = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Email check failed');
        return response.json();
    }

    async sendOtp(email: string) {
        const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error('Failed to send OTP');
    }

    async verifyOtp(email: string, code: string, isSignup: boolean = false): Promise<AuthResponse | { valid: boolean }> {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, isSignup: isSignup.toString() }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to verify OTP');
        }
        return response.json();
    }

    async sendPhoneOtp(phoneNumber: string) {
        const response = await fetch(`${API_BASE_URL}/auth/phone/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber }),
        });
        if (!response.ok) throw new Error('Failed to send OTP');
    }

    async loginPhone(phoneNumber: string, code: string): Promise<PhoneVerificationResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/phone/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, code }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'ログインに失敗しました');
        }

        return response.json();
    }

    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get profile');
        return response.json();
    }

    async updateProfile(data: { username?: string; email?: string; role?: string; phoneNumber?: string }) {
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

    async searchFarms(keyword?: string, location?: string, date?: string, guests?: number, category?: string, minPrice?: number, maxPrice?: number) {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (location) params.append('location', location);
        if (date) params.append('date', date);
        if (guests && guests > 0) params.append('guests', guests.toString());
        if (category) params.append('category', category);
        if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
        if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());

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

    // 農園の最安価格を一括取得
    async getMinPrices(ids: number[]): Promise<Record<number, number>> {
        if (ids.length === 0) return {};
        const params = ids.map(id => `ids=${id}`).join('&');
        const response = await fetch(`${API_BASE_URL}/farms/min-prices?${params}`);
        if (!response.ok) throw new Error('最安価格の取得に失敗しました');
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

    async getReservationById(id: number) {
        const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get reservation');
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

    async createReservationWithDetails(eventId: number, numberOfAdults: number, numberOfChildren: number, numberOfInfants: number) {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                eventId,
                numberOfAdults,
                numberOfChildren,
                numberOfInfants,
                numberOfPeople: numberOfAdults + numberOfChildren + numberOfInfants
            }),
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

    async adminCreateUser(data: { username: string; email: string; password?: string; role: string }) {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create user');
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

    async adminUpdateUser(id: number, data: { username: string; email: string; role: string }) {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    }

    async adminUpdateFarm(id: number, data: { name: string; description: string; location: string; imageUrl?: string; ownerId: number }) {
        const response = await fetch(`${API_BASE_URL}/admin/farms/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update farm');
        return response.json();
    }

    async adminGetDeletedUsers() {
        const response = await fetch(`${API_BASE_URL}/admin/users/deleted`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch deleted users');
        return response.json();
    }

    async adminGetDeletedFarms() {
        const response = await fetch(`${API_BASE_URL}/admin/farms/deleted`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch deleted farms');
        return response.json();
    }

    async adminRestoreUser(id: number) {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}/restore`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to restore user');
    }

    async adminRestoreFarm(id: number) {
        const response = await fetch(`${API_BASE_URL}/admin/farms/${id}/restore`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to restore farm');
    }

    // 管理者 - イベント
    async adminGetEvents() {
        const response = await fetch(`${API_BASE_URL}/admin/events`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get events');
        return response.json();
    }

    async adminGetDeletedEvents() {
        const response = await fetch(`${API_BASE_URL}/admin/events/deleted`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to get deleted events');
        return response.json();
    }

    async adminCreateEvent(data: {
        farmId: number;
        title: string;
        description: string;
        eventDate: string;
        capacity: number;
        price: number;
        childPrice?: number | null;
        category: string;
    }) {
        const response = await fetch(`${API_BASE_URL}/admin/events`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create event');
        return response.json();
    }

    async adminUpdateEvent(id: number, data: {
        farmId: number;
        title: string;
        description: string;
        eventDate: string;
        capacity: number;
        price: number;
        childPrice?: number | null;
        category: string;
    }) {
        const response = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update event');
        return response.json();
    }

    async adminDeleteEvent(id: number) {
        const response = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete event');
    }

    async adminRestoreEvent(id: number) {
        const response = await fetch(`${API_BASE_URL}/admin/events/${id}/restore`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to restore event');
    }

    async adminGetStats() {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    }

    // ========== Hard Delete (Permanent Deletion) ==========

    async adminHardDeleteUser(id: number) {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}/hard`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to permanently delete user');
    }

    async adminHardDeleteFarm(id: number) {
        const response = await fetch(`${API_BASE_URL}/admin/farms/${id}/hard`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to permanently delete farm');
    }

    async adminHardDeleteEvent(id: number) {
        const response = await fetch(`${API_BASE_URL}/admin/events/${id}/hard`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to permanently delete event');
    }

    // ========== Analytics ==========

    async getRecentActivities(limit: number = 20) {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/activities?limit=${limit}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch activities');
        return response.json();
    }

    async getAnalyticsStats() {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/stats`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch analytics stats');
        return response.json();
    }

    async getDailyStats(days: number = 30) {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/daily?days=${days}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch daily stats');
        return response.json();
    }

    async getPopularFarms(limit: number = 5) {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/popular-farms?limit=${limit}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch popular farms');
        return response.json();
    }

    async getPopularEvents(limit: number = 5) {
        const response = await fetch(`${API_BASE_URL}/admin/analytics/popular-events?limit=${limit}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch popular events');
        return response.json();
    }

    // ========== Image Upload ==========

    async uploadImage(file: File, folder: string = 'general'): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const token = getToken();
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload image');
        }
        return response.json();
    }

    async uploadImages(files: File[], folder: string = 'general'): Promise<{ urls: string[], errors?: string[] }> {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('folder', folder);

        const token = getToken();
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/upload/images`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload images');
        }
        return response.json();
    }

    async deleteImage(imageUrl: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/upload/image?url=${encodeURIComponent(imageUrl)}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete image');
    }

    removeToken() {
        removeToken();
    }

    // ========== Favorites ==========

    async getFavorites(): Promise<{ id: number; name: string; location: string; imageUrl: string }[]> {
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch favorites');
        return response.json();
    }

    async addFavorite(farmId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/favorites/${farmId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to add favorite');
    }

    async removeFavorite(farmId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/favorites/${farmId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to remove favorite');
    }

    async checkFavorites(farmIds: number[]): Promise<number[]> {
        const params = farmIds.map(id => `farmIds=${id}`).join('&');
        const response = await fetch(`${API_BASE_URL}/favorites/check?${params}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            // If not authenticated, return empty array
            return [];
        }
        const data = await response.json();
        return data.favoriteIds || [];
    }

    // ========== Reviews ==========

    async getReviews(farmId: number): Promise<{
        reviews: Review[];
        averageRating: number;
        reviewCount: number;
    }> {
        const response = await fetch(`${API_BASE_URL}/farms/${farmId}/reviews`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return response.json();
    }

    async createReview(farmId: number, rating: number, comment: string): Promise<Review> {
        const response = await fetch(`${API_BASE_URL}/farms/${farmId}/reviews`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating, comment }),
        });
        if (!response.ok) throw new Error('Failed to create review');
        return response.json();
    }

    async deleteReview(reviewId: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete review');
    }

    async getFarmRatings(farmIds: number[]): Promise<Map<number, { avgRating: number; count: number }>> {
        const params = farmIds.map(id => `farmIds=${id}`).join('&');
        const response = await fetch(`${API_BASE_URL}/farms/ratings?${params}`);
        if (!response.ok) {
            return new Map();
        }
        const data = await response.json();
        const ratingsMap = new Map<number, { avgRating: number; count: number }>();
        if (data.ratings) {
            for (const [farmId, values] of Object.entries(data.ratings)) {
                const [avgRating, count] = values as number[];
                ratingsMap.set(Number(farmId), { avgRating, count });
            }
        }
        return ratingsMap;
    }
}

export const api = new ApiClient();
