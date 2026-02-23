import { Home as HomeIcon, Shield, Sparkles, Tv, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { t } from "@/lib/tmdb";
import Logo from "@/components/Logo";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";


export default function About() {
    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <SEO
                title="من نحن"
                description="تعرف على منصة Tomito، وجهتك الأولى لمشاهدة أحدث الأفلام والمسلسلات بجودة عالية وتجربة مستخدم فريدة."
                keywords="عن توميتو, من نحن, موقع افلام, منصة ترفيه, Tomito About"
            />
            <div className="container mx-auto max-w-4xl">

                {/* Home Button */}
                <div className="mb-8 animate-fade-in">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border hover:bg-primary/10 hover:border-primary/50 transition-all group"
                    >
                        <HomeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{t("backHome")}</span>
                    </Link>
                </div>

                {/* Hero Section */}

                <section className="text-center mb-16 animate-fade-in">
                    <div className="flex justify-center mb-6">
                        <Logo className="scale-110 md:scale-150 transition-transform" />
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-6">
                        {t("aboutUs")}
                    </h1>

                    <p className="text-xl text-muted-foreground leading-relaxed">
                        منصة Tomito هي وجهتكم الأولى لمشاهدة أحدث الأفلام والمسلسلات بجودة عالية وتجربة مستخدم فريدة. نحن نسعى لتقديم المحتوى الترفيهي لكل عشاق السينما والدراما في العالم العربي.
                    </p>
                </section>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="p-8 rounded-2xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary/50 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Tv className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-4">أضخم مكتبة محتوى</h3>
                        <p className="text-muted-foreground">
                            نوفر لك آلاف العناوين من الأفلام والمسلسلات، من الإنتاجات العالمية إلى الدراما العربية، كلها في مكان واحد.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary/50 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-4">جودة مشاهدة فائقة</h3>
                        <p className="text-muted-foreground">
                            نحن نحرص على تقديم المحتوى بأعلى جودة ممكنة مع تقنيات بث متطورة تضمن لك مشاهدة سلسة بدون تقطيع.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary/50 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-4">تجربة مستخدم شخصية</h3>
                        <p className="text-muted-foreground">
                            تصميمنا يركز على سهولة الوصول للمحتوى واقتراحات مخصصة بناءً على ذوقك الفني وما تفضل مشاهدته.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-card/50 border border-border backdrop-blur-sm hover:border-primary/50 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-4">مصداقية وأمان</h3>
                        <p className="text-muted-foreground">
                            نعتمد على واجهة برمجية موثوقة (TMDB) لضمان دقة المعلومات وتحديث البيانات بشكل فوري.
                        </p>
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl p-10 border border-primary/20 text-center">
                    <h2 className="text-3xl font-bold mb-6">رؤيتنا</h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        نطمح لأن نكون المنصة العربية الرائدة في مجال الترفيه الرقمي، من خلال الابتكار المستمر وتقديم أفضل الخدمات التي تليق بالمشاهد العربي.
                    </p>
                </div>
            </div>
            <Footer />
            <BackButton />
        </div>
    );
}
