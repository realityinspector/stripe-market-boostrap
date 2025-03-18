# Stripe Connect Marketplace

A mobile Stripe Connect marketplace with robust automated testing infrastructure to ensure reliability and performance of vendor-customer interactions.

## Key Technologies

- React Native for mobile frontend
- Express backend
- PostgreSQL for data storage
- Comprehensive automated testing suite
- Continuous integration workflows

## Testing Infrastructure

This project implements a comprehensive testing framework that should be used when developing new features. The testing suite provides:

- **API Testing**: Validates all backend endpoints and services
- **UI Testing**: Ensures frontend components render correctly
- **E2E Testing**: Confirms complete user journeys function properly
- **Functional Testing**: Tests core business logic and features
- **Automated Testing**: Provides continuous validation of all systems

### Running Tests

```bash
# Run all tests
node testing/runTests.js

# Run specific test categories
node testing/runTests.js api     # Run only API tests
node testing/runTests.js ui      # Run only UI tests
node testing/runTests.js e2e     # Run only end-to-end tests
node testing/runTests.js auto    # Run the automated test suite

# Run the user-friendly test runner
node testing/run.js
```

### Test Reports

Test reports are generated in `testing/reports/` and provide detailed information about test results, including pass/fail rates and error messages.

## Development Guidelines

### Adding New Features

When adding new features to the application:

1. **Test First**: Create tests before implementing the feature
2. **Test During**: Ensure tests pass as you develop
3. **Test After**: Run the full test suite before submitting your changes

### Test Structure

- **Unit Tests**: Add to appropriate test file in `testing/api/` or `testing/frontend/`
- **Integration Tests**: Add to `testing/e2e/` directory
- **User Journey Tests**: Add to `testing/functional/` directory

### CI/CD Process

This project uses Replit's built-in deployment capabilities:

1. All tests must pass before deployment
2. The test suite will automatically run when major changes are made
3. Deployment is handled by Replit (through human operator)

## Important Notes for AI Agents

🚨 **CRITICAL**: Before implementing any feature, run the test suite to understand existing functionality and identify potential integration points.

🚨 **CRITICAL**: After implementing a feature, add appropriate tests and run the full test suite to ensure nothing was broken.

⚠️ **WARNING**: Do not modify core testing infrastructure without clear instructions. These components are essential for maintaining application reliability.

⚠️ **WARNING**: When working with Stripe Connect functionality, always use the testing infrastructure rather than making direct API calls.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `node server/server.js`
4. Run the test suite: `node testing/runTests.js`