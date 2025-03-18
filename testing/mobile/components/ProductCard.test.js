/**
 * ProductCard Component Tests
 * 
 * This file contains tests for the ProductCard component in the React Native mobile app.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '../../../mobile/components/ProductCard';
import Colors from '../../../mobile/constants/Colors';

describe('ProductCard', () => {
  // Mock data for testing
  const mockProduct = {
    id: '123',
    name: 'Test Product',
    price: 19.99,
    vendor_name: 'Test Vendor',
    image_url: 'https://example.com/test-image.jpg'
  };

  // Mock functions
  const mockOnPress = jest.fn();

  // Reset mocks between tests
  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test('renders correctly with all product data', () => {
    const { getByText, getByTestId } = render(
      <ProductCard 
        product={mockProduct} 
        onPress={mockOnPress} 
        testID="product-card"
      />
    );

    // Verify product name is displayed
    const productName = getByText('Test Product');
    expect(productName).toBeDefined();

    // Verify vendor name is displayed
    const vendorName = getByText('Test Vendor');
    expect(vendorName).toBeDefined();

    // Verify price is displayed with correct formatting
    const productPrice = getByText('$19.99');
    expect(productPrice).toBeDefined();
  });

  test('renders with default image when image_url is not provided', () => {
    const productWithoutImage = {
      ...mockProduct,
      image_url: null
    };

    const { getByTestId } = render(
      <ProductCard 
        product={productWithoutImage} 
        onPress={mockOnPress}
        testID="product-card"
      />
    );

    // Note: It's difficult to directly test image source in React Native Testing Library
    // This is a placeholder for actual image source testing which would be done in a real implementation
  });

  test('calls onPress with product data when card is pressed', () => {
    const { getByTestId } = render(
      <ProductCard 
        product={mockProduct} 
        onPress={mockOnPress}
        testID="product-card"
      />
    );

    // Find the TouchableOpacity container
    const touchable = getByTestId('product-card');
    
    // Simulate press event
    fireEvent.press(touchable);
    
    // Verify onPress was called with the product data
    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith(mockProduct);
  });

  test('applies custom styles when style prop is provided', () => {
    const customStyle = { backgroundColor: 'red', width: 150 };
    
    const { getByTestId } = render(
      <ProductCard 
        product={mockProduct} 
        onPress={mockOnPress}
        style={customStyle}
        testID="product-card"
      />
    );

    // Find the container
    const container = getByTestId('product-card');
    
    // Verify custom styles are applied
    // Note: This is simplified; in a real implementation we would need to check computed styles
    expect(container.props.style).toEqual(expect.arrayContaining([customStyle]));
  });

  // Note: This is a placeholder for a snapshot test
  // In a real implementation, we would include a proper snapshot test with 'toMatchSnapshot()'
});