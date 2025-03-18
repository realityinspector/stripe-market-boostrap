# Developer Guide: Testing Infrastructure

## 🚨 ATTENTION AI AGENTS & DEVELOPERS 🚨

This guide provides essential information for working with the testing infrastructure in this Stripe Connect Marketplace application. Following these guidelines is critical for maintaining a healthy, reliable testing ecosystem.

## Core Testing Philosophy

This project follows a comprehensive testing approach with several layers:

1. **API Tests**: Validate backend functionality and data integrity
2. **UI Tests**: Ensure frontend components render correctly
3. **E2E Tests**: Verify complete user journeys
4. **Functional Tests**: Test core business logic and features
5. **Automated Tests**: Provide continuous validation of all systems

## Adding Tests for New Features

### Step 1: Understand the Feature Context

Before implementing a feature, review existing tests to understand:
- How related components are currently tested
- What test fixtures and mocks are available
- Integration points with other components

```javascript
// EXAMPLE: Review existing product tests when adding a new product feature
// in testing/api/productEndpoints.test.js
```

### Step 2: Write Tests BEFORE Implementation

Follow Test-Driven Development (TDD) principles by writing tests first:

```javascript
/**
 * EXAMPLE: Test for new feature to filter products by price range
 */
async function testProductPriceFilter() {
  // Setup test products with different prices
  // Test the filter functionality
  // Validate expected results
}
```

### Step 3: Ensure Tests are Self-Documenting

All tests should clearly document what they test and expected behavior:

```javascript
/**
 * Test that products can be filtered by price range
 * 
 * Expectations:
 * - Specifying min price should exclude products below that price
 * - Specifying max price should exclude products above that price
 * - Specifying both should return only products in that range
 * - Ranges should be inclusive (e.g., min=10, max=20 includes $10 and $20 products)
 */
```

### Step 4: Integrate with Existing Tests

Add your test to the appropriate test file:

```javascript
// Add to existing export
module.exports = {
  testProductCreation,
  testProductListing,
  // Add your new test here
  testProductPriceFilter
};
```

### Step 5: Run the Test Suite

Always run the full test suite to ensure your changes don't break existing functionality:

```bash
# Run all tests
node testing/runTests.js

# Run only API tests
node testing/runTests.js api
```

## Test Categories and Organization

### API Tests (`testing/api/`)

Tests for backend API endpoints and services. Add tests here for:
- New API endpoints
- API parameter validation
- Response format and content
- Error handling

### UI Tests (`testing/frontend/` & `testing/e2e/`)

Tests for frontend components and rendering. Add tests here for:
- New UI components
- Page rendering
- Responsive design
- UI state management

### Functional Tests (`testing/functional/`)

Tests for complete user journeys. Add tests here for:
- New user workflows
- Integration between components
- Business logic validation

### Automated Tests (`testing/automation/`)

Comprehensive automated tests. These are typically composed of combinations of other tests.

## Working with Stripe Connect Testing

### Test Environment Setup

The testing infrastructure uses a mock Stripe environment for testing:

```javascript
// Example from testing/functional/stripe_integration.test.js
async function mockStripeInBrowser(page) {
  await page.evaluateOnNewDocument(() => {
    // Mock Stripe object
    window.Stripe = (key) => {
      /* Implementation details */
    };
  });
}
```

### Test Stripe Connect Onboarding

When adding vendor features, ensure to test the Stripe Connect onboarding flow:

```javascript
// Example from testing/functional/vendor_journey.test.js
async function testStripeConnectOnboarding(page) {
  // Navigate to onboarding page
  // Test the Connect button interaction
  // Validate successful onboarding
}
```

### Test Payment Processing

When adding payment features, ensure to test the full payment flow:

```javascript
// Example from testing/functional/customer_journey.test.js
async function testPaymentProcess(page) {
  // Test Stripe Elements rendering
  // Test payment submission
  // Validate payment confirmation
}
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on state from other tests
2. **Comprehensive Coverage**: Test happy paths, edge cases, and error conditions
3. **Descriptive Names**: Use clear test names that describe what's being tested
4. **Meaningful Assertions**: Assert the specific behavior you're testing
5. **Clean Up**: Always clean up test data after tests run

## Common Pitfalls to Avoid

1. **❌ Fragile Tests**: Don't write tests that depend on specific timing or state
2. **❌ Duplicate Coverage**: Don't duplicate test coverage unnecessarily
3. **❌ Testing Implementation Details**: Test behavior, not implementation
4. **❌ Incomplete Testing**: Don't forget to test error cases and edge conditions
5. **❌ Hard-coded Data**: Don't use hard-coded test data that could become invalid

## Troubleshooting

If tests are failing:

1. Check the test logs in `testing/logs/`
2. Look for screenshots in `testing/screenshots/`
3. Review recent changes to related code
4. Ensure Stripe mock integrations are properly configured

## CI/CD Integration

The testing infrastructure integrates with CI/CD through:

1. **Test Coordinator**: `/testing/coordinator/testCoordinator.js`
2. **Report Generator**: `/testing/utils/reportGenerator.js`
3. **Replit Workflows**: Configured in the Replit environment

Always check that CI passes before requesting deployment.