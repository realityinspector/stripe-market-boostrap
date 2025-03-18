/**
 * VendorCard Component Tests
 * 
 * This file contains tests for the VendorCard component in the React Native mobile app.
 */

// Import React
const React = require('react');
// Import testing utilities
const { render, fireEvent } = require('@testing-library/react-native');
// Import the component
const VendorCard = require('../../../mobile/components/VendorCard').default;

describe('VendorCard', () => {
  // Mock data for testing
  const mockVendor = {
    id: '456',
    business_name: 'Test Vendor',
    business_description: 'This is a test vendor description',
    product_count: 12,
    stripe_onboarding_complete: true,
    logo_url: 'https://example.com/test-vendor-image.jpg'
  };

  // Mock functions
  const mockOnPress = jest.fn();

  // Reset mocks between tests
  beforeEach(() => {
    mockOnPress.mockClear();
  });

  test('renders correctly with all vendor data', () => {
    const { getByText, getByTestId } = render(
      React.createElement(VendorCard, {
        vendor: mockVendor,
        onPress: mockOnPress,
        testID: "vendor-card"
      })
    );

    // Verify vendor name is displayed
    const vendorName = getByText('Test Vendor');
    expect(vendorName).toBeDefined();

    // Verify vendor description is displayed
    const vendorDescription = getByText('This is a test vendor description');
    expect(vendorDescription).toBeDefined();

    // Verify product count is displayed
    const productCount = getByText('12 products');
    expect(productCount).toBeDefined();
    
    // Verify verified badge is displayed
    const verifiedBadge = getByTestId('vendor-card-verified');
    expect(verifiedBadge).toBeDefined();
  });

  test('truncates long description', () => {
    const longDescriptionVendor = {
      ...mockVendor,
      business_description: 'This is a very long description that should be truncated when displayed in the vendor card component to ensure it fits properly in the UI layout without causing any overflow issues.'
    };

    const { getByTestId } = render(
      React.createElement(VendorCard, {
        vendor: longDescriptionVendor,
        onPress: mockOnPress,
        testID: "vendor-card"
      })
    );

    // Check description text (actual truncation testing would depend on implementation)
    const description = getByTestId('vendor-card-description');
    expect(description).toBeDefined();
    expect(description.props.numberOfLines).toBe(2);
    
    // In a real test we'd check the number of lines, but this is implementation-specific
  });

  test('renders with icon when logo_url is not provided', () => {
    const vendorWithoutImage = {
      ...mockVendor,
      logo_url: null
    };

    const { getByTestId } = render(
      React.createElement(VendorCard, {
        vendor: vendorWithoutImage,
        onPress: mockOnPress,
        testID: "vendor-card"
      })
    );

    // Find the image container
    const imageContainer = getByTestId('vendor-card-image');
    expect(imageContainer).toBeDefined();
    
    // Check icon is used as fallback
    const icon = getByTestId('vendor-card-icon');
    expect(icon).toBeDefined();
  });

  test('calls onPress with vendor data when card is pressed', () => {
    const { getByTestId } = render(
      React.createElement(VendorCard, {
        vendor: mockVendor,
        onPress: mockOnPress,
        testID: "vendor-card"
      })
    );

    // Find the TouchableOpacity container
    const touchable = getByTestId('vendor-card');
    
    // Simulate press event
    fireEvent.press(touchable);
    
    // Verify onPress was called with the vendor data
    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith(mockVendor);
  });

  test('applies custom styles when style prop is provided', () => {
    const customStyle = { backgroundColor: 'lightblue', borderRadius: 20 };
    
    const { getByTestId } = render(
      React.createElement(VendorCard, {
        vendor: mockVendor,
        onPress: mockOnPress,
        style: customStyle,
        testID: "vendor-card"
      })
    );

    // Find the container
    const container = getByTestId('vendor-card');
    
    // Verify custom styles are applied
    expect(container.props.style).toEqual(expect.arrayContaining([customStyle]));
  });

  test('renders with verified badge for verified vendors', () => {
    const verifiedVendor = {
      ...mockVendor,
      stripe_onboarding_complete: true
    };

    const { getByTestId } = render(
      React.createElement(VendorCard, {
        vendor: verifiedVendor,
        onPress: mockOnPress,
        testID: "vendor-card"
      })
    );

    // Check for verified badge
    const verifiedBadge = getByTestId('vendor-card-verified');
    expect(verifiedBadge).toBeDefined();
  });

  test('renders pending badge for non-verified vendors', () => {
    const nonVerifiedVendor = {
      ...mockVendor,
      stripe_onboarding_complete: false
    };

    const { getByTestId, queryByTestId } = render(
      React.createElement(VendorCard, {
        vendor: nonVerifiedVendor,
        onPress: mockOnPress,
        testID: "vendor-card"
      })
    );

    // Check that verified badge is not present
    const verifiedBadge = queryByTestId('vendor-card-verified');
    expect(verifiedBadge).toBeNull();
    
    // Check that pending badge is present
    const pendingBadge = getByTestId('vendor-card-pending');
    expect(pendingBadge).toBeDefined();
  });
});