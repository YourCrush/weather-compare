import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Mark app start
  performance.mark('app-start');
}

// Error handling for missing root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error: Root element not found</h1><p>The application could not start properly.</p></div>';
} else {
  // Create root and render app
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

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
  
  // Web Vitals reporting disabled for now
  // import('./utils/webVitals').then(({ reportWebVitals }) => {
  //   reportWebVitals((metric) => {
  //     console.log(`📊 ${metric.name}: ${metric.value}${metric.unit || ''}`);
  //   });
  // });
}