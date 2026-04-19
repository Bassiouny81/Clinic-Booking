// Lazy loading utilities for code splitting
import { lazy } from 'react';

// Lazy load heavy components with proper named exports
export const LazyChartContainer = lazy(() => import('@/components/ui/chart').then(module => ({ 
  default: module.ChartContainer 
})));

export const LazyCarousel = lazy(() => import('@/components/ui/carousel').then(module => ({ 
  default: module.Carousel 
})));

export const LazyCalendar = lazy(() => import('@/components/ui/calendar').then(module => ({ 
  default: module.Calendar 
})));

// Lazy load route components (matching App.tsx imports)
export const LazyDashboard = lazy(() => import('@/pages/dashboard'));

export const LazyAppointments = lazy(() => import('@/pages/appointments'));

export const LazyPatients = lazy(() => import('@/pages/patients'));

export const LazyInvoices = lazy(() => import('@/pages/invoices'));

export const LazyNotifications = lazy(() => import('@/pages/notifications'));

export const LazyBookingPage = lazy(() => import('@/pages/book'));

export const LazyNotFound = lazy(() => import('@/pages/not-found'));
