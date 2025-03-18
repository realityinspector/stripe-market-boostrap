# Stripe Connect Marketplace Testing System

This directory contains a comprehensive automated testing system for the Stripe Connect Marketplace application. The system is designed to test all aspects of the application, including API endpoints, E2E flows, and frontend rendering.

## Test Structure

The testing system is organized into the following directories:

- `api/`: Tests for API endpoints
- `e2e/`: End-to-end integration tests
- `frontend/`: Tests for frontend rendering and performance
- `utils/`: Utility functions for testing
- `reports/`: Generated test reports (created on test execution)

## Running Tests

You can run tests using the TestRunner workflow or directly with Node.js:

```bash
# Run all tests
node testing/runTests.js

# Run tests for a specific category
node testing/runTests.js api
node testing/runTests.js e2e
node testing/runTests.js frontend
```

## Test Reports

After running tests, reports are generated in two formats:

1. JSON Report: `testing/reports/test-report-{timestamp}.json`
2. Text Report: `testing/reports/test-report-{timestamp}.txt`

These reports contain detailed information about the test execution, including:

- Overall test statistics
- Category-specific statistics
- Details for failed tests
- Performance metrics

## Available Tests

### API Tests
- `authEndpoints.test.js`: Tests for authentication-related API endpoints
- `productEndpoints.test.js`: Tests for product-related API endpoints

### E2E Tests
- `paymentFlow.test.js`: End-to-end test for the payment flow

### Frontend Tests
- `pageRendering.test.js`: Tests for frontend page rendering and performance

## Adding New Tests

To add a new test:

1. Create a new file in the appropriate directory
2. Export test functions from the file
3. Optionally, export a cleanup function for cleanup after tests

Example test file structure:

```javascript
/**
 * Test file description
 */

// Test function
exports.testSomething = async () => {
  // Test implementation
  // Return any result, or throw an error on failure
};

// Optional cleanup function
exports.cleanup = async () => {
  // Cleanup code
};
```

## Utility Functions

The testing system provides several utility functions to assist with testing:

- `testHelpers.js`: Helper functions for creating test data and verifying results
- `testRunner.js`: Functions for running tests and collecting results
- `reportGenerator.js`: Functions for generating test reports

## CI/CD Integration

The testing system can be integrated with CI/CD pipelines by running the test script and checking the exit code:

```bash
node testing/runTests.js
```

If all tests pass, the script will exit with code 0. If any tests fail, it will exit with code 1.