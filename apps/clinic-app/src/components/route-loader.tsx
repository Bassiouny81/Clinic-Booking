import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LazyChartContainer, LazyCarousel, LazyCalendar } from '@/utils/lazy-imports';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

// Lazy load heavy components with fallback
export const LazyChartWithFallback = (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyChartContainer {...props} />
  </Suspense>
);

export const LazyCarouselWithFallback = (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyCarousel {...props} />
  </Suspense>
);

export const LazyCalendarWithFallback = (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyCalendar {...props} />
  </Suspense>
);

// Intersection Observer for lazy loading on scroll
export const useLazyLoadOnScroll = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { elementRef, isVisible };
};
