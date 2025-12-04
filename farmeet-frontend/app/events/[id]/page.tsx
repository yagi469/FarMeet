'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { ExperienceEvent } from '@/types';

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<ExperienceEvent | null>(null);
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authHelper.isAuthenticated()) {
            router.push('/login');
            return;
        }
        loadEvent();
    }, [params.id]);

    const loadEvent = async () => {
        try {
            const eventId = Number(params.id);
            const data = await api.getEvent(eventId);
            setEvent(data);
        } catch (error) {
            console.error('イベント読み込みエラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await api.createReservation(event!.id, numberOfPeople);
            alert('予約が完了しました！');
            router.push('/reservations');
        } catch (err) {
            setError('予約に失敗しました。もう一度お試しください。');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">イベントが見つかりませんでした</p>
            </div>
        );
    }

    const totalPrice = event.price * numberOfPeople;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                <p className="text-gray-600 mb-6">{event.description}</p>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center text-gray-700">
                        <span className="font-semibold w-32">農園:</span>
                        <span>{event.farm.name}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <span className="font-semibold w-32">開催日時:</span>
                        <span>{new Date(event.eventDate).toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <span className="font-semibold w-32">空き状況:</span>
                        <span>
                            残り{event.availableSlots}席 / 定員{event.capacity}名
                        </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <span className="font-semibold w-32">料金:</span>
                        <span className="text-green-600 font-bold">
                            ¥{event.price.toLocaleString()} / 人
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="numberOfPeople" className="block text-sm font-medium mb-2">
                            参加人数
                        </label>
                        <input
                            type="number"
                            id="numberOfPeople"
                            min="1"
                            max={event.availableSlots}
                            value={numberOfPeople}
                            onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded mb-6">
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>合計金額:</span>
                            <span className="text-green-600">¥{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || event.availableSlots === 0}
                        className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                        {submitting ? '予約中...' : '予約を確定する'}
                    </button>
                </form>
            </div>
        </div>
    );
}
