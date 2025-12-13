import { Metadata } from 'next';
import FarmDetailClient from './FarmDetailClient';

// バックエンドAPIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// サーバーサイドで農園データを取得（publicId対応）
async function getFarm(publicId: string) {
    try {
        // UUIDかどうか判定（ハイフンを含む36文字）
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(publicId);
        const endpoint = isUuid
            ? `${API_BASE_URL}/farms/p/${publicId}`
            : `${API_BASE_URL}/farms/${publicId}`;

        const res = await fetch(endpoint, {
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
    const farm = await getFarm(id);

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

    // publicIdがある場合はそれを使用、なければ数値IDで
    const farmUrl = farm.publicId ? `${baseUrl}/farms/${farm.publicId}` : `${baseUrl}/farms/${farm.id}`;

    return {
        title: `${farm.name} | FarMeet`,
        description: farm.description || '農業体験予約はFarMeetで',
        openGraph: {
            title: farm.name,
            description: farm.description || '農業体験予約はFarMeetで',
            url: farmUrl,
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

    // 初期データをサーバーサイドで取得してクライアントに渡す
    const farm = await getFarm(id);

    // farmIdとして内部IDを使用（イベント取得などで必要）
    const farmId = farm?.id ?? 0;

    return <FarmDetailClient farmId={farmId} initialFarm={farm} />;
}
