import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function MobileHeader() {
  const { user } = useAuth();
  const displayName = user?.firstName || "مستخدم";

  return (
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
  );
}
