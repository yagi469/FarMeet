import { Smartphone, CreditCard, Star, MessageCircle, BarChart3 } from 'lucide-react';

export function About() {
    return (
        <section className="py-24 bg-farmeet-cream">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-primary text-3xl md:text-4xl font-bold text-farmeet-text-dark mb-6">
                        FarMeetとは？
                    </h2>
                    <p className="text-lg text-farmeet-text-medium max-w-2xl mx-auto">
                        農家さんと家族をつなぐ、収穫体験プラットフォーム
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <p className="text-lg leading-relaxed mb-8 text-farmeet-text-medium">
                            FarMeetは、農家さんが収穫体験を簡単に提供できるオールインワンプラットフォームです。
                            予約管理から決済、お客様とのメッセージまで、すべてをひとつのアプリで完結。
                        </p>
                        <ul className="grid gap-4">
                            {[
                                { icon: Smartphone, text: "スマホひとつで予約管理" },
                                { icon: CreditCard, text: "安全な決済システム" },
                                { icon: Star, text: "レビュー機能で信頼度アップ" },
                                { icon: MessageCircle, text: "お客様と直接やりとり" },
                                { icon: BarChart3, text: "売上データを自動集計" },
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:translate-x-2 transition-all duration-300"
                                >
                                    <item.icon className="w-5 h-5 text-farmeet-green mr-3" />
                                    <span className="text-lg">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="order-1 md:order-2 flex justify-center">
                        {/* Phone Mockup */}
                        <div className="relative w-[300px] bg-gradient-to-br from-slate-700 to-slate-800 rounded-[32px] p-4 shadow-2xl">
                            <div className="bg-white rounded-[24px] overflow-hidden aspect-[9/19.5]">
                                <div className="p-6">
                                    <div className="text-center text-xl font-bold text-farmeet-green border-b-2 border-gray-100 pb-4 mb-4">
                                        FarMeet
                                    </div>
                                    <div className="bg-gradient-to-br from-farmeet-green to-farmeet-green-light text-white p-4 rounded-xl mb-4 text-center shadow-sm">
                                        <div className="text-sm opacity-90 mb-1">本日の予約</div>
                                        <div className="text-4xl font-black">8組</div>
                                    </div>
                                    <div className="grid gap-3">
                                        {[
                                            { time: "10:00", name: "田中様", count: "4名" },
                                            { time: "13:00", name: "佐藤様", count: "3名" },
                                            { time: "15:00", name: "鈴木様", count: "5名" },
                                        ].map((booking, i) => (
                                            <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm flex justify-between items-center">
                                                <span className="font-bold text-farmeet-text-dark">{booking.time}</span>
                                                <span>{booking.name}</span>
                                                <span className="text-farmeet-text-light">{booking.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
