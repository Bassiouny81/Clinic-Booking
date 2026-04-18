import { useGetDashboardStats } from "@workspace/api-client-react";
import { formatSAR, translateMode, translateStatus } from "@/hooks/use-clinic";
import { Users, CalendarDays, Wallet, Receipt, ArrowUpRight, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const statCards = [
    {
      title: "مواعيد اليوم",
      value: stats?.todayAppointments || 0,
      icon: CalendarDays,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      trend: "+2 من أمس",
    },
    {
      title: "إجمالي المرضى",
      value: stats?.totalPatients || 0,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      trend: "+12 هذا الشهر",
    },
    {
      title: "إيرادات الشهر",
      value: formatSAR(stats?.monthRevenue || 0),
      icon: Wallet,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      trend: "+8% عن الشهر الماضي",
    },
    {
      title: "فواتير معلقة",
      value: stats?.pendingInvoices || 0,
      icon: Receipt,
      color: "text-destructive",
      bg: "bg-destructive/10",
      trend: "تحتاج متابعة",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-lg shadow-black/5 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="w-3 h-3 me-1 text-green-500" />
                <span>{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              المواعيد القادمة
            </h2>
            <button
              onClick={() => navigate("/appointments")}
              className="text-sm text-primary hover:underline"
            >
              عرض الكل
            </button>
          </div>

          <Card className="border border-border/50 shadow-md rounded-2xl overflow-hidden">
            <div className="divide-y divide-border/50">
              {!stats?.upcomingAppointments?.length ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد مواعيد قادمة</p>
                </div>
              ) : (
                stats.upcomingAppointments.slice(0, 5).map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                        {appt.patient?.nameAr?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{appt.patient?.nameAr}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{appt.scheduledAt ? format(new Date(appt.scheduledAt), "hh:mm a") : "—"}</span>
                          <span>•</span>
                          <span>{translateMode(appt.mode)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`rounded-full px-3 py-1 text-xs ${
                        appt.status === "confirmed"
                          ? "bg-primary/20 text-primary"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {translateStatus(appt.status)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">إجراءات سريعة</h2>
          <Card className="border border-border/50 shadow-md rounded-2xl p-6 space-y-3 bg-gradient-to-br from-primary/5 to-transparent">
            <button
              onClick={() => window.location.href = "/book"}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-3 px-4 font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              <CalendarDays className="w-5 h-5" />
              حجز موعد جديد
            </button>
            <button
              onClick={() => navigate("/patients")}
              className="w-full bg-card border-2 border-primary/20 hover:border-primary text-primary rounded-xl py-3 px-4 font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-5 h-5" />
              إضافة مريض
            </button>
            <button
              onClick={() => navigate("/invoices")}
              className="w-full bg-card border-2 border-border hover:border-emerald-500 text-foreground rounded-xl py-3 px-4 font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Receipt className="w-5 h-5 text-emerald-600" />
              إنشاء فاتورة
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="w-full bg-card border-2 border-border hover:border-blue-400 text-foreground rounded-xl py-3 px-4 font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Activity className="w-5 h-5 text-blue-500" />
              إرسال تذكيرات
            </button>
          </Card>

          <Card className="border border-border/50 shadow-md rounded-2xl p-5">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">إحصائيات سريعة</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">معدل الحضور</span>
                <span className="font-bold text-green-600">87%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">متوسط مدة الجلسة</span>
                <span className="font-bold">45 دقيقة</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">رضا المرضى</span>
                <span className="font-bold text-primary">⭐ 4.8</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
