'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Tractor, CalendarCheck, Activity, TrendingUp, Star } from 'lucide-react';

interface ActivityLog {
    id: number;
    activityType: string;
    userId: number | null;
    targetId: number | null;
    targetType: string | null;
    description: string;
    createdAt: string;
}

interface PopularItem {
    id: number;
    name?: string;
    title?: string;
    location?: string;
    farmName?: string;
    reservationCount: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFarms: 0,
        totalEvents: 0,
        totalReservations: 0,
        recentSignups: 0,
        recentReservations: 0
    });
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [popularFarms, setPopularFarms] = useState<PopularItem[]>([]);
    const [popularEvents, setPopularEvents] = useState<PopularItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [statsData, activitiesData, farmsData, eventsData] = await Promise.all([
                    api.getAnalyticsStats(),
                    api.getRecentActivities(10),
                    api.getPopularFarms(5),
                    api.getPopularEvents(5)
                ]);
                setStats(statsData);
                setActivities(activitiesData);
                setPopularFarms(farmsData);
                setPopularEvents(eventsData);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        {
            title: '総ユーザー数',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            title: '登録農園数',
            value: stats.totalFarms,
            icon: Tractor,
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            title: '総予約数',
            value: stats.totalReservations,
            icon: CalendarCheck,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
        {
            title: '直近7日の新規登録',
            value: stats.recentSignups,
            icon: TrendingUp,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
        },
    ];

    const getActivityIcon = (type: string) => {
        if (type.includes('USER')) return '👤';
        if (type.includes('FARM')) return '🌾';
        if (type.includes('EVENT')) return '📅';
        if (type.includes('RESERVATION')) return '🎟️';
        if (type.includes('ADMIN')) return '🔧';
        return '📝';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}分前`;
        if (hours < 24) return `${hours}時間前`;
        if (days < 7) return `${days}日前`;
        return date.toLocaleDateString('ja-JP');
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">読み込み中...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                    <p className="text-3xl font-bold mt-2">{card.value}</p>
                                </div>
                                <div className={`p-4 rounded-full ${card.bg}`}>
                                    <Icon className={`w-8 h-8 ${card.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Activity & Rankings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-500" />
                        <h2 className="font-semibold text-gray-900">最近のアクティビティ</h2>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                        {activities.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                アクティビティがありません
                            </div>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">{getActivityIcon(activity.activityType)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">{activity.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDate(activity.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Popular Rankings */}
                <div className="space-y-6">
                    {/* Popular Farms */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <h2 className="font-semibold text-gray-900">人気の農園</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {popularFarms.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    データがありません
                                </div>
                            ) : (
                                popularFarms.map((farm, index) => (
                                    <div key={farm.id} className="p-3 flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-100 text-gray-600' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-50 text-gray-500'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{farm.name}</p>
                                            <p className="text-xs text-gray-500">{farm.location}</p>
                                        </div>
                                        <span className="text-sm text-gray-500">{farm.reservationCount}件</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Popular Events */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-purple-500" />
                            <h2 className="font-semibold text-gray-900">人気のイベント</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {popularEvents.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    データがありません
                                </div>
                            ) : (
                                popularEvents.map((event, index) => (
                                    <div key={event.id} className="p-3 flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-100 text-gray-600' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-50 text-gray-500'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                                            <p className="text-xs text-gray-500">{event.farmName}</p>
                                        </div>
                                        <span className="text-sm text-gray-500">{event.reservationCount}件</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
