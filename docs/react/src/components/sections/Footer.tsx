import { Wheat, Mail, Phone, Clock } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-farmeet-text-dark text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Wheat className="h-8 w-8 text-farmeet-green" />
                            <span className="text-2xl font-bold font-primary">FarMeet</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            農家さんと家族をつなぐ<br />
                            収穫体験プラットフォーム
                        </p>
                    </div>

                    {/* Service Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">サービス</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#features" className="hover:text-farmeet-green transition-colors">特徴</a></li>
                            <li><a href="#how-it-works" className="hover:text-farmeet-green transition-colors">ご利用の流れ</a></li>
                            <li><a href="#pricing" className="hover:text-farmeet-green transition-colors">料金</a></li>
                            <li><a href="#faq" className="hover:text-farmeet-green transition-colors">よくある質問</a></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">サポート</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-farmeet-green transition-colors">ヘルプセンター</a></li>
                            <li><a href="#" className="hover:text-farmeet-green transition-colors">お問い合わせ</a></li>
                            <li><a href="#" className="hover:text-farmeet-green transition-colors">利用規約</a></li>
                            <li><a href="#" className="hover:text-farmeet-green transition-colors">プライバシーポリシー</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">お問い合わせ</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-farmeet-green-light" />
                                info@farmeet.jp
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-farmeet-green-light" />
                                0120-XXX-XXX
                            </li>
                            <li className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-farmeet-green-light" />
                                平日 9:00-18:00
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    &copy; 2024 FarMeet. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
