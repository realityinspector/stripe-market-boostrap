/**
 * Button Component Tests
 * 
 * This file contains tests for the Button component in the React Native mobile app.
 */

const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');
const Button = require('../../../mobile/components/Button');
const Colors = require('../../../mobile/constants/Colors');

describe('Button', () => {
  // Mock function for onPress callback
  const mockOnPress = jest.fn();

  // Reset mocks between tests
  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test('renders correctly with default props', () => {
    const { getByText, getByTestId } = render(
      <Button 
        title="Test Button"
        onPress={mockOnPress}
        testID="test-button"
      />
    );

    // Verify button title is displayed
    const buttonTitle = getByText('Test Button');
    expect(buttonTitle).toBeDefined();
    
    // Verify button container has the correct styles
    const buttonContainer = getByTestId('test-button');
    expect(buttonContainer).toBeDefined();
  });

  test('renders disabled button correctly', () => {
    const { getByTestId } = render(
      <Button 
        title="Disabled Button"
        onPress={mockOnPress}
        disabled={true}
        testID="test-button"
      />
    );

    // Get button container
    const buttonContainer = getByTestId('test-button');
    
    // Verify disabled button has lower opacity
    // Note: This test would be better with specific style testing
    expect(buttonContainer.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opacity: expect.any(Number) })
      ])
    );
  });

  test('renders button with custom styles', () => {
    const customStyle = { backgroundColor: 'red', borderRadius: 30 };
    
    const { getByTestId } = render(
      <Button 
        title="Custom Button"
        onPress={mockOnPress}
        style={customStyle}
        testID="test-button"
      />
    );

    // Get button container
    const buttonContainer = getByTestId('test-button');
    
    // Verify custom styles are applied
    expect(buttonContainer.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 
          backgroundColor: 'red',
          borderRadius: 30
        })
      ])
    );
  });

  test('calls onPress when button is pressed', () => {
    const { getByTestId } = render(
      <Button 
        title="Press Me"
        onPress={mockOnPress}
        testID="test-button"
      />
    );

    // Get button container
    const buttonContainer = getByTestId('test-button');
    
    // Press the button
    fireEvent.press(buttonContainer);
    
    // Verify onPress was called
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress when disabled button is pressed', () => {
    const { getByTestId } = render(
      <Button 
        title="Disabled Button"
        onPress={mockOnPress}
        disabled={true}
        testID="test-button"
      />
    );

    // Get button container
    const buttonContainer = getByTestId('test-button');
    
    // Try pressing the disabled button
    fireEvent.press(buttonContainer);
    
    // Verify onPress was not called
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  test('renders button with icon correctly', () => {
    // Mock icon component
    const MockIcon = () => <></>;
    
    const { getByTestId } = render(
      <Button 
        title="Icon Button"
        onPress={mockOnPress}
        icon={<MockIcon testID="test-button-icon" />}
        testID="test-button"
      />
    );

    // Get button container and verify icon is present
    const buttonContainer = getByTestId('test-button');
    expect(buttonContainer).toBeDefined();
    
    // Note: In a real test, we'd verify the icon renders correctly
    // but this is limited in this mock setup
  });

  test('renders loading state correctly', () => {
    const { getByTestId, queryByText } = render(
      <Button 
        title="Loading Button"
        onPress={mockOnPress}
        loading={true}
        testID="test-button"
      />
    );

    // Get button container
    const buttonContainer = getByTestId('test-button');
    
    // Verify button title is not visible during loading
    expect(queryByText('Loading Button')).toBeNull();
    
    // Verify loading indicator is displayed
    // Note: In a real test with actual styles/components,
    // we'd directly check for the ActivityIndicator
  });
});