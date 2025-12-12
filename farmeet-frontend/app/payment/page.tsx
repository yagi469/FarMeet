'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';

function PaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reservationId = searchParams.get('reservationId');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reservation, setReservation] = useState<any>(null);

    useEffect(() => {
        if (!authHelper.isAuthenticated()) {
            router.push('/login');
            return;
        }
        if (reservationId) {
            loadReservation();
        }
    }, [reservationId, router]);

    const loadReservation = async () => {
        try {
            const data = await api.getReservationById(Number(reservationId));
            setReservation(data);
        } catch (err) {
            console.error('予約読み込みエラー:', err);
            setError('予約の読み込みに失敗しました');
        }
    };

    const handleStripePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.createStripeCheckoutSession(Number(reservationId));
            if (response.url) {
                window.location.href = response.url;
            } else {
                setError('決済URLの取得に失敗しました');
            }
        } catch (err: any) {
            setError(err.message || 'Stripe決済の開始に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handlePayPayPayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.createPayPayPayment(Number(reservationId));
            if (response.url) {
                window.location.href = response.url;
            } else {
                setError('PayPay決済URLの取得に失敗しました');
            }
        } catch (err: any) {
            setError(err.message || 'PayPay決済の開始に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleBankTransfer = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.initiateBankTransfer(Number(reservationId));
            router.push(`/payment/bank-transfer?reservationId=${reservationId}`);
        } catch (err: any) {
            setError(err.message || '銀行振込の開始に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (!reservationId) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">予約IDが指定されていません</p>
                    <Link href="/" className="text-green-600 hover:underline mt-4 inline-block">
                        トップページに戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">お支払い方法を選択</h1>

            {/* 予約情報サマリー */}
            {reservation && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="font-semibold mb-2">{reservation.event?.title}</h2>
                    <p className="text-gray-600 text-sm">{reservation.event?.farm?.name}</p>
                    <div className="border-t mt-4 pt-4 flex justify-between items-center">
                        <span className="text-gray-600">お支払い金額</span>
                        <span className="text-2xl font-bold text-green-600">
                            ¥{reservation.totalPrice?.toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* 決済方法選択 */}
            <div className="space-y-4">
                {/* Stripe（クレジットカード） */}
                <button
                    onClick={handleStripePayment}
                    disabled={loading}
                    className="w-full bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition flex items-center gap-4 disabled:opacity-50"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-semibold">クレジットカード</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard, JCB, AMEX対応</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* PayPay */}
                <button
                    onClick={handlePayPayPayment}
                    disabled={loading}
                    className="w-full bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition flex items-center gap-4 disabled:opacity-50"
                >
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-sm">PayPay</span>
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-semibold">PayPay</p>
                        <p className="text-sm text-gray-500">QRコード決済</p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* 銀行振込 */}
                <div
                    className="w-full bg-white rounded-xl shadow-lg p-6 flex items-center gap-4 opacity-50 cursor-not-allowed"
                >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-400">銀行振込</p>
                        <p className="text-sm text-orange-500">準備中</p>
                    </div>
                </div>
            </div>

            {/* キャンセルポリシー */}
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">キャンセルポリシー</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 4日前まで：全額返金</li>
                    <li>• 1〜3日前：50%返金</li>
                    <li>• 当日：返金不可</li>
                </ul>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
                        <p>処理中...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
            </div>
        }>
            <PaymentContent />
        </Suspense>
    );
}
