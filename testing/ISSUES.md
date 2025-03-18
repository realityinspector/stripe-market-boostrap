# Known Issues and Fixes

## API Issues

### 1. Missing CORS Headers
- **Issue:** The CORS header "access-control-allow-headers" is missing for API endpoints
- **Impact:** Frontend cross-origin requests may fail
- **Fix:** Update CORS middleware configuration to include all required headers
- **Status:** Priority 1 - Blocking frontend functionality

### 2. Product Vendor Endpoint Error
- **Issue:** Invalid input syntax for integer when accessing "/api/products/vendor"
- **Impact:** Vendors cannot retrieve their products
- **Error:** `invalid input syntax for type integer: "vendor"`
- **Fix:** Update route parameter handling in products.js route file
- **Status:** Priority 1 - Blocking vendor functionality

## Payment Flow Issues

### 3. Stripe Connect Onboarding
- **Issue:** Vendors have not completed Stripe onboarding
- **Impact:** Payment flow tests failing with 400 error
- **Error:** "Vendor has not completed Stripe onboarding"
- **Fix:** Implement proper Stripe Connect onboarding flow for vendors
- **Status:** Priority 2 - Blocking payments but not other functionality

## Implementation Plan

### Immediate Fixes (Priority 1)
1. Update CORS middleware to include all required headers
2. Fix product vendor endpoint to properly handle the route parameter

### Short-Term Fixes (Priority 2)
1. Implement Stripe Connect onboarding for vendors
2. Add Stripe account verification status checks
3. Create proper error handling for payment attempts with unverified vendors

### Testing Strategy
1. Run specific tests after each fix to verify resolution
2. Implement integration tests for Stripe Connect onboarding
3. Update E2E tests to properly mock Stripe Connect accounts when needed