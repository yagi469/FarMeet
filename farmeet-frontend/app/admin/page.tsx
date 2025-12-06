'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, Tractor, CalendarCheck } from 'lucide-react';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFarms: 0,
        totalReservations: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.adminGetStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    const cards = [
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
        // Reservation stats could be added here if backend supports it
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card) => {
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

            {/* Placeholder for future charts or recent activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                グラフや最近のアクティビティがここに表示されます
            </div>
        </div>
    );
}
