'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function PayPayMockContent() {
    const searchParams = useSearchParams();
    const paymentId = searchParams.get('payment_id');
    const amount = searchParams.get('amount');

    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleMockPayment = async () => {
        setLoading(true);
        try {
            // モック: PayPay決済完了をシミュレート
            await api.completePayPayPayment(Number(paymentId));
            setCompleted(true);
        } catch (err) {
            console.error('PayPay決済エラー:', err);
        } finally {
            setLoading(false);
        }
    };

    if (completed) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-green-600 mb-2">PayPay決済が完了しました！</h1>
                    <p className="text-gray-600 mb-8">ご予約が確定しました。</p>

                    <Link
                        href="/reservations"
                        className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        予約一覧を見る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-red-600 font-bold text-lg">PayPay</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">PayPay決済（デモ）</h1>
                <p className="text-gray-600 mb-4">PayPay APIは審査中のため、デモモードです。</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-500">お支払い金額</p>
                    <p className="text-3xl font-bold text-gray-800">¥{Number(amount).toLocaleString()}</p>
                </div>

                <button
                    onClick={handleMockPayment}
                    disabled={loading}
                    className="w-full bg-red-500 text-white px-6 py-4 rounded-lg hover:bg-red-600 transition font-bold text-lg disabled:opacity-50"
                >
                    {loading ? '処理中...' : 'PayPayで支払いをシミュレート'}
                </button>

                <p className="text-xs text-gray-400 mt-4">
                    ※ 実際のPayPay決済は行われません
                </p>
            </div>
        </div>
    );
}

export default function PayPayMockPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">読み込み中...</p>
            </div>
        }>
            <PayPayMockContent />
        </Suspense>
    );
}
