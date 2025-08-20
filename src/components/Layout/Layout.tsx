import React from 'react';
import { useAppContext } from '../../context';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { Footer } from './Footer';
import { LoadingOverlay } from '../LoadingOverlay';
import { ErrorNotifications } from '../ErrorNotifications';

export const Layout: React.FC = () => {
  const { state } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main layout */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <MainContent />
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Global loading overlay */}
      {state.ui.loading && <LoadingOverlay />}
      
      {/* Error notifications */}
      <ErrorNotifications />
    </div>
  );
};