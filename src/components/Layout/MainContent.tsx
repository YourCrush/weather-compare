import React from 'react';
import { useAppContext } from '../../context';
import { ViewToggle } from '../ViewToggle';
import { SummaryView } from '../Views/SummaryView';
import { CardsView } from '../Views/CardsView';
import { ChartsView } from '../Views/ChartsView';
import { SeasonalView } from '../Views/SeasonalView';
import { EmptyState } from '../EmptyState';

export const MainContent: React.FC = () => {
  const { state } = useAppContext();
  const { activeView } = state.ui;
  const hasLocations = state.locations.length > 0;

  const renderView = () => {
    if (!hasLocations) {
      return <EmptyState />;
    }

    switch (activeView) {
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
    <main className="flex-1 overflow-hidden">
      {/* Mobile view toggle */}
      <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ViewToggle />
      </div>

      {/* Main content */}
      <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderView()}
        </div>
      </div>
    </main>
  );
};