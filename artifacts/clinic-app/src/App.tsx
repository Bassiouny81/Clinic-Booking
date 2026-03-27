import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";

import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Patients from "@/pages/patients";
import Invoices from "@/pages/invoices";
import NotificationsPage from "@/pages/notifications";
import BookingPage from "@/pages/book";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PublicBookingRoute() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="logo" className="w-8 h-8 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="font-bold text-lg">عيادتي</span>
        </div>
        <LoginButton />
      </header>
      <main className="container mx-auto">
        <BookingPage />
      </main>
    </div>
  );
}

function LoginButton() {
  const { isAuthenticated, isLoading, login, logout, user } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{user?.firstName || "مستخدم"}</span>
        <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground underline">تسجيل الخروج</button>
      </div>
    );
  }
  return (
    <button onClick={login} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
      تسجيل الدخول
    </button>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/book" component={PublicBookingRoute} />
      {isAuthenticated ? (
        <Route>
          {() => (
            <Layout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/appointments" component={Appointments} />
                <Route path="/patients" component={Patients} />
                <Route path="/invoices" component={Invoices} />
                <Route path="/notifications" component={NotificationsPage} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
          )}
        </Route>
      ) : (
        <Route>
          {() => (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-8 p-6" dir="rtl">
              <div className="text-center space-y-4 max-w-md">
                <img src="/images/logo.png" alt="logo" className="w-20 h-20 rounded-2xl object-cover mx-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <h1 className="text-3xl font-bold">عيادتي</h1>
                <p className="text-muted-foreground text-lg">نظام إدارة عيادة التغذية المتكامل</p>
                <p className="text-sm text-muted-foreground">سجّل دخولك للوصول إلى لوحة التحكم</p>
              </div>
              <div className="space-y-4 w-full max-w-sm">
                <LoginButton />
                <div className="text-center">
                  <span className="text-muted-foreground text-sm">أو </span>
                  <a href="/book" className="text-primary text-sm underline hover:opacity-80">احجز موعداً بدون تسجيل دخول</a>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground max-w-md w-full pt-4 border-t">
                <div><div className="text-2xl mb-1">🏥</div>حجز مواعيد</div>
                <div><div className="text-2xl mb-1">💳</div>دفع إلكتروني</div>
                <div><div className="text-2xl mb-1">📱</div>واتساب</div>
              </div>
            </div>
          )}
        </Route>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
