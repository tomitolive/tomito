import { t } from "../lib/tmdb";
import { Home as HomeIcon, Lock, Eye, FileText, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function Privacy() {
    const lastUpdated = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <SEO
                title="سياسة الخصوصية"
                description="سياسة الخصوصية لمنصة Tomito. تعرف على كيفية حماية بياناتك ومعلوماتك الشخصية أثناء استخدام موقعنا."
                keywords="سياسة الخصوصية, حماية البيانات, شروط الاستخدام, خصوصية المستخدم, Tomito Privacy"
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

                <div className="mb-12 animate-fade-in text-center">

                    <FileText className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-6" />
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("privacyPolicy")}</h1>

                    <p className="text-muted-foreground">آخر تحديث: {lastUpdated}</p>
                </div>

                <div className="space-y-12 animate-slide-up">
                    {/* Section 1 */}
                    <section className="p-6 md:p-8 rounded-3xl bg-card/50 border border-border backdrop-blur-sm">

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">مقدمة</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p>نحن في Tomito نولي أهمية قصوى لخصوصية زوارنا. توضح هذه الوثيقة أنواع المعلومات الشخصية التي يتم استلامها وجمعها وكيفية استخدامها.</p>
                            <p>باستخدامك لموقعنا، فإنك توافق على سياسة الخصوصية الخاصة بنا وبالشروط الواردة فيها.</p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="p-8 rounded-3xl bg-card/50 border border-border backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Database className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-2xl font-bold">جمع المعلومات</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p>نحن لا نطلب من المستخدمين تسجيل حسابات أو تقديم معلومات شخصية حساسة لمشاهدة المحتوى. ومع ذلك، قد يتم جمع بعض المعلومات التقنية مثل:</p>
                            <ul className="list-disc pr-6 space-y-2 mt-4">
                                <li>نوع المتصفح ونظام التشغيل.</li>
                                <li>عنوان بروتوكول الإنترنت (IP).</li>
                                <li>الصفحات التي تمت زيارتها ومدة الزيارة.</li>
                                <li>بيانات التفاعل مع الخدمات الخارجية مثل Google Analytics.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="p-8 rounded-3xl bg-card/50 border border-border backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold">استخدام ملفات تعريف الارتباط (Cookies)</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p>يستخدم Tomito ملفات تعريف الارتباط لتخزين معلومات حول تفضيلات الزوار، ولتخصيص محتوى صفحة الويب بناءً على نوع متصفح الزوار أو معلومات أخرى يرسلها الزوار عبر متصفحهم (مثل تفضيلات اللغة أو الوضع الليلي).</p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="p-8 rounded-3xl bg-card/50 border border-border backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-orange-500" />
                            </div>
                            <h2 className="text-2xl font-bold">إخلاء المسؤولية</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <p>موقع Tomito هو محرك بحث للمحتوى المرئي، نحن لا نقوم برفع أو استضافة أي فيديو على سيرفراتنا الخاصة. جميع الروابط والمحتوى المتاح يتم استضافته على مواقع طرف ثالث. نحن لسنا مسؤولين عن المحتوى أو سياسات الخصوصية لتلك المواقع.</p>
                        </div>
                    </section>

                    {/* Contact CTA */}
                    <div className="text-center p-12 border-2 border-dashed border-border rounded-3xl">
                        <p className="text-muted-foreground mb-4">إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يمكنك التواصل معنا:</p>
                        <a href="/contact" className="text-primary font-bold hover:underline">عبر صفحة "اتصل بنا"</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
