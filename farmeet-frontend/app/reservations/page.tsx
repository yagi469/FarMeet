'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { Reservation } from '@/types';

interface PaymentInfo {
    id: number;
    paymentMethod: string;
    paymentStatus: string;
}

export default function ReservationsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [payments, setPayments] = useState<Record<number, PaymentInfo>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authHelper.isAuthenticated()) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }
        loadReservations();
    }, [router]);

    const loadReservations = async () => {
        try {
            const data = await api.getReservations();
            setReservations(data);
            setError(null);

            // 各予約の決済情報を取得
            const paymentData: Record<number, PaymentInfo> = {};
            for (const res of data) {
                try {
                    const payment = await api.getPaymentByReservation(res.id);
                    if (payment) {
                        paymentData[res.id] = payment;
                    }
                } catch {
                    // 決済情報がない場合は無視
                }
            }
            setPayments(paymentData);
        } catch (err) {
            console.error('予約読み込みエラー:', err);
            setError('予約の読み込みに失敗しました');
            setReservations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('この予約をキャンセルしてもよろしいですか？')) {
            return;
        }

        try {
            await api.cancelReservation(id);
            alert('予約をキャンセルしました');
            loadReservations();
        } catch (error) {
            alert('キャンセルに失敗しました');
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            STRIPE: 'クレジットカード',
            PAYPAY: 'PayPay',
            BANK_TRANSFER: '銀行振込',
        };
        return labels[method] || method;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            CONFIRMED: 'bg-green-100 text-green-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            PENDING_PAYMENT: 'bg-orange-100 text-orange-800',
            AWAITING_TRANSFER: 'bg-blue-100 text-blue-800',
            PAYMENT_FAILED: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
            COMPLETED: 'bg-blue-100 text-blue-800',
        };
        const labels: Record<string, string> = {
            CONFIRMED: '確定',
            PENDING: '保留中',
            PENDING_PAYMENT: '決済待ち',
            AWAITING_TRANSFER: '振込待ち',
            PAYMENT_FAILED: '決済失敗',
            CANCELLED: 'キャンセル済み',
            COMPLETED: '完了',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">予約一覧</h1>

            {error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => loadReservations()}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition mr-2"
                    >
                        再読み込み
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
                    >
                        ホームに戻る
                    </button>
                </div>
            ) : reservations.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                    <p className="text-gray-500 mb-4">まだ予約がありません</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                    >
                        農園を探す
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {reservations.map((reservation) => (
                        <div
                            key={reservation.id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.push(`/reservations/${reservation.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">
                                        {reservation.event.title}
                                    </h2>
                                    <p className="text-gray-600">{reservation.event.farm.name}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getStatusBadge(reservation.status)}
                                    {payments[reservation.id] && (
                                        <span className="text-xs text-gray-500">
                                            {getPaymentMethodLabel(payments[reservation.id].paymentMethod)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">開催日時</p>
                                    <p className="font-medium">
                                        {new Date(reservation.event.eventDate).toLocaleString('ja-JP')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">参加人数</p>
                                    <p className="font-medium">{reservation.numberOfPeople}名</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">合計金額</p>
                                    <p className="font-medium text-green-600">
                                        ¥{reservation.totalPrice.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">予約日時</p>
                                    <p className="font-medium">
                                        {new Date(reservation.createdAt).toLocaleString('ja-JP')}
                                    </p>
                                </div>
                            </div>

                            {reservation.status === 'CONFIRMED' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel(reservation.id);
                                    }}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                >
                                    予約をキャンセル
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
