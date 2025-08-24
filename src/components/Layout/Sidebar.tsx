import React from 'react';
import { useAppContext } from '../../context';
import { LocationManager } from '../LocationManager';

export const Sidebar: React.FC = () => {
  const { state, toggleSidebar } = useAppContext();

  return (
    <>
      {/* Backdrop */}
      {state.ui.sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
          ${state.ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:${state.ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 h-full overflow-y-auto">
          <LocationManager />
        </div>
      </aside>
    </>
  );
};