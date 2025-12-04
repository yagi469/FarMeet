'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { Farm, ExperienceEvent } from '@/types';

export default function FarmDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [farm, setFarm] = useState<Farm | null>(null);
    const [events, setEvents] = useState<ExperienceEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [params.id]);

    const loadData = async () => {
        try {
            const farmId = Number(params.id);
            const [farmData, eventsData] = await Promise.all([
                api.getFarm(farmId),
                api.getEventsByFarm(farmId),
            ]);
            setFarm(farmData);
            setEvents(eventsData);
        } catch (error) {
            console.error('データ読み込みエラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReserve = (eventId: number) => {
        if (!authHelper.isAuthenticated()) {
            router.push(`/login?redirect=${encodeURIComponent(`/events/${eventId}`)}`);
            return;
        }
        router.push(`/events/${eventId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    if (!farm) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">農園が見つかりませんでした</p>
            </div>
        );
    }

    return (
        <div>
            {/* 農園情報 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                {farm.imageUrl && (
                    <img
                        src={farm.imageUrl}
                        alt={farm.name}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                )}
                <h1 className="text-3xl font-bold mb-4">{farm.name}</h1>
                <p className="text-gray-600 mb-4">{farm.description}</p>
                <p className="text-gray-500">📍 {farm.location}</p>
            </div>

            {/* 体験イベント一覧 */}
            <div>
                <h2 className="text-2xl font-bold mb-4">収穫体験イベント</h2>
                {events.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-500">現在、予約可能なイベントはありません</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map((event) => (
                            <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                                <p className="text-gray-600 mb-4">{event.description}</p>
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-600">
                                        📅 {new Date(event.eventDate).toLocaleString('ja-JP')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        👥 残り{event.availableSlots}席 / 定員{event.capacity}名
                                    </p>
                                    <p className="text-lg font-bold text-green-600">
                                        ¥{event.price.toLocaleString()} / 人
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleReserve(event.id)}
                                    disabled={event.availableSlots === 0}
                                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {event.availableSlots === 0 ? '満席' : '予約する'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
