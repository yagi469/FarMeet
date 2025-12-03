import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
    const faqs = [
        {
            question: "本当に初期費用・月額費用は0円ですか?",
            answer: "はい、完全無料でご利用いただけます。手数料は予約が成立したときのみ発生します。予約がなければ一切費用はかかりませんので、リスクなく始められます。",
        },
        {
            question: "スマホだけで使えますか?",
            answer: "はい、スマホ・タブレット・パソコンすべてに対応しています。外出先でもスマホで予約確認や管理ができるので便利です。",
        },
        {
            question: "ITが苦手でも使えますか?",
            answer: "はい、シンプルで分かりやすい画面設計を心がけています。また、電話・メールでのサポートも充実しているので、分からないことがあればいつでもお問い合わせください。",
        },
        {
            question: "どんな作物でも登録できますか?",
            answer: "いちご、ブルーベリー、トマト、じゃがいも掘りなど、様々な収穫体験を登録できます。「こんな体験でも大丈夫?」とお悩みの場合は、お気軽にご相談ください。",
        },
        {
            question: "決済はどのように行われますか?",
            answer: "お客様はアプリ内でクレジットカード決済を行います。売上は月末締め、翌月10日にご指定の口座に振り込まれます(手数料を差し引いた金額)。",
        },
        {
            question: "キャンセル時の対応はどうなりますか?",
            answer: "キャンセルポリシーは農園ごとに設定できます。例えば「2日前までは無料、前日は50%、当日は100%」など、柔軟に設定可能です。",
        },
        {
            question: "繁忙期だけ使うことはできますか?",
            answer: "はい、もちろん可能です。月額費用がないので、収穫シーズンだけ公開して、オフシーズンは非公開にするといった使い方もできます。",
        },
    ];

    return (
        <section id="faq" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-primary text-3xl md:text-4xl font-bold text-farmeet-text-dark mb-6">
                        よくあるご質問
                    </h2>
                </div>

                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl px-6 bg-farmeet-bg-light data-[state=open]:bg-farmeet-cream transition-colors duration-300">
                                <AccordionTrigger className="text-lg font-bold text-farmeet-text-dark hover:no-underline py-6">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-farmeet-text-medium text-base leading-relaxed pb-6">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
