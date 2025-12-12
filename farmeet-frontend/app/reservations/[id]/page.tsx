'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { Reservation } from '@/types';

interface PaymentInfo {
    id: number;
    paymentMethod: string;
    paymentStatus: string;
    transferDeadline?: string;
}

interface Participant {
    id: number;
    userId: number;
    username: string;
    category: 'ADULT' | 'CHILD' | 'INFANT';
    joinedAt: string;
}

export default function ReservationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [payment, setPayment] = useState<PaymentInfo | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generatingLink, setGeneratingLink] = useState(false);
    const [copied, setCopied] = useState(false);

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

            // 招待コードがある場合はリンクを設定
            if (data.inviteCode) {
                setInviteLink(`${window.location.origin}/join/${data.inviteCode}`);
            }

            // 決済情報を取得
            try {
                const paymentData = await api.getPaymentByReservation(Number(params.id));
                setPayment(paymentData);
            } catch {
                // 決済情報がない場合は無視
            }

            // 参加者一覧を取得
            try {
                const participantsData = await api.getParticipants(Number(params.id));
                setParticipants(participantsData);
            } catch {
                // 参加者がいない場合は無視
            }
        } catch (err) {
            console.error('予約読み込みエラー:', err);
            setError('予約の読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInviteLink = async () => {
        if (!reservation) return;
        try {
            setGeneratingLink(true);
            const { inviteCode } = await api.generateInviteCode(reservation.id);
            const link = `${window.location.origin}/join/${inviteCode}`;
            setInviteLink(link);
        } catch (err: any) {
            alert(err.message || '招待リンクの生成に失敗しました');
        } finally {
            setGeneratingLink(false);
        }
    };

    const handleCopyLink = async () => {
        if (!inviteLink) return;
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            alert('コピーに失敗しました');
        }
    };

    const handleRemoveParticipant = async (participantId: number, username: string) => {
        if (!reservation) return;
        if (!confirm(`${username}さんを参加者から削除しますか？`)) return;

        try {
            await api.removeParticipant(reservation.id, participantId);
            setParticipants(participants.filter(p => p.id !== participantId));
        } catch (err: any) {
            alert(err.message || '削除に失敗しました');
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
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                {/* ステータスバナー */}
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                    <span className="text-sm text-gray-500">予約番号: #{reservation.id}</span>
                    <div className="flex items-center gap-3">
                        {payment && (
                            <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                                {getPaymentMethodLabel(payment.paymentMethod)}
                            </span>
                        )}
                        {getStatusBadge(reservation.status)}
                    </div>
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

                    {/* 決済方法 */}
                    {payment && (
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">お支払い方法</p>
                                <p className="font-semibold">{getPaymentMethodLabel(payment.paymentMethod)}</p>
                                {payment.transferDeadline && reservation.status === 'AWAITING_TRANSFER' && (
                                    <p className="text-sm text-orange-600 mt-1">
                                        振込期限: {new Date(payment.transferDeadline).toLocaleDateString('ja-JP')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

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
                    {(reservation.status === 'PENDING_PAYMENT' || reservation.status === 'PAYMENT_FAILED') && (
                        <Link
                            href={`/payment?reservationId=${reservation.id}`}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg text-center hover:bg-green-700 transition font-medium"
                        >
                            支払いに進む
                        </Link>
                    )}
                    {reservation.status === 'AWAITING_TRANSFER' && (
                        <Link
                            href={`/payment/bank-transfer?reservationId=${reservation.id}`}
                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700 transition font-medium"
                        >
                            振込情報を確認
                        </Link>
                    )}
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

            {/* 招待リンクセクション - 2人以上の予約のみ */}
            {reservation.status !== 'CANCELLED' && reservation.numberOfPeople >= 2 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="text-2xl">👥</span>
                            グループ招待
                        </h3>

                        {inviteLink ? (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    リンクを共有して、友人や家族を招待しましょう
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inviteLink}
                                        readOnly
                                        className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-sm"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${copied
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {copied ? '✓ コピー済み' : 'コピー'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    招待リンクを作成して、友人や家族と予約を共有できます
                                </p>
                                <button
                                    onClick={handleGenerateInviteLink}
                                    disabled={generatingLink}
                                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {generatingLink ? '生成中...' : '招待リンクを作成'}
                                </button>
                            </div>
                        )}

                        {/* 参加者一覧 */}
                        {participants.length > 0 && (
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-medium text-gray-900 mb-3">
                                    参加者 ({participants.length}名)
                                </h4>
                                <div className="space-y-2">
                                    {participants.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-600 font-medium">
                                                        {p.username.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="font-medium">{p.username}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${p.category === 'ADULT' ? 'bg-blue-100 text-blue-700' :
                                                        p.category === 'CHILD' ? 'bg-green-100 text-green-700' :
                                                            'bg-pink-100 text-pink-700'
                                                    }`}>
                                                    {p.category === 'ADULT' ? '大人' : p.category === 'CHILD' ? '子供' : '幼児'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">
                                                    {new Date(p.joinedAt).toLocaleDateString('ja-JP')}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveParticipant(p.id, p.username)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title="削除"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

