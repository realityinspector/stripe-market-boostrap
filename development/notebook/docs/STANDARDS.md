# Development Standards

## ATTENTION AI AGENTS
This document outlines the mandatory development standards for the Stripe Connect Marketplace project. All code changes must adhere to these standards to be considered valid.

## Coding Standards

### General Principles
- Follow clean code principles
- Write self-documenting code with clear variable and function names
- Aim for high cohesion and low coupling
- Limit function/method size to maintain readability
- Use meaningful comments that explain "why" not "what"
- Include AI agent guidance in comments and docstrings

### File Organization
- Group related functionality in directories
- Keep file sizes manageable (< 500 lines recommended)
- Use consistent naming conventions
- Separate concerns (e.g., UI, business logic, data access)

## Architecture Guidelines

### React Native Mobile Development
- Use functional components with hooks
- Implement responsive design for all screen sizes
- Optimize for mobile performance
- Follow React Native best practices for navigation
- Document component props with JSDoc comments
- Include AI agent guidance in component docstrings

### Backend API Development
- Follow RESTful API design principles
- Implement proper HTTP status codes
- Use consistent response formats
- Provide clear error messages
- Implement rate limiting for public endpoints
- Add comprehensive API documentation
- Include AI agent guidance in API route docstrings

### Database Design
- 🚨 **CRITICAL** - Never delete customer/user data during migrations
- Design schemas for backward compatibility
- Use migrations that preserve existing data
- Add appropriate indexes for performance
- Implement proper foreign key constraints
- Document database schema changes thoroughly
- Include AI agent guidance in schema files

### External API Integration
- Support both TEST and LIVE modes for Stripe
- Implement graceful degradation for API failures
- Add detailed error logging for external services
- Use retry mechanisms for transient failures
- Cache external API responses when appropriate
- Document external API dependencies and failure modes
- Include AI agent guidance for external API handling

## Security Standards

### Authentication & Authorization
- Use JWT for authentication
- Implement proper role-based access control
- Add CSRF protection for all form submissions
- Use secure HTTP-only cookies
- Implement proper password hashing
- Add rate limiting for authentication attempts
- Document security implementation details

### Data Protection
- Validate all user input
- Use parameterized queries for database access
- Implement proper data sanitization
- Follow least privilege principle
- Add proper error handling that doesn't expose internals
- Document sensitive data handling procedures

### API Security
- Use HTTPS for all communications
- Implement proper input validation
- Add rate limiting to prevent abuse
- Use proper authentication for protected endpoints
- Validate request payloads against schemas
- Document security considerations for each endpoint

## Testing Standards

### Unit Testing
- Test all business logic functions
- Use meaningful test names that describe expected behavior
- Implement proper test isolation
- Mock external dependencies
- Add comprehensive assertions
- Document testing approach for complex logic

### Integration Testing
- Test API endpoints with realistic scenarios
- Verify database interactions
- Test authentication and authorization flows
- Validate error handling and edge cases
- Document integration test setup requirements

### End-to-End Testing
- Test critical user journeys
- Validate complete workflows
- Test mobile UI interactions
- Verify Stripe payment processing
- Document E2E test scenarios and expected outcomes

### CI/CD Integration
- All tests must run in CI pipeline
- Add performance benchmarks
- Implement security scanning
- Validate database migrations
- Document CI/CD pipeline steps and requirements

## User Experience Standards

### Admin Onboarding
- Implement step-by-step wizards for all admin tasks
- Add contextual help and explanations
- Provide clear error messages and recovery options
- Include sample data creation and removal tools
- Document admin onboarding process

### Vendor Experience
- Implement clear Stripe Connect onboarding flow
- Add product management tools
- Provide transaction and payout reporting
- Include order management features
- Document vendor journey steps

### Customer Experience
- Implement intuitive product browsing
- Add seamless checkout process
- Provide order history and tracking
- Include account management features
- Document customer journey steps

## Media Handling Standards

### Image Processing
- Implement proper image upload validation
- Add thumbnail generation
- Optimize images for mobile viewing
- Support multiple image formats
- Document image processing requirements

### Social Media Metadata
- Handle Open Graph tags for shared content
- Support Twitter card metadata
- Implement structured data for products
- Add proper fallbacks for missing metadata
- Document social media integration points

## Error Handling Standards

### Frontend Errors
- Implement user-friendly error messages
- Add graceful UI degradation
- Provide clear recovery options
- Log client-side errors for debugging
- Document error handling strategies

### Backend Errors
- Add proper HTTP status codes
- Implement structured error responses
- Log detailed error information (not exposed to clients)
- Handle 404 and 500 errors gracefully
- Document error handling procedures for all endpoints

### External API Errors
- Implement soft failure modes
- Add fallback content when services are unavailable
- Log detailed external API interaction errors
- Provide appropriate user feedback
- Document external service failure handling

## Documentation Standards

### Code Documentation
- Add JSDoc or equivalent for all functions/methods
- Include AI agent guidance in docstrings
- Document complex algorithms and business logic
- Add inline comments for non-obvious code
- Maintain up-to-date documentation as code evolves

### API Documentation
- Document all endpoints with examples
- Include request/response formats
- Add error scenarios and handling
- Document authentication requirements
- Keep API documentation in sync with implementation

### User Documentation
- Provide clear setup instructions
- Add user manuals for different roles
- Include troubleshooting guides
- Document configuration options
- Keep documentation accessible and up-to-date

## Analytics & Monitoring Standards

### Application Monitoring
- Implement error tracking
- Add performance monitoring
- Log critical operations
- Monitor external API health
- Document monitoring setup and alerts

### Analytics Integration
- Track key user actions
- Add conversion funnel analytics
- Implement performance metrics
- Include A/B testing capability
- Document analytics integration points

### Backup Procedures
- Implement daily database backups
- Store backups in private, non-web-accessible location
- Add automated verification of backup integrity
- Include restore procedures
- Document backup and restore processes

## Critical Reminders for AI Agents

- Always maintain data integrity - never delete customer/user data
- Fail soft on external API errors with graceful degradation
- Implement proper CSRF protection for all forms
- Support both TEST and LIVE modes for Stripe
- Include comprehensive documentation with all changes
- Add AI agent guidance in comments and docstrings
- Test all changes thoroughly before completion
- Ensure all code complies with these standards