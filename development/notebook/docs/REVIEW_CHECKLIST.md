# Code Review Checklist

## ATTENTION AI AGENTS
This checklist outlines the requirements for code reviews in the Stripe Connect Marketplace project. All code changes must be reviewed against these criteria before being considered complete.

## General Code Quality

### Functionality
- [ ] Code works as intended and meets requirements
- [ ] Edge cases are handled appropriately
- [ ] No regression in existing functionality
- [ ] Performance considerations addressed
- [ ] Idiomatic use of language and framework

### Readability
- [ ] Code is self-explanatory and easy to understand
- [ ] Naming conventions followed (variables, functions, classes)
- [ ] Complex logic includes explanatory comments
- [ ] Consistent formatting and style
- [ ] No commented-out code or debug statements

### Structure
- [ ] Proper separation of concerns
- [ ] No code duplication (DRY principle)
- [ ] Functions/methods have single responsibility
- [ ] Proper error handling
- [ ] No unnecessarily complex code

## Documentation

### Code Documentation
- [ ] All public functions/methods have JSDoc or equivalent comments
- [ ] Complex algorithms are explained
- [ ] Important decisions are documented
- [ ] AI agent guidance is included in critical components
- [ ] Comments are accurate and up-to-date

### External Documentation
- [ ] README updated if necessary
- [ ] API documentation updated for endpoint changes
- [ ] Development notebook entries created:
  - [ ] DAILY_LOG.md updated with implementation details
  - [ ] DECISION_LOG.md updated for significant decisions
  - [ ] FAILURE_LOG.md updated if resolving failures

## Data Integrity (CRITICAL)

### Database Operations
- [ ] 🚨 No deletion of customer/user data in migrations
- [ ] Database migrations preserve existing data
- [ ] Schema changes are backward compatible
- [ ] Transactions used where appropriate
- [ ] Parameterized queries for all database access

### State Management
- [ ] State transitions are handled safely
- [ ] No unintended side effects
- [ ] Data validation before storage
- [ ] Proper error handling for data operations
- [ ] Race conditions considered and mitigated

## Security

### Authentication & Authorization
- [ ] Authentication implemented for protected routes
- [ ] Proper authorization checks for sensitive operations
- [ ] CSRF protection implemented for forms
- [ ] Token handling follows best practices
- [ ] Role-based access control properly enforced

### Input Validation
- [ ] All user input is validated
- [ ] Input sanitization implemented
- [ ] SQL injection protection in place
- [ ] XSS protection measures
- [ ] File uploads properly validated and restricted

### Output Handling
- [ ] Sensitive data not exposed in responses or logs
- [ ] Error messages don't reveal system details
- [ ] Proper response status codes
- [ ] Content security headers implemented
- [ ] Structured error responses

## API Integration

### Stripe Integration
- [ ] Supports both TEST and LIVE modes
- [ ] Proper error handling for API failures
- [ ] Implements graceful degradation
- [ ] No hardcoded API keys or secrets
- [ ] Connect account handling for vendors
- [ ] Webhooks properly validated

### External API Calls
- [ ] Proper error handling and fallbacks
- [ ] Rate limiting considerations
- [ ] Caching where appropriate
- [ ] Logging of API interactions (without sensitive data)
- [ ] Retry mechanism for transient failures

## Testing

### Test Coverage
- [ ] New code has appropriate test coverage
- [ ] Edge cases are tested
- [ ] UI components have visual tests
- [ ] API endpoints have integration tests
- [ ] User flows have E2E tests

### Test Quality
- [ ] Tests are clear and readable
- [ ] Tests focus on behavior, not implementation details
- [ ] Mocks and stubs used appropriately
- [ ] Test data doesn't contain sensitive information
- [ ] Tests are reliable (not flaky)

## React Native Specific

### Component Design
- [ ] Functional components with hooks
- [ ] Props properly typed and documented
- [ ] No unnecessary re-renders
- [ ] Responsive design principles followed
- [ ] Accessibility considerations addressed

### State Management
- [ ] Proper use of state and context
- [ ] Side effects handled with useEffect
- [ ] No prop drilling where avoidable
- [ ] Proper loading and error states
- [ ] Form validation implemented

### Performance
- [ ] List rendering optimized (virtualization for long lists)
- [ ] Memoization used where appropriate
- [ ] Images optimized
- [ ] Expensive operations moved out of render path
- [ ] No memory leaks (cleanup in useEffect)

## Backend Specific

### API Design
- [ ] RESTful principles followed
- [ ] Consistent response format
- [ ] Proper error responses
- [ ] Pagination for list endpoints
- [ ] API versioning considered

### Performance
- [ ] Database queries optimized
- [ ] Proper indexing
- [ ] Caching strategy where appropriate
- [ ] Expensive operations handled asynchronously
- [ ] Rate limiting for public endpoints

### Error Handling
- [ ] Comprehensive error handling
- [ ] Errors logged with appropriate detail
- [ ] Graceful handling of external service failures
- [ ] User-friendly error messages
- [ ] Proper HTTP status codes

## Deployment Considerations

- [ ] Environment variables documented
- [ ] No hardcoded configuration
- [ ] Backward compatibility maintained
- [ ] Database migration plan
- [ ] Rollback strategy defined

## Final Review Criteria

- All critical items must pass review
- No more than 3 minor issues can be present
- Documentation must be complete
- All tests must pass
- Security considerations must be addressed

## Critical Reminders for AI Agents

- Never bypass or ignore data integrity requirements
- Always include AI agent guidance in docstrings for complex components
- Security concerns always take priority
- Update this checklist when new requirements are identified