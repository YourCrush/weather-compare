import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationList } from '../LocationList';
import { Location } from '../../types';

// Mock the settings context
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();
const mockSettings = {
  favorites: [] as Location[],
};

vi.mock('../../context', () => ({
  useSettings: () => ({
    settings: mockSettings,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
  }),
}));

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

const mockOnRemoveLocation = vi.fn();
const mockOnReorderLocations = vi.fn();

describe('LocationList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings.favorites = [];
  });

  it('renders nothing when no locations provided', () => {
    const { container } = render(
      <LocationList
        locations={[]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders location list with locations', () => {
    render(
      <LocationList
        locations={[mockLocation1, mockLocation2]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    expect(screen.getByText('Selected Locations (2)')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('displays location details correctly', () => {
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('New York, United States')).toBeInTheDocument();
    expect(screen.getByText('40.7128, -74.0060')).toBeInTheDocument();
  });

  it('calls onRemoveLocation when remove button is clicked', () => {
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Remove New York'));
    expect(mockOnRemoveLocation).toHaveBeenCalledWith('1');
  });

  it('shows favorite button when showFavorites is true', () => {
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
        showFavorites={true}
      />
    );
    
    expect(screen.getByLabelText('Add New York to favorites')).toBeInTheDocument();
  });

  it('hides favorite button when showFavorites is false', () => {
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
        showFavorites={false}
      />
    );
    
    expect(screen.queryByLabelText('Add New York to favorites')).not.toBeInTheDocument();
  });

  it('shows filled heart for favorited locations', () => {
    mockSettings.favorites = [mockLocation1];
    
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    const favoriteButton = screen.getByLabelText('Remove New York from favorites');
    expect(favoriteButton).toBeInTheDocument();
    
    // Check if the heart is filled (has fill attribute)
    const heartIcon = favoriteButton.querySelector('svg');
    expect(heartIcon).toHaveAttribute('fill', 'currentColor');
  });

  it('shows empty heart for non-favorited locations', () => {
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    const favoriteButton = screen.getByLabelText('Add New York to favorites');
    expect(favoriteButton).toBeInTheDocument();
    
    // Check if the heart is empty (has fill="none")
    const heartIcon = favoriteButton.querySelector('svg');
    expect(heartIcon).toHaveAttribute('fill', 'none');
  });

  it('adds location to favorites when favorite button is clicked', () => {
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Add New York to favorites'));
    expect(mockAddFavorite).toHaveBeenCalledWith(mockLocation1);
  });

  it('removes location from favorites when favorite button is clicked for favorited location', () => {
    mockSettings.favorites = [mockLocation1];
    
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Remove New York from favorites'));
    expect(mockRemoveFavorite).toHaveBeenCalledWith('1');
  });

  it('shows drag handles when showReorder is true', () => {
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
        onReorderLocations={mockOnReorderLocations}
        showReorder={true}
      />
    );
    
    // Check for drag handle icon (hamburger menu)
    const dragHandle = document.querySelector('svg[viewBox="0 0 24 24"]');
    expect(dragHandle).toBeInTheDocument();
  });

  it('shows reorder instruction when showReorder is true', () => {
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
        onReorderLocations={mockOnReorderLocations}
        showReorder={true}
      />
    );
    
    expect(screen.getByText('Drag locations to reorder them')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles drag and drop operations', () => {
    render(
      <LocationList
        locations={[mockLocation1, mockLocation2]}
        onRemoveLocation={mockOnRemoveLocation}
        onReorderLocations={mockOnReorderLocations}
        showReorder={true}
      />
    );
    
    const firstLocationCard = screen.getByText('New York').closest('.card');
    const secondLocationCard = screen.getByText('London').closest('.card');
    
    expect(firstLocationCard).toBeInTheDocument();
    expect(secondLocationCard).toBeInTheDocument();
    
    // Simulate drag start
    fireEvent.dragStart(firstLocationCard!, { dataTransfer: { effectAllowed: 'move', setData: vi.fn() } });
    
    // Simulate drag over second item
    fireEvent.dragOver(secondLocationCard!, { dataTransfer: { dropEffect: 'move' } });
    
    // Simulate drop
    fireEvent.drop(secondLocationCard!);
    
    expect(mockOnReorderLocations).toHaveBeenCalledWith(0, 1);
  });

  it('shows proper accessibility labels and titles', () => {
    render(
      <LocationList
        locations={[mockLocation1]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    expect(screen.getByLabelText('Remove New York')).toBeInTheDocument();
    expect(screen.getByTitle('Remove from comparison')).toBeInTheDocument();
    expect(screen.getByLabelText('Add New York to favorites')).toBeInTheDocument();
    expect(screen.getByTitle('Add to favorites')).toBeInTheDocument();
  });

  it('handles locations without region', () => {
    const locationWithoutRegion: Location = {
      ...mockLocation1,
      region: undefined,
    };
    
    render(
      <LocationList
        locations={[locationWithoutRegion]}
        onRemoveLocation={mockOnRemoveLocation}
      />
    );
    
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.queryByText('New York, United States')).not.toBeInTheDocument();
  });
});