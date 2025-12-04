'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Farm, ExperienceEvent } from '@/types';

export default function FarmManagePage() {
    const params = useParams();
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

    if (loading) return <div>読み込み中...</div>;
    if (!farm) return <div>農園が見つかりません</div>;

    return (
        <div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{farm.name}</h1>
                    <p className="text-gray-600">📍 {farm.location}</p>
                </div>
                <Link
                    href="/farmer/farms"
                    className="text-gray-600 hover:underline"
                >
                    &larr; 一覧に戻る
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">農園情報</h2>
                <div className="flex gap-6">
                    {farm.imageUrl && (
                        <img
                            src={farm.imageUrl}
                            alt={farm.name}
                            className="w-48 h-32 object-cover rounded"
                        />
                    )}
                    <div>
                        <p className="text-gray-700 whitespace-pre-wrap">{farm.description}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">イベント管理</h2>
                <Link
                    href={`/farmer/farms/${farm.id}/events/new`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    + 新しいイベントを作成
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-500">登録されているイベントはありません</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold mb-1">{event.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">
                                    📅 {new Date(event.eventDate).toLocaleString('ja-JP')}
                                </p>
                                <div className="flex gap-4 text-sm">
                                    <span>定員: {event.capacity}名</span>
                                    <span>残り: {event.availableSlots}名</span>
                                    <span className="font-semibold text-green-600">¥{event.price.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {/* Future: Edit/Delete buttons */}
                                <button className="text-gray-400 cursor-not-allowed" disabled>
                                    編集
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
