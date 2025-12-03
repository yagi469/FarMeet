import { Phone, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function Contact() {
    const prefectures = [
        "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
        "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
        "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
        "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
        "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
        "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
        "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
    ];

    return (
        <section id="contact" className="py-24 bg-farmeet-green/5">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div>
                        <h2 className="font-primary text-3xl md:text-4xl font-bold text-farmeet-text-dark mb-6 leading-tight">
                            さあ、FarMeetを<br />始めましょう
                        </h2>
                        <p className="text-lg text-farmeet-text-medium mb-8">
                            登録は簡単3分。今日から、あなたの農園に新しい可能性を。
                        </p>

                        <ul className="space-y-4 mb-12">
                            {[
                                "初期費用・月額費用 0円",
                                "予約が入るまで費用なし",
                                "いつでもキャンセル可能",
                                "専任サポート付き"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center text-lg font-medium text-farmeet-text-dark">
                                    <span className="text-farmeet-green mr-3 text-xl">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-farmeet-green/20">
                            <p className="font-bold text-lg mb-4">お電話でのお問い合わせ</p>
                            <div className="flex items-center gap-3 text-2xl font-black text-farmeet-green-dark mb-2">
                                <Phone className="w-6 h-6" />
                                0120-XXX-XXX
                            </div>
                            <div className="flex items-center gap-3 text-farmeet-text-medium">
                                <Clock className="w-5 h-5" />
                                受付時間: 平日 9:00-18:00
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl">
                        <h3 className="text-2xl font-bold mb-8 text-center">無料登録・お問い合わせ</h3>
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('送信しました（デモ）'); }}>
                            <div className="space-y-2">
                                <Label htmlFor="name">お名前 <span className="text-red-500">*</span></Label>
                                <Input id="name" placeholder="山田 太郎" required className="bg-gray-50 h-12" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="farm-name">農園名 <span className="text-red-500">*</span></Label>
                                <Input id="farm-name" placeholder="〇〇農園" required className="bg-gray-50 h-12" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
                                <Input id="email" type="email" placeholder="example@farm.jp" required className="bg-gray-50 h-12" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">電話番号 <span className="text-red-500">*</span></Label>
                                <Input id="phone" type="tel" placeholder="090-1234-5678" required className="bg-gray-50 h-12" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prefecture">都道府県 <span className="text-red-500">*</span></Label>
                                <Select required>
                                    <SelectTrigger className="bg-gray-50 h-12">
                                        <SelectValue placeholder="選択してください" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {prefectures.map((pref) => (
                                            <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="crop">主な作物</Label>
                                <Input id="crop" placeholder="例: いちご、トマト、ブルーベリー" className="bg-gray-50 h-12" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">ご質問・ご要望</Label>
                                <Textarea id="message" placeholder="ご自由にお書きください" rows={4} className="bg-gray-50 resize-none" />
                            </div>

                            <Button type="submit" className="w-full bg-farmeet-green hover:bg-farmeet-green-dark text-white text-lg font-bold h-14 shadow-lg hover:shadow-xl transition-all">
                                無料で始める
                            </Button>

                            <p className="text-center text-sm text-farmeet-text-light mt-4">
                                送信後、担当者より2営業日以内にご連絡いたします。
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
