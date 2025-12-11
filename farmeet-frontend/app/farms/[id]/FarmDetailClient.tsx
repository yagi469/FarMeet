'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { addToRecentlyViewed } from '@/lib/recentlyViewed';
import { Farm, ExperienceEvent } from '@/types';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User as UserIcon, Check } from 'lucide-react';
import { ja } from 'date-fns/locale';
import ReviewSection from '@/components/ReviewSection';
import ShareButtons from '@/components/ShareButtons';

interface FarmDetailClientProps {
    farmId: number;
    initialFarm?: Farm;
}

export default function FarmDetailClient({ farmId, initialFarm }: FarmDetailClientProps) {
    const router = useRouter();
    const [farm, setFarm] = useState<Farm | null>(initialFarm || null);
    const [events, setEvents] = useState<ExperienceEvent[]>([]);
    const [loading, setLoading] = useState(!initialFarm);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<ExperienceEvent | null>(null);
    const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState<ExperienceEvent[]>([]);

    useEffect(() => {
        loadData();
    }, [farmId]);

    useEffect(() => {
        if (selectedDate && events.length > 0) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const targetDateStr = `${year}-${month}-${day}`;

            const dayEvents = events.filter(e => {
                const eventDatePart = e.eventDate.split('T')[0];
                return eventDatePart === targetDateStr;
            });

            setEventsOnSelectedDate(dayEvents);
            if (dayEvents.length === 1) {
                setSelectedEvent(dayEvents[0]);
            } else {
                setSelectedEvent(null);
            }
        } else {
            setEventsOnSelectedDate([]);
            setSelectedEvent(null);
        }
    }, [selectedDate, events]);

    const loadData = async () => {
        try {
            const [farmData, eventsData] = await Promise.all([
                initialFarm ? Promise.resolve(initialFarm) : api.getFarm(farmId),
                api.getEventsByFarm(farmId),
            ]);

            if (!initialFarm) {
                setFarm(farmData);
            }
            setEvents(eventsData);

            // 閲覧履歴に追加
            addToRecentlyViewed({
                id: farmData.id,
                name: farmData.name,
                imageUrl: farmData.imageUrl,
                location: farmData.location,
            });
        } catch (error) {
            console.error('データ読み込みエラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReserve = () => {
        if (!selectedEvent) return;
        if (!authHelper.isAuthenticated()) {
            router.push(`/login?redirect=${encodeURIComponent(`/events/${selectedEvent.id}`)}`);
            return;
        }
        router.push(`/events/${selectedEvent.id}`);
    };

    if (loading) return <div className="flex justify-center py-20">読み込み中...</div>;
    if (!farm) return <div className="text-center py-20">農園が見つかりませんでした</div>;

    // 画像配列を安全に生成（undefined/空文字列/null文字列を除外）
    const rawImages = farm.images && farm.images.length > 0 ? farm.images : [farm.imageUrl];
    const images = rawImages.filter((img): img is string => !!img && img.trim() !== '' && img !== 'null');
    const features = farm.features || [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{farm.name}</h1>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center text-gray-600 underline cursor-pointer">
                        <MapPin className="w-4 h-4 mr-1" />
                        {farm.location}
                    </div>
                    <ShareButtons
                        url={typeof window !== 'undefined'
                            ? (process.env.NEXT_PUBLIC_SITE_URL
                                ? `${process.env.NEXT_PUBLIC_SITE_URL}${window.location.pathname}`
                                : window.location.href)
                            : ''}
                        title={farm.name}
                        description={farm.description}
                    />
                </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] mb-8 rounded-xl overflow-hidden">
                <div className="col-span-2 row-span-2">
                    <ImageWithFallback src={images[0]} alt="Main" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
                </div>
                <div className="col-span-1 row-span-1">
                    <ImageWithFallback src={images[1] || images[0]} alt="Sub 1" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
                </div>
                <div className="col-span-1 row-span-1">
                    <ImageWithFallback src={images[2] || images[0]} alt="Sub 2" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
                </div>
                <div className="col-span-1 row-span-1">
                    <ImageWithFallback src={images[3] || images[0]} alt="Sub 3" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
                </div>
                <div className="col-span-1 row-span-1 relative">
                    <ImageWithFallback src={images[4] || images[0]} alt="Sub 4" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Details */}
                <div className="lg:col-span-2">
                    {/* Host Info */}
                    <div className="flex items-center justify-between border-b pb-6 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">
                                {farm.owner?.username || 'オーナー'}さんの農園
                            </h2>
                            <p className="text-gray-500">{farm.location}</p>
                        </div>
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={farm.owner?.avatarUrl} alt={farm.owner?.username} />
                            <AvatarFallback>
                                <UserIcon className="h-6 w-6" />
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                        <div className="space-y-4 mb-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Check className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{feature}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    <div className="border-t pt-6 mb-8">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {farm.description}
                        </p>
                    </div>

                    {/* Reviews Section */}
                    <ReviewSection farmId={farmId} />
                </div>

                {/* Right Column: Sticky Reservation Widget */}
                <div className="relative">
                    <Card className="sticky top-24 shadow-xl border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                {selectedEvent ? `¥${selectedEvent.price.toLocaleString()}` : '日付を選択'}
                                <span className="text-base font-normal text-gray-500 ml-1">
                                    {selectedEvent ? '/人' : ''}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg p-4 mb-4">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md border mx-auto"
                                    modifiers={{
                                        event: events.map(e => new Date(e.eventDate))
                                    }}
                                    modifiersClassNames={{
                                        event: "bg-green-100 font-bold text-green-700 rounded-full"
                                    }}
                                    disabled={(date) => {
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const dateStr = `${year}-${month}-${day}`;
                                        return !events.some(e => e.eventDate.split('T')[0] === dateStr);
                                    }}
                                    locale={ja}
                                />
                            </div>

                            {/* 時間スロット選択 */}
                            {eventsOnSelectedDate.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">時間を選択</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {eventsOnSelectedDate.map((event) => (
                                            <button
                                                key={event.id}
                                                onClick={() => setSelectedEvent(event)}
                                                className={`p-3 rounded-lg border text-sm transition-all ${selectedEvent?.id === event.id
                                                    ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                                                    : 'border-gray-200 hover:border-gray-400'
                                                    } ${event.availableSlots === 0 ? 'opacity-50' : ''}`}
                                                disabled={event.availableSlots === 0}
                                            >
                                                <div className="font-medium">
                                                    {new Date(event.eventDate).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {event.availableSlots === 0 ? '満席' : `残り${event.availableSlots}席`}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* イベント詳細 */}
                            {selectedEvent ? (
                                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="font-bold text-lg mb-2">{selectedEvent.title}</p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">日時</span>
                                            <span className="font-medium">
                                                {new Date(selectedEvent.eventDate).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
                                                {' '}
                                                {new Date(selectedEvent.eventDate).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 〜
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">料金</span>
                                            <span className="font-medium">¥{selectedEvent.price.toLocaleString()} / 人</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">空き状況</span>
                                            <span className={`font-medium ${selectedEvent.availableSlots <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                                                残り {selectedEvent.availableSlots} 席
                                            </span>
                                        </div>
                                        {selectedEvent.description && (
                                            <p className="text-gray-600 mt-2 pt-2 border-t">{selectedEvent.description}</p>
                                        )}
                                    </div>
                                </div>
                            ) : eventsOnSelectedDate.length > 0 ? (
                                <div className="mb-4 text-center text-sm text-gray-500 py-3">
                                    上記の時間を選択してください
                                </div>
                            ) : (
                                <div className="mb-4 text-center text-sm text-gray-500 py-3">
                                    イベントが開催されている日付（緑色）を選択してください
                                </div>
                            )}

                            <Button
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-6 text-lg"
                                onClick={handleReserve}
                                disabled={!selectedEvent || selectedEvent.availableSlots === 0}
                            >
                                {selectedEvent ? (selectedEvent.availableSlots === 0 ? '満席' : '予約画面へ進む') : '日程を確認'}
                            </Button>

                            <p className="text-center text-xs text-gray-500 mt-4">
                                支払いはまだ確定しません
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ImageWithFallback({ src, alt, className }: { src: string | undefined, alt: string, className?: string }) {
    const [error, setError] = useState(false);
    // @ts-ignore
    const imgRef = useRef<HTMLImageElement>(null);

    // マウント時に画像のロード状態をチェック
    useEffect(() => {
        const img = imgRef.current;
        if (img && img.complete && img.naturalWidth === 0) {
            setError(true);
        }
    }, [src]);

    if (!src || src === '' || error) {
        return (
            <div className={`bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ${className}`}>
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${className}`}
            onError={() => setError(true)}
        />
    );
}
