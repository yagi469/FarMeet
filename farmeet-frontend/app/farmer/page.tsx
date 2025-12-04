'use client';

import Link from 'next/link';

export default function FarmerDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">農園管理</h2>
                    <p className="text-gray-600 mb-4">
                        登録済みの農園を確認・編集したり、新しい農園を登録できます。
                    </p>
                    <Link
                        href="/farmer/farms"
                        className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        農園一覧を見る
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">イベント管理</h2>
                    <p className="text-gray-600 mb-4">
                        体験イベントの作成や管理は、各農園の詳細ページから行えます。
                    </p>
                    <Link
                        href="/farmer/farms"
                        className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded hover:bg-green-200 transition"
                    >
                        農園を選択する
                    </Link>
                </div>
            </div>
        </div>
    );
}
