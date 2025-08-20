import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Mark app start
  performance.mark('app-start');
}

// Create root and render app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Mark app rendered
  performance.mark('app-rendered');
  
  // Measure app initialization time
  performance.measure('app-initialization', 'app-start', 'app-rendered');
  
  // Log performance metrics
  const initMeasure = performance.getEntriesByName('app-initialization')[0];
  if (initMeasure) {
    console.log(`⚡ App initialized in ${initMeasure.duration.toFixed(2)}ms`);
  }
  
  // Report Web Vitals in development
  import('./utils/webVitals').then(({ reportWebVitals }) => {
    reportWebVitals((metric) => {
      console.log(`📊 ${metric.name}: ${metric.value}${metric.unit || ''}`);
    });
  });
}