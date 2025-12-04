'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Header() {
    const { isAuthenticated, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <span className="text-2xl font-bold text-green-600">FarMeet</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
                            農園一覧
                        </Link>
                        {isAuthenticated && (
                            <Link href="/reservations" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
                                予約一覧
                            </Link>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 border border-gray-300 rounded-full py-2 px-4 hover:shadow-md transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                                        👤
                                    </div>
                                </button>

                                {isMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                プロファイル
                                            </Link>
                                            <Link
                                                href="/reservations"
                                                className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 md:hidden"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                予約一覧
                                            </Link>
                                            <hr className="my-2" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                ログアウト
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-full hover:bg-gray-50 transition"
                                >
                                    ログイン
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full transition"
                                >
                                    新規登録
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
