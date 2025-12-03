import { TrendingUp, Users, Smartphone, Heart, MapPin } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export function Features() {
    const features = [
        {
            icon: TrendingUp,
            title: "追加収益の獲得",
            description: "収穫体験による新しい収益源を創出。既存の作物を活かして、平均月20万円の追加収入を実現している農家さんも。",
        },
        {
            icon: Users,
            title: "新規顧客の開拓",
            description: "全国から収穫体験を探している家族にリーチ。体験後のリピーターや、農産物の直接販売にもつながります。",
        },
        {
            icon: Smartphone,
            title: "簡単な予約管理",
            description: "24時間自動受付で電話対応不要。カレンダーで空き状況を一目で確認。ダブルブッキングの心配もありません。",
        },
        {
            icon: Heart,
            title: "農業の魅力発信",
            description: "写真や動画で農園の魅力を発信。お客様のレビューが自然と口コミを広げ、あなたの農園のファンを増やします。",
        },
        {
            icon: MapPin,
            title: "地域活性化",
            description: "観光客の誘致で地域経済に貢献。周辺の飲食店や観光施設とも連携し、地域全体の活性化につながります。",
        },
    ];

    return (
        <section id="features" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-primary text-3xl md:text-4xl font-bold text-farmeet-text-dark mb-6">
                        FarMeetが解決します
                    </h2>
                    <p className="text-lg text-farmeet-text-medium max-w-2xl mx-auto">
                        5つのメリットで、あなたの農園経営をサポート
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="bg-farmeet-cream border-2 border-transparent hover:border-farmeet-green-light hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                        >
                            <CardContent className="p-8">
                                <div className="mb-6 text-farmeet-green">
                                    <feature.icon className="w-16 h-16" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-primary text-2xl font-bold text-farmeet-green-dark mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-farmeet-text-medium leading-relaxed">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
