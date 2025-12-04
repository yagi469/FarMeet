'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Farm } from '@/types';
import FarmCard from '@/components/FarmCard';

export default function Home() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const data = await api.getFarms();
      setFarms(data);
    } catch (error) {
      console.error('農園の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
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
      {/* 検索エリア - Airbnbスタイル */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white rounded-full shadow-lg p-4 border border-gray-200">
          <div className="flex-1 px-4">
            <label className="text-xs font-semibold text-gray-700">場所</label>
            <input
              type="text"
              placeholder="どこに行きますか？"
              className="w-full border-none focus:outline-none text-sm"
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-gray-300" />
          <div className="flex-1 px-4">
            <label className="text-xs font-semibold text-gray-700">日程</label>
            <input
              type="text"
              placeholder="日程を追加"
              className="w-full border-none focus:outline-none text-sm"
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-gray-300" />
          <div className="flex-1 px-4">
            <label className="text-xs font-semibold text-gray-700">人数</label>
            <input
              type="text"
              placeholder="ゲストを追加"
              className="w-full border-none focus:outline-none text-sm"
            />
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* カテゴリータブ - Airbnbスタイル */}
      <div className="flex gap-8 mb-8 overflow-x-auto pb-4 border-b">
        <button className="flex flex-col items-center gap-2 pb-3 border-b-2 border-gray-900 opacity-100 hover:border-gray-500 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium whitespace-nowrap">すべての農園</span>
        </button>
        <button className="flex flex-col items-center gap-2 pb-3 border-b-2 border-transparent opacity-60 hover:opacity-100 hover:border-gray-300 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-xs font-medium whitespace-nowrap">果物狩り</span>
        </button>
        <button className="flex flex-col items-center gap-2 pb-3 border-b-2 border-transparent opacity-60 hover:opacity-100 hover:border-gray-300 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="text-xs font-medium whitespace-nowrap">野菜収穫</span>
        </button>
        <button className="flex flex-col items-center gap-2 pb-3 border-b-2 border-transparent opacity-60 hover:opacity-100 hover:border-gray-300 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-xs font-medium whitespace-nowrap">花摘み</span>
        </button>
      </div>

      {/* 農園一覧 */}
      {farms.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-500 text-lg">まだ農園が登録されていません</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">おすすめの農園</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {farms.map((farm) => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
