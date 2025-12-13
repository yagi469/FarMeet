'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Gift, CheckCircle, XCircle, LogIn } from 'lucide-react';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import Link from 'next/link';

interface VoucherInfo {
    id: number;
    code: string;
    amount: number;
    balance: number;
    status: string;
    expiresAt: string;
    isUsable: boolean;
    hasMessage?: boolean;
    purchaserName?: string;
}

export default function RedeemPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;

    const [loading, setLoading] = useState(true);
    const [voucherInfo, setVoucherInfo] = useState<VoucherInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [redeeming, setRedeeming] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(authHelper.isAuthenticated());
        loadVoucherInfo();
    }, [code]);

    const loadVoucherInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const info = await api.checkGiftVoucher(code);
            setVoucherInfo(info);
        } catch (err: any) {
            setError(err.message || 'ギフト券が見つかりません');
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!isLoggedIn) {
            router.push(`/login?redirect=/gift/redeem/${code}`);
            return;
        }

        setRedeeming(true);
        try {
            await api.redeemGiftVoucher(code);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'ギフト券の登録に失敗しました');
        } finally {
            setRedeeming(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">読み込み中...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">登録完了！</h1>
                    <p className="text-gray-600 mb-6">
                        ギフト券が正常に登録されました。<br />
                        予約時にご利用いただけます。
                    </p>
                    {voucherInfo && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-500">残高</p>
                            <p className="text-3xl font-bold text-emerald-600">
                                ¥{voucherInfo.balance.toLocaleString()}
                            </p>
                        </div>
                    )}
                    <Link
                        href="/"
                        className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition"
                    >
                        農園を探す
                    </Link>
                </div>
            </div>
        );
    }

    if (error && !voucherInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">エラー</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition"
                    >
                        トップページに戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">ギフト券を受け取る</h1>
                    <p className="text-gray-500 mt-2">FarMeetで使えるギフト券です</p>
                </div>

                {voucherInfo && (
                    <div className="space-y-4 mb-6">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                            <p className="text-sm opacity-80 mb-1">金額</p>
                            <p className="text-4xl font-bold">¥{voucherInfo.amount.toLocaleString()}</p>
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <p className="text-sm opacity-80">コード</p>
                                <p className="font-mono text-lg">{voucherInfo.code}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">有効期限</span>
                                <span className="font-medium">
                                    {new Date(voucherInfo.expiresAt).toLocaleDateString('ja-JP')}
                                </span>
                            </div>
                            {voucherInfo.purchaserName && (
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-500">送り主</span>
                                    <span className="font-medium">{voucherInfo.purchaserName}</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {!isLoggedIn ? (
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push(`/login?redirect=/gift/redeem/${code}`)}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition"
                        >
                            <LogIn className="w-5 h-5" />
                            ログインして受け取る
                        </button>
                        <p className="text-sm text-gray-500 text-center">
                            アカウントをお持ちでない場合は
                            <Link href={`/signup?redirect=/gift/redeem/${code}`} className="text-emerald-600 hover:underline">
                                新規登録
                            </Link>
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleRedeem}
                        disabled={redeeming || !voucherInfo?.isUsable}
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {redeeming ? '登録中...' : 'このギフト券を登録する'}
                    </button>
                )}

                {voucherInfo && !voucherInfo.isUsable && (
                    <p className="text-sm text-red-500 text-center mt-3">
                        このギフト券は既に使用済みか、有効期限が切れています
                    </p>
                )}
            </div>
        </div>
    );
}
