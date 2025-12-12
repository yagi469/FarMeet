'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { ExperienceEvent } from '@/types';

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [event, setEvent] = useState<ExperienceEvent | null>(null);
    const [numberOfAdults, setNumberOfAdults] = useState(1);
    const [numberOfChildren, setNumberOfChildren] = useState(0);
    const [numberOfInfants, setNumberOfInfants] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authHelper.isAuthenticated()) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (numberOfAdults + numberOfChildren + numberOfInfants === 0) {
            setError('参加人数を1名以上選択してください。');
            return;
        }
        setShowConfirmation(true);
    };

    const confirmReservation = async () => {
        setSubmitting(true);
        try {
            const reservation = await api.createReservationWithDetails(event!.id, numberOfAdults, numberOfChildren, numberOfInfants);
            // 決済ページへリダイレクト
            router.push(`/payment?reservationId=${reservation.id}`);
        } catch (err) {
            setError('予約に失敗しました。もう一度お試しください。');
            setShowConfirmation(false);
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

    const totalPeople = numberOfAdults + numberOfChildren + numberOfInfants;
    const childPrice = event.childPrice ?? event.price;
    const totalPrice = (event.price * numberOfAdults) + (childPrice * numberOfChildren);

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
                    <div className="flex items-start text-gray-700">
                        <span className="font-semibold w-32">料金:</span>
                        <div>
                            <div className="text-green-600 font-bold">
                                大人(13歳以上): ¥{event.price.toLocaleString()}
                            </div>
                            <div className="text-green-600">
                                子供(6-12歳): ¥{childPrice.toLocaleString()}
                            </div>
                            <div className="text-gray-500 text-sm">
                                幼児(0-5歳): 無料
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                        {/* 大人 */}
                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <div className="font-medium">大人</div>
                                <div className="text-sm text-gray-500">13歳以上</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNumberOfAdults(Math.max(0, numberOfAdults - 1))}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                    disabled={numberOfAdults === 0}
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-semibold">{numberOfAdults}</span>
                                <button
                                    type="button"
                                    onClick={() => setNumberOfAdults(Math.min(event.availableSlots - numberOfChildren - numberOfInfants, numberOfAdults + 1))}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                    disabled={totalPeople >= event.availableSlots}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* 子供 */}
                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <div className="font-medium">子供</div>
                                <div className="text-sm text-gray-500">6歳〜12歳</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNumberOfChildren(Math.max(0, numberOfChildren - 1))}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                    disabled={numberOfChildren === 0}
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-semibold">{numberOfChildren}</span>
                                <button
                                    type="button"
                                    onClick={() => setNumberOfChildren(Math.min(event.availableSlots - numberOfAdults - numberOfInfants, numberOfChildren + 1))}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                    disabled={totalPeople >= event.availableSlots}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* 幼児 */}
                        <div className="flex items-center justify-between py-3 border-b">
                            <div>
                                <div className="font-medium">幼児</div>
                                <div className="text-sm text-gray-500">0歳〜5歳（無料）</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNumberOfInfants(Math.max(0, numberOfInfants - 1))}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                    disabled={numberOfInfants === 0}
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-semibold">{numberOfInfants}</span>
                                <button
                                    type="button"
                                    onClick={() => setNumberOfInfants(Math.min(event.availableSlots - numberOfAdults - numberOfChildren, numberOfInfants + 1))}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                    disabled={totalPeople >= event.availableSlots}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded mb-6 space-y-2">
                        {numberOfAdults > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>大人 {numberOfAdults}名 × ¥{event.price.toLocaleString()}</span>
                                <span>¥{(event.price * numberOfAdults).toLocaleString()}</span>
                            </div>
                        )}
                        {numberOfChildren > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>子供 {numberOfChildren}名 × ¥{childPrice.toLocaleString()}</span>
                                <span>¥{(childPrice * numberOfChildren).toLocaleString()}</span>
                            </div>
                        )}
                        {numberOfInfants > 0 && (
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>幼児 {numberOfInfants}名</span>
                                <span>無料</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
                            <span>合計金額:</span>
                            <span className="text-green-600">¥{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || event.availableSlots === 0 || totalPeople === 0}
                        className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                        {submitting ? '予約中...' : '確認画面へ進む'}
                    </button>
                </form>

                {/* Confirmation Modal */}
                {showConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-4">予約内容の確認</h2>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">イベント</p>
                                    <p className="font-semibold">{event.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">日時</p>
                                    <p className="font-semibold">{new Date(event.eventDate).toLocaleString('ja-JP')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">人数</p>
                                    <div className="font-semibold">
                                        {numberOfAdults > 0 && <div>大人: {numberOfAdults}名</div>}
                                        {numberOfChildren > 0 && <div>子供: {numberOfChildren}名</div>}
                                        {numberOfInfants > 0 && <div>幼児: {numberOfInfants}名</div>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">合計金額</p>
                                    <p className="text-xl font-bold text-green-600">¥{totalPrice.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                                    disabled={submitting}
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={confirmReservation}
                                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:bg-gray-400"
                                    disabled={submitting}
                                >
                                    {submitting ? '予約中...' : '予約を確定する'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
