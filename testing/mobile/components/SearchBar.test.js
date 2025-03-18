/**
 * SearchBar Component Tests
 * 
 * This file contains tests for the SearchBar component in the React Native mobile app.
 */

// Import dependencies
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Import the SearchBar component directly
import SearchBar from '../../../mobile/components/SearchBar';

describe('SearchBar', () => {
  // Mock functions
  const mockOnChangeText = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnClear = jest.fn();

  // Reset mocks between tests
  beforeEach(() => {
    mockOnChangeText.mockClear();
    mockOnSubmit.mockClear();
    mockOnClear.mockClear();
  });

  test('renders correctly with default props', () => {
    const { getByPlaceholderText, getByTestId } = render(
      React.createElement(SearchBar, {
        onChangeText: mockOnChangeText,
        onSubmit: mockOnSubmit,
        onClear: mockOnClear
      })
    );

    // Verify search input is displayed with correct placeholder
    const searchInput = getByPlaceholderText('Search products...');
    expect(searchInput).toBeDefined();

    // Verify search icon is displayed
    const searchIcon = getByTestId('search-bar-icon');
    expect(searchIcon).toBeDefined();
  });

  test('renders correctly with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      React.createElement(SearchBar, {
        placeholder: "Find vendors...",
        onChangeText: mockOnChangeText,
        onSubmit: mockOnSubmit,
        onClear: mockOnClear
      })
    );

    // Verify search input is displayed with custom placeholder
    const searchInput = getByPlaceholderText('Find vendors...');
    expect(searchInput).toBeDefined();
  });

  test('calls onChangeText when text changes', () => {
    const { getByTestId } = render(
      React.createElement(SearchBar, {
        onChangeText: mockOnChangeText,
        onSubmit: mockOnSubmit,
        onClear: mockOnClear
      })
    );

    // Find the TextInput
    const input = getByTestId('search-bar-input');
    
    // Simulate text change
    fireEvent.changeText(input, 'test search');
    
    // Verify onChangeText was called with the new text
    expect(mockOnChangeText).toHaveBeenCalledTimes(1);
    expect(mockOnChangeText).toHaveBeenCalledWith('test search');
  });

  test('calls onSubmit when submit button is pressed', () => {
    const { getByTestId } = render(
      React.createElement(SearchBar, {
        value: "test search",
        onChangeText: mockOnChangeText,
        onSubmit: mockOnSubmit,
        onClear: mockOnClear
      })
    );

    // Find the TextInput
    const input = getByTestId('search-bar-input');
    
    // Simulate submit event
    fireEvent(input, 'submitEditing');
    
    // Verify onSubmit was called
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test('shows clear button when value is provided', () => {
    const { getByTestId } = render(
      React.createElement(SearchBar, {
        value: "test search",
        onChangeText: mockOnChangeText,
        onSubmit: mockOnSubmit,
        onClear: mockOnClear
      })
    );

    // Verify clear button is displayed
    const clearButton = getByTestId('search-bar-clear-button');
    expect(clearButton).toBeDefined();
    
    // Verify clear icon is displayed
    const clearIcon = getByTestId('search-bar-clear-icon');
    expect(clearIcon).toBeDefined();
  });

  test('does not show clear button when value is empty', () => {
    const { queryByTestId } = render(
      React.createElement(SearchBar, {
        value: "",
        onChangeText: mockOnChangeText,
        onSubmit: mockOnSubmit,
        onClear: mockOnClear
      })
    );

    // Verify clear button is not displayed
    const clearButton = queryByTestId('search-bar-clear-button');
    expect(clearButton).toBeNull();
  });

  test('calls onClear when clear button is pressed', () => {
    const { getByTestId } = render(
      React.createElement(SearchBar, {
        value: "test search",
        onChangeText: mockOnChangeText,
        onSubmit: mockOnSubmit,
        onClear: mockOnClear
      })
    );

    // Find the clear button
    const clearButton = getByTestId('search-bar-clear-button');
    
    // Simulate press event
    fireEvent.press(clearButton);
    
    // Verify onClear was called
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  test('applies custom styles when style prop is provided', () => {
    const customStyle = { backgroundColor: 'lightblue', borderRadius: 20 };
    
    const { getByTestId } = render(
      React.createElement(SearchBar, {
        onChangeText: mockOnChangeText,
        onSubmit: mockOnSubmit,
        onClear: mockOnClear,
        style: customStyle
      })
    );

    // Find the container
    const container = getByTestId('search-bar');
    
    // Verify custom styles are applied
    expect(container.props.style).toEqual(expect.arrayContaining([customStyle]));
  });

  test('uses custom testID when provided', () => {
    const { getByTestId } = render(
      React.createElement(SearchBar, {
        onChangeText: mockOnChangeText,
        onSubmit: mockOnSubmit,
        onClear: mockOnClear,
        testID: "custom-search"
      })
    );

    // Find elements with custom testID
    const container = getByTestId('custom-search');
    const searchIcon = getByTestId('custom-search-icon');
    const input = getByTestId('custom-search-input');
    
    // Verify elements with custom testID exist
    expect(container).toBeDefined();
    expect(searchIcon).toBeDefined();
    expect(input).toBeDefined();
  });
});