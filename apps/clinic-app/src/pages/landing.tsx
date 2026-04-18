import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CalendarDays, Apple, Activity, HeartPulse, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { FaInstagram, FaSnapchat, FaWhatsapp, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function LandingPage({ onLogin }: { onLogin?: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground" dir="rtl">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Apple className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-2xl text-primary tracking-tight">عيادتي</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center font-medium">
            <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">خدماتنا</a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">عن العيادة</a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">تواصل معنا</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onLogin} className="hidden sm:flex font-medium">تسجيل الدخول</Button>
            <Link href="/book">
              <Button className="shadow-lg shadow-primary/20 rounded-full px-6 transition-transform hover:scale-105">
                احجز موعدك الآن
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 mt-20">
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
          <div className="container mx-auto px-6 lg:flex lg:items-center lg:gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                نستقبل المواعيد الحضورية وعن بعد
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.2] mb-6">
                صحتك تبدأ بتغذية <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">سليمة ومتوازنة</span>
              </h1>
              <p className="mt-6 text-lg tracking-wide leading-8 text-muted-foreground mb-10 max-w-2xl">
                في عيادة الدكتورة سعاد، نقدم لك خططاً غذائية مخصصة تتناسب مع أهدافك الصحية وجدولك اليومي. فريقنا المتخصص هنا ليدعمك في كل خطوة نحو حياة أكثر صحة ونشاطاً.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 rounded-xl shadow-xl shadow-primary/20 transition-transform hover:scale-105">
                    احجز موعدك الآن
                    <CalendarDays className="ms-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 rounded-xl border-2" onClick={onLogin}>
                  دخول المراجعين
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-16 sm:mt-24 lg:mt-0 lg:w-1/2 relative hidden md:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-card border border-border">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-8">
                  {/* Dashboard Mockup abstract illustration */}
                  <div className="w-full h-full bg-background rounded-2xl shadow-sm border border-border/50 p-6 flex flex-col gap-4">
                    <div className="flex gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-32 bg-primary/5 rounded-xl border border-primary/10 mb-2 p-4 flex gap-4">
                        <div className="w-1/3 h-full bg-primary/10 rounded-lg"></div>
                        <div className="w-1/3 h-full bg-primary/20 rounded-lg"></div>
                        <div className="w-1/3 h-full bg-accent/20 rounded-lg"></div>
                    </div>
                    <div className="flex gap-3 mt-auto">
                      <div className="h-8 bg-muted rounded flex-1"></div>
                      <div className="h-8 bg-primary rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="services" className="py-24 bg-card border-y border-border">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-4">خدمات متكاملة لرعايتك</h2>
              <p className="text-lg text-muted-foreground">نوفر أحدث الأساليب العلمية في التغذية لضمان حصولك على نتائج مستدامة</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Apple, title: "خطط غذائية مخصصة", desc: "برامج مصممة خصيصاً لتناسب احتياجاتك، سواء لإنقاص الوزن، الرياضيين، أو الحالات الصحية." },
                { icon: Activity, title: "متابعة دورية مستمرة", desc: "نبقى معك خطوة بخطوة من خلال الجلسات الحضورية أو عن بعد لضمان تقدمك." },
                { icon: HeartPulse, title: "تحليل وقياسات دقيقة", desc: "استخدام أحدث أجهزة تحليل مكونات الجسم لمعرفة نسبة الدهون والعضل وتحديد المسار الصحيح." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-background rounded-3xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* Contact Section */}
        <section id="contact" className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-4">تواصل معنا</h2>
              <p className="text-lg text-muted-foreground">يمكنكم التواصل معنا والحصول على آخر التحديثات حول محاضرات ولقاءات د. سعاد من خلال الضغط على الروابط التالية</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: <FaInstagram className="w-6 h-6" />,
                  label: "انستقرام",
                  handle: "Dr_S_Alsulami",
                  href: "https://www.instagram.com/dr_s_alsulami?igsh=MWZsZTFteXB5cHlwcg%3D%3D&utm_source=qr",
                  color: "text-pink-500",
                  bg: "bg-pink-500/10",
                },
                {
                  icon: <FaSnapchat className="w-6 h-6" />,
                  label: "سناب شات",
                  handle: "Dr_SAlsulami",
                  href: "https://snapchat.com/t/ryUj6Ivv",
                  color: "text-yellow-500",
                  bg: "bg-yellow-500/10",
                },
                {
                  icon: <FaXTwitter className="w-6 h-6" />,
                  label: "تويتر",
                  handle: "Dr_S_Alsulami",
                  href: "https://x.com/dr_s_alsulami?s=11&t=WaQexWC1uW_sFW6kElT98A",
                  color: "text-foreground",
                  bg: "bg-muted",
                },
                {
                  icon: <FaTiktok className="w-6 h-6" />,
                  label: "تيك توك",
                  handle: "dr_s_alsulami",
                  href: "https://www.tiktok.com/@dr_s_alsulami",
                  color: "text-foreground",
                  bg: "bg-muted",
                },
                {
                  icon: <FaWhatsapp className="w-6 h-6" />,
                  label: "واتساب",
                  handle: "+966 54 865 9742",
                  href: "https://wa.link/btzhyv",
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                },
                {
                  icon: <Globe className="w-6 h-6" />,
                  label: "الموقع الإلكتروني",
                  handle: "sooadalsulami.com",
                  href: "https://sooadalsulami.com",
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
              ].map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-all hover:-translate-y-0.5 group"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="text-right min-w-0">
                    <p className="text-sm text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.handle}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Apple className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">عيادة الدكتورة سعاد</span>
          </div>
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} جميع الحقوق محفوظة لعيادة الدكتورة سعاد للتغذية.</p>
        </div>
      </footer>
    </div>
  );
}
