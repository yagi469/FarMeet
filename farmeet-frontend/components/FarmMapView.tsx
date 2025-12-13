'use client';

import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { Farm } from '@/types';

interface FarmMapViewProps {
    farms: Farm[];
    onFarmClick?: (farm: Farm) => void;
}

// Japan center coordinates
const JAPAN_CENTER = {
    lat: 36.2048,
    lng: 138.2529,
};

const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '1rem',
};

// Custom map style for a cleaner look
const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
};

export default function FarmMapView({ farms, onFarmClick }: FarmMapViewProps) {
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [mapCenter, setMapCenter] = useState(JAPAN_CENTER);
    const [mapZoom, setMapZoom] = useState(5);

    // Filter farms that have coordinates
    const farmsWithCoords = useMemo(() =>
        farms.filter(farm => farm.latitude != null && farm.longitude != null),
        [farms]
    );

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey || '',
    });

    const handleMarkerClick = useCallback((farm: Farm) => {
        setSelectedFarm(farm);
        if (farm.latitude && farm.longitude) {
            setMapCenter({ lat: farm.latitude, lng: farm.longitude });
        }
    }, []);

    const handleInfoWindowClose = useCallback(() => {
        setSelectedFarm(null);
    }, []);

    // Fallback UI when API key is not configured
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        return (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
                <div className="text-center">
                    <span className="text-6xl block mb-4">🗺️</span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">地図表示の設定が必要です</h3>
                    <p className="text-gray-600 mb-4">
                        Google Maps APIキーを設定すると、農園の位置を地図上で確認できます。
                    </p>
                    <div className="bg-white rounded-lg p-4 text-left text-sm text-gray-700 max-w-md mx-auto">
                        <p className="font-medium mb-2">設定方法:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>でAPIキーを取得</li>
                            <li>Maps JavaScript APIを有効化</li>
                            <li><code className="bg-gray-100 px-1 rounded">.env.local</code>ファイルを作成</li>
                            <li><code className="bg-gray-100 px-1 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY</code>を追加</li>
                        </ol>
                    </div>
                </div>

                {/* Show farms as a simple list */}
                <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">📍 農園一覧（{farmsWithCoords.length}件）</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                        {farmsWithCoords.map(farm => (
                            <Link
                                key={farm.id}
                                href={`/farms/${farm.id}`}
                                className="flex items-center gap-3 bg-white p-3 rounded-lg hover:shadow-md transition-shadow border border-gray-100"
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-green-100">
                                    {farm.imageUrl ? (
                                        <img src={farm.imageUrl} alt={farm.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">🌾</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{farm.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{farm.location}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="bg-red-50 rounded-2xl p-8 text-center">
                <span className="text-4xl">⚠️</span>
                <p className="text-red-600 mt-2">地図の読み込みに失敗しました</p>
                <p className="text-sm text-red-500">APIキーが正しく設定されているか確認してください</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="bg-gray-100 rounded-2xl p-8 text-center animate-pulse" style={{ height: '500px' }}>
                <span className="text-4xl">🗺️</span>
                <p className="text-gray-600 mt-2">地図を読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Farm count badge */}
            <div className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-full shadow-lg border">
                <span className="font-medium text-gray-800">📍 {farmsWithCoords.length}件の農園</span>
            </div>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={mapZoom}
                options={mapOptions}
                onLoad={() => {
                    // Auto-fit bounds to show all markers
                    if (farmsWithCoords.length > 0) {
                        const avgLat = farmsWithCoords.reduce((sum, f) => sum + (f.latitude || 0), 0) / farmsWithCoords.length;
                        const avgLng = farmsWithCoords.reduce((sum, f) => sum + (f.longitude || 0), 0) / farmsWithCoords.length;
                        setMapCenter({ lat: avgLat, lng: avgLng });
                        setMapZoom(6);
                    }
                }}
            >
                {farmsWithCoords.map(farm => (
                    <Marker
                        key={farm.id}
                        position={{ lat: farm.latitude!, lng: farm.longitude! }}
                        onClick={() => handleMarkerClick(farm)}
                        animation={window.google?.maps?.Animation?.DROP}
                    />
                ))}

                {selectedFarm && selectedFarm.latitude && selectedFarm.longitude && (
                    <InfoWindow
                        position={{ lat: selectedFarm.latitude, lng: selectedFarm.longitude }}
                        onCloseClick={handleInfoWindowClose}
                    >
                        <div className="p-2 max-w-xs">
                            {selectedFarm.imageUrl && (
                                <div className="w-full h-24 rounded-lg overflow-hidden mb-2">
                                    <img
                                        src={selectedFarm.imageUrl}
                                        alt={selectedFarm.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedFarm.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">📍 {selectedFarm.location}</p>
                            <Link
                                href={`/farms/${selectedFarm.id}`}
                                className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-full transition-colors"
                            >
                                詳細を見る
                            </Link>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
