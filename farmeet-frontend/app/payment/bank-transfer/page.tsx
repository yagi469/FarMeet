'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';

function BankTransferContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reservationId = searchParams.get('reservationId');

    const [payment, setPayment] = useState<any>(null);
    const [reservation, setReservation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authHelper.isAuthenticated()) {
            router.push('/login');
            return;
        }
        if (reservationId) {
            loadData();
        }
    }, [reservationId, router]);

    const loadData = async () => {
        try {
            const [resData, paymentData] = await Promise.all([
                api.getReservationById(Number(reservationId)),
                api.getPaymentByReservation(Number(reservationId))
            ]);
            setReservation(resData);
            setPayment(paymentData);
        } catch (err) {
            console.error('データ読み込みエラー:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">銀行振込でのお支払い</h1>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* 振込金額 */}
                <div className="bg-green-50 p-6 text-center border-b">
                    <p className="text-sm text-gray-600 mb-1">お振込金額</p>
                    <p className="text-3xl font-bold text-green-600">
                        ¥{reservation?.totalPrice?.toLocaleString()}
                    </p>
                </div>

                {/* 振込先情報 */}
                <div className="p-6 space-y-4">
                    <h2 className="font-semibold text-lg mb-4">振込先口座</h2>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">金融機関名</span>
                            <span className="font-medium">○○銀行</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">支店名</span>
                            <span className="font-medium">本店（001）</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">口座種別</span>
                            <span className="font-medium">普通</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">口座番号</span>
                            <span className="font-medium">1234567</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">口座名義</span>
                            <span className="font-medium">カ）ファーミート</span>
                        </div>
                    </div>

                    {/* 振込期限 */}
                    {payment?.transferDeadline && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-yellow-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">
                                    振込期限: {new Date(payment.transferDeadline).toLocaleDateString('ja-JP', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-yellow-600 mt-1">
                                期限を過ぎると予約がキャンセルされます
                            </p>
                        </div>
                    )}

                    {/* 注意事項 */}
                    <div className="text-sm text-gray-500 space-y-2">
                        <p>• 振込手数料はお客様負担となります</p>
                        <p>• 振込名義人は予約者名と同一にしてください</p>
                        <p>• 入金確認後、予約確定のメールをお送りします</p>
                        <p>• 確認には1-2営業日かかる場合があります</p>
                    </div>
                </div>

                {/* アクション */}
                <div className="p-6 bg-gray-50 border-t">
                    <Link
                        href="/reservations"
                        className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium text-center"
                    >
                        予約一覧を見る
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function BankTransferPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
            </div>
        }>
            <BankTransferContent />
        </Suspense>
    );
}
