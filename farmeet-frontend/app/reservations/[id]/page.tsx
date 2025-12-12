'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { Reservation } from '@/types';

export default function ReservationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authHelper.isAuthenticated()) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        loadReservation();
    }, [params.id, router, pathname]);

    const loadReservation = async () => {
        try {
            const data = await api.getReservationById(Number(params.id));
            setReservation(data);
            setError(null);
        } catch (err) {
            console.error('予約読み込みエラー:', err);
            setError('予約の読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!reservation) return;
        if (!confirm('この予約をキャンセルしてもよろしいですか？')) return;

        try {
            await api.cancelReservation(reservation.id);
            alert('予約をキャンセルしました');
            loadReservation();
        } catch (error) {
            alert('キャンセルに失敗しました');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    if (error || !reservation) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 mb-4">{error || '予約が見つかりません'}</p>
                    <Link
                        href="/reservations"
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                    >
                        予約一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            CONFIRMED: 'bg-green-100 text-green-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
            COMPLETED: 'bg-blue-100 text-blue-800',
        };
        const labels: Record<string, string> = {
            CONFIRMED: '確定',
            PENDING: '保留中',
            CANCELLED: 'キャンセル済み',
            COMPLETED: '完了',
        };
        return (
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    // 料金内訳の計算
    const adultPrice = reservation.event.price;
    const childPrice = reservation.event.childPrice ?? reservation.event.price;
    const numberOfAdults = reservation.numberOfAdults ?? reservation.numberOfPeople;
    const numberOfChildren = reservation.numberOfChildren ?? 0;
    const numberOfInfants = reservation.numberOfInfants ?? 0;

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
            {/* ヘッダー */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/reservations"
                    className="text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold">予約詳細</h1>
            </div>

            {/* メインカード */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* ステータスバナー */}
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                    <span className="text-sm text-gray-500">予約番号: #{reservation.id}</span>
                    {getStatusBadge(reservation.status)}
                </div>

                {/* イベント情報 */}
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold mb-2">{reservation.event.title}</h2>
                    <Link
                        href={`/farms/${reservation.event.farm.id}`}
                        className="text-green-600 hover:underline"
                    >
                        {reservation.event.farm.name}
                    </Link>
                </div>

                {/* 詳細情報 */}
                <div className="p-6 space-y-6">
                    {/* 開催日時 */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">開催日時</p>
                            <p className="font-semibold">
                                {new Date(reservation.event.eventDate).toLocaleString('ja-JP', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>

                    {/* 場所 */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">開催場所</p>
                            <p className="font-semibold">{reservation.event.farm.location}</p>
                        </div>
                    </div>

                    {/* 参加人数 */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">参加人数</p>
                            <div className="space-y-1">
                                {numberOfAdults > 0 && (
                                    <p className="font-semibold">大人（13歳以上）: {numberOfAdults}名</p>
                                )}
                                {numberOfChildren > 0 && (
                                    <p className="font-semibold">子供（6-12歳）: {numberOfChildren}名</p>
                                )}
                                {numberOfInfants > 0 && (
                                    <p className="font-semibold">幼児（0-5歳）: {numberOfInfants}名</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 料金明細 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-3">料金明細</p>
                        <div className="space-y-2">
                            {numberOfAdults > 0 && (
                                <div className="flex justify-between">
                                    <span>大人 ¥{adultPrice.toLocaleString()} × {numberOfAdults}名</span>
                                    <span>¥{(adultPrice * numberOfAdults).toLocaleString()}</span>
                                </div>
                            )}
                            {numberOfChildren > 0 && (
                                <div className="flex justify-between">
                                    <span>子供 ¥{childPrice.toLocaleString()} × {numberOfChildren}名</span>
                                    <span>¥{(childPrice * numberOfChildren).toLocaleString()}</span>
                                </div>
                            )}
                            {numberOfInfants > 0 && (
                                <div className="flex justify-between text-gray-500">
                                    <span>幼児 × {numberOfInfants}名</span>
                                    <span>無料</span>
                                </div>
                            )}
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                <span>合計</span>
                                <span className="text-green-600">¥{reservation.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* 予約日時 */}
                    <div className="text-sm text-gray-500">
                        予約日時: {new Date(reservation.createdAt).toLocaleString('ja-JP')}
                    </div>
                </div>

                {/* アクション */}
                <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row gap-3">
                    <Link
                        href={`/farms/${reservation.event.farm.id}`}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-center hover:bg-gray-50 transition font-medium"
                    >
                        農園ページを見る
                    </Link>
                    {reservation.status === 'CONFIRMED' && (
                        <button
                            onClick={handleCancel}
                            className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-medium"
                        >
                            予約をキャンセル
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
