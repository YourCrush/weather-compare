import React from 'react';
import { AppProvider } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import { WeatherDataProvider } from './context/WeatherDataProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Sidebar } from './components/Layout/Sidebar';
import { ErrorNotifications } from './components/ErrorNotifications';
import { SummaryView } from './components/Views/SummaryView';
import { CardsView } from './components/Views/CardsView';
import { ChartsView } from './components/Views/ChartsView';
import { SeasonalView } from './components/Views/SeasonalView';
import { useAppContext } from './context';
import './index.css';

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
          id="main-content"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Global notifications */}
      <ErrorNotifications />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Weather Comparison App</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Something went wrong loading the application.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
    >
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