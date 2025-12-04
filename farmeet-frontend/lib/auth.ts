import { api, setToken, removeToken } from './api';
import { User } from '@/types';

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export const authHelper = {
    async login(email: string, password: string): Promise<AuthState> {
        try {
            const response = await api.login(email, password);
            setToken(response.token);
            return {
                user: {
                    id: 0, // Will be populated from profile
                    username: response.username,
                    email: response.email,
                    role: response.role as 'USER' | 'FARMER' | 'ADMIN',
                },
                token: response.token,
                isAuthenticated: true,
            };
        } catch (error) {
            throw new Error('ログインに失敗しました');
        }
    },

    async signup(username: string, email: string, password: string, role?: string): Promise<AuthState> {
        try {
            const response = await api.signup({ username, email, password, role });
            setToken(response.token);
            return {
                user: {
                    id: 0,
                    username: response.username,
                    email: response.email,
                    role: response.role as 'USER' | 'FARMER' | 'ADMIN',
                },
                token: response.token,
                isAuthenticated: true,
            };
        } catch (error) {
            throw new Error('サインアップに失敗しました');
        }
    },

    logout(): void {
        removeToken();
    },

    async getProfile(): Promise<User | null> {
        try {
            return await api.getProfile();
        } catch (error) {
            return null;
        }
    },

    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};
