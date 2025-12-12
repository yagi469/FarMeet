'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { Farm } from '@/types';
import FarmCard from '@/components/FarmCard';
import Link from 'next/link';

export default function FavoritesPage() {
    const router = useRouter();
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [ratings, setRatings] = useState<Record<number, { averageRating: number; reviewCount: number }>>({});
    const [minPrices, setMinPrices] = useState<Record<number, number>>({});

    useEffect(() => {
        if (!authHelper.isAuthenticated()) {
            router.push('/login?redirect=/favorites');
            return;
        }
        loadFavorites();
    }, [router]);

    const loadFavorites = async () => {
        try {
            const data = await api.getFavorites();
            setFarms(data as Farm[]);

            // レビュー情報と最安価格を取得
            if (data.length > 0) {
                const farmIds = data.map((f) => f.id);

                // 各農園のレビュー情報を取得
                const ratingsData: Record<number, { averageRating: number; reviewCount: number }> = {};
                for (const farm of data) {
                    try {
                        const reviewData = await api.getReviews(farm.id);
                        ratingsData[farm.id] = {
                            averageRating: reviewData.averageRating,
                            reviewCount: reviewData.reviewCount
                        };
                    } catch {
                        // レビュー取得失敗は無視
                    }
                }
                setRatings(ratingsData);

                // 最安価格を取得
                try {
                    const prices = await api.getMinPrices(farmIds);
                    setMinPrices(prices);
                } catch {
                    // 価格取得失敗は無視
                }
            }
        } catch (error) {
            console.error('お気に入りの読み込みに失敗しました:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteChange = (farmId: number, isFavorite: boolean) => {
        if (!isFavorite) {
            // Remove from list when unfavorited
            setFarms(prev => prev.filter(f => f.id !== farmId));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">お気に入りの農園</h1>
                <Link
                    href="/"
                    className="text-green-600 hover:text-green-700 font-medium"
                >
                    ← 農園一覧に戻る
                </Link>
            </div>

            {farms.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">💚</div>
                    <p className="text-gray-500 text-lg mb-4">お気に入りの農園がありません</p>
                    <Link
                        href="/"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        農園を探す
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {farms.map((farm) => (
                        <FarmCard
                            key={farm.id}
                            farm={farm}
                            isFavorite={true}
                            onFavoriteChange={handleFavoriteChange}
                            averageRating={ratings[farm.id]?.averageRating}
                            reviewCount={ratings[farm.id]?.reviewCount}
                            minPrice={minPrices[farm.id]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

