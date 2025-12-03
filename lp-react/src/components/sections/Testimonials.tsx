import { User } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
    const testimonials = [
        {
            text: "「電話対応がなくなって、本業の野菜作りに集中できるようになりました。月の売上も30%アップ!子どもたちの笑顔を見ると、農業の楽しさを改めて実感します。」",
            name: "山田 太郎さん",
            info: "千葉県・野菜農家 / FarMeet歴2年",
            gradient: "from-green-400 to-green-500",
        },
        {
            text: "「予約管理が本当に楽になりました。レビュー機能のおかげで、新規のお客様も安心して来てくださいます。リピーターさんも増えて、直売所の売上も伸びています!」",
            name: "佐藤 花子さん",
            info: "静岡県・いちご農家 / FarMeet歴1年",
            gradient: "from-orange-300 to-orange-400",
        },
        {
            text: "「最初は不安でしたが、サポートが手厚くてすぐに使えるようになりました。都会から家族連れが来てくれて、地域も活気づいています。農業の未来が明るく感じます!」",
            name: "鈴木 健一さん",
            info: "長野県・果樹園 / FarMeet歴6ヶ月",
            gradient: "from-sky-300 to-sky-400",
        },
    ];

    return (
        <section className="py-24 bg-gradient-to-br from-farmeet-cream to-farmeet-beige">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-primary text-3xl md:text-4xl font-bold text-farmeet-text-dark mb-6">
                        農家さんの声
                    </h2>
                    <p className="text-lg text-farmeet-text-medium max-w-2xl mx-auto">
                        実際にFarMeetを活用されている農家さんの声をご紹介
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <Card
                            key={index}
                            className="border-none shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                        >
                            <div className="p-8 bg-farmeet-bg-light text-center">
                                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md mb-4`}>
                                    <User className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            <CardContent className="p-8 pt-4">
                                <div className="text-farmeet-orange text-xl mb-4 text-center">★★★★★</div>
                                <p className="text-farmeet-text-medium italic leading-relaxed mb-6">
                                    {item.text}
                                </p>
                                <div className="text-center border-t pt-6">
                                    <div className="font-bold text-lg text-farmeet-text-dark mb-1">{item.name}</div>
                                    <div className="text-sm text-farmeet-text-light">{item.info}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
