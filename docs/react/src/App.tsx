import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Problems } from "@/components/sections/Problems";
import { Features } from "@/components/sections/Features";
import { Testimonials } from "@/components/sections/Testimonials";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

function App() {
    return (
        <div className="min-h-screen bg-background font-secondary text-foreground antialiased">
            <Header />
            <main>
                <Hero />
                <About />
                <Problems />
                <Features />
                <Testimonials />
                <HowItWorks />
                <Pricing />
                <FAQ />
                <Contact />
            </main>
            <Footer />
        </div>
    );
}

export default App;
