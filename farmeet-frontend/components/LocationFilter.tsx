'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface LocationFilterProps {
    onLocationChange: (location: string) => void;
    selectedLocation: string;
}

// 地方別の分類マッピング
const regionGroups: { [key: string]: string[] } = {
    '北海道': ['北海道'],
    '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    '関東': ['東京都', '神奈川県', '埼玉県', '千葉県', '茨城県', '栃木県', '群馬県'],
    '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
    '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
    '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
};

// 地域から地方を取得
const getRegion = (location: string): string => {
    for (const [region, prefectures] of Object.entries(regionGroups)) {
        if (prefectures.some(pref => location.includes(pref) || location.startsWith(pref.slice(0, -1)))) {
            return region;
        }
    }
    return 'その他';
};

// 地域をグループ化
const groupLocationsByRegion = (locations: string[]): { [key: string]: string[] } => {
    const grouped: { [key: string]: string[] } = {};

    locations.forEach(location => {
        const region = getRegion(location);
        if (!grouped[region]) {
            grouped[region] = [];
        }
        grouped[region].push(location);
    });

    return grouped;
};

// 地方の表示順序
const regionOrder = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄', 'その他'];

export default function LocationFilter({ onLocationChange, selectedLocation }: LocationFilterProps) {
    const [locations, setLocations] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            const data = await api.getLocations();
            setLocations(data);
        } catch (error) {
            console.error('地域一覧の取得に失敗しました:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupedLocations = groupLocationsByRegion(locations);

    return (
        <div className="relative w-full">
            <select
                value={selectedLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                disabled={loading}
                className="appearance-none w-full bg-transparent border-none focus:outline-none cursor-pointer text-sm text-gray-600 pr-8"
            >
                <option value="">どこに行きますか？</option>
                {regionOrder.map(region => {
                    const regionLocations = groupedLocations[region];
                    if (!regionLocations || regionLocations.length === 0) return null;

                    return (
                        <optgroup key={region} label={`【${region}】`}>
                            {regionLocations.map(location => (
                                <option key={location} value={location}>
                                    {location}
                                </option>
                            ))}
                        </optgroup>
                    );
                })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}
