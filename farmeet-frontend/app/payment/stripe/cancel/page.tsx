'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function StripeCancelContent() {
    const searchParams = useSearchParams();
    const reservationId = searchParams.get('reservation_id');

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">お支払いがキャンセルされました</h1>
                <p className="text-gray-600 mb-8">決済は完了していません。別のお支払い方法をお試しください。</p>

                <div className="space-y-3">
                    {reservationId && (
                        <Link
                            href={`/payment?reservationId=${reservationId}`}
                            className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                        >
                            お支払い方法を選び直す
                        </Link>
                    )}
                    <Link
                        href="/reservations"
                        className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                        予約一覧を見る
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function StripeCancelPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
            </div>
        }>
            <StripeCancelContent />
        </Suspense>
    );
}
