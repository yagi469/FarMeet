'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Gift, Plus, Search, RefreshCw, Copy, Link2, Check } from 'lucide-react';

interface GiftVoucher {
    id: number;
    code: string;
    amount: number;
    balance: number;
    status: string;
    expiresAt: string;
    isFreeIssue?: boolean;
    issueReason?: string;
    purchaserName?: string;
    redeemerName?: string;
    createdAt: string;
}

export default function GiftVouchersPage() {
    const [vouchers, setVouchers] = useState<GiftVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueAmount, setIssueAmount] = useState(3000);
    const [issueReason, setIssueReason] = useState('');
    const [issuing, setIssuing] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const getRedeemUrl = (code: string) => {
        return `https://farmeet.vercel.app/gift/redeem/${code}`;
    };

    const handleCopyCode = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleCopyLink = async (code: string) => {
        const url = getRedeemUrl(code);
        await navigator.clipboard.writeText(url);
        setCopiedCode(`link-${code}`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const data = await api.adminGetGiftVouchers();
            setVouchers(data);
        } catch (error) {
            console.error('ギフト券の取得に失敗しました:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIssue = async () => {
        if (!issueAmount || issueAmount <= 0) {
            alert('金額を入力してください');
            return;
        }
        setIssuing(true);
        try {
            await api.adminIssueGiftVoucher(issueAmount, issueReason || undefined);
            alert('ギフト券を発行しました');
            setShowIssueModal(false);
            setIssueAmount(3000);
            setIssueReason('');
            loadVouchers();
        } catch (error) {
            alert('発行に失敗しました');
        } finally {
            setIssuing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            ACTIVE: 'bg-green-100 text-green-800',
            USED: 'bg-gray-100 text-gray-800',
            EXPIRED: 'bg-red-100 text-red-800',
        };
        const labels: Record<string, string> = {
            PENDING: '未有効化',
            ACTIVE: '有効',
            USED: '使用済み',
            EXPIRED: '期限切れ',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const filteredVouchers = vouchers.filter(v =>
        v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.purchaserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.redeemerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Gift className="w-8 h-8 text-emerald-600" />
                    <h1 className="text-2xl font-bold text-gray-900">ギフト券管理</h1>
                </div>
                <button
                    onClick={() => setShowIssueModal(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    無料発行
                </button>
            </div>

            {/* 検索バー */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="コード、購入者、利用者で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={loadVouchers}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* 統計 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">総発行数</div>
                    <div className="text-2xl font-bold">{vouchers.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">有効</div>
                    <div className="text-2xl font-bold text-green-600">
                        {vouchers.filter(v => v.status === 'ACTIVE').length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">使用済み</div>
                    <div className="text-2xl font-bold text-gray-600">
                        {vouchers.filter(v => v.status === 'USED').length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">総残高</div>
                    <div className="text-2xl font-bold text-emerald-600">
                        ¥{vouchers.reduce((sum, v) => sum + v.balance, 0).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* テーブル */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">コード</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">金額</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">残高</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ステータス</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">種別</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">有効期限</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">発行日</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredVouchers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    ギフト券がありません
                                </td>
                            </tr>
                        ) : (
                            filteredVouchers.map((voucher) => (
                                <tr key={voucher.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm">{voucher.code}</span>
                                            <button
                                                onClick={() => handleCopyCode(voucher.code)}
                                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                                                title="コードをコピー"
                                            >
                                                {copiedCode === voucher.code ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleCopyLink(voucher.code)}
                                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                title="共有リンクをコピー"
                                            >
                                                {copiedCode === `link-${voucher.code}` ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Link2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">¥{voucher.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3">¥{voucher.balance.toLocaleString()}</td>
                                    <td className="px-4 py-3">{getStatusBadge(voucher.status)}</td>
                                    <td className="px-4 py-3">
                                        {voucher.isFreeIssue ? (
                                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                無料発行
                                            </span>
                                        ) : (
                                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                購入
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(voucher.expiresAt).toLocaleDateString('ja-JP')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(voucher.createdAt).toLocaleDateString('ja-JP')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 発行モーダル */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">無料ギフト券発行</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
                                <input
                                    type="number"
                                    value={issueAmount}
                                    onChange={(e) => setIssueAmount(Number(e.target.value))}
                                    className="w-full border rounded-lg px-3 py-2"
                                    min={100}
                                    step={100}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    発行理由（任意）
                                </label>
                                <textarea
                                    value={issueReason}
                                    onChange={(e) => setIssueReason(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows={3}
                                    placeholder="例: キャンペーン特典、お詫び対応など"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowIssueModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleIssue}
                                disabled={issuing}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                {issuing ? '発行中...' : '発行する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
