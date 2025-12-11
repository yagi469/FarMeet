import { Metadata } from 'next';
import FarmDetailClient from './FarmDetailClient';

// バックエンドAPIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// サーバーサイドで農園データを取得
async function getFarm(id: number) {
    try {
        const res = await fetch(`${API_BASE_URL}/farms/${id}`, {
            cache: 'no-store', // 常に最新データを取得
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Failed to fetch farm:', error);
        return null;
    }
}

// 動的メタデータ生成（OGP対応）
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const farmId = Number(id);
    const farm = await getFarm(farmId);

    if (!farm) {
        return {
            title: '農園が見つかりません | FarMeet',
            description: '指定された農園は見つかりませんでした。',
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // 画像URLの場合も同様にbaseUrlを使用
    const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(farm.name)}&description=${encodeURIComponent(farm.description || '')}&location=${encodeURIComponent(farm.location || '')}&image=${encodeURIComponent(farm.imageUrl || '')}`;

    return {
        title: `${farm.name} | FarMeet`,
        description: farm.description || '農業体験予約はFarMeetで',
        openGraph: {
            title: farm.name,
            description: farm.description || '農業体験予約はFarMeetで',
            url: `${baseUrl}/farms/${farmId}`,
            siteName: 'FarMeet',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: farm.name,
                },
            ],
            type: 'website',
            locale: 'ja_JP',
        },
        twitter: {
            card: 'summary_large_image',
            title: farm.name,
            description: farm.description || '農業体験予約はFarMeetで',
            images: [ogImageUrl],
        },
    };
}

// サーバーコンポーネント（ページ本体）
export default async function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const farmId = Number(id);

    // 初期データをサーバーサイドで取得してクライアントに渡す
    const farm = await getFarm(farmId);

    return <FarmDetailClient farmId={farmId} initialFarm={farm} />;
}
