// Performance Monitoring System
// Tracks load times, memory usage, and performance metrics

export interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timestamp: number;
}

export interface ComponentMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRenderTimestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private observers: PerformanceObserver[] = [];
  private maxMetricsStored = 50;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe Core Web Vitals
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.recordMetric('largestContentfulPaint', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('firstInputDelay', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('cumulativeLayoutShift', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Paint timing
      const paintObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('firstContentfulPaint', entry.startTime);
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.warn('Performance observers not supported:', error);
    }
  }

  private recordMetric(metricName: keyof PerformanceMetrics, value: number) {
    const timestamp = Date.now();
    const existingMetric = this.metrics[this.metrics.length - 1];

    if (existingMetric && timestamp - existingMetric.timestamp < 5000) {
      // Update existing metric within 5 seconds
      (existingMetric as any)[metricName] = value;
    } else {
      // Create new metric entry
      const newMetric: any = {
        pageLoadTime: 0,
        timeToInteractive: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timestamp,
      };
      newMetric[metricName] = value;
      this.metrics.push(newMetric);

      // Limit stored metrics
      if (this.metrics.length > this.maxMetricsStored) {
        this.metrics.shift();
      }
    }
  }

  // Track component render performance
  public trackComponentRender(componentName: string, renderTime: number) {
    const existing = this.componentMetrics.get(componentName);
    if (existing) {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime: (existing.renderTime + renderTime) / 2, // Average
        renderCount: existing.renderCount + 1,
        lastRenderTimestamp: Date.now(),
      });
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        lastRenderTimestamp: Date.now(),
      });
    }
  }

  // Measure memory usage
  public measureMemory(): PerformanceMetrics['memoryUsage'] {
    if (typeof window !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return undefined;
  }

  // Get page load metrics
  public getPageLoadMetrics(): Partial<PerformanceMetrics> | null {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    return {
      pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      memoryUsage: this.measureMemory(),
      timestamp: Date.now(),
    };
  }

  // Get all metrics
  public getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  // Get component metrics
  public getComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values());
  }

  // Get slowest components
  public getSlowestComponents(limit: number = 5): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values())
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, limit);
  }

  // Clear metrics
  public clearMetrics() {
    this.metrics = [];
    this.componentMetrics.clear();
  }

  // Export metrics for analysis
  public exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      componentMetrics: Array.from(this.componentMetrics.values()),
      timestamp: Date.now(),
    }, null, 2);
  }

  // Disconnect observers
  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components
export function usePerformanceTracking(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    performanceMonitor.trackComponentRender(componentName, renderTime);
  };
}

// Utility to check if performance is good
export function getPerformanceScore(): {
  score: number;
  rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  recommendations: string[];
} {
  const metrics = performanceMonitor.getPageLoadMetrics();
  const memory = performanceMonitor.measureMemory();
  const slowComponents = performanceMonitor.getSlowestComponents(3);

  let score = 100;
  const recommendations: string[] = [];

  // Check page load time
  if (metrics?.pageLoadTime) {
    if (metrics.pageLoadTime > 5000) {
      score -= 30;
      recommendations.push('Page load time is too slow (>5s). Consider code splitting.');
    } else if (metrics.pageLoadTime > 3000) {
      score -= 15;
      recommendations.push('Page load time could be improved (<3s target).');
    }
  }

  // Check memory usage
  if (memory) {
    const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (memoryUsagePercent > 90) {
      score -= 25;
      recommendations.push('Memory usage is critical (>90%). Check for memory leaks.');
    } else if (memoryUsagePercent > 70) {
      score -= 10;
      recommendations.push('Memory usage is high (>70%). Monitor state size.');
    }
  }

  // Check slow components
  slowComponents.forEach(comp => {
    if (comp.renderTime > 100) {
      score -= 10;
      recommendations.push(`${comp.componentName} is slow (${comp.renderTime.toFixed(2)}ms). Consider optimization.`);
    }
  });

  // Determine rating
  let rating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  if (score >= 90) rating = 'excellent';
  else if (score >= 70) rating = 'good';
  else if (score >= 50) rating = 'needs-improvement';
  else rating = 'poor';

  return { score, rating, recommendations };
}

// Log performance metrics to console (development only)
export function logPerformanceMetrics() {
  if (process.env.NODE_ENV !== 'development') return;

  const pageMetrics = performanceMonitor.getPageLoadMetrics();
  const slowComponents = performanceMonitor.getSlowestComponents(5);
  const score = getPerformanceScore();

  console.group('🚀 Performance Metrics');
  console.log('Page Load Time:', pageMetrics?.pageLoadTime?.toFixed(2) + 'ms');
  console.log('Time to Interactive:', pageMetrics?.timeToInteractive?.toFixed(2) + 'ms');
  if (pageMetrics?.memoryUsage) {
    const memoryMB = (pageMetrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2);
    console.log('Memory Usage:', memoryMB + 'MB');
  }
  console.log('Performance Score:', score.score, `(${score.rating})`);
  if (score.recommendations.length > 0) {
    console.log('Recommendations:', score.recommendations);
  }
  if (slowComponents.length > 0) {
    console.log('Slowest Components:', slowComponents);
  }
  console.groupEnd();
}
