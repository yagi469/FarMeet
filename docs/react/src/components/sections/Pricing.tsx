import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function Pricing() {
    const features = [
        "初期費用 0円",
        "月額費用 0円",
        "予約管理システム",
        "決済システム",
        "メッセージ機能",
        "レビュー・評価機能",
        "売上レポート",
        "サポート対応",
    ];

    return (
        <section id="pricing" className="py-24 bg-farmeet-bg-light">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-primary text-3xl md:text-4xl font-bold text-farmeet-text-dark mb-6">
                        シンプルな料金プラン
                    </h2>
                    <p className="text-lg text-farmeet-text-medium max-w-2xl mx-auto">
                        初期費用・月額費用は0円。予約が成立したときだけ手数料をいただきます
                    </p>
                </div>

                <Card className="max-w-2xl mx-auto overflow-hidden border-4 border-farmeet-green-light shadow-2xl rounded-3xl">
                    <div className="bg-gradient-to-br from-farmeet-green to-farmeet-green-light text-white p-12 text-center">
                        <h3 className="text-2xl font-bold mb-6">予約成立時手数料</h3>
                        <div className="flex items-baseline justify-center gap-2 mb-4">
                            <span className="text-7xl font-black leading-none">15</span>
                            <span className="text-3xl font-bold">%</span>
                        </div>
                        <p className="text-lg opacity-95">予約が成立したときのみ</p>
                    </div>

                    <CardContent className="p-10">
                        <div className="grid md:grid-cols-2 gap-4 mb-10">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 text-lg">
                                    <Check className="w-6 h-6 text-farmeet-green flex-shrink-0" strokeWidth={3} />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-farmeet-cream p-8 rounded-xl mb-10">
                            <h4 className="font-bold text-lg mb-4 text-farmeet-text-dark">収益例</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>体験料金: ¥3,000 × 5名</span>
                                    <span>= ¥15,000</span>
                                </div>
                                <div className="flex justify-between text-red-500">
                                    <span>手数料(15%)</span>
                                    <span>- ¥2,250</span>
                                </div>
                                <div className="flex justify-between border-t-2 border-farmeet-green pt-3 font-bold text-xl text-farmeet-green-dark">
                                    <span>あなたの収益</span>
                                    <span>¥12,750</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Button
                                size="lg"
                                className="w-full md:w-auto bg-farmeet-green hover:bg-farmeet-green-dark text-white text-lg px-12 py-6 h-auto shadow-lg hover:shadow-xl transition-all"
                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                今すぐ無料で始める
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
