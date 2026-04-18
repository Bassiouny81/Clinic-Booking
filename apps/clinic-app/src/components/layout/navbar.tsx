import { useLocation } from "wouter";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { navItems } from "./nav-items";

export function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.email?.split("@")[0] || "مستخدم";

  return (
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
  );
}
