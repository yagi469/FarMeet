'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trash2 } from 'lucide-react';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const data = await api.adminGetUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            alert('ユーザー一覧の取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('本当にこのユーザーを削除（BAN）しますか？')) return;
        try {
            await api.adminDeleteUser(id);
            setUsers(users.filter(user => user.id !== id));
            alert('ユーザーを削除しました');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('ユーザーの削除に失敗しました');
        }
    };

    if (isLoading) return <div>読み込み中...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">ID</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">ユーザー名</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">メールアドレス</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">権限</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600">#{user.id}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.username}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'FARMER' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="削除"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
