import { Home as HomeIcon, Mail, MessageCircle, Send, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

import { t } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";


export default function Contact() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        alert("شكراً لتواصلك معنا! سنرد عليك في أقرب وقت ممكن.");
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <SEO
                title="اتصل بنا"
                description="تواصل مع فريق دعم Tomito لأي استفسارات أو اقتراحات. نحن هنا لمساعدتك في الحصول على أفضل تجربة ترفيهية."
                keywords="اتصل بنا, دعم العملاء, تواصل معنا, شكاوى واقتراحات, توميتو"
            />
            <div className="container mx-auto max-w-5xl">

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

                <div className="text-center mb-10 md:mb-16 animate-fade-in">

                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent mb-4 md:mb-6">
                        {t("contactUs")}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        هل لديك أي استفسار أو اقتراح؟ نحن هنا لمساعدتك. تواصل معنا عبر النموذج أدناه أو من خلال قنوات التواصل الاجتماعي.
                    </p>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-8 animate-slide-in-right">
                        <div className="p-5 md:p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold">البريد الإلكتروني</h3>
                            </div>
                            <p className="text-muted-foreground font-mono text-sm md:text-base break-words">support@tomito.xyz</p>
                        </div>


                        <div className="p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Twitter className="w-5 h-5 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-bold">تويتر (X)</h3>
                            </div>
                            <p className="text-muted-foreground">@TomitoApp</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-green-500" />
                                </div>
                                <h3 className="text-lg font-bold">تيليجرام</h3>
                            </div>
                            <p className="text-muted-foreground">@TomitoSupport</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 animate-slide-in-left">
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl bg-card/30 border border-border backdrop-blur-md shadow-2xl">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium pr-2">الاسم الكامل</label>
                                    <Input
                                        id="name"
                                        placeholder="أدخل اسمك هنا"
                                        className="bg-secondary/30 border-border h-12 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium pr-2">البريد الإلكتروني</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@mail.com"
                                        className="bg-secondary/30 border-border h-12 focus:ring-primary text-left"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <label htmlFor="message" className="text-sm font-medium pr-2">رسالتك</label>
                                <Textarea
                                    id="message"
                                    placeholder="كيف يمكننا مساعدتك؟"
                                    className="min-h-[150px] bg-secondary/30 border-border focus:ring-primary"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                                <Send className="w-5 h-5 ml-2" />
                                إرسال الرسالة
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
