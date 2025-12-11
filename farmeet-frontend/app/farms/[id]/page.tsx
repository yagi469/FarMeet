'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { addToRecentlyViewed } from '@/lib/recentlyViewed';
import { Farm, ExperienceEvent } from '@/types';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Assuming shadcn/ui calendar exists
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User as UserIcon, Check } from 'lucide-react';
import { ja } from 'date-fns/locale';
import ReviewSection from '@/components/ReviewSection';

export default function FarmDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [farm, setFarm] = useState<Farm | null>(null);
    const [events, setEvents] = useState<ExperienceEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<ExperienceEvent | null>(null);
    const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState<ExperienceEvent[]>([]);

    useEffect(() => {
        loadData();
    }, [params.id]);

    useEffect(() => {
        if (selectedDate && events.length > 0) {
            // Find events on selected date (using local timezone)
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const targetDateStr = `${year}-${month}-${day}`;

            const dayEvents = events.filter(e => {
                // Compare using the date part of eventDate
                const eventDatePart = e.eventDate.split('T')[0];
                return eventDatePart === targetDateStr;
            });

            setEventsOnSelectedDate(dayEvents);
            // Auto-select first event if only one exists
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
            const farmId = Number(params.id);
            const [farmData, eventsData] = await Promise.all([
                api.getFarm(farmId),
                api.getEventsByFarm(farmId),
            ]);
            setFarm(farmData);
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

    // Use dummy images if list is empty (fallback)
    const images = (farm.images && farm.images.length > 0) ? farm.images : [farm.imageUrl];
    const features = farm.features || [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{farm.name}</h1>
                <div className="flex items-center text-gray-600 underline cursor-pointer">
                    <MapPin className="w-4 h-4 mr-1" />
                    {farm.location}
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
                <div className="col-span-1 row-span-1">
                    <ImageWithFallback src={images[4] || images[0]} alt="Sub 4" className="w-full h-full object-cover hover:opacity-90 transition cursor-pointer" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column: Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Host Info */}
                    <div className="flex justify-between items-center pb-6 border-b">
                        <div>
                            <h2 className="text-xl font-semibold">ホスト: {farm.owner.username} さん</h2>
                            <p className="text-gray-500 text-sm">登録: {new Date(farm.createdAt).getFullYear()}年</p>
                        </div>
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={farm.owner.avatarUrl} />
                            <AvatarFallback>{farm.owner.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Description */}
                    <div className="pb-6 border-b">
                        <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">{farm.description}</p>
                    </div>

                    {/* Features/Amenities */}
                    <div className="pb-6 border-b">
                        <h3 className="text-xl font-semibold mb-4">農園の特徴</h3>
                        {features.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-center text-gray-700">
                                        <Check className="w-5 h-5 mr-3 text-gray-600" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">特徴情報は登録されていません</p>
                        )}
                    </div>

                    {/* Reviews Section */}
                    <ReviewSection farmId={Number(params.id)} />
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
                                        // イベントがある日付のみ選択可能
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

    if (!src || error) {
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
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    );
}
