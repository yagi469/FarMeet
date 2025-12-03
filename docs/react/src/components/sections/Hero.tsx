import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-[72px]">
            {/* Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-farmeet-green via-farmeet-green-light to-farmeet-orange-light">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/20" />
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center text-white py-16">
                <h1 className="font-primary mb-8">
                    <span className="block text-4xl md:text-6xl font-black leading-tight mb-4 drop-shadow-md">
                        あなたの農園を、
                    </span>
                    <span className="block text-3xl md:text-5xl font-bold leading-tight drop-shadow-md">
                        家族の笑顔が集まる場所に
                    </span>
                </h1>

                <p className="text-lg md:text-xl mb-12 opacity-95 max-w-2xl mx-auto leading-relaxed">
                    FarMeetは、農家さんと収穫体験を楽しみたい家族をつなぐプラットフォームです。
                    簡単な予約管理で新しい収益源を創出し、あなたの農業の魅力をもっと多くの人に届けます。
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
                    <Button
                        size="lg"
                        className="bg-gradient-to-br from-farmeet-green to-farmeet-green-light hover:translate-y-[-3px] hover:shadow-xl transition-all duration-300 text-lg px-10 py-6 h-auto shadow-lg border-0"
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        今すぐ無料で始める
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-farmeet-green hover:border-white text-lg px-10 py-6 h-auto transition-all duration-300"
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        詳しく見る
                    </Button>
                </div>

                <div className="flex flex-wrap gap-8 md:gap-16 justify-center">
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-black font-primary mb-2">1,200+</div>
                        <div className="text-sm md:text-base opacity-90">登録農園</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-black font-primary mb-2">50,000+</div>
                        <div className="text-sm md:text-base opacity-90">年間利用者</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl md:text-5xl font-black font-primary mb-2">4.8★</div>
                        <div className="text-sm md:text-base opacity-90">平均評価</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
