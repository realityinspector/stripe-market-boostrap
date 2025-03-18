/**
 * SearchBar Component Tests
 * 
 * This file contains tests for the SearchBar component in the React Native mobile app.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../../../mobile/components/SearchBar';

describe('SearchBar', () => {
  // Mock functions
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnClear = jest.fn();

  // Reset mocks between tests
  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnSubmit.mockClear();
    mockOnClear.mockClear();
  });

  test('renders correctly with default props', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <SearchBar 
        onChangeText={mockOnChange}
        onSubmit={mockOnSubmit}
        testID="search-bar"
      />
    );

    // Verify search bar is displayed with default placeholder
    const searchInput = getByPlaceholderText('Search products...');
    expect(searchInput).toBeDefined();
  });

  test('renders with custom placeholder', () => {
    const customPlaceholder = 'Find vendors...';
    const { getByPlaceholderText } = render(
      <SearchBar 
        placeholder={customPlaceholder}
        onChangeText={mockOnChange}
        onSubmit={mockOnSubmit}
        testID="search-bar"
      />
    );

    // Verify search bar is displayed with custom placeholder
    const searchInput = getByPlaceholderText(customPlaceholder);
    expect(searchInput).toBeDefined();
  });

  test('calls onChangeText when input changes', () => {
    const { getByTestId } = render(
      <SearchBar 
        onChangeText={mockOnChange}
        onSubmit={mockOnSubmit}
        testID="search-bar"
      />
    );

    // Find the TextInput
    const searchInput = getByTestId('search-bar-input');
    
    // Simulate typing text
    fireEvent.changeText(searchInput, 'test query');
    
    // Verify onChangeText was called with the input text
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('test query');
  });

  test('calls onSubmit when search is submitted', () => {
    const { getByTestId } = render(
      <SearchBar 
        onChangeText={mockOnChange}
        onSubmit={mockOnSubmit}
        testID="search-bar"
      />
    );

    // Find the TextInput
    const searchInput = getByTestId('search-bar-input');
    
    // Simulate submitting the search
    fireEvent(searchInput, 'submitEditing');
    
    // Verify onSubmit was called
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test('shows clear button when text is entered and calls onClear when pressed', () => {
    const { getByTestId, queryByTestId } = render(
      <SearchBar 
        onChangeText={mockOnChange}
        onSubmit={mockOnSubmit}
        onClear={mockOnClear}
        value="test query"
        testID="search-bar"
      />
    );

    // Verify clear button is visible when there's text
    const clearButton = getByTestId('search-bar-clear-button');
    expect(clearButton).toBeDefined();
    
    // Press the clear button
    fireEvent.press(clearButton);
    
    // Verify onClear was called
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  test('does not show clear button when input is empty', () => {
    const { queryByTestId } = render(
      <SearchBar 
        onChangeText={mockOnChange}
        onSubmit={mockOnSubmit}
        onClear={mockOnClear}
        value=""
        testID="search-bar"
      />
    );

    // Verify clear button is not visible when there's no text
    const clearButton = queryByTestId('search-bar-clear-button');
    expect(clearButton).toBeNull();
  });

  test('applies custom styles when style prop is provided', () => {
    const customStyle = { backgroundColor: 'red', borderRadius: 20 };
    
    const { getByTestId } = render(
      <SearchBar 
        onChangeText={mockOnChange}
        onSubmit={mockOnSubmit}
        style={customStyle}
        testID="search-bar"
      />
    );

    // Find the container
    const container = getByTestId('search-bar');
    
    // Verify custom styles are applied
    // Note: This is simplified; in a real implementation we would need to check computed styles
    expect(container.props.style).toEqual(expect.arrayContaining([customStyle]));
  });
});