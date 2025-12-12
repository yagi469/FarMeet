'use client';

import { useState, useRef, useEffect } from 'react';
import { PRODUCE_ITEMS, MONTH_NAMES, getCurrentMonth, ProduceItem } from '@/lib/seasonData';

interface SeasonCalendarProps {
    onProduceClick: (produce: ProduceItem) => void;
}

export default function SeasonCalendar({ onProduceClick }: SeasonCalendarProps) {
    const currentMonth = getCurrentMonth();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // 現在月を中央に表示するスクロール
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const monthWidth = 120; // 1ヶ月分の幅（px）
            const scrollPosition = (currentMonth - 1) * monthWidth - container.clientWidth / 2 + monthWidth / 2;
            container.scrollLeft = Math.max(0, scrollPosition);
        }
    }, [currentMonth]);

    // 月ごとの旬の収穫物を取得
    const getProduceForMonth = (month: number) => {
        return PRODUCE_ITEMS.filter(item => item.months.includes(month));
    };

    // カテゴリ別にグループ化
    const groupByCategory = (items: ProduceItem[]) => {
        const grouped: { FRUIT: ProduceItem[]; VEGETABLE: ProduceItem[]; FLOWER: ProduceItem[] } = {
            FRUIT: [],
            VEGETABLE: [],
            FLOWER: []
        };
        items.forEach(item => {
            grouped[item.category].push(item);
        });
        return grouped;
    };

    const selectedProduces = getProduceForMonth(selectedMonth);
    const groupedProduces = groupByCategory(selectedProduces);

    return (
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 shadow-sm border border-green-100">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    <h2 className="text-lg font-bold text-gray-900">シーズンカレンダー</h2>
                </div>
                <p className="text-sm text-gray-600">今月は <span className="font-bold text-green-600">{MONTH_NAMES[currentMonth - 1]}</span></p>
            </div>

            {/* 月選択バー */}
            <div
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {MONTH_NAMES.map((name, index) => {
                    const month = index + 1;
                    const isCurrent = month === currentMonth;
                    const isSelected = month === selectedMonth;
                    const produceCount = getProduceForMonth(month).length;

                    return (
                        <button
                            key={month}
                            onClick={() => setSelectedMonth(month)}
                            className={`
                flex-shrink-0 min-w-[100px] px-4 py-3 rounded-2xl transition-all duration-200
                ${isSelected
                                    ? 'bg-green-600 text-white shadow-lg scale-105'
                                    : isCurrent
                                        ? 'bg-green-100 text-green-800 border-2 border-green-600'
                                        : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                                }
              `}
                        >
                            <div className="font-bold text-center">{name}</div>
                            <div className={`text-xs text-center mt-1 ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                                {produceCount}種類
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 選択月の旬の収穫物 */}
            <div className="space-y-4">
                {/* 果物 */}
                {groupedProduces.FRUIT.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                            <span>🍇</span> 果物
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {groupedProduces.FRUIT.map(produce => (
                                <button
                                    key={produce.id}
                                    onClick={() => onProduceClick(produce)}
                                    className="flex items-center gap-2 bg-white hover:bg-red-50 active:bg-red-100 px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:border-red-300 transition-all hover:scale-105"
                                >
                                    <span className="text-xl">{produce.emoji}</span>
                                    <span className="text-sm font-medium text-gray-800">{produce.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 野菜 */}
                {groupedProduces.VEGETABLE.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                            <span>🥕</span> 野菜
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {groupedProduces.VEGETABLE.map(produce => (
                                <button
                                    key={produce.id}
                                    onClick={() => onProduceClick(produce)}
                                    className="flex items-center gap-2 bg-white hover:bg-orange-50 active:bg-orange-100 px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:border-orange-300 transition-all hover:scale-105"
                                >
                                    <span className="text-xl">{produce.emoji}</span>
                                    <span className="text-sm font-medium text-gray-800">{produce.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 花 */}
                {groupedProduces.FLOWER.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                            <span>🌸</span> 花
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {groupedProduces.FLOWER.map(produce => (
                                <button
                                    key={produce.id}
                                    onClick={() => onProduceClick(produce)}
                                    className="flex items-center gap-2 bg-white hover:bg-pink-50 active:bg-pink-100 px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:border-pink-300 transition-all hover:scale-105"
                                >
                                    <span className="text-xl">{produce.emoji}</span>
                                    <span className="text-sm font-medium text-gray-800">{produce.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 旬のものがない場合 */}
                {selectedProduces.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <span className="text-4xl block mb-2">🌾</span>
                        <p>この月の旬情報はまだ登録されていません</p>
                    </div>
                )}
            </div>

            {/* ヒント */}
            <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs text-gray-500 text-center">
                    💡 収穫物をクリックすると、その体験ができる農園を検索できます
                </p>
            </div>
        </div>
    );
}
