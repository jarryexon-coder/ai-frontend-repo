import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen-enhanced-v2';

// Mock any dependencies
jest.mock('../../services/api-service', () => ({
  getNBAGames: jest.fn().mockResolvedValue([]),
  getNBAStandings: jest.fn().mockResolvedValue([]),
}));

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<HomeScreen />);
    
    // Check for any text element
    expect(getByText(/NBA/i)).toBeTruthy();
  });

  it('shows loading state initially', () => {
    const { getByTestId } = render(<HomeScreen />);
    
    // Assuming your component has a loading indicator
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
