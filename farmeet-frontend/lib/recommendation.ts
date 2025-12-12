// おすすめ農園のレコメンドロジック

import { Farm } from '@/types';
import { RecentlyViewedItem } from './recentlyViewed';

interface FarmWithScore {
    farm: Farm;
    score: number;
}

interface RatingInfo {
    avgRating: number;
    count: number;
}

/**
 * 閲覧履歴から地域の傾向を抽出
 */
function extractLocationPreferences(recentlyViewed: RecentlyViewedItem[]): Map<string, number> {
    const locationCounts = new Map<string, number>();

    recentlyViewed.forEach(item => {
        // 都道府県を抽出（例: "埼玉県秩父市" → "埼玉県"）
        const prefecture = extractPrefecture(item.location);
        if (prefecture) {
            locationCounts.set(prefecture, (locationCounts.get(prefecture) || 0) + 1);
        }
    });

    return locationCounts;
}

/**
 * 都道府県を抽出
 */
function extractPrefecture(location: string): string | null {
    const match = location.match(/^(.+?[都道府県])/);
    return match ? match[1] : null;
}

/**
 * 農園のレコメンドスコアを計算
 */
function calculateScore(
    farm: Farm,
    recentlyViewedIds: Set<number>,
    favoriteIds: Set<number>,
    locationPreferences: Map<string, number>,
    ratingsMap: Map<number, RatingInfo>
): number {
    let score = 0;

    // 1. 地域一致ボーナス（閲覧履歴と同じ都道府県）
    const farmPrefecture = extractPrefecture(farm.location);
    if (farmPrefecture && locationPreferences.has(farmPrefecture)) {
        const locationCount = locationPreferences.get(farmPrefecture) || 0;
        score += 30 * Math.min(locationCount, 3); // 最大90点
    }

    // 2. 評価ボーナス（4.0以上で加点）
    const ratingInfo = ratingsMap.get(farm.id);
    if (ratingInfo && ratingInfo.avgRating >= 4.0) {
        score += 15 + (ratingInfo.avgRating - 4.0) * 10; // 4.0で15点、5.0で25点
        // レビュー数ボーナス
        score += Math.min(ratingInfo.count, 5) * 2; // 最大10点
    }

    // 3. 未閲覧ボーナス（まだ見ていない農園を優先）
    if (!recentlyViewedIds.has(farm.id)) {
        score += 10;
    }

    // 4. お気に入りでないボーナス（すでにお気に入りなら下げる）
    if (!favoriteIds.has(farm.id)) {
        score += 5;
    }

    return score;
}

/**
 * おすすめ農園を取得
 */
export function getRecommendedFarms(
    allFarms: Farm[],
    recentlyViewed: RecentlyViewedItem[],
    favoriteIds: number[],
    ratingsMap: Map<number, RatingInfo>,
    limit: number = 4
): Farm[] {
    // 閲覧履歴がない場合は高評価順で返す
    if (recentlyViewed.length === 0) {
        return allFarms
            .filter(farm => !favoriteIds.includes(farm.id))
            .sort((a, b) => {
                const ratingA = ratingsMap.get(a.id)?.avgRating || 0;
                const ratingB = ratingsMap.get(b.id)?.avgRating || 0;
                return ratingB - ratingA;
            })
            .slice(0, limit);
    }

    // 閲覧済みIDのセットを作成
    const recentlyViewedIds = new Set(recentlyViewed.map(item => item.id));
    const favoriteIdsSet = new Set(favoriteIds);

    // 地域傾向を抽出
    const locationPreferences = extractLocationPreferences(recentlyViewed);

    // 各農園にスコアを付与
    const farmsWithScores: FarmWithScore[] = allFarms
        .filter(farm => !recentlyViewedIds.has(farm.id) || recentlyViewed.length >= 5)
        .map(farm => ({
            farm,
            score: calculateScore(farm, recentlyViewedIds, favoriteIdsSet, locationPreferences, ratingsMap)
        }));

    // スコア順にソートして上位を返す
    return farmsWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.farm);
}

/**
 * レコメンドの理由を生成
 */
export function getRecommendationReason(
    farm: Farm,
    recentlyViewed: RecentlyViewedItem[],
    ratingsMap: Map<number, RatingInfo>
): string {
    const farmPrefecture = extractPrefecture(farm.location);
    const viewedPrefectures = recentlyViewed.map(item => extractPrefecture(item.location));

    // 地域一致の場合
    if (farmPrefecture && viewedPrefectures.includes(farmPrefecture)) {
        return `${farmPrefecture}の農園に興味がありそうですね`;
    }

    // 高評価の場合
    const ratingInfo = ratingsMap.get(farm.id);
    if (ratingInfo && ratingInfo.avgRating >= 4.5) {
        return `評価 ${ratingInfo.avgRating.toFixed(1)} の人気農園`;
    }

    if (ratingInfo && ratingInfo.count >= 5) {
        return `${ratingInfo.count}件のレビューで高評価`;
    }

    return 'あなたにおすすめ';
}
