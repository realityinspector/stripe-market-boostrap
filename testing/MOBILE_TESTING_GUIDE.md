# Mobile Testing Guide for Stripe Connect Marketplace

This guide provides detailed instructions for testing the React Native mobile components of the Stripe Connect Marketplace application.

## Table of Contents

1. [Setup](#setup)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Categories](#test-categories)
4. [Writing Tests](#writing-tests)
5. [Running Tests](#running-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Setup

The mobile testing infrastructure uses:

- Jest as the test runner
- React Native Testing Library for component testing
- Detox for E2E testing (future implementation)

To set up the testing environment:

```bash
# Install dependencies (if not already installed)
npm install --save-dev @testing-library/react-native @testing-library/jest-native

# Running tests
node testing/mobile/runMobileTests.js
```

## Testing Philosophy

The mobile testing approach follows these principles:

1. **Component-First Testing**: Each UI component should have its own test file
2. **User-Centric Testing**: Tests should simulate how users interact with components
3. **Integration Coverage**: Test how components work together
4. **Navigation Flow Testing**: Validate navigation between screens works correctly
5. **Cross-Platform Verification**: Test behavior on different device sizes

## Test Categories

Mobile tests are organized into the following categories:

### 1. Component Tests (`testing/mobile/components/`)

Test individual React Native components in isolation:
- Rendering with different props
- User interactions (press, change text, etc.)
- Style changes based on state
- Accessibility features

### 2. Navigation Tests (`testing/mobile/navigation/`)

Test the navigation structure and flows:
- Navigation between screens
- Navigation stack behavior
- Tab navigation
- Deep linking

### 3. Screen Tests (`testing/mobile/screens/`)

Test complete screens that combine multiple components:
- Screen rendering
- Screen interactions
- Data fetching and display
- Form submission

### 4. Context Tests (`testing/mobile/contexts/`)

Test context providers and hooks:
- Context state changes
- Hook behavior
- Authentication flows

## Writing Tests

### Component Test Structure

Each component test should follow this pattern:

```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ComponentName from '../../../mobile/components/ComponentName';

describe('ComponentName', () => {
  // Test rendering
  test('renders correctly', () => {
    const { getByTestId, toJSON } = render(<ComponentName prop1="value" />);
    expect(getByTestId('component-id')).toBeDefined();
    expect(toJSON()).toMatchSnapshot();
  });

  // Test interactions
  test('handles press events', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<ComponentName onPress={onPressMock} />);
    fireEvent.press(getByTestId('button'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
```

### Using Test IDs

Add `testID` props to your components to make them easily selectable in tests:

```jsx
<TouchableOpacity 
  testID="product-card" 
  onPress={onPress}
>
  <Text testID="product-name">{product.name}</Text>
</TouchableOpacity>
```

Then select elements in tests using `getByTestId`:

```javascript
const { getByTestId } = render(<ProductCard product={mockProduct} />);
expect(getByTestId('product-name').props.children).toBe('Test Product');
```

### Mocking Dependencies

For components that use external dependencies, create mocks in a `__mocks__` directory:

```javascript
// __mocks__/@react-navigation/native.js
export const useNavigation = jest.fn().mockReturnValue({
  navigate: jest.fn(),
  goBack: jest.fn(),
});
```

## Running Tests

Use the provided test runner to run mobile tests:

```bash
# Run all mobile tests
node testing/mobile/runMobileTests.js

# Run tests for a specific component
node testing/mobile/runMobileTests.js ProductCard

# Run tests with coverage report
node testing/mobile/runMobileTests.js --coverage
```

## CI/CD Integration

The mobile tests are integrated with the CI/CD pipeline through these mechanisms:

1. The `testing/ci.js` script runs mobile tests as part of the full test suite
2. The `testing/mobile/runMobileTests.js` script can be run independently
3. Test reports are generated in the standard format used by the CI/CD pipeline
4. Mobile test failures block deployment through the quality gates

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on state from other tests
2. **Mock External Resources**: Mock API calls, navigation, and external services
3. **Test the Interface, Not Implementation**: Focus on what users see and interact with
4. **Realistic Props**: Use realistic mock data that represents actual use cases
5. **Test Error States**: Verify components handle error cases gracefully
6. **Accessibility Testing**: Verify accessibility features work correctly
7. **Snapshot Maintenance**: Update snapshots when component changes are intentional

## Troubleshooting

### Common Issues

1. **Tests are not finding elements**:
   - Ensure testIDs are unique and correctly spelled
   - Check component rendering conditions

2. **Context errors**:
   - Wrap components in the necessary providers during testing

3. **Navigation errors**:
   - Mock the navigation object using jest.fn()

4. **Async test failures**:
   - Use `waitFor` or `act` for asynchronous operations

If you encounter persistent issues, please refer to the React Native Testing Library documentation or contact the development team.