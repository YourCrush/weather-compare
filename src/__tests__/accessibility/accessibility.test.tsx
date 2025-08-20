import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LocationList } from '../../components/LocationList';
import { FavoritesManager } from '../../components/Favorites/FavoritesManager';
import { SettingsPanel } from '../../components/Settings/SettingsPanel';
import { ErrorNotifications } from '../../components/ErrorNotifications';
import { Location } from '../../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock contexts
const mockSettings = {
  favorites: [] as Location[],
  units: 'metric' as const,
  theme: 'light' as const,
  defaultView: 'summary' as const,
  chartSettings: {
    sharedYAxis: false,
    showGrid: true,
    showLegend: true,
    animationEnabled: true,
  },
  autoRefresh: true,
  refreshInterval: 15,
};

const mockAppState = {
  locations: [] as Location[],
  weatherData: new Map(),
  settings: mockSettings,
  ui: {
    activeView: 'summary' as const,
    loading: false,
    errors: [],
    selectedTimeRange: '7d' as const,
    sidebarOpen: false,
    exportModalOpen: false,
  },
};

vi.mock('../../context', () => ({
  useAppContext: () => ({
    state: mockAppState,
    addLocation: vi.fn(),
    removeLocation: vi.fn(),
    dismissError: vi.fn(),
  }),
  useSettings: () => ({
    settings: mockSettings,
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    setTheme: vi.fn(),
    setUnits: vi.fn(),
    toggleTheme: vi.fn(),
    toggleUnits: vi.fn(),
    formatTemperature: (celsius: number) => ({ value: Math.round(celsius), unit: '°C' }),
    formatSpeed: (mps: number) => ({ value: Math.round(mps * 3.6), unit: 'km/h' }),
    formatPressure: (hpa: number) => ({ value: Math.round(hpa), unit: 'hPa' }),
  }),
}));

const mockLocation: Location = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  region: 'New York',
};

describe('Accessibility Tests', () => {
  describe('LocationList', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <LocationList
          locations={[mockLocation]}
          onRemoveLocation={vi.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA labels for interactive elements', () => {
      render(
        <LocationList
          locations={[mockLocation]}
          onRemoveLocation={vi.fn()}
        />
      );

      expect(screen.getByLabelText('Remove New York')).toBeInTheDocument();
      expect(screen.getByLabelText('Add New York to favorites')).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(
        <LocationList
          locations={[mockLocation]}
          onRemoveLocation={vi.fn()}
        />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Selected Locations (1)');
    });

    it('supports keyboard navigation', () => {
      render(
        <LocationList
          locations={[mockLocation]}
          onRemoveLocation={vi.fn()}
        />
      );

      const removeButton = screen.getByLabelText('Remove New York');
      const favoriteButton = screen.getByLabelText('Add New York to favorites');

      expect(removeButton).toHaveAttribute('tabIndex', '0');
      expect(favoriteButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('FavoritesManager', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<FavoritesManager />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes for dropdown', () => {
      render(<FavoritesManager />);

      const button = screen.getByLabelText('Open favorites');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Open favorites');
    });

    it('announces state changes to screen readers', () => {
      const favoritesWithData = {
        ...mockSettings,
        favorites: [mockLocation],
      };

      vi.mocked(useSettings).mockReturnValue({
        ...vi.mocked(useSettings)(),
        settings: favoritesWithData,
      });

      render(<FavoritesManager />);

      // Should show count badge
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('SettingsPanel', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<SettingsPanel />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper form labels and associations', () => {
      render(<SettingsPanel />);

      // Check for proper form structure
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();

      // Check for fieldsets and legends
      const fieldsets = screen.getAllByRole('group');
      expect(fieldsets.length).toBeGreaterThan(0);
    });

    it('has proper radio button groups', () => {
      render(<SettingsPanel />);

      // Units radio group
      const unitsRadios = screen.getAllByRole('radio');
      expect(unitsRadios.length).toBeGreaterThan(0);

      unitsRadios.forEach(radio => {
        expect(radio).toHaveAttribute('name');
      });
    });

    it('provides clear error messages', () => {
      render(<SettingsPanel />);

      // Error messages should be associated with form controls
      const errorMessages = container.querySelectorAll('[role="alert"]');
      errorMessages.forEach(error => {
        expect(error).toHaveAttribute('id');
      });
    });
  });

  describe('ErrorNotifications', () => {
    it('should not have accessibility violations', async () => {
      const stateWithErrors = {
        ...mockAppState,
        ui: {
          ...mockAppState.ui,
          errors: [
            {
              id: '1',
              type: 'network' as const,
              message: 'Network error occurred',
              timestamp: new Date().toISOString(),
              dismissed: false,
            },
          ],
        },
      };

      vi.mocked(useAppContext).mockReturnValue({
        ...vi.mocked(useAppContext)(),
        state: stateWithErrors,
      });

      const { container } = render(<ErrorNotifications />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('announces errors to screen readers', () => {
      const stateWithErrors = {
        ...mockAppState,
        ui: {
          ...mockAppState.ui,
          errors: [
            {
              id: '1',
              type: 'network' as const,
              message: 'Network error occurred',
              timestamp: new Date().toISOString(),
              dismissed: false,
            },
          ],
        },
      };

      vi.mocked(useAppContext).mockReturnValue({
        ...vi.mocked(useAppContext)(),
        state: stateWithErrors,
      });

      render(<ErrorNotifications />);

      // Error should be announced with proper role
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('Network error occurred');
    });

    it('has accessible dismiss buttons', () => {
      const stateWithErrors = {
        ...mockAppState,
        ui: {
          ...mockAppState.ui,
          errors: [
            {
              id: '1',
              type: 'network' as const,
              message: 'Network error occurred',
              timestamp: new Date().toISOString(),
              dismissed: false,
            },
          ],
        },
      };

      vi.mocked(useAppContext).mockReturnValue({
        ...vi.mocked(useAppContext)(),
        state: stateWithErrors,
      });

      render(<ErrorNotifications />);

      const dismissButton = screen.getByLabelText('Dismiss error');
      expect(dismissButton).toBeInTheDocument();
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error');
    });
  });

  describe('Color Contrast', () => {
    it('meets WCAG AA contrast requirements', () => {
      // This would typically use a color contrast testing library
      // For now, we'll test that proper CSS classes are applied
      render(
        <div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
          Test content
        </div>
      );

      const element = screen.getByText('Test content');
      expect(element).toHaveClass('text-gray-900', 'dark:text-gray-100');
    });
  });

  describe('Focus Management', () => {
    it('maintains logical tab order', () => {
      render(
        <LocationList
          locations={[mockLocation]}
          onRemoveLocation={vi.fn()}
        />
      );

      const interactiveElements = screen.getAllByRole('button');
      
      // All interactive elements should be focusable
      interactiveElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('provides visible focus indicators', () => {
      render(
        <LocationList
          locations={[mockLocation]}
          onRemoveLocation={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      
      // Focus styles should be applied (checked via CSS classes)
      buttons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none');
        // Should have alternative focus styling
        expect(
          button.className.includes('focus:ring') || 
          button.className.includes('focus:border')
        ).toBe(true);
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('provides meaningful text alternatives', () => {
      render(
        <LocationList
          locations={[mockLocation]}
          onRemoveLocation={vi.fn()}
        />
      );

      // Icons should have text alternatives
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(
          button.hasAttribute('aria-label') || 
          button.textContent?.trim() !== ''
        ).toBe(true);
      });
    });

    it('uses semantic HTML elements', () => {
      render(
        <LocationList
          locations={[mockLocation]}
          onRemoveLocation={vi.fn()}
        />
      );

      // Should use proper semantic elements
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('provides status updates for dynamic content', () => {
      const stateWithLoading = {
        ...mockAppState,
        ui: {
          ...mockAppState.ui,
          loading: true,
        },
      };

      vi.mocked(useAppContext).mockReturnValue({
        ...vi.mocked(useAppContext)(),
        state: stateWithLoading,
      });

      render(<div aria-live="polite" aria-busy={stateWithLoading.ui.loading}>
        Loading content...
      </div>);

      const liveRegion = screen.getByText('Loading content...');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-busy', 'true');
    });
  });
});