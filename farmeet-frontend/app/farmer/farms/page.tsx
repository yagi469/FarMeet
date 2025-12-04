'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Farm } from '@/types';

export default function MyFarmsPage() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFarms();
    }, []);

    const loadFarms = async () => {
        try {
            const data = await api.getMyFarms();
            setFarms(data);
        } catch (error) {
            console.error('農園読み込みエラー:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>読み込み中...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">農園管理</h1>
                <Link
                    href="/farmer/farms/new"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center"
                >
                    <span className="mr-2">+</span>
                    新しい農園を登録
                </Link>
            </div>

            {farms.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-md text-center">
                    <p className="text-gray-500 mb-4">登録されている農園はありません</p>
                    <Link
                        href="/farmer/farms/new"
                        className="text-green-600 hover:underline"
                    >
                        最初の農園を登録する
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {farms.map((farm) => (
                        <div key={farm.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {farm.imageUrl && (
                                <img
                                    src={farm.imageUrl}
                                    alt={farm.name}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-2">{farm.name}</h2>
                                <p className="text-gray-600 mb-4 line-clamp-2">{farm.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">📍 {farm.location}</span>
                                    <Link
                                        href={`/farmer/farms/${farm.id}`}
                                        className="text-green-600 hover:underline font-medium"
                                    >
                                        詳細・管理 &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
