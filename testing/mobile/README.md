# Mobile Testing Guide

## Overview

This directory contains the testing infrastructure for the React Native mobile components of the Stripe Connect Marketplace application. The tests validate that components render correctly, handle user interactions, and maintain expected functionality.

## Directory Structure

- `/components/` - Tests for UI components
- `/contexts/` - Tests for context providers (future)
- `/navigation/` - Tests for navigation components (future)
- `/screens/` - Tests for screen components (future)
- `/__mocks__/` - Mock implementations for native modules
- `jest.config.js` - Jest configuration for mobile tests
- `jest.setup.js` - Setup file for Jest with React Native specific configurations
- `setup.js` - Setup file for test environment
- `run_test.sh` - Shell script to run mobile tests
- `runMobileTests.js` - JavaScript wrapper for running mobile tests

## Running Tests

### Option 1: Using the shell script

```bash
# Run all mobile component tests
bash testing/mobile/run_test.sh

# Run tests for a specific component
bash testing/mobile/run_test.sh Button
```

### Option 2: Using the JavaScript runner

```bash
# Run all mobile component tests
node testing/mobile/runMobileTests.js

# Run tests for a specific component
node testing/mobile/runMobileTests.js Button

# Generate coverage report
node testing/mobile/runMobileTests.js --coverage
```

## Writing New Tests

1. Create a new test file in the appropriate directory (e.g., `components/NewComponent.test.js`)
2. Use the template from `testing/templates/mobile_test_template.js`
3. Use CommonJS require syntax for imports (not ES6 imports)
4. Make sure to add testIDs to your component for easier testing

### Example Test File Structure

```javascript
// Import dependencies using CommonJS syntax
const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');
const ComponentName = require('../../../mobile/components/ComponentName').default;

describe('ComponentName', () => {
  // Test cases...
});
```

## Test Coverage

Current test coverage includes:
- Button component
- SearchBar component
- ProductCard component
- VendorCard component

## Troubleshooting

If you encounter issues with the tests:

1. Make sure you're using CommonJS require syntax, not ES6 imports
2. Check that your component exports properly (default exports need `.default`)
3. Verify that testIDs are used consistently
4. Ensure the component mock in `__mocks__` is up to date if needed
5. Check that props are passed correctly to React.createElement