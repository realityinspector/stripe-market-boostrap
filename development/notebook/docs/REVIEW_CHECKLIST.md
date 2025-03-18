# Code Review Checklist

## ATTENTION AI AGENTS
This document provides a comprehensive checklist for code reviews in the Stripe Connect Marketplace project. Use this checklist to ensure consistency and quality when reviewing code.

## General Review Guidelines

- [ ] Be respectful and constructive in review comments
- [ ] Focus on code, not the developer
- [ ] Provide specific, actionable feedback
- [ ] Explain reasoning behind suggestions
- [ ] Balance thoroughness with pragmatism
- [ ] Consider both technical and business perspectives
- [ ] Ask questions rather than making demands
- [ ] Reference standards and documentation where applicable

## Functionality

- [ ] Code correctly implements the required functionality
- [ ] All requirements are addressed
- [ ] Edge cases are handled properly
- [ ] Error scenarios are managed appropriately
- [ ] Business logic is correct
- [ ] Integration points work as expected
- [ ] No unintended side effects
- [ ] User experience is consistent with expectations

## Code Quality

### Structure and Organization
- [ ] Code follows project architecture
- [ ] Responsibilities are properly separated
- [ ] Code is organized logically
- [ ] Classes and functions have single responsibilities
- [ ] No code duplication
- [ ] No unnecessary complexity
- [ ] Appropriate design patterns used
- [ ] Consistent with existing code style

### Readability and Maintainability
- [ ] Code is self-documenting
- [ ] Variable and function names are meaningful
- [ ] Complex logic is appropriately commented
- [ ] No commented-out code
- [ ] No magic numbers or strings
- [ ] Consistent indentation and formatting
- [ ] File and function length are reasonable
- [ ] No unnecessary code

## Performance

- [ ] Algorithms are efficient
- [ ] No unnecessary database queries
- [ ] Database queries are optimized
- [ ] Appropriate indexing is used
- [ ] Caching is implemented where appropriate
- [ ] Bulk operations are used when applicable
- [ ] Resource usage is reasonable
- [ ] No memory leaks

## Security

- [ ] Input validation is implemented
- [ ] SQL injection is prevented
- [ ] XSS vulnerabilities are addressed
- [ ] CSRF protection is implemented
- [ ] Authentication and authorization are properly checked
- [ ] Sensitive data is handled securely
- [ ] Error messages don't expose sensitive information
- [ ] Security headers are properly set

## Testing

- [ ] Tests cover the new functionality
- [ ] Tests cover edge cases
- [ ] Tests cover error scenarios
- [ ] Tests are meaningful and not just for coverage
- [ ] Unit tests are isolated
- [ ] Integration tests validate system behavior
- [ ] Test data is appropriate
- [ ] Tests are reliable (not flaky)

## Error Handling

- [ ] Errors are properly caught and handled
- [ ] Appropriate error messages are provided
- [ ] Error responses follow API standards
- [ ] Errors are properly logged
- [ ] Recovery mechanisms are implemented where appropriate
- [ ] Transactions are properly managed
- [ ] External API errors are handled gracefully
- [ ] Frontend displays appropriate error messages

## Documentation

- [ ] Code is documented appropriately
- [ ] API endpoints are documented
- [ ] Complex logic is explained
- [ ] User-facing changes are documented
- [ ] Configuration changes are documented
- [ ] Architecture decisions are recorded
- [ ] Dependencies are documented
- [ ] README and other docs are updated

## Database

- [ ] Schema changes are backward compatible
- [ ] Migrations are properly implemented
- [ ] Foreign key constraints are in place
- [ ] Indexes are created for frequent queries
- [ ] Transactions are used appropriately
- [ ] No direct manipulation of production data
- [ ] Data integrity is maintained
- [ ] Soft deletes used instead of hard deletes

## API Design

- [ ] Endpoints follow RESTful conventions
- [ ] Request/response formats are consistent
- [ ] URL structure is logical
- [ ] HTTP methods are used appropriately
- [ ] Status codes are used correctly
- [ ] Error responses follow standards
- [ ] Authentication is properly implemented
- [ ] Rate limiting is considered

## Frontend Specific

- [ ] UI matches design specifications
- [ ] Components are reusable
- [ ] State management is appropriate
- [ ] Responsive design principles are followed
- [ ] Accessibility requirements are met
- [ ] Loading states are handled
- [ ] Error states are displayed properly
- [ ] Forms implement proper validation

## Mobile Specific

- [ ] Works on all target platforms (iOS/Android)
- [ ] Handles different screen sizes
- [ ] Responsive to device orientation changes
- [ ] Follows platform design guidelines
- [ ] Handles offline modes gracefully
- [ ] Battery and data usage are optimized
- [ ] Permissions are requested appropriately
- [ ] App lifecycle events are handled properly

## Stripe Integration

- [ ] Follows Stripe best practices
- [ ] Uses latest Stripe SDK where appropriate
- [ ] Properly handles Stripe API errors
- [ ] Implements idempotency for payments
- [ ] Correctly handles webhooks
- [ ] Test mode is used for non-production environments
- [ ] Production and test keys are properly separated
- [ ] Sensitive payment information is handled securely

## Performance Testing

- [ ] API response times are acceptable
- [ ] Database query times are within limits
- [ ] Frontend rendering performance is optimized
- [ ] Network requests are minimized
- [ ] Assets are properly optimized
- [ ] Memory usage is reasonable
- [ ] CPU usage is reasonable
- [ ] Battery impact on mobile devices is considered

## Deployment Considerations

- [ ] Configuration changes are backward compatible
- [ ] Feature flags are used for risky changes
- [ ] Database migrations are reversible
- [ ] Deployment instructions are clear
- [ ] Rollback procedures are defined
- [ ] Required environment variables are documented
- [ ] Dependencies are properly specified
- [ ] Monitoring is configured for new components

## Compliance and Standards

- [ ] Code follows project coding standards
- [ ] Accessibility guidelines (WCAG) are followed
- [ ] Legal requirements are met
- [ ] Privacy considerations are addressed
- [ ] Appropriate licenses are included
- [ ] Third-party code usage is properly attributed
- [ ] No intellectual property concerns
- [ ] No compliance issues with payment processing

## Final Checks

- [ ] Pull request description is clear and complete
- [ ] All automated tests pass
- [ ] No new warnings or linting issues
- [ ] Code has been tested in a staging environment
- [ ] Changes have been manually verified
- [ ] Release notes are prepared
- [ ] Documentation is updated
- [ ] No TODOs left in the code

## Specialization-Specific Checklists

### Payment Processing
- [ ] Payment flows are secure
- [ ] Payment confirmation is properly implemented
- [ ] Refund process is properly handled
- [ ] Payment webhooks are correctly processed
- [ ] Order status is updated correctly
- [ ] Payment failures are handled gracefully
- [ ] Payment reconciliation is considered
- [ ] Multi-currency issues are addressed if applicable

### Vendor Management
- [ ] Vendor onboarding process works correctly
- [ ] Stripe Connect integration is properly implemented
- [ ] Commission calculation is correct
- [ ] Payout process is properly implemented
- [ ] Vendor analytics are accurate
- [ ] Product management workflows work correctly
- [ ] Vendor notifications are implemented
- [ ] Vendor account management is complete

### Customer Experience
- [ ] User registration and login work correctly
- [ ] Shopping experience is intuitive
- [ ] Product discovery works well
- [ ] Checkout process is smooth
- [ ] Order management is user-friendly
- [ ] User profiles are properly implemented
- [ ] Notifications are appropriate
- [ ] Account settings are complete