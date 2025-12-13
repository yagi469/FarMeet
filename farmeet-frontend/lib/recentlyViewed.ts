// 最近見た農園の管理（localStorage使用）

const STORAGE_KEY = 'farmeet_recently_viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
    id: number;
    publicId?: string;
    name: string;
    imageUrl?: string;
    location: string;
    viewedAt: number;
}

/**
 * 最近見た農園リストを取得
 */
export function getRecentlyViewed(): RecentlyViewedItem[] {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch {
        return [];
    }
}

/**
 * 農園を最近見たリストに追加
 */
export function addToRecentlyViewed(item: Omit<RecentlyViewedItem, 'viewedAt'>): void {
    if (typeof window === 'undefined') return;

    try {
        const list = getRecentlyViewed();

        // 既に存在する場合は削除（後で先頭に追加するため）
        const filtered = list.filter(i => i.id !== item.id);

        // 先頭に追加
        const newItem: RecentlyViewedItem = {
            ...item,
            viewedAt: Date.now(),
        };
        filtered.unshift(newItem);

        // 最大件数を超えたら古いものを削除
        const trimmed = filtered.slice(0, MAX_ITEMS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
        console.error('Failed to save recently viewed:', error);
    }
}

/**
 * 最近見たリストをクリア
 */
export function clearRecentlyViewed(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
