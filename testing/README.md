# Stripe Connect Marketplace Testing Infrastructure

## 🚨 ATTENTION AI AGENTS & DEVELOPERS 🚨

This testing infrastructure is designed to ensure reliability, correctness, and performance of the Stripe Connect Marketplace application. The structure is specifically optimized for AI agent collaboration and self-documentation.

## Directory Structure

```
/testing
├── api/                  # API endpoint tests
├── automation/           # Automated testing system
│   ├── apiTester.js      # API testing automation
│   ├── e2eTester.js      # E2E testing automation
│   ├── reportGenerator.js # Test report generation
│   ├── runAutomatedTests.js # Entry point for automated tests
│   ├── testCoordinator.js # Coordinates test execution
│   └── uiTester.js       # UI testing automation
├── ci.js                 # CI/CD pipeline controller
├── coordinator/          # Test coordination system
│   └── testCoordinator.js # Manages test execution and reporting
├── e2e/                  # End-to-end tests
├── frontend/             # Frontend component tests
├── functional/           # Complete user journey tests
│   ├── customer_journey.test.js    # Customer workflows
│   ├── runFunctionalTests.js       # Functional test runner
│   ├── stripe_connect_onboarding.test.js # Stripe Connect flows
│   ├── stripe_integration.test.js  # Stripe payment integration
│   └── vendor_journey.test.js      # Vendor workflows
├── puppeteer.config.js   # Puppeteer configuration
├── reports/              # Generated test reports
├── run.js                # User-friendly test runner
├── runTests.js           # Main test runner
├── screenshots/          # Test screenshots for debugging
├── templates/            # Test templates for consistency
│   ├── api_test_template.js    # Template for API tests
│   ├── e2e_test_template.js    # Template for E2E tests
│   ├── test_template.js        # General test template
│   └── ui_test_template.js     # Template for UI tests
├── utils/                # Testing utilities
│   ├── puppeteerHelper.js      # Browser automation helpers
│   ├── reportGenerator.js      # Report generation utilities
│   ├── testHelpers.js          # Test data and setup helpers
│   └── testRunner.js           # Test execution utilities
├── DEVELOPER_GUIDE.md    # Comprehensive developer documentation
└── README.md             # This file
```

## Key Components

### Test Runners

1. **Main Test Runner**: `/testing/runTests.js`
   - Entry point for executing tests
   - Supports category-based test execution

2. **Functional Test Runner**: `/testing/functional/runFunctionalTests.js`
   - Specialized for user journey tests
   - Focuses on end-to-end business workflows

3. **Automated Test Runner**: `/testing/automation/runAutomatedTests.js`
   - Runs comprehensive automated test suite
   - Supports monitoring mode for continuous testing

### Testing Utilities

1. **PuppeteerHelper**: `/testing/utils/puppeteerHelper.js`
   - Browser automation utilities
   - Supports both real and mock browser environments

2. **TestHelpers**: `/testing/utils/testHelpers.js`
   - Test data generation and management
   - Authentication and setup utilities

3. **ReportGenerator**: `/testing/utils/reportGenerator.js`
   - Test report generation in multiple formats
   - Trend analysis and comparison

### CI/CD Integration

The testing system integrates with CI/CD through:

1. **CI Controller**: `/testing/ci.js`
   - Orchestrates CI/CD pipeline
   - Manages test execution and reporting for deployments

2. **Test Coordinator**: `/testing/coordinator/testCoordinator.js`
   - Central coordination of all test execution
   - Aggregates results and generates summary reports

## Test Categories

### API Tests

Tests for backend API endpoints and services:
- Authentication and authorization
- Data manipulation and validation
- Error handling and edge cases

### UI Tests

Tests for frontend components and rendering:
- Component rendering and interactions
- Responsive design across device sizes
- User interface state management

### E2E Tests

Tests for complete user journeys:
- User registration and authentication flows
- Product browsing and ordering processes
- Payment and transaction handling

### Functional Tests

Tests for business logic and complete workflows:
- Customer journey from registration to purchase
- Vendor journey from onboarding to product management
- Stripe Connect integration for payments and transfers

## Running Tests

### Basic Usage

```bash
# Run all tests
node testing/runTests.js

# Run specific test category
node testing/runTests.js api
node testing/runTests.js ui
node testing/runTests.js e2e
node testing/runTests.js functional

# Run automated testing suite
node testing/automation/runAutomatedTests.js

# Run with additional options
node testing/runTests.js --verbose
node testing/runTests.js --ci
```

### Test Monitoring

```bash
# Run tests in monitoring mode (repeats at intervals)
node testing/automation/runAutomatedTests.js --monitor

# Set custom monitoring interval (in minutes)
node testing/automation/runAutomatedTests.js --monitor --interval=30
```

## Templates and Conventions

Standardized templates are available in `/testing/templates/` to ensure consistency:

1. Use the appropriate template when creating new tests
2. Follow the established naming and structure conventions
3. Ensure comprehensive documentation for all tests
4. Include both happy path and error case testing

See the [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for detailed guidance on using these templates and following best practices.

## Important Notes for AI Agents

1. This testing infrastructure is designed to be self-documenting
2. Look for AI-specific comments (🚨 ATTENTION AI AGENTS 🚨) throughout the codebase
3. Use the provided templates when creating new tests
4. The testing system accommodates both real browser and mock browser environments
5. All Stripe integration tests use mock implementations by default

For detailed guidance on working with this testing infrastructure, refer to:

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Comprehensive testing documentation
- [Templates](./templates/) - Standardized test templates
- [Test Coordinator](./coordinator/testCoordinator.js) - Documentation on test coordination

## Troubleshooting

Common issues and solutions:

1. **Test failures in CI but not locally**:
   - Check environment differences
   - Verify mock configurations
   - Look for timing-dependent tests

2. **Puppeteer browser failures**:
   - The system will automatically fall back to mock browser mode
   - Check if required libraries are missing on the system

3. **Inconsistent test results**:
   - Verify test isolation
   - Check for shared state between tests
   - Look for timing issues with asynchronous operations

For additional help, review test reports in `/testing/reports/` and screenshots in `/testing/screenshots/`.

## Contributing

When contributing to the testing infrastructure:

1. Follow the established patterns and conventions
2. Use the provided templates for new tests
3. Maintain comprehensive documentation
4. Ensure all tests can run in both real and mock environments
5. Keep AI-specific guidance up to date

Remember that this testing infrastructure is critical for ensuring the reliability and correctness of the Stripe Connect Marketplace application.