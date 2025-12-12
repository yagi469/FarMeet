'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Farm } from '@/types';
import { RecentlyViewedItem } from '@/lib/recentlyViewed';
import { getRecommendedFarms, getRecommendationReason } from '@/lib/recommendation';
import FarmCard from './FarmCard';

interface RecommendedFarmsProps {
    allFarms: Farm[];
    recentlyViewed: RecentlyViewedItem[];
    favoriteIds: Set<number>;
    ratingsMap: Map<number, { avgRating: number; count: number }>;
    pricesMap: Record<number, number>;
    onFavoriteChange: (farmId: number, isFavorite: boolean) => void;
}

export default function RecommendedFarms({
    allFarms,
    recentlyViewed,
    favoriteIds,
    ratingsMap,
    pricesMap,
    onFavoriteChange,
}: RecommendedFarmsProps) {
    // レコメンド農園を計算
    const recommendedFarms = useMemo(() => {
        return getRecommendedFarms(
            allFarms,
            recentlyViewed,
            Array.from(favoriteIds),
            ratingsMap,
            4 // 4件表示
        );
    }, [allFarms, recentlyViewed, favoriteIds, ratingsMap]);

    // レコメンドがない場合は表示しない
    if (recommendedFarms.length === 0) {
        return null;
    }

    return (
        <div className="mb-10">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">✨</span>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">あなたへのおすすめ</h2>
                        <p className="text-sm text-gray-500">
                            {recentlyViewed.length > 0
                                ? '閲覧履歴に基づいておすすめ'
                                : '人気の農園をピックアップ'}
                        </p>
                    </div>
                </div>
            </div>

            {/* カード一覧 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedFarms.map((farm) => (
                    <div key={farm.id} className="relative">
                        {/* おすすめ理由バッジ */}
                        <div className="absolute -top-2 left-3 z-10 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
                            {getRecommendationReason(farm, recentlyViewed, ratingsMap)}
                        </div>
                        <FarmCard
                            farm={farm}
                            isFavorite={favoriteIds.has(farm.id)}
                            onFavoriteChange={onFavoriteChange}
                            averageRating={ratingsMap.get(farm.id)?.avgRating}
                            reviewCount={ratingsMap.get(farm.id)?.count}
                            minPrice={pricesMap[farm.id]}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
