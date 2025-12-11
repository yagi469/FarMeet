'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { Farm } from '@/types';
import FarmCard from '@/components/FarmCard';
import SearchBar from '@/components/SearchBar';
import LocationFilter from '@/components/LocationFilter';
import DatePicker from '@/components/DatePicker';
import GuestSelector from '@/components/GuestSelector';

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

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const data = await api.getFarms();
      setFarms(data);
      // Load favorite status if user is logged in
      await loadFavoriteStatus(data.map((f: Farm) => f.id));
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

  const handleSearch = async (keyword: string) => {
    setSearchKeyword(keyword);
    await performSearch(keyword, selectedLocation, selectedDate, adults, children, selectedCategory);
  };

  const handleLocationChange = async (location: string) => {
    setSelectedLocation(location);
    await performSearch(searchKeyword, location, selectedDate, adults, children, selectedCategory);
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    await performSearch(searchKeyword, selectedLocation, date, adults, children, selectedCategory);
  };

  const handleGuestsChange = async (newAdults: number, newChildren: number) => {
    setAdults(newAdults);
    setChildren(newChildren);
    await performSearch(searchKeyword, selectedLocation, selectedDate, newAdults, newChildren, selectedCategory);
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    await performSearch(searchKeyword, selectedLocation, selectedDate, adults, children, category);
  };

  const performSearch = async (keyword: string, location: string, date: string, adultsCount: number, childrenCount: number, category: string) => {
    setLoading(true);
    try {
      const totalGuests = adultsCount + childrenCount;
      const data = await api.searchFarms(
        keyword || undefined,
        location || undefined,
        date || undefined,
        totalGuests > 0 ? totalGuests : undefined,
        category || undefined
      );
      setFarms(data);
      // Reload favorite status for new farms
      await loadFavoriteStatus(data.map((f: Farm) => f.id));
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
          <div className="flex-1 px-4 py-2 md:py-0 mb-4 md:mb-0">
            <label className="text-xs font-bold text-gray-800 block mb-1">人数</label>
            <GuestSelector
              onGuestsChange={handleGuestsChange}
              adults={adults}
              children={children}
            />
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 md:p-4 w-full md:w-auto flex justify-center items-center transition-colors shadow-md">
            <span className="md:hidden font-bold mr-2">検索</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>



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
              <FarmCard
                key={farm.id}
                farm={farm}
                isFavorite={favoriteIds.has(farm.id)}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

