'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authHelper } from '@/lib/auth';
import { api } from '@/lib/api';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
    const router = useRouter();
    const pathname = usePathname();
    const { refreshUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', email: '', role: '' as 'USER' | 'FARMER' | 'ADMIN' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!authHelper.isAuthenticated()) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await api.getProfile();
            setUser(data);
            setEditForm({ username: data.username, email: data.email, role: data.role });
        } catch (error) {
            console.error('プロファイル読み込みエラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setEditForm({ username: user.username, email: user.email, role: user.role });
        }
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updatedUser = await api.updateProfile(editForm);
            setUser(updatedUser);
            setIsEditing(false);
            setSuccess('プロファイルを更新しました');
            // AuthContextのユーザー情報も更新
            await refreshUser();
        } catch (err) {
            setError('プロファイルの更新に失敗しました');
        } finally {
            setSaving(false);
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

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            ユーザー名
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        ) : (
                            <p className="text-lg font-semibold">{user.username}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            メールアドレス
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        ) : (
                            <p className="text-lg font-semibold">{user.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            役割
                        </label>
                        {isEditing ? (
                            <select
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'USER' | 'FARMER' | 'ADMIN' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="USER">一般ユーザー</option>
                                <option value="FARMER">農家</option>
                            </select>
                        ) : (
                            <p className="text-lg font-semibold">
                                {roleLabels[user.role]}
                            </p>
                        )}
                    </div>

                    <div className="pt-6 border-t flex gap-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 py-3 border border-gray-300 rounded hover:bg-gray-50 transition"
                                    disabled={saving}
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700 transition disabled:bg-gray-400"
                                    disabled={saving}
                                >
                                    {saving ? '保存中...' : '保存する'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleEdit}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
                                >
                                    編集する
                                </button>
                                <button
                                    onClick={() => router.push('/reservations')}
                                    className="flex-1 bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
                                >
                                    予約一覧を見る
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
