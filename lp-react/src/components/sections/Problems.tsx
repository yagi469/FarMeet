import { PhoneOff, ClipboardList, Search, Sprout } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export function Problems() {
    const problems = [
        {
            icon: PhoneOff,
            title: "電話対応に追われて\n本業に集中できない",
        },
        {
            icon: ClipboardList,
            title: "予約管理が大変で\nダブルブッキングが心配",
        },
        {
            icon: Search,
            title: "新しい収益源を\n見つけたい",
        },
        {
            icon: Sprout,
            title: "農業の魅力を\nもっと多くの人に伝えたい",
        },
    ];

    return (
        <section className="py-24 bg-farmeet-beige/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-primary text-3xl md:text-4xl font-bold text-farmeet-text-dark">
                        こんなお悩み、ありませんか？
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {problems.map((problem, index) => (
                        <Card
                            key={index}
                            className="border-none shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <CardContent className="p-8 text-center flex flex-col items-center h-full justify-center">
                                <div className="mb-6 text-farmeet-green">
                                    <problem.icon className="w-16 h-16" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-farmeet-text-dark leading-relaxed whitespace-pre-line">
                                    {problem.title}
                                </h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
