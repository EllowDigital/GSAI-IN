/**
 * Performance monitoring utilities for tracking Core Web Vitals and user experience metrics
 */

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    try {
      // Observe paint metrics (FCP, LCP)
      if ('PerformanceObserver' in window) {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.logMetric('FCP', entry.startTime);
            }
          });
        });

        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

        // Observe LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.startTime;
          this.logMetric('LCP', lastEntry.startTime);
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Observe CLS
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.logMetric('CLS', clsValue);
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);

        // Observe FID
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.logMetric('FID', entry.processingStart - entry.startTime);
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      }

      // Measure TTFB using Navigation Timing API
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
          this.logMetric('TTFB', this.metrics.ttfb);
        }
      });

    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  private logMetric(name: string, value: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance Metric - ${name}: ${Math.round(value)}ms`);
    }

    // You can send metrics to analytics service here
    // Example: gtag('event', 'performance_metric', { metric_name: name, value: Math.round(value) });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public disconnect() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting performance observer:', error);
      }
    });
    this.observers = [];
  }

  // Utility methods for performance optimization
  public measureAsyncOperation<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return operation().finally(() => {
      const duration = performance.now() - startTime;
      this.logMetric(`Async Operation: ${name}`, duration);
    });
  }

  public measureSyncOperation<T>(
    name: string,
    operation: () => T
  ): T {
    const startTime = performance.now();
    
    try {
      return operation();
    } finally {
      const duration = performance.now() - startTime;
      this.logMetric(`Sync Operation: ${name}`, duration);
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vitals:', metric);
  }
  // Send to analytics service
  // gtag('event', metric.name, { value: Math.round(metric.value * 1000) });
};

export const preloadResource = (href: string, as: string, type?: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
};

export const preconnectToOrigin = (origin: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  
  document.head.appendChild(link);
};

export default performanceMonitor;