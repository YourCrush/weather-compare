import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppProvider } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import { WeatherDataProvider } from './context/WeatherDataProvider';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Sidebar } from './components/Layout/Sidebar';
import { ErrorNotifications } from './components/ErrorNotifications';
import { SharedStateNotification } from './components/SharedStateNotification';
import { LoadingOverlay } from './components/Loading/LoadingOverlay';
import { PerformanceMonitor } from './components/Performance/PerformanceMonitor';
import { ExportModal } from './components/Export/ExportModal';
import { useAppContext } from './context';
import './index.css';

// Lazy load views for better performance
const SummaryView = lazy(() => import('./components/Views/SummaryView').then(m => ({ default: m.SummaryView })));
const CardsView = lazy(() => import('./components/Views/CardsView').then(m => ({ default: m.CardsView })));
const ChartsView = lazy(() => import('./components/Views/ChartsView').then(m => ({ default: m.ChartsView })));
const SeasonalView = lazy(() => import('./components/Views/SeasonalView').then(m => ({ default: m.SeasonalView })));

const AppContent: React.FC = () => {
  const { state } = useAppContext();

  const renderActiveView = () => {
    switch (state.ui.activeView) {
      case 'summary':
        return <SummaryView />;
      case 'cards':
        return <CardsView />;
      case 'charts':
        return <ChartsView />;
      case 'seasonal':
        return <SeasonalView />;
      default:
        return <SummaryView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Global loading overlay */}
      <LoadingOverlay 
        isVisible={state.ui.loading} 
        message="Loading weather data..." 
      />

      {/* Header */}
      <Header />

      {/* Main content area */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main 
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${state.ui.sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}
            pt-16 pb-20
          `}
          role="main"
          aria-label="Main content"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ErrorBoundary>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading view...</span>
                </div>
              }>
                {renderActiveView()}
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Global notifications and modals */}
      <ErrorNotifications />
      <SharedStateNotification />
      <ExportModal />

      {/* Performance monitor (development only) */}
      <PerformanceMonitor />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <SettingsProvider>
          <WeatherDataProvider>
            <AppContent />
          </WeatherDataProvider>
        </SettingsProvider>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;