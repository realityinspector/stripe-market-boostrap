# 🚨 Failure Log

This document tracks significant failures, errors, and bugs encountered during development, along with their resolution. It serves as a knowledge base for troubleshooting recurring issues.

## Active Failures

### FL-001: Payment Flow E2E Tests Failing with 400 Error

**First Observed:** March 14, 2025
**Status:** Active - High Priority
**Error Message:** `Error 400: Vendor has not completed Stripe Connect onboarding`

**Description:**
E2E tests in `testing/e2e/paymentFlow.test.js` are consistently failing with a 400 error. The error indicates that vendors have not completed the Stripe Connect onboarding process, which is preventing payment processing.

**Impact:**
- All payment-related E2E tests are failing
- Prevents verification of critical payment workflows
- Blocks complete CI/CD pipeline success

**Reproduction Steps:**
1. Run `node testing/runTests.js e2e`
2. Observe failures in payment flow tests
3. Check error logs showing 400 status code

**Root Cause Analysis:**
The test is attempting to create payments for vendors who don't have valid Stripe Connect accounts. The current implementation does not properly mock the Stripe Connect onboarding process for testing purposes.

**Resolution Plan:**
1. Create a mock implementation of Stripe Connect for testing
2. Update vendor model to support test mode
3. Add pre-test setup to create vendors with mock Stripe accounts
4. Update tests to use the mock implementation

**Related Tasks:**
- CT-001: Fix failing E2E tests related to payment flow

---

### FL-002: Missing CORS Headers in API Responses

**First Observed:** March 15, 2025
**Status:** Active - High Priority
**Error Message:** `Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource`

**Description:**
API endpoints are missing required CORS headers, specifically 'access-control-allow-headers'. This is causing cross-origin request failures in the tests and would affect production usage from different origins.

**Impact:**
- API tests failing with CORS errors
- Frontend can't access API from different origins
- Mobile app unable to connect to API

**Reproduction Steps:**
1. Run `node testing/runTests.js api`
2. Check CORS headers test in `testing/frontend/pageRendering.test.js`
3. Observe missing 'access-control-allow-headers' in response

**Root Cause Analysis:**
The Express server's CORS middleware is not properly configured. It's setting some CORS headers but missing critical ones like 'access-control-allow-headers'.

**Resolution Plan:**
1. Update CORS middleware configuration in Express server
2. Add all required CORS headers
3. Test with cross-origin requests
4. Verify that all tests pass

**Related Tasks:**
- CT-002: Implement proper CORS headers for API endpoints

---

## Resolved Failures

### FL-003: Chalk Dependency Causing Test Output Formatting Issues

**First Observed:** March 16, 2025
**Resolved:** March 17, 2025
**Error Message:** `TypeError: chalk.blue is not a function`

**Description:**
Test runner output was broken due to issues with the chalk dependency, which is used for console color formatting.

**Impact:**
- Test output was unformatted or missing
- Error messages difficult to read
- CI output parsing affected

**Root Cause Analysis:**
The chalk dependency was being imported incorrectly or had version compatibility issues. The exact cause was a mismatch between the ESM and CommonJS module systems.

**Resolution:**
1. Removed dependency on external chalk library
2. Implemented custom color functions (blue, green, red, etc.)
3. Updated all test output formatting to use new functions
4. Verified output formatting across all test types

**Resolution Commit:** n/a
**Lessons Learned:**
- Minimize dependencies for critical infrastructure
- Test output formatting across different environments
- Prefer simple implementations for core utilities

---

## 🔍 Instructions for AI Agents

When encountering a failure:

1. Document it immediately in this log
2. Assign a unique failure ID (FL-XXX)
3. Include all details needed to reproduce and understand the issue
4. Develop a clear resolution plan
5. Link to related tasks in CURRENT.md

When resolving a failure:
1. Update the entry with resolution details
2. Move it to the "Resolved Failures" section
3. Add lessons learned to prevent similar issues
4. Update related tasks in CURRENT.md

This failure log serves as:
- A knowledge base for troubleshooting
- Documentation of known issues
- A resource for preventing recurring problems
- Evidence of resolution approaches that work