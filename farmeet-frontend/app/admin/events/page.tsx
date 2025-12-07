'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trash2, Plus, Calendar as CalendarIcon, RotateCcw, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Event {
    id: number;
    title: string;
    description: string;
    eventDate: string;
    capacity: number;
    price: number;
    availableSlots: number;
    category: string;
    farmId: number;
}

interface Farm {
    id: number;
    name: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showDeleted, setShowDeleted] = useState(false);

    const [formData, setFormData] = useState({
        farmId: '',
        title: '',
        description: '',
        eventDate: '',
        capacity: '10',
        price: '0',
        category: 'FRUIT'
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [eventsData, farmsData] = await Promise.all([
                showDeleted ? api.adminGetDeletedEvents() : api.adminGetEvents(),
                api.adminGetFarms() // Need farms for mapping names and dropdown
            ]);
            setEvents(eventsData);
            setFarms(farmsData);
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

    const getFarmName = (farmId: number) => {
        return farms.find(f => f.id === farmId)?.name || '不明な農園';
    };

    const getSortedAndFilteredEvents = () => {
        let result = [...events];

        // Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(event =>
                event.title.toLowerCase().includes(lowerTerm) ||
                event.description.toLowerCase().includes(lowerTerm) ||
                getFarmName(event.farmId).toLowerCase().includes(lowerTerm) ||
                event.id.toString().includes(lowerTerm)
            );
        }

        // Sort
        if (sortConfig) {
            result.sort((a: any, b: any) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle derived values or nested properties
                if (sortConfig.key === 'farmName') {
                    aValue = getFarmName(a.farmId);
                    bValue = getFarmName(b.farmId);
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

    const filteredEvents = getSortedAndFilteredEvents();

    const handleDelete = async (id: number) => {
        if (!confirm('本当にこのイベントを削除しますか？')) return;
        try {
            await api.adminDeleteEvent(id);
            setEvents(events.filter(e => e.id !== id));
            alert('イベントを削除しました');
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('イベントの削除に失敗しました');
        }
    };

    const handleRestore = async (id: number) => {
        if (!confirm('このイベントを復元しますか？')) return;
        try {
            await api.adminRestoreEvent(id);
            setEvents(events.filter(e => e.id !== id));
            alert('イベントを復元しました');
        } catch (error) {
            console.error('Failed to restore event:', error);
            alert('イベントの復元に失敗しました');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                farmId: parseInt(formData.farmId),
                title: formData.title,
                description: formData.description,
                eventDate: new Date(formData.eventDate).toISOString(),
                capacity: parseInt(formData.capacity),
                price: parseInt(formData.price),
                category: formData.category
            };

            if (editingId) {
                await api.adminUpdateEvent(editingId, payload);
                alert('イベント情報を更新しました');
            } else {
                await api.adminCreateEvent(payload);
                alert('イベントを作成しました');
            }
            setIsDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Failed to save event:', error);
            alert('保存に失敗しました');
        }
    };

    const resetForm = () => {
        setFormData({
            farmId: '',
            title: '',
            description: '',
            eventDate: '',
            capacity: '10',
            price: '0',
            category: 'FRUIT'
        });
        setEditingId(null);
    };

    const handleEdit = (event: Event) => {
        // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
        const date = new Date(event.eventDate);
        const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

        setFormData({
            farmId: event.farmId?.toString() || '',
            title: event.title,
            description: event.description || '',
            eventDate: dateStr,
            capacity: event.capacity.toString(),
            price: event.price.toString(),
            category: event.category || 'FRUIT'
        });
        setEditingId(event.id);
        setIsDialogOpen(true);
    };

    if (isLoading) return <div>読み込み中...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">イベント管理</h1>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="検索 (タイトル, 農園, 説明)..."
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
                                    イベントを追加
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingId ? 'イベント情報を編集' : 'イベントを新規作成'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">開催農園</label>
                                        <select
                                            required
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={formData.farmId}
                                            onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                                        >
                                            <option value="">選択してください</option>
                                            {farms.map((farm) => (
                                                <option key={farm.id} value={farm.id}>
                                                    {farm.name} (#{farm.id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">イベント名</label>
                                        <Input
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="例: いちご狩り体験"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                                        <select
                                            required
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="FRUIT">果物狩り</option>
                                            <option value="VEGETABLE">野菜収穫</option>
                                            <option value="FLOWER">花摘み</option>
                                            <option value="OTHER">その他</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">日時</label>
                                        <Input
                                            type="datetime-local"
                                            required
                                            value={formData.eventDate}
                                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">定員 (人)</label>
                                            <Input
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.capacity}
                                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">料金 (円)</label>
                                            <Input
                                                type="number"
                                                required
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
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
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('title')}>
                                イベント情報 {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('farmName')}>
                                開催農園 {sortConfig?.key === 'farmName' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm cursor-pointer hover:bg-gray-100" onClick={() => handleSort('eventDate')}>
                                日時・価格 {sortConfig?.key === 'eventDate' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredEvents.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600">#{event.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{event.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-[200px]">{event.description}</div>
                                    <span className="inline-block px-2 py-0.5 mt-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                        {event.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Building className="w-3 h-3 text-gray-400" />
                                        {getFarmName(event.farmId)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1 mb-1">
                                        <CalendarIcon className="w-3 h-3" />
                                        {new Date(event.eventDate).toLocaleDateString()}
                                    </div>
                                    <div>¥{event.price.toLocaleString()} / {event.capacity}名</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {showDeleted ? (
                                        <button
                                            onClick={() => handleRestore(event.id)}
                                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-end ml-auto gap-1"
                                            title="復元"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            <span className="text-sm font-medium">復元</span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="編集"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
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
                        {events.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                    イベントが見つかりません
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
