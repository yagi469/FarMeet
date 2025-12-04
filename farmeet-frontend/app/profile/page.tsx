'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authHelper } from '@/lib/auth';
import { api } from '@/lib/api';
import { User } from '@/types';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authHelper.isAuthenticated()) {
            router.push('/login');
            return;
        }
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await api.getProfile();
            setUser(data);
        } catch (error) {
            console.error('プロファイル読み込みエラー:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">プロファイル情報が取得できませんでした</p>
            </div>
        );
    }

    const roleLabels = {
        USER: '一般ユーザー',
        FARMER: '農家',
        ADMIN: '管理者',
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">プロファイル</h1>

            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            ユーザー名
                        </label>
                        <p className="text-lg font-semibold">{user.username}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            メールアドレス
                        </label>
                        <p className="text-lg font-semibold">{user.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            役割
                        </label>
                        <p className="text-lg font-semibold">
                            {roleLabels[user.role]}
                        </p>
                    </div>

                    <div className="pt-6 border-t">
                        <button
                            onClick={() => router.push('/reservations')}
                            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
                        >
                            予約一覧を見る
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
