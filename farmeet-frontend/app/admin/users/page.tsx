'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER'
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.adminUpdateUser(editingId, {
                    username: formData.username,
                    email: formData.email,
                    role: formData.role
                });
                alert('ユーザー情報を更新しました');
            } else {
                await api.adminCreateUser({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                });
                alert('ユーザーを作成しました');
            }
            setIsDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('保存に失敗しました');
        }
    };

    const resetForm = () => {
        setFormData({ username: '', email: '', password: '', role: 'USER' });
        setEditingId(null);
    };

    const handleEdit = (user: User) => {
        setFormData({
            username: user.username,
            email: user.email,
            password: '', // Password not shown/required for edit
            role: user.role
        });
        setEditingId(user.id);
        setIsDialogOpen(true);
    };

    if (isLoading) return <div>読み込み中...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            ユーザーを追加
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'ユーザー情報を編集' : 'ユーザーを新規作成'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名</label>
                                <Input
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="例: yamada_taro"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                                <Input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="user@example.com"
                                />
                            </div>
                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                                    <Input
                                        required
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="password123"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">権限</label>
                                <select
                                    required
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="USER">USER (一般ユーザー)</option>
                                    <option value="FARMER">FARMER (農家)</option>
                                    <option value="ADMIN">ADMIN (管理者)</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full">
                                {editingId ? '更新する' : '作成する'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

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
                                        onClick={() => handleEdit(user)}
                                        className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                                        title="編集"
                                    >
                                        Edit
                                    </button>
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
