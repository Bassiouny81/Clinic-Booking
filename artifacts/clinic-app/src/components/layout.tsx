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
  Menu,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
function useAuth() {
  return {
    user: { firstName: "دكتورة سعاد", lastName: "", email: "doctor@clinic.com", id: "local" },
    logout: () => {
      localStorage.removeItem("local_auth");
      window.location.href = "/";
    },
  };
}

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/appointments", label: "المواعيد", icon: CalendarDays },
  { href: "/patients", label: "المرضى", icon: Users },
  { href: "/invoices", label: "الفواتير", icon: Receipt },
  { href: "/notifications", label: "التنبيهات", icon: BellRing },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.email?.split("@")[0] || "مستخدم";

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <aside className="w-64 bg-card border-l border-border/50 hidden md:flex flex-col shadow-xl shadow-black/5 z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
          </div>
          <span className="font-bold text-xl text-primary">عيادتي</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-border/50 mt-2">
            <a href="/book" className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-primary/10 transition-colors">
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">حجز موعد جديد</span>
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {(displayName[0] || "م").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground">أخصائي تغذية</div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 me-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
            <span className="font-bold text-lg text-primary">عيادتي</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{(displayName[0] || "م").toUpperCase()}</span>
          </div>
        </header>

        <header className="h-20 bg-background/80 backdrop-blur-md sticky top-0 z-10 hidden md:flex items-center justify-between px-8 border-b border-border/40">
          <h1 className="text-2xl font-bold text-foreground">
            {navItems.find((i) => i.href === location)?.label || "النظام"}
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full border-border/50">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-3 ps-4 border-s border-border/50">
              <div className="text-end">
                <p className="text-sm font-bold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">أخصائي تغذية</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <span className="text-white font-bold">{(displayName[0] || "م").toUpperCase()}</span>
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
