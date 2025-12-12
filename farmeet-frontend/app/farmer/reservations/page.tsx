'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Reservation } from '@/types';

export default function FarmerReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            const data = await api.getFarmerReservations();
            setReservations(data);
        } catch (error) {
            console.error('予約読み込みエラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusLabels: Record<string, { label: string; color: string }> = {
        PENDING: { label: '保留中', color: 'bg-yellow-100 text-yellow-800' },
        PENDING_PAYMENT: { label: '決済待ち', color: 'bg-orange-100 text-orange-800' },
        AWAITING_TRANSFER: { label: '振込待ち', color: 'bg-blue-100 text-blue-800' },
        PAYMENT_FAILED: { label: '決済失敗', color: 'bg-red-100 text-red-800' },
        CONFIRMED: { label: '確定', color: 'bg-green-100 text-green-800' },
        CANCELLED: { label: 'キャンセル', color: 'bg-gray-100 text-gray-800' },
        COMPLETED: { label: '体験済み', color: 'bg-blue-100 text-blue-800' },
    };

    if (loading) {
        return <div>読み込み中...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">予約管理</h1>

            {reservations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500">まだ予約がありません</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    予約者
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    イベント
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    日時
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    人数
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    合計金額
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ステータス
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {reservation.user.username}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {reservation.user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {reservation.event.title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {reservation.event.farm.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(reservation.event.eventDate).toLocaleString('ja-JP')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {reservation.numberOfPeople}名
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ¥{reservation.totalPrice.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusLabels[reservation.status].color}`}>
                                            {statusLabels[reservation.status].label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
