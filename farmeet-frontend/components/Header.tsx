'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authHelper } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsAuthenticated(authHelper.isAuthenticated());
    }, []);

    const handleLogout = () => {
        authHelper.logout();
        setIsAuthenticated(false);
        router.push('/');
    };

    return (
        <header className="bg-green-600 text-white shadow-md">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    FarMeet
                </Link>
                <div className="flex gap-4 items-center">
                    <Link href="/" className="hover:text-green-200 transition">
                        農園一覧
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <Link href="/reservations" className="hover:text-green-200 transition">
                                予約一覧
                            </Link>
                            <Link href="/profile" className="hover:text-green-200 transition">
                                プロファイル
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-50 transition"
                            >
                                ログアウト
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-green-200 transition">
                                ログイン
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-50 transition"
                            >
                                新規登録
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
