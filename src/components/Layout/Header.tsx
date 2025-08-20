import React from 'react';
import { useAppContext, useSettings } from '../../context';
import { ThemeToggle } from '../ThemeToggle';
import { ViewToggle } from '../ViewToggle';
import { SettingsPanel } from '../Settings';
import { FavoritesManager } from '../Favorites';

export const Header: React.FC = () => {
  const { state, toggleSidebar } = useAppContext();
  const { settings } = useSettings();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Logo */}
            <div className="flex items-center">
              <svg className="w-8 h-8 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Weather Compare
              </h1>
            </div>
          </div>

          {/* Center - View toggle (hidden on mobile) */}
          <div className="hidden md:block">
            <ViewToggle />
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-3">
            <FavoritesManager />
            <ThemeToggle />
            <SettingsPanel />
          </div>
        </div>
      </div>
    </header>
  );
};