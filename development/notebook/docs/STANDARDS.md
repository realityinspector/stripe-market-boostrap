# Development Standards

## ATTENTION AI AGENTS
This document outlines the development standards for the Stripe Connect Marketplace project. All code, documentation, and processes must adhere to these standards.

## Coding Standards

### General Guidelines
- Follow the principle of least surprise
- Write self-documenting code
- Keep functions small and focused on a single responsibility
- Limit function arguments to 3 or fewer when possible
- Avoid deep nesting (>3 levels)
- Use meaningful variable and function names
- Add comments explaining "why" not "what"
- Follow consistent code formatting
- Write code for humans, not compilers

### Naming Conventions
- Use camelCase for variables and functions in JavaScript/TypeScript
- Use PascalCase for classes and React components
- Use UPPER_SNAKE_CASE for constants
- Use kebab-case for file names
- Use descriptive names that explain purpose

### Error Handling
- Never silently catch errors
- Always log errors with context
- Return meaningful error messages
- Use appropriate HTTP status codes
- Implement retry mechanisms for transient failures
- Prefer explicit error handling over generic catches
- Don't expose sensitive information in error messages

### Code Organization
- Organize code by feature rather than type
- Keep related code together
- Limit file size to 300-500 lines
- Limit function size to 20-30 lines
- Use consistent import ordering
- Separate concerns appropriately
- Extract reusable utilities and components

## Architecture Guidelines

### Backend (Express.js)
- Follow RESTful API design principles
- Implement proper middleware for cross-cutting concerns
- Use dependency injection for services
- Implement repository pattern for database access
- Separate business logic from API controllers
- Implement proper validation for all inputs
- Use consistent error response format
- Implement proper logging throughout the application

### Frontend (React Native)
- Use functional components with hooks
- Implement proper state management
- Keep UI components pure and presentational when possible
- Implement proper form validation
- Use context API for shared state
- Follow responsive design principles
- Implement proper error handling for API calls
- Use proper loading states for async operations

### Database Design
- Implement proper foreign key constraints
- Use appropriate data types
- Normalize database when appropriate
- Implement indexes for performance
- Use transactions for multi-step operations
- Avoid storing sensitive data in plain text
- Implement soft deletes rather than hard deletes
- Use UUID for public-facing IDs

## External API Integration

### Stripe Integration
- Follow Stripe's best practices
- Use the official Stripe libraries
- Implement proper error handling for API calls
- Implement webhook handlers for asynchronous events
- Implement idempotency for payment operations
- Store Stripe customer and payment method IDs securely
- Implement proper logging for payment operations
- Test with Stripe's test mode and test cards

### Third-Party API Integration
- Use appropriate authentication methods
- Implement retry logic for API calls
- Handle rate limiting appropriately
- Cache responses when appropriate
- Implement circuit breakers for failing APIs
- Log all API calls and responses
- Implement timeout handling
- Monitor API performance and availability

## Security Standards

### Authentication
- Use JWT for authentication
- Implement proper token expiration
- Store tokens securely
- Implement refresh token rotation
- Use HTTPS for all communications
- Implement proper password hashing
- Require strong passwords
- Implement account lockout for failed attempts

### Authorization
- Implement role-based access control
- Check permissions for all operations
- Enforce separation of concerns
- Implement proper data filtering based on user roles
- Log all access control decisions
- Implement resource-based permissions
- Validate user access to specific resources
- Use principle of least privilege

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all API calls
- Implement proper input validation
- Sanitize all user inputs
- Implement CSRF protection
- Set proper security headers
- Implement proper Content Security Policy
- Follow OWASP security guidelines

### API Security
- Implement rate limiting
- Validate and sanitize all inputs
- Implement proper authentication and authorization
- Use appropriate HTTP methods and status codes
- Implement proper error handling
- Log security-relevant events
- Implement CORS properly
- Don't expose sensitive information in responses

## Testing Standards

### Unit Testing
- Test all business logic
- Use meaningful test names describing expected behavior
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error scenarios
- Maintain high test coverage for core functionality
- Keep tests fast and independent
- Don't test implementation details

### Integration Testing
- Test API endpoints
- Test database operations
- Test third-party integrations
- Use proper test data setup and teardown
- Test success and failure scenarios
- Validate response formats and status codes
- Test with different user roles
- Test data persistence

### End-to-End Testing
- Test critical user journeys
- Test across multiple components
- Use realistic test data
- Test in an environment similar to production
- Test responsiveness across devices
- Test with different user roles
- Test payment flows thoroughly
- Test error scenarios

### Performance Testing
- Establish performance baselines
- Test API response times
- Test under expected load
- Identify and fix bottlenecks
- Test database query performance
- Test frontend rendering performance
- Test mobile performance
- Monitor and log performance metrics

## User Experience Standards

### Customer UX
- Intuitive shopping experience
- Clear product information
- Streamlined checkout process
- Transparent pricing and fees
- Easy account management
- Clear order history and tracking
- Responsive design across devices
- Helpful error messages

### Vendor UX
- Simple onboarding process
- Clear inventory management
- Transparent fee structure
- Comprehensive sales analytics
- Easy payout management
- Responsive design across devices
- Intuitive product listing process
- Helpful guidance and tooltips

### Admin UX
- Comprehensive dashboard
- Easy user management
- Clear transaction monitoring
- Efficient vendor approval process
- Detailed analytics and reporting
- Configurable system parameters
- Search and filtering capabilities
- Audit trails for all operations

## Mobile Development Standards

### React Native Standards
- Use functional components with hooks
- Implement proper navigation using React Navigation
- Follow responsive design principles
- Optimize for different screen sizes
- Handle offline scenarios gracefully
- Implement proper error handling
- Use appropriate loading indicators
- Follow platform-specific design guidelines

### Mobile Testing
- Test on both iOS and Android
- Test on different device sizes
- Test in low-network conditions
- Test battery consumption
- Test offline functionality
- Test push notifications
- Test app permissions
- Test app lifecycle events

## Documentation Standards

### Code Documentation
- Document all functions and classes
- Explain complex logic
- Document parameters and return values
- Document exceptions and error states
- Keep documentation up-to-date with code changes
- Use JSDoc for JavaScript/TypeScript documentation
- Document edge cases and limitations
- Provide examples for complex functions

### API Documentation
- Document all endpoints
- Specify request and response formats
- Document authentication requirements
- Provide example requests and responses
- Document error responses
- Specify rate limits and quotas
- Document versioning strategy
- Keep documentation up-to-date with API changes

### User Documentation
- Provide clear getting started guides
- Document all features and functionality
- Use screenshots and examples
- Document error messages and solutions
- Provide troubleshooting guides
- Keep documentation up-to-date with features
- Organize documentation logically
- Make documentation accessible and searchable

## Media Handling

### Image Standards
- Optimize images for web and mobile
- Use responsive images techniques
- Implement lazy loading for images
- Support common image formats
- Implement proper alt text for accessibility
- Validate uploaded images
- Implement image thumbnails
- Store images in appropriate storage

### Video Standards
- Support common video formats
- Implement responsive video playback
- Optimize video delivery
- Implement proper controls
- Support captions for accessibility
- Implement lazy loading for videos
- Handle different network conditions
- Validate uploaded videos

## Error Handling

### Frontend Error Handling
- Implement global error boundary
- Display user-friendly error messages
- Log errors for debugging
- Recover gracefully from errors
- Show appropriate loading states
- Handle network errors appropriately
- Retry operations when appropriate
- Preserve user input during errors

### Backend Error Handling
- Use appropriate HTTP status codes
- Return consistent error response format
- Log errors with context
- Handle unexpected errors gracefully
- Implement proper validation errors
- Don't expose sensitive information
- Implement proper database error handling
- Handle third-party API errors appropriately

## Monitoring and Logging

### Application Logging
- Log application startup and shutdown
- Log authentication and authorization events
- Log API requests and responses
- Log errors with stack traces
- Log performance metrics
- Use appropriate log levels
- Include context in log messages
- Don't log sensitive information

### Monitoring
- Monitor application health
- Monitor API response times
- Monitor error rates
- Monitor database performance
- Monitor third-party API performance
- Set up alerts for critical issues
- Monitor system resources
- Monitor user engagement