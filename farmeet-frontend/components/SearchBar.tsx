'use client';

import { useState } from 'react';

interface SearchBarProps {
    onSearch: (keyword: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [keyword, setKeyword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(keyword);
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
                    placeholder="農園名や地域で検索..."
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
