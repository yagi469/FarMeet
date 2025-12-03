import { ArrowRight } from 'lucide-react';

export function HowItWorks() {
    const steps = [
        {
            number: 1,
            title: "無料登録",
            description: "メールアドレスで簡単登録。初期費用は一切かかりません。登録後すぐに管理画面にアクセスできます。",
        },
        {
            number: 2,
            title: "農園情報を登録",
            description: "農園の写真、体験内容、料金を登録。ガイドに従って入力するだけで、魅力的なページが完成します。",
        },
        {
            number: 3,
            title: "予約受付開始",
            description: "公開したらすぐに予約受付スタート。予約が入ったらアプリで通知。あとは当日お客様をお迎えするだけ。",
        },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-primary text-3xl md:text-4xl font-bold text-farmeet-text-dark mb-6">
                        ご利用の流れ
                    </h2>
                    <p className="text-lg text-farmeet-text-medium max-w-2xl mx-auto">
                        たった3ステップで、今日から収穫体験を提供できます
                    </p>
                </div>

                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-4">
                    {steps.map((step, index) => (
                        <div key={index} className="contents md:flex md:items-center w-full">
                            <div className="flex-1 bg-farmeet-cream p-8 rounded-2xl text-center hover:-translate-y-2 hover:shadow-lg transition-all duration-300 w-full">
                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-farmeet-green to-farmeet-green-light rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg mb-6">
                                    {step.number}
                                </div>
                                <h3 className="font-primary text-xl font-bold text-farmeet-green-dark mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-farmeet-text-medium leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="text-farmeet-green-light flex-shrink-0 transform rotate-90 md:rotate-0 my-4 md:my-0 md:mx-4">
                                    <ArrowRight className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
