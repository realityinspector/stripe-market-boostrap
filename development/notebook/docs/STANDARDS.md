# 📏 Coding Standards and Best Practices

This document outlines the coding standards, patterns, and best practices that must be followed when developing the Stripe Connect Marketplace. Adhering to these standards ensures code quality, maintainability, and consistency across the codebase.

## 🚨 CRITICAL NOTICE FOR AI AGENTS 🚨

As an AI agent working on this codebase, you **must** adhere to these standards in all code you generate. Code that does not meet these standards will not pass review and may introduce bugs, security vulnerabilities, or maintenance issues.

## 🏗️ Architecture Guidelines

### Application Structure

```
/
├── server/             # Backend API server
│   ├── routes/         # API route definitions
│   ├── controllers/    # Business logic handlers
│   ├── models/         # Data models
│   ├── middleware/     # Express middleware
│   ├── services/       # External service integrations
│   └── utils/          # Utility functions
├── mobile/             # React Native mobile app
│   ├── screens/        # Mobile screens by feature
│   ├── components/     # Reusable UI components
│   ├── services/       # API and external services
│   ├── navigation/     # Navigation configuration
│   └── utils/          # Utility functions
├── testing/            # Testing infrastructure
│   ├── api/            # API tests
│   ├── e2e/            # End-to-end tests
│   ├── frontend/       # Frontend component tests
│   ├── utils/          # Test utilities
│   └── templates/      # Test templates
└── development/        # Development tools and documentation
    └── notebook/       # CI/CD notebook structure
```

### Architectural Patterns

1. **Three-Tier Architecture**
   - Presentation layer (Mobile UI)
   - Business logic layer (API controllers)
   - Data layer (Database models)

2. **Feature-Based Organization**
   - Group code by feature rather than type
   - Each feature should be self-contained where possible
   - Cross-cutting concerns in shared modules

3. **Dependency Injection**
   - Use dependency injection for services
   - Avoid tight coupling between components
   - Facilitate easier testing with mocks

## 💻 Coding Standards

### General Standards

1. **Naming Conventions**
   - **Files**: Use camelCase for JavaScript files, PascalCase for React components
   - **Functions**: Use camelCase (e.g., `getUserById`)
   - **Components**: Use PascalCase (e.g., `ProductCard`)
   - **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
   - **Variables**: Use camelCase (e.g., `userProfile`)
   - **Database fields**: Use snake_case (e.g., `user_id`)

2. **Code Formatting**
   - Use 2 spaces for indentation
   - Maximum line length of 100 characters
   - Use semicolons at the end of statements
   - Use single quotes for strings by default

3. **Error Handling**
   - Always use try/catch for asynchronous operations
   - Provide meaningful error messages
   - Log errors with appropriate detail
   - Return consistent error responses from API

### JavaScript/TypeScript Standards

1. **Modern JavaScript Features**
   - Use ES6+ features consistently
   - Prefer const over let where possible
   - Use arrow functions for callbacks
   - Use destructuring for objects and arrays
   - Use template literals for string interpolation

2. **Async Patterns**
   - Use async/await instead of raw promises
   - Handle promise rejections with try/catch
   - Avoid deeply nested callbacks
   - Use Promise.all for parallel operations

3. **TypeScript Usage**
   - Define explicit types for function parameters and returns
   - Use interfaces for complex object structures
   - Avoid using `any` type unless absolutely necessary
   - Use TypeScript enums for fixed sets of values

### React/React Native Standards

1. **Component Architecture**
   - Use functional components with hooks
   - Keep components focused on a single responsibility
   - Extract reusable logic into custom hooks
   - Separate business logic from presentation

2. **State Management**
   - Use React Context for global state
   - Use useReducer for complex component state
   - Keep state as close to where it's used as possible
   - Use immutable patterns for state updates

3. **Performance Optimization**
   - Use React.memo for pure components
   - Use useCallback for event handlers
   - Use useMemo for expensive calculations
   - Implement virtualization for long lists

### API Design Standards

1. **RESTful Principles**
   - Use appropriate HTTP methods (GET, POST, PUT, DELETE)
   - Maintain resource-based URL structure
   - Use consistent naming conventions
   - Return appropriate status codes

2. **Response Structure**
   ```json
   {
     "status": "success",
     "data": { ... },
     "message": "Optional message"
   }
   ```

3. **Error Response Structure**
   ```json
   {
     "status": "error",
     "error": {
       "code": "ERROR_CODE",
       "message": "Human-readable error message"
     }
   }
   ```

4. **Input Validation**
   - Validate all input data at API boundaries
   - Return clear validation error messages
   - Use schema validation libraries (e.g., Joi, Yup)
   - Sanitize inputs to prevent injection attacks

## 🔒 Security Standards

1. **Authentication**
   - Use JWT for authentication
   - Store tokens securely (HttpOnly cookies or secure storage)
   - Implement proper token expiration and refresh
   - Use HTTPS for all communications

2. **Authorization**
   - Implement role-based access control
   - Check permissions on all protected routes
   - Never trust client-side authorization
   - Log authorization failures

3. **Data Protection**
   - Never store sensitive data in plain text
   - Use environment variables for secrets
   - Implement proper input validation
   - Apply the principle of least privilege

4. **Stripe Integration Security**
   - Never log full card details
   - Use Stripe Elements for secure card collection
   - Keep Stripe webhook endpoint secret
   - Validate webhook signatures

## 🧪 Testing Standards

1. **Test Coverage**
   - Minimum 80% code coverage for business logic
   - All API endpoints must have tests
   - Critical user flows must have E2E tests
   - Test both success and error cases

2. **Test Structure**
   - Follow the Arrange-Act-Assert pattern
   - Each test should test one concept
   - Use descriptive test names
   - Isolate tests from external dependencies

3. **Test Templates**
   - Use the established test templates in `/testing/templates/`
   - Follow the documentation patterns in example tests
   - Include test documentation for AI agents
   - Document test assumptions and edge cases

## 🌐 Stripe Connect Standards

1. **Vendor Onboarding**
   - Use Stripe Connect Express for simplified onboarding
   - Store Stripe account IDs securely
   - Implement proper error handling for onboarding failures
   - Provide clear guidance for vendors during onboarding

2. **Payment Processing**
   - Use Payment Intents API for modern payments
   - Implement webhooks for payment status updates
   - Store transaction references, not full payment details
   - Handle failed payments gracefully

3. **Platform Fee Handling**
   - Calculate platform fees consistently
   - Clearly communicate fee structure to vendors
   - Provide transaction history with fee breakdown
   - Handle fee-related disputes properly

4. **Testing Stripe Integration**
   - Use Stripe test mode for development
   - Mock Stripe responses in tests
   - Test webhook handling with Stripe CLI
   - Verify both success and failure scenarios

## 📝 Documentation Standards

1. **Code Documentation**
   - Document complex logic with clear comments
   - Use JSDoc for function documentation
   - Include examples for non-obvious usages
   - Explain the "why" not just the "what"

2. **API Documentation**
   - Document all API endpoints
   - Include request/response examples
   - Document error scenarios
   - Keep documentation in sync with implementation

3. **README Files**
   - Each major directory should have a README.md
   - Explain the purpose and structure of the directory
   - Include quick start instructions where applicable
   - Link to related documentation

## 🔍 Instructions for AI Agents

When developing code:

1. **Review the standards** relevant to your task
2. **Follow established patterns** from existing codebase
3. **Document your code** according to the standards
4. **Run relevant tests** to verify your changes
5. **Update documentation** if you change behavior

When implementing new features:
1. **Start with API design** following RESTful principles
2. **Implement backend logic** with proper error handling
3. **Create UI components** following React standards
4. **Write tests** for all new functionality
5. **Document** the new feature for users and developers

When fixing bugs:
1. **Write a test** that reproduces the bug
2. **Fix the implementation** to pass the test
3. **Verify** no regressions were introduced
4. **Document** the root cause and fix in commit message

---

**Remember**: These standards exist to ensure code quality and maintainability. Deviations should be rare and documented in the DECISION_LOG.md file.