# Known Testing Issues

🚨 **ATTENTION AI AGENTS** 🚨

This document tracks known issues in the testing infrastructure to help with troubleshooting. Understanding these issues is critical for maintaining and improving the test suite.

## Current Test Failures

As of March 18, 2025, the automated test suite has a success rate of 82% (27/33 tests passing). Below are the known issues:

### API Test Failures

#### 1. Authenticated Route Test
- **Error**: Failed to access authenticated route
- **Root Cause**: The authentication middleware is returning a 403 status instead of the expected 401 for invalid tokens.
- **Files to Check**: 
  - `/server/middleware/auth.js` - Check HTTP status code returned for invalid tokens
  - `/testing/api/authEndpoints.test.js` - Verify test expectations

#### 2. Product Creation Test
- **Error**: Failed to create product
- **Root Cause**: The product creation endpoint may be expecting additional fields or the vendor authentication may be failing.
- **Files to Check**: 
  - `/server/routes/products.js` - Check required fields and validation
  - `/testing/api/productEndpoints.test.js` - Verify test data format

#### 3. Create Payment Intent Test
- **Error**: Failed to create payment intent
- **Root Cause**: The Stripe integration may be expecting a valid Stripe account or the payment intent creation parameters may be incorrect.
- **Files to Check**: 
  - `/server/routes/payments.js` - Check Stripe payment intent creation
  - `/server/services/stripe.js` - Verify Stripe initialization
  - `/testing/api/paymentEndpoints.test.js` - Check test data for payment intent

### UI Test Failures

#### 1. User Registration Test
- **Error**: Registration failed or unexpected redirect
- **Root Cause**: The registration form submission might not be handling asynchronous operations correctly, or the redirect logic after registration might be different than expected.
- **Files to Check**: 
  - `/mobile/screens/auth/RegisterScreen.js` - Check form submission logic
  - `/testing/frontend/pageRendering.test.js` - Verify test expectations

#### 2. User Login Test
- **Error**: Login failed or unexpected redirect
- **Root Cause**: Similar to registration, the login flow might have timing issues or unexpected redirects.
- **Files to Check**: 
  - `/mobile/screens/auth/LoginScreen.js` - Check authentication flow
  - `/testing/frontend/pageRendering.test.js` - Verify test expectations

#### 3. Payment Process Test
- **Error**: Payment confirmation message not as expected
- **Root Cause**: The payment confirmation message might be different than what the test expects, or the mock Stripe implementation might not be working correctly.
- **Files to Check**: 
  - `/mobile/screens/customer/PaymentConfirmationScreen.js` - Check payment success message
  - `/testing/e2e/paymentFlow.test.js` - Verify test expectations for payment confirmation

## Common Issues and Solutions

### 1. Puppeteer Browser Launch Failures

**Error Message**:
```
Error initializing browser: Failed to launch the browser process!
/chrome-linux64/chrome: error while loading shared libraries: libgobject-2.0.so.0: cannot open shared object file: No such file or directory
```

**Solution**:
- The system is already falling back to mock browser mode automatically.
- To fix the real browser launch, the required system libraries would need to be installed.
- This doesn't impact test functionality as all tests are designed to work with the mock browser.

### 2. Async Timing Issues

Some tests may fail due to race conditions or timing issues with asynchronous operations.

**Solution**:
- Use the `mockSafeWait()` function instead of directly waiting for a fixed time
- Ensure all asynchronous operations have proper awaits
- Use event-based waiting instead of fixed time waiting where possible

### 3. Missing Element Failures

UI tests may fail because expected elements aren't found in the DOM.

**Solution**:
- Check the element selectors in the test
- Verify the component rendering logic
- Check the timing of when the test is looking for the element

## Next Steps for Improvement

1. Address API test failures by checking authentication and validation logic
2. Update UI tests to handle form submission and redirect logic correctly
3. Ensure Stripe mocking is consistent between tests
4. Increase the timeout values for network-dependent tests
5. Add more detailed logging to help diagnose failures

Remember that the testing infrastructure is designed to be resilient, with graceful fallbacks and comprehensive error reporting. Even with these failures, the overall system continues to function with 82% of tests passing.

## For AI Agents

When addressing these issues:
1. Start with API tests as they form the foundation
2. Then address UI test issues by fixing the test expectations or the UI component behavior
3. Use the provided test templates to create additional tests for new features
4. When fixing issues, update this document to track progress

The goal is to achieve and maintain a test success rate of 95% or higher.