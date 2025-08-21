import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FavoritesManager } from '../FavoritesManager';
import { Location } from '../../../types';

// Mock the contexts
const mockAddLocation = vi.fn();
const mockAddFavorite = vi.fn();
const mockRemoveFavorite = vi.fn();

const mockSettings = {
  favorites: [] as Location[],
};

vi.mock('../../../context', () => ({
  useAppContext: () => ({
    addLocation: mockAddLocation,
  }),
  useSettings: () => ({
    settings: mockSettings,
    addFavorite: mockAddFavorite,
    removeFavorite: mockRemoveFavorite,
  }),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

const mockLocation: Location = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  region: 'New York',
};

describe('FavoritesManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings.favorites = [];
    mockConfirm.mockReturnValue(true);
  });

  it('renders favorites button with count', () => {
    mockSettings.favorites = [mockLocation];
    
    render(<FavoritesManager />);
    
    expect(screen.getByLabelText('Open favorites')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });\n\n  it('shows empty state when no favorites', () => {\n    render(<FavoritesManager />);\n    \n    // Open the dropdown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    \n    expect(screen.getByText('No favorite locations yet')).toBeInTheDocument();\n    expect(screen.getByText('Add locations to your comparison to save them as favorites')).toBeInTheDocument();\n  });\n\n  it('displays favorite locations', () => {\n    mockSettings.favorites = [mockLocation];\n    \n    render(<FavoritesManager />);\n    \n    // Open the dropdown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    \n    expect(screen.getByText('New York')).toBeInTheDocument();\n    expect(screen.getByText('New York, United States')).toBeInTheDocument();\n  });\n\n  it('adds location to comparison when add button is clicked', () => {\n    mockSettings.favorites = [mockLocation];\n    \n    render(<FavoritesManager />);\n    \n    // Open the dropdown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    \n    // Click add to comparison button\n    fireEvent.click(screen.getByLabelText('Add New York to comparison'));\n    \n    expect(mockAddLocation).toHaveBeenCalledWith(mockLocation);\n  });\n\n  it('removes favorite when remove button is clicked and confirmed', async () => {\n    mockSettings.favorites = [mockLocation];\n    \n    render(<FavoritesManager />);\n    \n    // Open the dropdown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    \n    // Click remove button\n    fireEvent.click(screen.getByLabelText('Remove New York from favorites'));\n    \n    expect(mockConfirm).toHaveBeenCalledWith('Remove this location from favorites?');\n    expect(mockRemoveFavorite).toHaveBeenCalledWith('1');\n  });\n\n  it('does not remove favorite when removal is cancelled', () => {\n    mockConfirm.mockReturnValue(false);\n    mockSettings.favorites = [mockLocation];\n    \n    render(<FavoritesManager />);\n    \n    // Open the dropdown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    \n    // Click remove button\n    fireEvent.click(screen.getByLabelText('Remove New York from favorites'));\n    \n    expect(mockConfirm).toHaveBeenCalledWith('Remove this location from favorites?');\n    expect(mockRemoveFavorite).not.toHaveBeenCalled();\n  });\n\n  it('closes dropdown when close button is clicked', () => {\n    render(<FavoritesManager />);\n    \n    // Open the dropdown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    expect(screen.getByText('Favorite Locations')).toBeInTheDocument();\n    \n    // Close the dropdown\n    fireEvent.click(screen.getByLabelText('Close favorites'));\n    \n    expect(screen.queryByText('Favorite Locations')).not.toBeInTheDocument();\n  });\n\n  it('closes dropdown when backdrop is clicked', () => {\n    render(<FavoritesManager />);\n    \n    // Open the dropdown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    expect(screen.getByText('Favorite Locations')).toBeInTheDocument();\n    \n    // Click backdrop\n    const backdrop = document.querySelector('.fixed.inset-0');\n    expect(backdrop).toBeInTheDocument();\n    fireEvent.click(backdrop!);\n    \n    expect(screen.queryByText('Favorite Locations')).not.toBeInTheDocument();\n  });\n\n  it('closes dropdown after adding location to comparison', () => {\n    mockSettings.favorites = [mockLocation];\n    \n    render(<FavoritesManager />);\n    \n    // Open the dropdown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    expect(screen.getByText('Favorite Locations')).toBeInTheDocument();\n    \n    // Add location to comparison\n    fireEvent.click(screen.getByLabelText('Add New York to comparison'));\n    \n    expect(screen.queryByText('Favorite Locations')).not.toBeInTheDocument();\n  });\n\n  it('handles multiple favorite locations', () => {\n    const location2: Location = {\n      id: '2',\n      name: 'London',\n      country: 'United Kingdom',\n      latitude: 51.5074,\n      longitude: -0.1278,\n      timezone: 'Europe/London',\n      region: 'England',\n    };\n    \n    mockSettings.favorites = [mockLocation, location2];\n    \n    render(<FavoritesManager />);\n    \n    // Check count in button\n    expect(screen.getByText('2')).toBeInTheDocument();\n    \n    // Open dropdown and check both locations are shown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    \n    expect(screen.getByText('New York')).toBeInTheDocument();\n    expect(screen.getByText('London')).toBeInTheDocument();\n  });\n\n  it('shows proper accessibility labels and titles', () => {\n    mockSettings.favorites = [mockLocation];\n    \n    render(<FavoritesManager />);\n    \n    // Open the dropdown\n    fireEvent.click(screen.getByLabelText('Open favorites'));\n    \n    // Check accessibility labels\n    expect(screen.getByLabelText('Add New York to comparison')).toBeInTheDocument();\n    expect(screen.getByLabelText('Remove New York from favorites')).toBeInTheDocument();\n    expect(screen.getByLabelText('Close favorites')).toBeInTheDocument();\n    \n    // Check titles\n    expect(screen.getByTitle('Add to comparison')).toBeInTheDocument();\n    expect(screen.getByTitle('Remove from favorites')).toBeInTheDocument();\n  });\n});"