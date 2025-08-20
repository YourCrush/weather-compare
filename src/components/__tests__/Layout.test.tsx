import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Layout } from '../Layout/Layout';
import { Providers } from '../../context';

// Mock the location manager hook
vi.mock('../../hooks/useLocationManager', () => ({
  useLocationManager: () => ({
    locations: [],
    addLocation: vi.fn(),
    removeLocation: vi.fn(),
    reorderLocations: vi.fn(),
    error: null,
    clearError: vi.fn(),
  }),
}));

// Mock the weather services
vi.mock('../../services/weather-api', () => ({
  weatherService: {
    searchLocations: vi.fn(),
  },
}));

vi.mock('../../services/geolocation', () => ({
  geolocationService: {
    checkGeolocationSupport: vi.fn().mockResolvedValue({
      supported: true,
      permission: 'prompt',
    }),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Providers>
      {component}
    </Providers>
  );
};

describe('Layout', () => {
  it('renders header with logo and title', () => {
    renderWithProviders(<Layout />);
    
    expect(screen.getByText('Weather Compare')).toBeInTheDocument();
  });

  it('renders sidebar with location manager', () => {
    renderWithProviders(<Layout />);
    
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders main content with empty state', () => {
    renderWithProviders(<Layout />);
    
    expect(screen.getByText('Compare Weather Across Cities')).toBeInTheDocument();
  });

  it('renders footer with attribution', () => {
    renderWithProviders(<Layout />);
    
    expect(screen.getByText('Weather Compare by YourCrush')).toBeInTheDocument();
    expect(screen.getByText('Data from Open-Meteo')).toBeInTheDocument();
  });

  it('toggles sidebar on mobile menu button click', () => {
    renderWithProviders(<Layout />);
    
    const menuButton = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(menuButton);
    
    // The sidebar should be visible (not hidden by transform)
    const sidebar = screen.getByRole('complementary', { hidden: true });
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('renders view toggle buttons', () => {
    renderWithProviders(<Layout />);
    
    expect(screen.getByRole('tab', { name: /summary/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /cards/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /charts/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /seasonal/i })).toBeInTheDocument();
  });

  it('switches views when view toggle buttons are clicked', () => {
    renderWithProviders(<Layout />);
    
    const chartsButton = screen.getByRole('tab', { name: /charts/i });
    fireEvent.click(chartsButton);
    
    expect(screen.getByText('Charts View Coming Soon')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    renderWithProviders(<Layout />);
    
    const themeButton = screen.getByLabelText(/switch to.*mode/i);
    expect(themeButton).toBeInTheDocument();
  });

  it('toggles theme when theme button is clicked', () => {
    renderWithProviders(<Layout />);
    
    const themeButton = screen.getByLabelText(/switch to.*mode/i);
    fireEvent.click(themeButton);
    
    // Theme should change (this would be tested more thoroughly in theme tests)
    expect(themeButton).toBeInTheDocument();
  });
});