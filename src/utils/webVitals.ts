/**
 * Web Vitals reporting utility
 * Measures and reports Core Web Vitals metrics
 */

export interface WebVitalMetric {
  name: string;
  value: number;
  unit?: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

type ReportHandler = (metric: WebVitalMetric) => void;

// Thresholds for Core Web Vitals (based on Google's recommendations)
const THRESHOLDS = {
  CLS: [0.1, 0.25],      // Cumulative Layout Shift
  FCP: [1800, 3000],     // First Contentful Paint (ms)
  FID: [100, 300],       // First Input Delay (ms)
  LCP: [2500, 4000],     // Largest Contentful Paint (ms)
  TTFB: [800, 1800],     // Time to First Byte (ms)
};

/**
 * Get rating based on metric value and thresholds
 */
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!thresholds) return 'good';
  
  if (value <= thresholds[0]) return 'good';
  if (value <= thresholds[1]) return 'needs-improvement';
  return 'poor';
};

/**
 * Create a metric object
 */
const createMetric = (
  name: string,
  value: number,
  unit?: string,
  delta: number = value,
  id: string = `${name}-${Date.now()}`
): WebVitalMetric => ({
  name,
  value,
  unit,
  rating: getRating(name, value),
  delta,
  id,
});

/**
 * Report Cumulative Layout Shift (CLS)
 */
const reportCLS = (onReport: ReportHandler) => {
  let clsValue = 0;
  let clsEntries: LayoutShift[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShift[]) {
      // Only count layout shifts without recent user input
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        clsEntries.push(entry);
      }
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });

  // Report CLS when the page is about to be unloaded
  const reportCLSValue = () => {
    if (clsValue > 0) {
      onReport(createMetric('CLS', clsValue));
    }
  };

  // Report on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportCLSValue();
    }
  });

  // Report on page unload
  window.addEventListener('beforeunload', reportCLSValue);
};

/**
 * Report First Contentful Paint (FCP)
 */
const reportFCP = (onReport: ReportHandler) => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        onReport(createMetric('FCP', entry.startTime, 'ms'));
        observer.disconnect();
      }
    }
  });

  observer.observe({ type: 'paint', buffered: true });
};

/**
 * Report First Input Delay (FID)
 */
const reportFID = (onReport: ReportHandler) => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEventTiming[]) {
      const fid = entry.processingStart - entry.startTime;
      onReport(createMetric('FID', fid, 'ms'));
      observer.disconnect();
    }
  });

  observer.observe({ type: 'first-input', buffered: true });
};

/**
 * Report Largest Contentful Paint (LCP)
 */
const reportLCP = (onReport: ReportHandler) => {
  let lcpValue = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LargestContentfulPaint[]) {
      lcpValue = entry.startTime;
    }
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });

  // Report LCP when the page is about to be unloaded
  const reportLCPValue = () => {
    if (lcpValue > 0) {
      onReport(createMetric('LCP', lcpValue, 'ms'));
    }
  };

  // Report on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportLCPValue();
    }
  });

  // Report on page unload
  window.addEventListener('beforeunload', reportLCPValue);
};

/**
 * Report Time to First Byte (TTFB)
 */
const reportTTFB = (onReport: ReportHandler) => {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceNavigationTiming[]) {
      const ttfb = entry.responseStart - entry.requestStart;
      onReport(createMetric('TTFB', ttfb, 'ms'));
      observer.disconnect();
    }
  });

  observer.observe({ type: 'navigation', buffered: true });
};

/**
 * Report custom metrics
 */
const reportCustomMetrics = (onReport: ReportHandler) => {
  // Report bundle size
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      onReport(createMetric('Connection', connection.effectiveType));
    }
  }

  // Report memory usage (if available)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    onReport(createMetric('Memory Usage', memoryUsage, '%'));
  }

  // Report device pixel ratio
  onReport(createMetric('Device Pixel Ratio', window.devicePixelRatio));

  // Report viewport size
  onReport(createMetric('Viewport Width', window.innerWidth, 'px'));
  onReport(createMetric('Viewport Height', window.innerHeight, 'px'));
};

/**
 * Main function to report all Web Vitals
 */
export const reportWebVitals = (onReport: ReportHandler) => {
  // Check if Performance Observer is supported
  if (typeof PerformanceObserver === 'undefined') {
    console.warn('PerformanceObserver is not supported in this browser');
    return;
  }

  try {
    reportCLS(onReport);
    reportFCP(onReport);
    reportFID(onReport);
    reportLCP(onReport);
    reportTTFB(onReport);
    reportCustomMetrics(onReport);
  } catch (error) {
    console.error('Error reporting Web Vitals:', error);
  }
};

/**
 * Send metrics to analytics service
 */
export const sendToAnalytics = (metric: WebVitalMetric) => {
  // In a real application, you would send this to your analytics service
  // For example: Google Analytics, Adobe Analytics, etc.
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', metric);
  }

  // Example: Send to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      custom_map: {
        metric_rating: metric.rating,
      },
    });
  }

  // Example: Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'web-vital',
        metric,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(error => {
      console.error('Failed to send analytics:', error);
    });
  }
};

// Type definitions for Performance Observer entries
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface LargestContentfulPaint extends PerformanceEntry {
  renderTime: number;
  loadTime: number;
  size: number;
  id: string;
  url: string;
  element: Element;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  cancelable: boolean;
  target: Node;
}

interface PerformanceNavigationTiming extends PerformanceEntry {
  unloadEventStart: number;
  unloadEventEnd: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
  type: string;
  redirectCount: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
}