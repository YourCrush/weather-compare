import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FavoritesQuickSelect } from '../FavoritesQuickSelect';
import { Location } from '../../../types';

// Mock the contexts
const mockAddLocation = vi.fn();
const mockState = {
  locations: [] as Location[],
};

const mockSettings = {
  favorites: [] as Location[],
};

vi.mock('../../../context', () => ({
  useAppContext: () => ({
    state: mockState,
    addLocation: mockAddLocation,
  }),
  useSettings: () => ({
    settings: mockSettings,
  }),
}));

// Mock window.alert
const mockAlert = vi.fn();
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true,
});

const mockLocation1: Location = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  region: 'New York',
};

const mockLocation2: Location = {
  id: '2',
  name: 'London',
  country: 'United Kingdom',
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: 'Europe/London',
  region: 'England',
};

describe('FavoritesQuickSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings.favorites = [];
    mockState.locations = [];
  });

  it('does not render when no favorites exist', () => {
    const { container } = render(<FavoritesQuickSelect />);
    expect(container.firstChild).toBeNull();
  });

  it('renders quick select button when favorites exist', () => {
    mockSettings.favorites = [mockLocation1];
    
    render(<FavoritesQuickSelect />);
    
    expect(screen.getByLabelText('Quick select from favorites')).toBeInTheDocument();
    expect(screen.getByText('Quick Add')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Available count
  });

  it('renders in compact mode', () => {
    mockSettings.favorites = [mockLocation1];
    
    render(<FavoritesQuickSelect compact={true} />);
    
    expect(screen.getByLabelText('Quick select from favorites')).toBeInTheDocument();
    expect(screen.queryByText('Quick Add')).not.toBeInTheDocument(); // Hidden in compact mode
  });

  it('shows available favorites in dropdown', () => {
    mockSettings.favorites = [mockLocation1, mockLocation2];
    
    render(<FavoritesQuickSelect />);
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Quick select from favorites'));
    
    expect(screen.getByText('Quick Add Favorites')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('filters out locations already in comparison', () => {
    mockSettings.favorites = [mockLocation1, mockLocation2];
    mockState.locations = [mockLocation1]; // New York already in comparison
    
    render(<FavoritesQuickSelect />);
    
    // Should show count of 1 (only London available)
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Quick select from favorites'));
    
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.queryByText('New York')).not.toBeInTheDocument();
  });

  it('shows all favorites in comparison message when none available', () => {
    mockSettings.favorites = [mockLocation1, mockLocation2];
    mockState.locations = [mockLocation1, mockLocation2]; // Both already in comparison
    
    render(<FavoritesQuickSelect />);
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Quick select from favorites'));
    
    expect(screen.getByText('All favorites are already in comparison')).toBeInTheDocument();
  });

  it('adds location to comparison when clicked', () => {
    mockSettings.favorites = [mockLocation1];
    
    render(<FavoritesQuickSelect />);
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Quick select from favorites'));
    
    // Click on location
    fireEvent.click(screen.getByText('New York'));
    
    expect(mockAddLocation).toHaveBeenCalledWith(mockLocation1);
  });

  it('prevents adding when at location limit', () => {
    mockSettings.favorites = [mockLocation1];
    mockState.locations = [
      { id: '3', name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
      { id: '4', name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
      { id: '5', name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
    ];
    
    render(<FavoritesQuickSelect />);
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Quick select from favorites'));
    
    // Click on location
    fireEvent.click(screen.getByText('New York'));
    
    expect(mockAlert).toHaveBeenCalledWith('Maximum of 3 locations can be compared at once. Remove a location first.');
    expect(mockAddLocation).not.toHaveBeenCalled();
  });

  it('does not add location if already in comparison', () => {
    mockSettings.favorites = [mockLocation1];
    mockState.locations = [mockLocation1];
    
    render(<FavoritesQuickSelect />);
    
    // Should not show any available favorites
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('closes dropdown when close button is clicked', () => {
    mockSettings.favorites = [mockLocation1];
    
    render(<FavoritesQuickSelect />);
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Quick select from favorites'));
    expect(screen.getByText('Quick Add Favorites')).toBeInTheDocument();
    
    // Close dropdown
    fireEvent.click(screen.getByLabelText('Close quick select'));
    expect(screen.queryByText('Quick Add Favorites')).not.toBeInTheDocument();
  });

  it('closes dropdown when backdrop is clicked', () => {
    mockSettings.favorites = [mockLocation1];
    
    render(<FavoritesQuickSelect />);
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Quick select from favorites'));
    expect(screen.getByText('Quick Add Favorites')).toBeInTheDocument();
    
    // Click backdrop
    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    
    expect(screen.queryByText('Quick Add Favorites')).not.toBeInTheDocument();
  });

  it('closes dropdown after adding location', () => {
    mockSettings.favorites = [mockLocation1];
    
    render(<FavoritesQuickSelect />);
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Quick select from favorites'));
    expect(screen.getByText('Quick Add Favorites')).toBeInTheDocument();
    
    // Add location
    fireEvent.click(screen.getByText('New York'));
    
    expect(screen.queryByText('Quick Add Favorites')).not.toBeInTheDocument();
  });

  it('shows location count in footer', () => {
    mockSettings.favorites = [mockLocation1];
    mockState.locations = [mockLocation2]; // 1 location in comparison
    
    render(<FavoritesQuickSelect />);
    
    // Open dropdown
    fireEvent.click(screen.getByLabelText('Quick select from favorites'));
    
    expect(screen.getByText('Click to add to comparison (1/3 locations)')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    mockSettings.favorites = [mockLocation1];
    
    const { container } = render(<FavoritesQuickSelect className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows proper accessibility labels', () => {
    mockSettings.favorites = [mockLocation1];
    
    render(<FavoritesQuickSelect />);
    
    expect(screen.getByLabelText('Quick select from favorites')).toBeInTheDocument();
    expect(screen.getByTitle('Quick select from favorites')).toBeInTheDocument();
  });
});