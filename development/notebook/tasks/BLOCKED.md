# 🚫 Blocked Tasks

This document contains tasks that cannot proceed due to external dependencies, decisions needed, or other blockers. These tasks should be revisited regularly to determine if the blockers have been resolved.

## 🔒 Waiting on External Dependencies

### WT-001: Implement Stripe Connect Express onboarding flow

**Description:** Implement the Stripe Connect Express onboarding flow to enable vendors to connect their Stripe accounts to the marketplace.

**Success Criteria:**
- Vendors can initiate Stripe Connect onboarding
- Vendors are redirected to Stripe to complete onboarding
- Platform receives webhooks on onboarding status
- Vendor accounts are updated with Stripe account IDs

**Blockers:**
- Need production Stripe account with Connect capabilities enabled
- Need approval for Stripe Connect platform fees
- Need legal documents for vendor agreement

**Next Steps:**
1. Request Stripe Connect capability for production account
2. Draft vendor agreement with legal team
3. Get approval for platform fee structure

**Blocked Since:** March 15, 2025
**Owner:** Product Team
**Priority:** High

---

## 🤔 Waiting on Decisions

### WD-001: Determine approach for handling international tax compliance

**Description:** Implement appropriate tax calculation and reporting for international marketplace sales.

**Success Criteria:**
- Correct tax rates applied based on customer and vendor locations
- Tax reporting compliant with relevant jurisdictions
- Automated tax calculation at checkout
- Proper tax documentation for vendors and customers

**Blockers:**
- Need decision on which tax jurisdictions to support initially
- Need decision on tax calculation service to use
- Need legal guidance on tax documentation requirements

**Next Steps:**
1. Schedule meeting with legal team
2. Research tax calculation services (Avalara, TaxJar, etc.)
3. Define MVP tax jurisdiction support

**Blocked Since:** March 10, 2025
**Owner:** Finance Team
**Priority:** Medium

---

### WD-002: Select authentication provider for social login options

**Description:** Implement social login options (Google, Facebook, Apple) to simplify user registration and login.

**Success Criteria:**
- Users can sign up/login with supported social accounts
- Profile information is properly imported
- Account linking workflow established
- Consistent experience across platforms

**Blockers:**
- Need decision on which social login providers to support
- Need approval for OAuth application creation
- Need decision on profile data storage policy

**Next Steps:**
1. Create proposal for supported social login options
2. Draft privacy policy updates for social login data
3. Get security team review of implementation plan

**Blocked Since:** March 12, 2025
**Owner:** Product Team
**Priority:** Low

---

## 🛠️ Technical Blockers

### TB-001: Resolve performance issues with product search API

**Description:** Fix performance issues with the product search API that is causing timeouts on large result sets.

**Success Criteria:**
- Search API response time under 500ms for all queries
- Proper pagination of search results
- Optimized database queries
- Caching implemented where appropriate

**Blockers:**
- Need to complete database indexing strategy
- Need to resolve database connection pooling issues
- Need decision on maximum result set size

**Next Steps:**
1. Complete database performance audit
2. Test indexing strategies on staging environment
3. Implement connection pooling optimizations

**Blocked Since:** March 14, 2025
**Owner:** Backend Team
**Priority:** High

---

## 🔍 Instructions for AI Agents

When dealing with blocked tasks:

1. Regularly review this file to check if blockers have been resolved
2. Update the status of blockers as new information becomes available
3. If all blockers for a task are resolved, move it to CURRENT.md
4. Document any workarounds or partial implementations that can proceed

When adding a new blocked task:
1. Clearly describe the blockers preventing progress
2. Identify who owns resolving each blocker
3. List concrete next steps to resolve the blockers
4. Set appropriate priority level

Blocked tasks should not be ignored - they should be regularly reviewed and followed up on to prevent them from being forgotten.