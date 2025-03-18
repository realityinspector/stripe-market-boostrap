# 🔍 Pre-Commit Review Checklist

This document provides a comprehensive checklist for reviewing code changes before submitting them. Following this checklist ensures that changes meet quality standards and minimize the risk of introducing bugs or security vulnerabilities.

## 🚨 CRITICAL NOTICE FOR AI AGENTS 🚨

As an AI agent working on this codebase, you **must** review your code changes against this checklist before considering them complete. This self-review process is essential for maintaining code quality and preventing common issues.

## ✅ Functionality Checklist

### Core Functionality
- [ ] Changes fulfill the requirements of the task
- [ ] All user flows work as expected
- [ ] Edge cases are handled appropriately
- [ ] Changes are resilient to invalid inputs
- [ ] Performance implications have been considered

### Error Handling
- [ ] All potential errors are caught and handled
- [ ] Error messages are clear and actionable
- [ ] Error states are properly displayed to users
- [ ] System recovery from errors works as expected
- [ ] Error logs provide sufficient context for debugging

### Mobile Specific
- [ ] UI renders correctly on different screen sizes
- [ ] Touch interactions work as expected
- [ ] Keyboard handling works correctly
- [ ] Offline behavior is graceful (if applicable)
- [ ] Proper navigation patterns are followed

## 🔒 Security Checklist

### General Security
- [ ] Input validation is implemented for all user inputs
- [ ] SQL injection vectors are prevented
- [ ] Cross-site scripting (XSS) protections are in place
- [ ] Authentication checks are present where needed
- [ ] Authorization checks validate user permissions

### Data Protection
- [ ] Sensitive data is not logged
- [ ] Personal information is handled according to privacy policies
- [ ] API keys and secrets are not hardcoded
- [ ] Data is validated before storage or processing
- [ ] HTTPS is used for all external communications

### Payment Security
- [ ] Stripe integration follows security best practices
- [ ] Payment data is handled securely
- [ ] Proper encryption and tokenization is used
- [ ] Transaction amounts are validated
- [ ] Duplicate payment prevention measures exist

## 🧪 Testing Checklist

### Test Coverage
- [ ] New functionality has corresponding tests
- [ ] Tests cover both success and error scenarios
- [ ] Edge cases are included in test cases
- [ ] UI component tests are included if applicable
- [ ] Integration tests verify component interactions

### Test Quality
- [ ] Tests are independent and don't rely on each other
- [ ] Tests use proper assertions
- [ ] Tests follow the project's testing patterns
- [ ] Tests are readable and well-documented
- [ ] Mock data and dependencies are used appropriately

### Test Execution
- [ ] All tests pass locally
- [ ] No flaky tests were introduced
- [ ] Performance tests pass (if applicable)
- [ ] Security tests pass (if applicable)
- [ ] End-to-end tests verify the complete flow

## 📦 Code Quality Checklist

### General Quality
- [ ] Code follows the project's style guide
- [ ] No unused code or commented-out code
- [ ] Complex logic is properly documented
- [ ] Functions and components have a single responsibility
- [ ] Naming is clear and consistent

### JavaScript/TypeScript Quality
- [ ] No TypeScript 'any' types used without justification
- [ ] Proper type annotations are used
- [ ] Modern JavaScript features are used appropriately
- [ ] No memory leaks in event listeners or subscriptions
- [ ] Asynchronous code uses async/await pattern

### React/React Native Quality
- [ ] Components are properly structured
- [ ] State is managed efficiently
- [ ] Effects have appropriate dependencies
- [ ] Memoization is used where beneficial
- [ ] React-specific anti-patterns are avoided

## 📄 Documentation Checklist

### Code Documentation
- [ ] Complex logic has explanatory comments
- [ ] Functions have JSDoc comments
- [ ] Non-obvious decisions are explained
- [ ] APIs have clear documentation
- [ ] TODO comments include ticket references

### Project Documentation
- [ ] README.md is updated if necessary
- [ ] New features are documented for users
- [ ] API changes are reflected in API documentation
- [ ] Environment variables are documented
- [ ] Deployment changes are documented

### Development Notebook
- [ ] DAILY_LOG.md is updated with implementation details
- [ ] DECISION_LOG.md includes any architectural decisions
- [ ] FAILURE_LOG.md documents any encountered issues
- [ ] Tasks are moved to appropriate status in task tracking

## 🚀 Performance Checklist

### General Performance
- [ ] Changes don't introduce unnecessary network requests
- [ ] Appropriate data caching is implemented
- [ ] Large data sets are handled efficiently
- [ ] Computationally expensive operations are optimized
- [ ] Resources are properly released when no longer needed

### React Performance
- [ ] Unnecessary re-renders are avoided
- [ ] Lists use virtualization for large data sets
- [ ] Heavy calculations are memoized
- [ ] Dependencies for hooks are properly specified
- [ ] Event handlers are properly memoized

### API Performance
- [ ] Database queries are optimized
- [ ] API responses are appropriately sized
- [ ] Pagination is used for large data sets
- [ ] Response times are within acceptable limits
- [ ] Rate limiting is considered for heavy operations

## 🛠️ Deployment Readiness Checklist

### Configuration
- [ ] Environment variables are documented
- [ ] Default values are sensible
- [ ] Configuration is appropriate for different environments
- [ ] Feature flags are used for incomplete features
- [ ] Backward compatibility is maintained where needed

### Migration
- [ ] Database migrations are included if schema changed
- [ ] Migrations are reversible if possible
- [ ] Data migration plans are documented
- [ ] Existing data is compatible with changes
- [ ] Deployment order is specified for dependent changes

### Monitoring
- [ ] Appropriate logging is added for new features
- [ ] Error tracking will capture potential issues
- [ ] Performance monitoring is considered
- [ ] Important business events are tracked
- [ ] Health checks include new functionality

## 📝 Special Instructions for AI Agents

When reviewing your code changes:

1. **Go through the entire checklist** systematically
2. **Be especially thorough** in areas related to your changes
3. **Document any items** that aren't applicable to your changes
4. **Fix issues** discovered during the review process
5. **Update the development notebook** with review findings

Before marking a task as complete:
1. **Run all relevant tests** to verify your changes
2. **Update documentation** to reflect your changes
3. **Log your changes** in the appropriate development notebook files
4. **Verify CI/CD pipeline** success for your changes

---

**Remember**: This checklist is not just a formality but an essential quality assurance tool. Following it diligently will lead to higher quality code with fewer bugs and security issues.