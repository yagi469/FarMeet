'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { Reservation } from '@/types';

export default function JoinReservationPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [joined, setJoined] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'ADULT' | 'CHILD' | 'INFANT'>('ADULT');

    useEffect(() => {
        setIsLoggedIn(authHelper.isAuthenticated());
        loadReservation();
    }, [code]);

    const loadReservation = async () => {
        try {
            setLoading(true);
            const data = await api.getInviteDetails(code);
            setReservation(data);
        } catch (err) {
            setError('招待リンクが無効か、期限が切れています。');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!isLoggedIn) {
            // ログインページにリダイレクト、戻りURLを設定
            router.push(`/login?redirect=/join/${code}`);
            return;
        }

        try {
            setJoining(true);
            await api.joinReservation(code, selectedCategory);
            setJoined(true);
        } catch (err: any) {
            setError(err.message || '参加に失敗しました');
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error && !reservation) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">リンクが無効です</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                    >
                        トップページへ
                    </Link>
                </div>
            </div>
        );
    }

    if (joined) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">参加しました！</h1>
                    <p className="text-gray-600 mb-6">
                        {reservation?.event?.title}への参加登録が完了しました。
                    </p>
                    <Link
                        href="/reservations"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                    >
                        予約一覧を見る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🎫</div>
                    <h1 className="text-2xl font-bold text-gray-900">グループ予約への招待</h1>
                    <p className="text-gray-600 mt-2">
                        {reservation?.user?.username}さんからの招待です
                    </p>
                </div>

                {/* 予約詳細カード */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                        <h2 className="text-xl font-bold">{reservation?.event?.title}</h2>
                        <p className="text-green-100 mt-1">{reservation?.event?.farm?.name}</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📅</span>
                            <div>
                                <p className="text-sm text-gray-500">開催日</p>
                                <p className="font-medium">
                                    {reservation?.event?.eventDate
                                        ? new Date(reservation.event.eventDate).toLocaleDateString('ja-JP', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short',
                                        })
                                        : ''}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📍</span>
                            <div>
                                <p className="text-sm text-gray-500">場所</p>
                                <p className="font-medium">{reservation?.event?.farm?.location}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-2xl">👥</span>
                            <div>
                                <p className="text-sm text-gray-500">予約人数</p>
                                <p className="font-medium">{reservation?.numberOfPeople}名</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* エラー表示 */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* カテゴリ選択 */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">参加区分を選択してください</h3>
                    <div className="space-y-3">
                        {[
                            { value: 'ADULT' as const, label: '大人（13歳以上）', icon: '👨', available: (reservation?.numberOfAdults ?? 1) - 1 },
                            { value: 'CHILD' as const, label: '子供（6-12歳）', icon: '👦', available: reservation?.numberOfChildren ?? 0 },
                            { value: 'INFANT' as const, label: '幼児（0-5歳・無料）', icon: '👶', available: reservation?.numberOfInfants ?? 0 },
                        ].filter(cat => cat.available > 0 || cat.value === selectedCategory).map((cat) => (
                            <label
                                key={cat.value}
                                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${selectedCategory === cat.value
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    } ${cat.available <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="category"
                                    value={cat.value}
                                    checked={selectedCategory === cat.value}
                                    onChange={() => cat.available > 0 && setSelectedCategory(cat.value)}
                                    disabled={cat.available <= 0}
                                    className="w-5 h-5 text-green-600"
                                />
                                <span className="text-2xl">{cat.icon}</span>
                                <div className="flex-1">
                                    <span className="font-medium">{cat.label}</span>
                                    <span className={`ml-2 text-sm ${cat.available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {cat.available > 0 ? `残り${cat.available}名` : '満員'}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 参加ボタン */}
                <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {joining ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            参加処理中...
                        </>
                    ) : isLoggedIn ? (
                        <>
                            <span className="text-xl">✨</span>
                            この予約に参加する
                        </>
                    ) : (
                        <>
                            <span className="text-xl">🔑</span>
                            ログインして参加する
                        </>
                    )}
                </button>

                {!isLoggedIn && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                        参加するにはログインが必要です
                    </p>
                )}

                {/* 注意事項 */}
                <div className="mt-8 p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-medium text-amber-800 mb-2">📌 ご注意</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                        <li>• 参加登録は予約への参加意思表示です</li>
                        <li>• 決済は予約者が一括で行います</li>
                        <li>• キャンセルは予約者にご連絡ください</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

