/**
 * シーズンカレンダー用マスターデータ
 * 収穫物ごとの旬情報を定義
 */

export interface ProduceItem {
    id: string;
    name: string;        // 表示名（例: いちご）
    keywords: string[];  // イベントタイトルで検索するキーワード
    emoji: string;       // アイコン
    category: 'FRUIT' | 'VEGETABLE' | 'FLOWER';
    months: number[];    // 旬の月（1-12）
}

/**
 * 収穫物マスターデータ
 * 日本の一般的な収穫時期を基準に設定
 */
export const PRODUCE_ITEMS: ProduceItem[] = [
    // 果物
    {
        id: 'strawberry',
        name: 'いちご',
        keywords: ['いちご', 'イチゴ', '苺', 'ストロベリー'],
        emoji: '🍓',
        category: 'FRUIT',
        months: [12, 1, 2, 3, 4, 5]
    },
    {
        id: 'cherry',
        name: 'さくらんぼ',
        keywords: ['さくらんぼ', 'サクランボ', 'チェリー'],
        emoji: '🍒',
        category: 'FRUIT',
        months: [5, 6, 7]
    },
    {
        id: 'peach',
        name: '桃',
        keywords: ['桃', 'もも', 'ピーチ'],
        emoji: '🍑',
        category: 'FRUIT',
        months: [6, 7, 8]
    },
    {
        id: 'grape',
        name: 'ぶどう',
        keywords: ['ぶどう', 'ブドウ', '葡萄', 'マスカット', 'シャインマスカット', '巨峰'],
        emoji: '🍇',
        category: 'FRUIT',
        months: [7, 8, 9, 10]
    },
    {
        id: 'pear',
        name: '梨',
        keywords: ['梨', 'なし', 'ナシ'],
        emoji: '🍐',
        category: 'FRUIT',
        months: [8, 9, 10]
    },
    {
        id: 'apple',
        name: 'りんご',
        keywords: ['りんご', 'リンゴ', '林檎', 'アップル'],
        emoji: '🍎',
        category: 'FRUIT',
        months: [9, 10, 11, 12]
    },
    {
        id: 'mikan',
        name: 'みかん',
        keywords: ['みかん', 'ミカン', '蜜柑', 'オレンジ', '柑橘'],
        emoji: '🍊',
        category: 'FRUIT',
        months: [10, 11, 12, 1, 2]
    },
    {
        id: 'blueberry',
        name: 'ブルーベリー',
        keywords: ['ブルーベリー'],
        emoji: '🫐',
        category: 'FRUIT',
        months: [6, 7, 8]
    },
    {
        id: 'mango',
        name: 'マンゴー',
        keywords: ['マンゴー'],
        emoji: '🥭',
        category: 'FRUIT',
        months: [5, 6, 7, 8]
    },
    {
        id: 'pineapple',
        name: 'パイナップル',
        keywords: ['パイナップル', 'パイン'],
        emoji: '🍍',
        category: 'FRUIT',
        months: [4, 5, 6, 7]
    },
    {
        id: 'melon',
        name: 'メロン',
        keywords: ['メロン'],
        emoji: '🍈',
        category: 'FRUIT',
        months: [5, 6, 7, 8]
    },
    {
        id: 'watermelon',
        name: 'スイカ',
        keywords: ['スイカ', 'すいか', '西瓜'],
        emoji: '🍉',
        category: 'FRUIT',
        months: [6, 7, 8]
    },

    // 野菜
    {
        id: 'tomato',
        name: 'トマト',
        keywords: ['トマト', 'とまと', 'ミニトマト'],
        emoji: '🍅',
        category: 'VEGETABLE',
        months: [6, 7, 8, 9]
    },
    {
        id: 'corn',
        name: 'とうもろこし',
        keywords: ['とうもろこし', 'トウモロコシ', 'コーン'],
        emoji: '🌽',
        category: 'VEGETABLE',
        months: [6, 7, 8, 9]
    },
    {
        id: 'potato',
        name: 'じゃがいも',
        keywords: ['じゃがいも', 'ジャガイモ', 'ポテト'],
        emoji: '🥔',
        category: 'VEGETABLE',
        months: [5, 6, 7, 9, 10, 11]
    },
    {
        id: 'sweetpotato',
        name: 'さつまいも',
        keywords: ['さつまいも', 'サツマイモ', '芋掘り'],
        emoji: '🍠',
        category: 'VEGETABLE',
        months: [9, 10, 11]
    },
    {
        id: 'carrot',
        name: 'にんじん',
        keywords: ['にんじん', 'ニンジン', '人参'],
        emoji: '🥕',
        category: 'VEGETABLE',
        months: [4, 5, 6, 7, 10, 11, 12]
    },
    {
        id: 'daikon',
        name: '大根',
        keywords: ['大根', 'だいこん', 'ダイコン'],
        emoji: '🥬',
        category: 'VEGETABLE',
        months: [10, 11, 12, 1, 2]
    },
    {
        id: 'eggplant',
        name: 'なす',
        keywords: ['なす', 'ナス', '茄子'],
        emoji: '🍆',
        category: 'VEGETABLE',
        months: [6, 7, 8, 9, 10]
    },
    {
        id: 'cucumber',
        name: 'きゅうり',
        keywords: ['きゅうり', 'キュウリ', '胡瓜'],
        emoji: '🥒',
        category: 'VEGETABLE',
        months: [5, 6, 7, 8, 9]
    },
    {
        id: 'pumpkin',
        name: 'かぼちゃ',
        keywords: ['かぼちゃ', 'カボチャ', '南瓜'],
        emoji: '🎃',
        category: 'VEGETABLE',
        months: [7, 8, 9, 10, 11, 12]
    },

    // 花
    {
        id: 'sunflower',
        name: 'ひまわり',
        keywords: ['ひまわり', 'ヒマワリ', '向日葵'],
        emoji: '🌻',
        category: 'FLOWER',
        months: [7, 8, 9]
    },
    {
        id: 'tulip',
        name: 'チューリップ',
        keywords: ['チューリップ'],
        emoji: '🌷',
        category: 'FLOWER',
        months: [3, 4, 5]
    },
    {
        id: 'sakura',
        name: '桜',
        keywords: ['桜', 'さくら', 'サクラ'],
        emoji: '🌸',
        category: 'FLOWER',
        months: [3, 4]
    },
    {
        id: 'rose',
        name: 'バラ',
        keywords: ['バラ', 'ばら', '薔薇', 'ローズ'],
        emoji: '🌹',
        category: 'FLOWER',
        months: [5, 6, 10, 11]
    },
    {
        id: 'cosmos',
        name: 'コスモス',
        keywords: ['コスモス', '秋桜'],
        emoji: '🌼',
        category: 'FLOWER',
        months: [9, 10, 11]
    },
    {
        id: 'lavender',
        name: 'ラベンダー',
        keywords: ['ラベンダー'],
        emoji: '💜',
        category: 'FLOWER',
        months: [6, 7, 8]
    },
];

/**
 * 月名（日本語）
 */
export const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

/**
 * 指定した月に旬の収穫物を取得
 * @param month 月（1-12）
 * @returns 旬の収穫物リスト
 */
export function getProduceByMonth(month: number): ProduceItem[] {
    return PRODUCE_ITEMS.filter(item => item.months.includes(month));
}

/**
 * カテゴリでフィルタした旬の収穫物を取得
 * @param month 月（1-12）
 * @param category カテゴリ
 * @returns フィルタされた収穫物リスト
 */
export function getProduceByMonthAndCategory(month: number, category: 'FRUIT' | 'VEGETABLE' | 'FLOWER'): ProduceItem[] {
    return PRODUCE_ITEMS.filter(item => item.months.includes(month) && item.category === category);
}

/**
 * 現在の月を取得（1-12）
 */
export function getCurrentMonth(): number {
    return new Date().getMonth() + 1;
}
