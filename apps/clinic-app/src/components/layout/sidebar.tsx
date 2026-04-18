import { Link, useLocation } from "wouter";
import { PlusCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { navItems } from "./nav-items";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.email?.split("@")[0] || "مستخدم";

  return (
    <aside className="w-64 bg-card border-l border-border/50 hidden md:flex flex-col shadow-xl shadow-black/5 z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
        </div>
        <span className="font-bold text-xl text-primary font-outfit">عيادتي</span>
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
  );
}
