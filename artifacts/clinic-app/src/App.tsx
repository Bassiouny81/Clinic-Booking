import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

import { useState } from "react";
import LandingPage from "@/pages/landing";

// Local dev auth mock
export function useAuth() {
  const isAuth = localStorage.getItem("local_auth") === "true";
  return {
    isAuthenticated: isAuth,
    isLoading: false,
    user: { firstName: "دكتورة سعاد", id: "local" },
    login: () => {
      localStorage.setItem("local_auth", "true");
      window.location.href = "/";
    },
    logout: () => {
      localStorage.removeItem("local_auth");
      window.location.href = "/";
    },
  };
}

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
          {() => {
            const { login } = useAuth();
            return <LandingPage onLogin={login} />;
          }}
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
