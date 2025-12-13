'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface FarmSuggestion {
    id: number;
    name: string;
    location: string;
    imageUrl: string;
    rating?: number;
    reviewCount?: number;
    reason?: string;
}

interface SearchBarProps {
    onSearch: (keyword: string) => void;
    onAiSearch?: (suggestions: FarmSuggestion[], message: string) => void;
}

export default function SearchBar({ onSearch, onAiSearch }: SearchBarProps) {
    const [keyword, setKeyword] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(keyword);
    };

    const handleAiSearch = async () => {
        if (!keyword.trim() || isAiLoading) return;

        setIsAiLoading(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
            const response = await fetch(`${apiBaseUrl}/ai/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: keyword }),
            });

            if (response.ok) {
                const data = await response.json();
                if (onAiSearch) {
                    const message = data.message || data.error || '';
                    onAiSearch(data.suggestions || [], message);
                }
            }
        } catch (error) {
            console.error('AI search error:', error);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-2 bg-white rounded-full shadow-md border border-gray-200 px-6 py-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="いちご狩り、子連れで楽しめる農園..."
                    className="flex-1 border-none focus:outline-none text-gray-700 placeholder-gray-400"
                />
                {keyword && (
                    <button
                        type="button"
                        onClick={() => {
                            setKeyword('');
                            onSearch('');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
                {/* AI Search Button */}
                <button
                    type="button"
                    onClick={handleAiSearch}
                    disabled={!keyword.trim() || isAiLoading}
                    className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="AIがおすすめの農園を提案します"
                >
                    {isAiLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">AI</span>
                </button>
                {/* Normal Search Button */}
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
        </form>
    );
}

