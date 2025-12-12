'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function StripeSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (sessionId) {
            confirmPayment();
        }
    }, [sessionId]);

    const confirmPayment = async () => {
        try {
            await api.confirmStripePayment(sessionId!);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || '決済確認に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">決済を確認中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-red-600 mb-2">決済確認エラー</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/reservations"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition inline-block"
                    >
                        予約一覧を確認
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-green-600 mb-2">お支払いが完了しました！</h1>
                <p className="text-gray-600 mb-8">ご予約が確定しました。当日のご来場をお待ちしております。</p>

                <div className="space-y-3">
                    <Link
                        href="/reservations"
                        className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        予約一覧を見る
                    </Link>
                    <Link
                        href="/"
                        className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                        トップページに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function StripeSuccessPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
            </div>
        }>
            <StripeSuccessContent />
        </Suspense>
    );
}
