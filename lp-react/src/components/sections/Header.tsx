import { useState, useEffect } from 'react';
import { Wheat, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const NavLinks = ({ mobile = false, onClick = () => { } }) => (
        <>
            {['features', 'how-it-works', 'pricing', 'faq'].map((item) => (
                <a
                    key={item}
                    href={`#${item}`}
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item);
                        onClick();
                    }}
                    className={cn(
                        "nav-link-underline text-sm font-medium transition-colors hover:text-farmeet-green",
                        mobile ? "text-lg py-2" : "text-farmeet-text-dark"
                    )}
                >
                    {item === 'features' && '特徴'}
                    {item === 'how-it-works' && 'ご利用の流れ'}
                    {item === 'pricing' && '料金'}
                    {item === 'faq' && 'よくある質問'}
                </a>
            ))}
        </>
    );

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300",
                isScrolled ? "shadow-md backdrop-blur-md py-2" : "shadow-sm py-4"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Wheat className="h-8 w-8 text-farmeet-green" />
                    <span className="text-2xl font-bold font-primary text-farmeet-green-dark">FarMeet</span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <NavLinks />
                    <Button
                        className="bg-farmeet-green hover:bg-farmeet-green-dark text-white font-bold shadow-md hover:shadow-lg transition-all"
                        onClick={() => scrollToSection('contact')}
                    >
                        無料で始める
                    </Button>
                </nav>

                {/* Mobile Nav */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <div className="flex flex-col gap-4 mt-8">
                                <NavLinks mobile onClick={() => { }} />
                                <Button
                                    className="bg-farmeet-green hover:bg-farmeet-green-dark text-white font-bold w-full"
                                    onClick={() => scrollToSection('contact')}
                                >
                                    無料で始める
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
