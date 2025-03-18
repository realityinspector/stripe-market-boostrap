# Current Tasks

## ATTENTION AI AGENTS
This document tracks currently active tasks for the Stripe Connect Marketplace project. Refer to this document to understand what needs to be worked on next.

## Critical Tasks

### STRIPE-001: Fix Stripe Connect Vendor Onboarding
**Priority**: High  
**Status**: In Progress  
**Assigned**: AI Agent  
**Description**: Implement proper Stripe Connect onboarding flow for vendors. Current tests are failing because vendors are not properly connected to Stripe.

**Steps**:
1. Update vendor registration to create a Stripe Connect account
2. Implement Connect account onboarding URL generation
3. Handle onboarding completion webhook
4. Add vendor dashboard to show onboarding status
5. Update tests to properly mock Stripe Connect API calls

**Acceptance Criteria**:
- Vendor registration creates a Stripe Connect account
- Vendors can complete Stripe onboarding process
- Payment tests pass with proper Connect integration
- Both TEST and LIVE modes are supported
- Soft failure handling for API errors

### AUTH-001: Fix Authentication Route Issues
**Priority**: High  
**Status**: Pending  
**Assigned**: AI Agent  
**Description**: Address issues with authenticated API routes. Tests are failing with 403 errors instead of the expected 401 for invalid tokens.

**Steps**:
1. Review authentication middleware implementation
2. Fix token validation and error response handling
3. Update tests to validate correct behavior
4. Add comprehensive error messages

**Acceptance Criteria**:
- Authentication middleware returns appropriate status codes
- Error messages are clear and helpful
- Tests verify both success and failure scenarios
- All authenticated route tests pass

### PAYMENT-001: Fix Payment Intent Creation
**Priority**: High  
**Status**: Pending  
**Assigned**: AI Agent  
**Description**: Address issues with Stripe payment intent creation. Tests are failing when attempting to create payment intents.

**Steps**:
1. Review payment intent creation logic
2. Fix Stripe integration for payment intents
3. Improve error handling for API failures
4. Update tests to properly validate behavior

**Acceptance Criteria**:
- Payment intents are created successfully
- Both direct and Connect payments are supported
- Error handling is robust with soft failures
- Tests pass for all payment scenarios

### UI-001: Fix User Registration UI Tests
**Priority**: Medium  
**Status**: Pending  
**Assigned**: AI Agent  
**Description**: Fix UI tests for user registration that are currently failing due to unexpected redirects or form submission issues.

**Steps**:
1. Review registration form implementation
2. Fix form submission and redirect logic
3. Update tests to match expected behavior
4. Improve error handling and user feedback

**Acceptance Criteria**:
- Registration form submits successfully
- Appropriate redirects occur on success/failure
- Error messages are clear and helpful
- UI tests pass for all registration scenarios

### UI-002: Fix User Login UI Tests
**Priority**: Medium  
**Status**: Pending  
**Assigned**: AI Agent  
**Description**: Fix UI tests for user login that are currently failing due to unexpected redirects or authentication issues.

**Steps**:
1. Review login form implementation
2. Fix authentication flow and redirect logic
3. Update tests to match expected behavior
4. Improve error handling and user feedback

**Acceptance Criteria**:
- Login form submits successfully
5. Authentication happens properly
6. Appropriate redirects occur on success/failure
7. Error messages are clear and helpful
8. UI tests pass for all login scenarios

### CI-001: Complete Development Notebook Structure
**Priority**: Medium  
**Status**: In Progress  
**Assigned**: AI Agent  
**Description**: Complete the development notebook structure and integrate it with the CI/CD pipeline to ensure proper documentation and process adherence.

**Steps**:
1. ✅ Create core notebook structure files
2. ✅ Implement AI agent guidance documentation
3. ✅ Define CI/CD compliance requirements
4. ✅ Document development standards
5. Create daily log tracking
6. Set up failure logging system
7. Establish decision log
8. Integrate notebook checks with test runner

**Acceptance Criteria**:
- Complete notebook structure is in place
- AI agents have clear guidance documentation
- CI/CD pipeline checks notebook compliance
- Documentation is comprehensive and useful

## Instructions for AI Agents

1. Always create detailed development logs in logs/DAILY_LOG.md
2. Document any failures encountered in logs/FAILURE_LOG.md
3. Record significant decisions in logs/DECISION_LOG.md
4. When completing a task, move it from CURRENT.md to COMPLETED.md
5. When encountering blockers, document them in BLOCKED.md
6. Always follow the development standards in docs/STANDARDS.md
7. Ensure all work complies with CI/CD requirements in workflows/CI_COMPLIANCE.md