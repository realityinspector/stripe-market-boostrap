# Stripe Connect Marketplace

A mobile Stripe Connect marketplace with an advanced automated testing infrastructure designed to ensure robust reliability and performance of vendor-customer interactions.

## Key Technologies

- React Native for mobile frontend
- Express backend with RESTful API
- PostgreSQL for data storage
- Comprehensive automated testing suite with expanded test example library
- Enhanced continuous integration workflows with detailed error tracking

## Testing Infrastructure

This project implements a comprehensive multi-layered testing framework that must be used when developing new features. The testing suite provides:

- **API Testing**: Validates all backend endpoints, services, and error handling
- **UI Testing**: Ensures frontend components render correctly across device sizes
- **E2E Testing**: Confirms complete user journeys function properly end-to-end
- **Functional Testing**: Tests core business logic, edge cases, and Stripe integration
- **Automated Testing**: Provides continuous validation of all systems as a CI/CD pipeline

### Running Tests

```bash
# --- COMPLETE CI/CD TEST SUITE ---
# Run the full E2E-CI/CD test set (recommended before deployments)
node testing/ci.js

# --- AUTOMATED TEST RUNNERS ---
# Run the entire automated test suite (API, UI, E2E tests)
node testing/automation/runAutomatedTests.js

# Run specific automated test categories
node testing/automation/runAutomatedTests.js --api-only    # Run only API tests
node testing/automation/runAutomatedTests.js --ui-only     # Run only UI tests
node testing/automation/runAutomatedTests.js --e2e-only    # Run only E2E tests
node testing/automation/runAutomatedTests.js --monitor     # Run tests continuously

# --- INDIVIDUAL TEST CATEGORIES ---
# Run all tests or specific categories
node testing/runTests.js                # Run all tests
node testing/runTests.js api            # Run only API tests
node testing/runTests.js ui             # Run only UI tests
node testing/runTests.js e2e            # Run only end-to-end tests
node testing/runTests.js auto           # Run automated test suite
node testing/runTests.js stripe         # Run Stripe integration tests

# --- FUNCTIONAL TESTS ---
# Run user journey functional tests
node testing/functional/runFunctionalTests.js              # Run all functional tests
node testing/functional/runFunctionalTests.js customer     # Test customer journey
node testing/functional/runFunctionalTests.js vendor       # Test vendor journey
node testing/functional/runFunctionalTests.js admin        # Test admin journey
node testing/functional/runFunctionalTests.js edge-cases   # Test edge cases
node testing/functional/runFunctionalTests.js stripe       # Test Stripe integration

# --- USER-FRIENDLY INTERFACE ---
# Run the simplified test runner interface
node testing/run.js                     # User-friendly test runner
node testing/run.js --report            # View most recent test report
```

### Test Reports

Test reports are automatically generated and stored in the following locations:
- **Automated Reports**: `testing/reports/automated-report-*.json` and `*.html`
- **Test Run Reports**: `testing/reports/test-report-*.json`
- **Functional Test Reports**: `testing/reports/functional-tests-*.json`

Reports include:
- Detailed pass/fail statistics by test category
- Error messages and stack traces for failed tests
- Timestamps and execution duration metrics
- Screenshots for UI tests (stored in `testing/screenshots/`)

### Troubleshooting Tests

If you encounter issues with the test suite:

1. Check the detailed error messages in the report files
2. Look for screenshots in the `testing/screenshots/` directory
3. Run specific test categories to isolate the problem
4. Fix any library import issues (like the chalk ESM module issue) by updating the import approach
5. If using Puppeteer, check if the browser is available or if it's using the mock browser fallback

For Puppeteer mock browser warnings: These are EXPECTED in environments without Chrome installed - the test infrastructure automatically falls back to a mock browser implementation.

## Development Guidelines

### Adding New Features

When adding new features to the application:

1. **Test First**: Create tests before implementing the feature
2. **Test During**: Ensure tests pass as you develop
3. **Test After**: Run the full test suite before submitting your changes
4. **Template Usage**: Follow the test template patterns in `testing/templates/`

### Test Structure

- **API Tests**: Add to appropriate test file in `testing/api/` using the API test template
- **UI Tests**: Add to `testing/ui/` directory using the UI test template
- **E2E Tests**: Add to `testing/e2e/` directory using the E2E test template
- **Functional Tests**: Add to `testing/functional/` directory
- **Test Templates**: Use the templates in `testing/templates/` as starting points

### CI/CD Process

This project uses a comprehensive CI/CD pipeline with Replit deployments:

1. **CI Pipeline**: Run `node testing/ci.js` to execute the complete CI process
2. **Quality Gates**: All tests must pass before deployment is allowed
3. **Test Coordinator**: The test coordinator in `testing/coordinator/testCoordinator.js` manages test execution
4. **Automated Tests**: Configured as Replit workflow for continuous testing
5. **Deployment**: Handled by Replit after test verification

## Important Notes for AI Agents

🚨 **CRITICAL**: Before implementing any feature, run the full E2E-CI/CD test set with `node testing/ci.js` to understand existing functionality and identify potential integration points.

🚨 **CRITICAL**: After implementing a feature, add appropriate tests following the template patterns and run the full CI/CD pipeline to verify nothing was broken.

⚠️ **WARNING**: The chalk library is imported as an ESM module. If you use it in CommonJS files, create a simple replacement as shown in `testing/functional/admin_journey.test.js`.

⚠️ **WARNING**: When working with Stripe Connect functionality, always use the testing helpers in `testing/utils/` rather than making direct API calls.

⚠️ **WARNING**: Mock browser warnings during test execution are EXPECTED in the Replit environment - the test infrastructure handles this automatically.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server workflow: `restart_workflow Server`
4. Run the test suite: `node testing/ci.js`
5. Check test reports in `testing/reports/`