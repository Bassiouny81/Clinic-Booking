import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Receipt,
  BellRing,
} from "lucide-react";

export const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/appointments", label: "المواعيد", icon: CalendarDays },
  { href: "/patients", label: "المرضى", icon: Users },
  { href: "/invoices", label: "الفواتير", icon: Receipt },
  { href: "/notifications", label: "التنبيهات", icon: BellRing },
];
