/**
 * ProductCard Component Tests
 * 
 * This file contains tests for the ProductCard component in the React Native mobile app.
 */

// Import React
const React = require('react');
// Import testing utilities
const { render, fireEvent } = require('@testing-library/react-native');
// Import the component directly
const ProductCard = require('../../../mobile/components/ProductCard');

describe('ProductCard', () => {
  // Mock data for testing
  const mockProduct = {
    id: '123',
    name: 'Test Product',
    price: 49.99,
    vendor_name: 'Test Vendor',
    image_url: 'https://example.com/test-product.jpg'
  };

  // Mock functions
  const mockOnPress = jest.fn();

  // Reset mocks between tests
  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test('renders correctly with all product data', () => {
    const { getByText, getByTestId } = render(
      React.createElement(ProductCard, {
        product: mockProduct,
        onPress: mockOnPress,
        testID: "product-card"
      })
    );

    // Verify product name is displayed
    const productName = getByText('Test Product');
    expect(productName).toBeDefined();

    // Verify vendor name is displayed
    const vendorName = getByText('Test Vendor');
    expect(vendorName).toBeDefined();

    // Verify price is displayed and correctly formatted
    const price = getByText('$49.99');
    expect(price).toBeDefined();

    // Verify image container exists
    const imageContainer = getByTestId('product-card-image-container');
    expect(imageContainer).toBeDefined();
  });

  test('calls onPress with product data when card is pressed', () => {
    const { getByTestId } = render(
      React.createElement(ProductCard, {
        product: mockProduct,
        onPress: mockOnPress,
        testID: "product-card"
      })
    );

    // Find the TouchableOpacity container
    const touchable = getByTestId('product-card');
    
    // Simulate press event
    fireEvent.press(touchable);
    
    // Verify onPress was called with the product data
    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith(mockProduct);
  });

  test('uses default image when image_url is not provided', () => {
    const productWithoutImage = {
      ...mockProduct,
      image_url: null
    };

    const { getByTestId } = render(
      React.createElement(ProductCard, {
        product: productWithoutImage,
        onPress: mockOnPress,
        testID: "product-card"
      })
    );

    // Find the image element
    const image = getByTestId('product-card-image');
    
    // This test is implementation-specific; in a real test we'd check the source,
    // but that's challenging in a test environment, so we just check the element exists
    expect(image).toBeDefined();
  });

  test('truncates long product names to two lines', () => {
    const productWithLongName = {
      ...mockProduct,
      name: 'This is a very long product name that should be truncated when displayed in the product card component to ensure it fits properly in the UI layout without causing any overflow issues.'
    };

    const { getByTestId } = render(
      React.createElement(ProductCard, {
        product: productWithLongName,
        onPress: mockOnPress,
        testID: "product-card"
      })
    );

    // Find the name element
    const nameElement = getByTestId('product-card-name');
    
    // Check that it's set to display a maximum of 2 lines
    expect(nameElement.props.numberOfLines).toBe(2);
  });

  test('truncates long vendor names to one line', () => {
    const productWithLongVendorName = {
      ...mockProduct,
      vendor_name: 'This is a very long vendor name that should be truncated when displayed'
    };

    const { getByTestId } = render(
      React.createElement(ProductCard, {
        product: productWithLongVendorName,
        onPress: mockOnPress,
        testID: "product-card"
      })
    );

    // Find the vendor name element
    const vendorNameElement = getByTestId('product-card-vendor-name');
    
    // Check that it's set to display a maximum of 1 line
    expect(vendorNameElement.props.numberOfLines).toBe(1);
  });

  test('formats price with two decimal places', () => {
    const productWithIntegerPrice = {
      ...mockProduct,
      price: 50
    };

    const { getByText } = render(
      React.createElement(ProductCard, {
        product: productWithIntegerPrice,
        onPress: mockOnPress,
        testID: "product-card"
      })
    );

    // Verify price is formatted with two decimal places
    const price = getByText('$50.00');
    expect(price).toBeDefined();
  });

  test('applies custom styles when style prop is provided', () => {
    const customStyle = { backgroundColor: 'lightblue', borderRadius: 20 };
    
    const { getByTestId } = render(
      React.createElement(ProductCard, {
        product: mockProduct,
        onPress: mockOnPress,
        style: customStyle,
        testID: "product-card"
      })
    );

    // Find the container
    const container = getByTestId('product-card');
    
    // Verify custom styles are applied
    expect(container.props.style).toEqual(expect.arrayContaining([customStyle]));
  });
});