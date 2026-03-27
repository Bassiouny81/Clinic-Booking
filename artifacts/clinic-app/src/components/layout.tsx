import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Receipt, 
  BellRing, 
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/appointments", label: "المواعيد", icon: CalendarDays },
  { href: "/patients", label: "المرضى", icon: Users },
  { href: "/invoices", label: "الفواتير", icon: Receipt },
  { href: "/notifications", label: "التنبيهات", icon: BellRing },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-l border-border/50 hidden md:flex flex-col shadow-xl shadow-black/5 z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {/* Fallback to text if image fails to load during generation */}
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
            <span className="font-display font-bold text-xl ms-2 text-primary">عيادتي</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive">
            <LogOut className="w-5 h-5 me-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
            <span className="font-display font-bold text-lg text-primary">عيادتي</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">د</span>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="h-20 bg-background/80 backdrop-blur-md sticky top-0 z-10 hidden md:flex items-center justify-between px-8 border-b border-border/40">
          <h1 className="text-2xl font-display font-bold text-foreground">
            {navItems.find(i => i.href === location)?.label || "النظام"}
          </h1>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full rounded-xl border-border/50">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-3 ps-4 border-s border-border/50">
              <div className="text-end">
                <p className="text-sm font-bold text-foreground">د. أحمد عبدالله</p>
                <p className="text-xs text-muted-foreground">أخصائي تغذية</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <span className="text-white font-bold">د.أ</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto space-y-8 pb-20"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
