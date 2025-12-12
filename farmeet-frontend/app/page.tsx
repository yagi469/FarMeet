'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { getRecentlyViewed, RecentlyViewedItem } from '@/lib/recentlyViewed';
import { Farm } from '@/types';
import FarmCard from '@/components/FarmCard';
import SearchBar from '@/components/SearchBar';
import LocationFilter from '@/components/LocationFilter';
import DatePicker from '@/components/DatePicker';
import GuestSelector from '@/components/GuestSelector';
import SeasonCalendar from '@/components/SeasonCalendar';
import FarmMapView from '@/components/FarmMapView';
import RecommendedFarms from '@/components/RecommendedFarms';
import { ProduceItem } from '@/lib/seasonData';

export default function Home() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [ratingsMap, setRatingsMap] = useState<Map<number, { avgRating: number; count: number }>>(new Map());
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [pricesMap, setPricesMap] = useState<Record<number, number>>({});
  const [isSearched, setIsSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    loadFarms();
    // 最近見た農園を読み込み
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const loadFarms = async () => {
    try {
      const data = await api.getFarms();
      setFarms(data);
      const farmIds = data.map((f: Farm) => f.id);
      // Load favorite status if user is logged in
      await loadFavoriteStatus(farmIds);
      // Load ratings for all farms
      await loadRatings(farmIds);
      // Load min prices for all farms
      await loadPrices(farmIds);
    } catch (error) {
      console.error('農園の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteStatus = async (farmIds: number[]) => {
    if (!authHelper.isAuthenticated() || farmIds.length === 0) {
      return;
    }
    try {
      const ids = await api.checkFavorites(farmIds);
      setFavoriteIds(new Set(ids));
    } catch (error) {
      console.error('お気に入り状態の取得に失敗しました:', error);
    }
  };

  const loadRatings = async (farmIds: number[]) => {
    if (farmIds.length === 0) return;
    try {
      const ratings = await api.getFarmRatings(farmIds);
      setRatingsMap(ratings);
    } catch (error) {
      console.error('評価データの取得に失敗しました:', error);
    }
  };

  const loadPrices = async (farmIds: number[]) => {
    if (farmIds.length === 0) return;
    try {
      const prices = await api.getMinPrices(farmIds);
      setPricesMap(prices);
    } catch (error) {
      console.error('価格データの取得に失敗しました:', error);
    }
  };

  const handleFavoriteChange = (farmId: number, isFavorite: boolean) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (isFavorite) {
        newSet.add(farmId);
      } else {
        newSet.delete(farmId);
      }
      return newSet;
    });
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleGuestsChange = (newAdults: number, newChildren: number) => {
    setAdults(newAdults);
    setChildren(newChildren);
  };




  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // カテゴリーは即時検索（タブなので）
    performSearch(searchKeyword, selectedLocation, selectedDate, adults, children, category, priceRange.min, priceRange.max);
  };

  const handlePriceChange = (min?: number, max?: number) => {
    setPriceRange({ min, max });
  };

  const handleSearchButtonClick = () => {
    performSearch(searchKeyword, selectedLocation, selectedDate, adults, children, selectedCategory, priceRange.min, priceRange.max);
  };

  // シーズンカレンダーから収穫物がクリックされた時のハンドラー
  const handleProduceClick = (produce: ProduceItem) => {
    // キーワードの最初の1つを使って検索
    const keyword = produce.keywords[0];
    setSearchKeyword(keyword);
    setSelectedCategory(produce.category);
    performSearch(keyword, selectedLocation, selectedDate, adults, children, produce.category, priceRange.min, priceRange.max);
  };

  const performSearch = async (keyword: string, location: string, date: string, adultsCount: number, childrenCount: number, category: string, minPrice?: number, maxPrice?: number) => {
    setLoading(true);
    try {
      const totalGuests = adultsCount + childrenCount;
      const data = await api.searchFarms(
        keyword || undefined,
        location || undefined,
        date || undefined,
        totalGuests > 0 ? totalGuests : undefined,
        category || undefined,
        minPrice,
        maxPrice
      );
      setFarms(data);
      setIsSearched(true);
      const farmIds = data.map((f: Farm) => f.id);
      // Reload favorite status for new farms
      await loadFavoriteStatus(farmIds);
      // Reload ratings for new farms
      await loadRatings(farmIds);
    } catch (error) {
      console.error('検索に失敗しました:', error);
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
      {/* 検索バー */}
      <SearchBar onSearch={handleSearch} />

      {/* Airbnb風検索エリア */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white rounded-3xl md:rounded-full shadow-lg p-4 md:p-2 md:pl-6 border border-gray-200">
          <div className="flex-1 px-4 py-2 md:py-0 border-b md:border-b-0 border-gray-100">
            <label className="text-xs font-bold text-gray-800 block mb-1">場所</label>
            <LocationFilter
              onLocationChange={handleLocationChange}
              selectedLocation={selectedLocation}
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-gray-300" />
          <div className="flex-1 px-4 py-2 md:py-0 border-b md:border-b-0 border-gray-100">
            <label className="text-xs font-bold text-gray-800 block mb-1">日程</label>
            <DatePicker
              onDateChange={handleDateChange}
              selectedDate={selectedDate}
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-gray-300" />
          <div className="flex-1 px-4 py-2 md:py-0 border-b md:border-b-0 border-gray-100">
            <label className="text-xs font-bold text-gray-800 block mb-1">人数</label>
            <GuestSelector
              onGuestsChange={handleGuestsChange}
              adults={adults}
              children={children}
            />
          </div>
          <div className="hidden md:block w-px h-8 bg-gray-300" />
          <div className="flex-1 px-4 py-2 md:py-0 mb-4 md:mb-0 min-w-[150px]">
            <label className="text-xs font-bold text-gray-800 block mb-1">価格帯</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={priceRange.max || 10000}
                onChange={(e) => {
                  const max = Number(e.target.value);
                  if (max === 10000) {
                    handlePriceChange(undefined, undefined);
                  } else {
                    handlePriceChange(0, max);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap min-w-[70px]">
                {priceRange.max === undefined ? '指定なし' : `〜¥${priceRange.max.toLocaleString()}`}
              </span>
            </div>
          </div>
          <button
            onClick={handleSearchButtonClick}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 md:p-4 w-full md:w-auto flex justify-center items-center transition-colors shadow-md"
          >
            <span className="md:hidden font-bold mr-2">検索</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* シーズンカレンダー - 検索していないときのみ表示 */}
      {!isSearched && (
        <SeasonCalendar onProduceClick={handleProduceClick} />
      )}



      {/* カテゴリータブ - Airbnbスタイル */}
      <div className="flex gap-8 mb-8 overflow-x-auto pb-4 border-b">
        <button
          onClick={() => handleCategoryChange('')}
          className={`flex flex-col items-center gap-2 pb-3 border-b-2 transition ${selectedCategory === '' ? 'border-gray-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'}`}
        >
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-medium whitespace-nowrap">すべての農園</span>
        </button>
        <button
          onClick={() => handleCategoryChange('FRUIT')}
          className={`flex flex-col items-center gap-2 pb-3 border-b-2 transition ${selectedCategory === 'FRUIT' ? 'border-gray-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'}`}
        >
          <span className="text-2xl">🍇</span>
          <span className="text-xs font-medium whitespace-nowrap">果物狩り</span>
        </button>
        <button
          onClick={() => handleCategoryChange('VEGETABLE')}
          className={`flex flex-col items-center gap-2 pb-3 border-b-2 transition ${selectedCategory === 'VEGETABLE' ? 'border-gray-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'}`}
        >
          <span className="text-2xl">🥕</span>
          <span className="text-xs font-medium whitespace-nowrap">野菜収穫</span>
        </button>
        <button
          onClick={() => handleCategoryChange('FLOWER')}
          className={`flex flex-col items-center gap-2 pb-3 border-b-2 transition ${selectedCategory === 'FLOWER' ? 'border-gray-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'}`}
        >
          <span className="text-2xl">🌸</span>
          <span className="text-xs font-medium whitespace-nowrap">花摽み</span>
        </button>
      </div>

      {/* 最近見た農園 - 検索していないときのみ表示 */}
      {!isSearched && recentlyViewed.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">🕒 最近見た農園</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {recentlyViewed.map((item) => (
              <Link
                key={item.id}
                href={`/farms/${item.id}`}
                className="flex-shrink-0 w-48 group"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                      <span className="text-4xl">🌾</span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 truncate group-hover:text-green-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">{item.location}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* おすすめ農園 - 検索していないときのみ表示 */}
      {!isSearched && farms.length > 0 && (
        <RecommendedFarms
          allFarms={farms}
          recentlyViewed={recentlyViewed}
          favoriteIds={favoriteIds}
          ratingsMap={ratingsMap}
          pricesMap={pricesMap}
          onFavoriteChange={handleFavoriteChange}
        />
      )}

      {/* 農園一覧 */}
      {farms.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-500 text-lg">まだ農園が登録されていません</p>
        </div>
      ) : (
        <>
          {/* タイトルと表示切替タブ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {isSearched ? `検索結果（${farms.length}件）` : 'すべての農園'}
            </h2>

            {/* リスト/マップ切り替えタブ - 強調デザイン */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">表示:</span>
              <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${viewMode === 'list'
                    ? 'bg-white shadow-md text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="text-sm">リスト</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${viewMode === 'map'
                    ? 'bg-green-600 shadow-md text-white font-medium'
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                    }`}
                >
                  {/* NEWバッジ */}
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    NEW
                  </span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">地図で探す</span>
                </button>
              </div>
            </div>
          </div>

          {/* マップ表示 */}
          {viewMode === 'map' && (
            <div className="mb-8">
              <FarmMapView farms={farms} />
            </div>
          )}

          {/* リスト表示 */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {farms.map((farm) => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  isFavorite={favoriteIds.has(farm.id)}
                  onFavoriteChange={handleFavoriteChange}
                  averageRating={ratingsMap.get(farm.id)?.avgRating}
                  reviewCount={ratingsMap.get(farm.id)?.count}
                  minPrice={pricesMap[farm.id]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
