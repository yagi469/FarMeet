'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function FarmerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    const navItems = [
        { href: '/farmer', label: 'ダッシュボード', icon: '📊' },
        { href: '/farmer/farms', label: '農園管理', icon: '🚜' },
        { href: '/farmer/reservations', label: '予約管理', icon: '📋' },
    ];

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            } else if (user?.role !== 'FARMER') {
                router.push('/');
            }
        }
    }, [isLoading, isAuthenticated, user, pathname, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    // Don't render if not authenticated or not a farmer
    if (!isAuthenticated || user?.role !== 'FARMER') {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-green-800">農家専用ページ</h2>
                </div>
                <nav className="mt-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition ${pathname === item.href ? 'bg-green-50 text-green-700 border-r-4 border-green-600' : ''
                                }`}
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
