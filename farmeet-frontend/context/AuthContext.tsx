'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authHelper } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: () => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    login: () => { },
    logout: () => { },
    refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // クライアントサイドでのみトークンを確認
        const checkAuth = async () => {
            const token = authHelper.getToken();
            if (token) {
                const userData = await authHelper.getProfile();
                if (userData) {
                    setIsAuthenticated(true);
                    setUser(userData);
                } else {
                    // トークンが無効な場合はログアウト
                    authHelper.logout();
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = () => {
        setIsAuthenticated(true);
        // Refresh user data after login
        authHelper.getProfile().then((userData) => {
            if (userData) setUser(userData);
        });
    };

    const logout = () => {
        authHelper.logout();
        setIsAuthenticated(false);
        setUser(null);
        router.push('/');
    };

    const refreshUser = async () => {
        const userData = await authHelper.getProfile();
        if (userData) {
            setUser(userData);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);


