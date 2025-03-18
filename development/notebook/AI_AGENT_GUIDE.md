# AI Agent Guide for Stripe Connect Marketplace

## ATTENTION AI AGENTS
This guide provides AI-specific guidance for working on the Stripe Connect Marketplace project. Follow these guidelines to ensure consistent, high-quality development and maintain the project's integrity.

## Development Notebook Navigation

### Getting Started
1. Begin by reading the README.md file for a project overview
2. Review CURRENT.md to understand active tasks
3. Check DAILY_LOG.md for recent development activity
4. Review FAILURE_LOG.md to understand current issues
5. Examine DECISION_LOG.md to understand key architectural decisions

### Task Management
- Active tasks are in CURRENT.md, prioritize those marked "Critical"
- Future tasks are in BACKLOG.md, do not start these without permission
- Completed tasks are in COMPLETED.md, use these as reference
- Blocked tasks are in BLOCKED.md, work on unblocking these when possible

### Documentation Updates
- Record significant decisions in DECISION_LOG.md
- Add daily progress to DAILY_LOG.md
- Document failures and solutions in FAILURE_LOG.md
- Move tasks between status files as appropriate

## AI-Specific Development Guidelines

### Code Standards
1. **Database Safety**: Never perform destructive operations on the database
   - Always use ORM migrations rather than direct SQL
   - Never use DELETE or DROP operations without explicit requirements
   - Always prefer soft deletes (status flags) over hard deletes

2. **Error Handling**:
   - Implement comprehensive error handling at all layers
   - Return appropriate HTTP status codes and error messages
   - Log errors with sufficient context for debugging
   - Never expose sensitive information in error messages

3. **Testing**:
   - Maintain comprehensive test coverage
   - Fix failing tests before adding new features
   - Follow test-driven development when appropriate
   - Document test cases and expected outcomes

4. **Security Practices**:
   - Implement proper authentication and authorization
   - Use CSRF protection for all forms and state-changing requests
   - Validate and sanitize all user inputs
   - Follow secure coding practices for sensitive operations

### Working with Stripe
1. **Stripe Connect Integration**:
   - Follow Stripe Connect best practices for marketplace integration
   - Always use Stripe's official libraries
   - Implement proper error handling for Stripe API calls
   - Use webhook verification for event handling
   - Test both connected account creation and payment flows
   - Maintain separation between platform and connected account operations

2. **Stripe Testing**:
   - Use Stripe test mode with test API keys
   - Test with various Stripe test cards and scenarios
   - Verify webhook handling with Stripe CLI
   - Confirm successful payment flows and refunds
   - Test vendor onboarding and payout processes

### Mobile Development (React Native)
1. **Platform Compatibility**:
   - Ensure compatibility across iOS and Android
   - Test responsive layouts on various device sizes
   - Handle platform-specific edge cases appropriately

2. **Performance**:
   - Optimize rendering performance
   - Minimize network requests and bundle size
   - Use appropriate caching strategies
   - Implement lazy loading where beneficial

### Documentation Standards
1. **Code Documentation**:
   - Document complex logic and business rules
   - Use JSDoc for function and method documentation
   - Explain non-obvious design decisions

2. **System Documentation**:
   - Update architectural documentation as needed
   - Document API endpoints according to standards
   - Create or update user guides for new features

### Error Recovery
1. **Graceful Failures**:
   - Implement retry mechanisms for transient failures
   - Gracefully handle API unavailability
   - Provide clear user feedback for errors
   - Maintain system state consistency during failures

2. **Debugging**:
   - Add appropriate logging for debugging
   - Instrument code for performance monitoring
   - Create reproducible test cases for bugs

## Communication Guidelines

### Development Logs
- Record detailed daily development progress
- Document challenges encountered and solutions implemented
- Note key insights and observations
- Reference task IDs in log entries

### Decision Documentation
- Document significant design or implementation decisions
- Include context, alternatives considered, and rationale
- Reference external resources or best practices
- Document impact of decisions on other system components

### Task Updates
- Update task statuses as work progresses
- Document implementation details for completed tasks
- Record blockers and dependencies
- Link tasks to related documentation and code

## Conclusion
Following these guidelines will ensure consistent development practices across all AI agents working on the Stripe Connect Marketplace project. If you encounter a situation not covered by these guidelines, document your decision-making process in the appropriate logs.