'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trash2, Plus, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists or using standard textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Note: You might need to install/configure these shadcn/ui components first if not present.
// For simplicity, I'll use standard HTML elements for the form if complex components are missing, 
// but will try to align with shadcn styles.

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

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        imageUrl: '',
        ownerId: ''
    });

    const fetchData = async () => {
        try {
            const [farmsData, usersData] = await Promise.all([
                api.adminGetFarms(),
                api.adminGetUsers()
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

    useEffect(() => {
        fetchData();
    }, []);

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.adminCreateFarm({
                ...formData,
                ownerId: parseInt(formData.ownerId)
            });
            alert('農園を作成しました');
            setIsDialogOpen(false);
            setFormData({ name: '', description: '', location: '', imageUrl: '', ownerId: '' });
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Failed to create farm:', error);
            alert('農園の作成に失敗しました');
        }
    };

    if (isLoading) return <div>読み込み中...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">農園管理</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            農園を追加
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>農園を新規作成</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
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
                            <Button type="submit" className="w-full">作成する</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">ID</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">農園情報</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm">オーナー</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {farms.map((farm) => (
                            <tr key={farm.id} className="hover:bg-gray-50">
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
                                    <button
                                        onClick={() => handleDelete(farm.id)}
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
