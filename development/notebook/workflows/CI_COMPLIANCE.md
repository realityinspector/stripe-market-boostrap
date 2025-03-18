# CI/CD Compliance Requirements

## ATTENTION AI AGENTS
This document outlines the mandatory CI/CD compliance requirements for the Stripe Connect Marketplace project. All code changes must adhere to these requirements to be considered valid.

## Core CI/CD Principles

### Database Integrity (HIGHEST PRIORITY)
- **MANDATORY**: All database migrations must be non-destructive
- **MANDATORY**: Never delete customer or user data during migrations
- **CRITICAL**: Database schema changes must be backward compatible
- **REQUIRED**: All migrations must be tested in isolation before deployment
- **REQUIRED**: Rollback plans must be documented for all schema changes
- **AUTOMATED**: CI pipeline must validate data integrity during migrations

### Security Requirements
- **MANDATORY**: CSRF protection for all form submissions
- **MANDATORY**: Input validation on all user-supplied data
- **MANDATORY**: Parameterized queries for all database operations
- **AUTOMATED**: Security scans must run on all code changes
- **AUTOMATED**: Dependency vulnerability checks must run in CI
- **REQUIRED**: All authentication flows must be tested in CI

### API Integration
- **MANDATORY**: Stripe integration must support both TEST and LIVE modes
- **MANDATORY**: All external API calls must implement graceful degradation
- **REQUIRED**: Detailed error logging for external API failures
- **AUTOMATED**: API endpoint tests must simulate failure scenarios
- **AUTOMATED**: Mock responses for external APIs in test environment

### Testing Coverage
- **MANDATORY**: All API endpoints must have test coverage
- **MANDATORY**: All user-facing features must have UI tests
- **MANDATORY**: E2E tests must cover critical user journeys
- **REQUIRED**: Test coverage metrics must be tracked in CI
- **AUTOMATED**: Tests must run on all pull requests and merges

### Error Handling
- **MANDATORY**: All 404 and 500 errors must be handled gracefully
- **REQUIRED**: Custom error pages for all error types
- **AUTOMATED**: Error simulation testing in CI pipeline
- **AUTOMATED**: Load testing for critical endpoints

### Media Handling
- **REQUIRED**: Image upload and processing tests
- **REQUIRED**: Thumbnail generation validation
- **AUTOMATED**: Tests for media metadata extraction

### Performance Monitoring
- **REQUIRED**: Response time metrics in CI pipeline
- **REQUIRED**: Lighthouse performance scoring
- **AUTOMATED**: Performance regression detection

### Analytics & Logging
- **REQUIRED**: Analytics tracking must be validated in CI
- **REQUIRED**: Log format validation
- **AUTOMATED**: Analytics event tracking tests

## CI/CD Pipeline Stages

### 1. Pre-Commit Checks
- Lint validation
- Code formatting check
- Initial test run

### 2. Build Validation
- Full build process
- Dependency resolution
- Asset compilation

### 3. Test Suite Execution
- Unit tests
- Integration tests
- API tests
- UI tests
- E2E tests

### 4. Security Analysis
- CSRF protection verification
- Input validation tests
- Dependency vulnerability scans
- Authentication flow tests

### 5. Database Migration Validation
- Schema migration tests
- Data integrity checks
- Rollback validation
- Performance impact assessment

### 6. Feature Validation
- User journey tests
- Admin functionality tests
- Vendor onboarding tests
- Stripe payment processing tests

### 7. Performance & Load Testing
- Basic load testing
- Response time validation
- Resource utilization checks

### 8. Pre-Deployment Checklist
- Documentation updates verification
- API contract validation
- README updates
- Security sign-off

## CI/CD Test Requirements Matrix

| Feature Area            | Unit Tests | Integration Tests | E2E Tests | Security Tests | Performance Tests |
|-------------------------|:----------:|:-----------------:|:---------:|:--------------:|:-----------------:|
| User Authentication     |     ✓      |         ✓         |     ✓     |        ✓       |                   |
| Database Migrations     |     ✓      |         ✓         |           |        ✓       |         ✓         |
| API Endpoints           |     ✓      |         ✓         |     ✓     |        ✓       |         ✓         |
| Stripe Integration      |     ✓      |         ✓         |     ✓     |        ✓       |                   |
| Vendor Onboarding       |     ✓      |         ✓         |     ✓     |                |                   |
| Admin Functionality     |     ✓      |         ✓         |     ✓     |        ✓       |                   |
| Media Handling          |     ✓      |         ✓         |           |                |         ✓         |
| Error Handling          |     ✓      |         ✓         |     ✓     |                |                   |
| Analytics               |     ✓      |         ✓         |           |                |                   |

## Deployment Process

- **IMPORTANT**: Actual deployment is performed by the user on Replit
- CI/CD pipeline prepares the deployment but does not execute it
- Final deployment checklist is provided to the user
- Deployment documentation must be kept updated

## Compliance Enforcement

All pull requests and code changes must:
1. Pass the complete CI/CD pipeline
2. Address all test failures
3. Document the reasoning for any test modifications
4. Maintain or improve test coverage
5. Include updated documentation for changes

## Critical Reminders for AI Agents

- Never bypass or disable tests to make the pipeline pass
- Document all decisions related to CI/CD changes
- Maintain backward compatibility in all changes
- Always prioritize data integrity above all else
- Ensure graceful degradation for external service failures
- Implement progressive enhancement for all user-facing features