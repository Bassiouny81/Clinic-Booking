import { lazy } from 'react';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

// Lazy loaded route components (matching actual page imports from App.tsx)
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Appointments = lazy(() => import('@/pages/appointments'));
const Patients = lazy(() => import('@/pages/patients'));
const Invoices = lazy(() => import('@/pages/invoices'));
const NotificationsPage = lazy(() => import('@/pages/notifications'));
const BookingPage = lazy(() => import('@/pages/book'));
const NotFound = lazy(() => import('@/pages/not-found'));

// Export lazy routes with Suspense wrapper
export const lazyRoutes = [
  {
    path: '/',
    component: () => (
      <Suspense fallback={<RouteLoader />}>
        <Dashboard />
      </Suspense>
    )
  },
  {
    path: '/appointments',
    component: () => (
      <Suspense fallback={<RouteLoader />}>
        <Appointments />
      </Suspense>
    )
  },
  {
    path: '/patients',
    component: () => (
      <Suspense fallback={<RouteLoader />}>
        <Patients />
      </Suspense>
    )
  },
  {
    path: '/invoices',
    component: () => (
      <Suspense fallback={<RouteLoader />}>
        <Invoices />
      </Suspense>
    )
  },
  {
    path: '/notifications',
    component: () => (
      <Suspense fallback={<RouteLoader />}>
        <NotificationsPage />
      </Suspense>
    )
  },
  {
    path: '/book',
    component: () => (
      <Suspense fallback={<RouteLoader />}>
        <BookingPage />
      </Suspense>
    )
  },
  {
    path: '*',
    component: () => (
      <Suspense fallback={<RouteLoader />}>
        <NotFound />
      </Suspense>
    )
  }
];
