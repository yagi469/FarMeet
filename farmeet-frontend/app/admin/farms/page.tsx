'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trash2, Plus, MapPin, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists or using standard textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Farm {
    id: number;
    name: string;
    description: string;
    location: string;
    imageUrl: string;
    owner: {
        id: number;
        username: string;
        email: string;
    };
}

interface User {
    id: number;
    username: string;
    role: string;
}

export default function AdminFarmsPage() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [farmers, setFarmers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showDeleted, setShowDeleted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        imageUrl: '',
        ownerId: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [farmsData, usersData] = await Promise.all([
                showDeleted ? api.adminGetDeletedFarms() : api.adminGetFarms(),
                api.adminGetUsers() // Always get all users to map farmers
            ]);
            setFarms(farmsData);
            setFarmers(usersData.filter((u: User) => u.role === 'FARMER'));
        } catch (error) {
            console.error('Failed to fetch data:', error);
            alert('データの取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchData();
    }, [showDeleted]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedAndFilteredFarms = () => {
        let result = [...farms];

        // Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(farm =>
                farm.name.toLowerCase().includes(lowerTerm) ||
                farm.location.toLowerCase().includes(lowerTerm) ||
                farm.owner.username.toLowerCase().includes(lowerTerm) ||
                farm.id.toString().includes(lowerTerm)
            );
        }

        // Sort
        if (sortConfig) {
            result.sort((a: any, b: any) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nested sorting for owner
                if (sortConfig.key === 'owner') {
                    aValue = a.owner.username;
                    bValue = b.owner.username;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    };

    const filteredFarms = getSortedAndFilteredFarms();

    const handleDelete = async (id: number) => {
        if (!confirm('本当にこの農園を削除しますか？')) return;
        try {
            await api.adminDeleteFarm(id);
            setFarms(farms.filter(farm => farm.id !== id));
            alert('農園を削除しました');
        } catch (error) {
            console.error('Failed to delete farm:', error);
            alert('農園の削除に失敗しました');
        }
    };

    const handleRestore = async (id: number) => {
        if (!confirm('この農園を復元しますか？')) return;
        try {
            await api.adminRestoreFarm(id);
            setFarms(farms.filter(farm => farm.id !== id));
            alert('農園を復元しました');
        } catch (error) {
            console.error('Failed to restore farm:', error);
            alert('農園の復元に失敗しました');
        }
    };

    const handleHardDelete = async (id: number) => {
        if (!confirm('⚠️ 警告: この農園を完全に削除しますか？\n\nこの操作は取り消せません。関連するイベントも全て削除されます。')) return;
        try {
            await api.adminHardDeleteFarm(id);
            setFarms(farms.filter(farm => farm.id !== id));
            alert('農園を完全に削除しました');
        } catch (error) {
            console.error('Failed to hard delete farm:', error);
            alert('農園の完全削除に失敗しました');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.adminUpdateFarm(editingId, {
                    ...formData,
                    ownerId: parseInt(formData.ownerId)
                });
                alert('農園情報を更新しました');
            } else {
                await api.adminCreateFarm({
                    ...formData,
                    ownerId: parseInt(formData.ownerId)
                });
                alert('農園を作成しました');
            }
            setIsDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Failed to save farm:', error);
            alert('保存に失敗しました');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', location: '', imageUrl: '', ownerId: '' });
        setEditingId(null);
    };

    const handleEdit = (farm: Farm) => {
        setFormData({
            name: farm.name,
            description: farm.description,
            location: farm.location,
            imageUrl: farm.imageUrl || '',
            ownerId: farm.owner.id.toString()
        });
        setEditingId(farm.id);
        setIsDialogOpen(true);
    };

    if (isLoading) return <div>読み込み中...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">農園管理</h1>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="検索 (農園名, 場所, オーナー)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none bg-white px-3 py-2 rounded-md border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={showDeleted}
                            onChange={(e) => setShowDeleted(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        />
                        <span>削除済みを表示</span>
                    </label>

                    {!showDeleted && (
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 shadow-sm">
                                    <Plus className="w-4 h-4" />
                                    農園を追加
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{editingId ? '農園情報を編集' : '農園を新規作成'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">農園名</label>
                                        <Input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="例: 山田農園"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                                        <textarea
                                            required
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
                                        <Input
                                            required
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="例: 長野県松本市"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">画像URL</label>
                                        <Input
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">オーナー</label>
                                        <select
                                            required
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={formData.ownerId}
                                            onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                                        >
                                            <option value="">選択してください</option>
                                            {farmers.map((farmer) => (
                                                <option key={farmer.id} value={farmer.id}>
                                                    {farmer.username} (#{farmer.id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Button type="submit" className="w-full">
                                        {editingId ? '更新する' : '作成する'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>
                                ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                                農園情報 {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('owner')}>
                                オーナー {sortConfig?.key === 'owner' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredFarms.map((farm) => (
                            <tr key={farm.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600">#{farm.id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {farm.imageUrl && (
                                            <img src={farm.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">{farm.name}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {farm.location}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {farm.owner.username} <span className="text-xs text-gray-400">(#{farm.owner.id})</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {showDeleted ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleRestore(farm.id)}
                                                className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                                                title="復元"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                <span className="text-sm font-medium">復元</span>
                                            </button>
                                            <button
                                                onClick={() => handleHardDelete(farm.id)}
                                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                                title="完全削除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">完全削除</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(farm)}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="編集"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(farm.id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="削除"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredFarms.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                    農園が見つかりません
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
