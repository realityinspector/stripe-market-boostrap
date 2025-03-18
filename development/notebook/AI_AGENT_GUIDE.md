# AI Agent Development Guide

## ATTENTION AI AGENTS
This guide provides critical instructions for AI agents working on the Stripe Connect Marketplace project. Follow these guidelines for all development work to ensure consistency and compliance with project requirements.

## Development Notebook Navigation
- Start with README.md for an overview
- Review this guide (AI_AGENT_GUIDE.md) for AI-specific instructions
- Check tasks/CURRENT.md for active tasks
- Document your work in logs/DAILY_LOG.md
- Record failures in logs/FAILURE_LOG.md
- Document decisions in logs/DECISION_LOG.md

## AI-Specific Development Guidelines

### 🚨 CRITICAL REQUIREMENTS - NEVER IGNORE 🚨

#### Database Integrity
- **NEVER DELETE CUSTOMER/USER DATA** during migrations or updates
- Use safe migrations only - always preserve existing user data
- Add safeguards in migration scripts to prevent data loss
- Document all schema changes in DECISION_LOG.md
- Include data protection measures in code reviews (REVIEW_CHECKLIST.md)
- All database changes must be reversible and backward compatible
- Add comments and docstrings emphasizing data protection requirements
- Test migrations thoroughly before applying to production data

#### Platform & Framework
- Use React Native for mobile development
- Document any React Native version changes in DECISION_LOG.md
- Always add docstrings to React Native components explaining their purpose

#### Security
- Implement CSRF protection for all API endpoints
- Detail security implementations in docs/STANDARDS.md
- Include security tests in CI/CD pipeline
- Document security considerations in code comments and docstrings

#### External API Integration
- For Stripe: Support both LIVE and TEST modes
- **FAIL SOFT** on all external API failures with graceful degradation
- Add detailed logging for external API interactions
- Document external API dependencies in code comments
- Include retry logic and fallback mechanisms for external services
- Never expose API keys or secrets in code or logs

#### Internal API Integration
- Integrate all internal APIs with CI/CD testing
- Document API contracts in code comments and docstrings
- Ensure test coverage for all API endpoints

#### Deployment Process
- **REMEMBER: Deployment is done by the user on Replit**
- Do not attempt to automate deployment outside of Replit
- Document deployment steps in workflows/RELEASE_PROCESS.md
- Add comments referring to Replit deployment process

#### User Experience
- Implement administrative wizards with explainers for all admin tasks
- Include step-by-step guides for complex processes
- Create onboarding flows for new users and admins
- Document UX decisions in DECISION_LOG.md

#### Data Management
- Provide tools to create and remove sample data
- Implement admin user management features
- Create daily database backup jobs to private folder (not web-accessible)
- Document backup and restore procedures

#### Media Handling
- Gracefully handle social media content metadata
- Implement image and media serving with thumbnail generation
- Document media handling strategies in code comments
- Include media tests in CI/CD pipeline

#### Error Handling
- Fail soft on external API errors with detailed logging
- Test for and proactively handle 404 and 500 errors
- Document error handling strategies in code comments
- Create user-friendly error messages and recovery paths

#### Testing & CI/CD
- Integrate security and basic load testing in CI/CD
- Implement analytics tracking for development metrics
- Expose analytics history through console interfaces
- Document testing requirements in workflows/CI_COMPLIANCE.md
- Ensure all CI/CD tests maintain backward compatibility

## Code Documentation Requirements

### Docstrings and Comments
All code MUST include clear comments and docstrings that:

1. Explain the purpose of files, functions, and classes
2. Highlight critical data integrity considerations:
   ```javascript
   /**
    * Updates user profile information
    * 
    * 🚨 ATTENTION AI AGENTS 🚨
    * This function follows safe update principles:
    * - NEVER deletes user data
    * - Preserves existing fields not included in the update
    * - Validates input before persistence
    * - Uses parameterized queries to prevent SQL injection
    */
   ```

3. Emphasize external API handling:
   ```javascript
   /**
    * Process payment via Stripe API
    * 
    * 🚨 ATTENTION AI AGENTS 🚨
    * This function:
    * - Handles both TEST and LIVE Stripe modes
    * - Fails soft with graceful error handling
    * - Includes detailed logging of API interactions
    * - Never exposes API keys or secrets
    */
   ```

4. Highlight CI/CD integration points:
   ```javascript
   /**
    * API endpoint for user registration
    * 
    * 🚨 ATTENTION AI AGENTS 🚨
    * This endpoint:
    * - Is integrated with CI/CD testing
    * - Includes CSRF protection
    * - Has security tests in the CI pipeline
    * - Must maintain backward compatibility
    */
   ```

### Code Review Process
All code changes must:
1. Preserve and update docstrings and comments
2. Maintain or improve existing hints for future AI agents
3. Follow the docs/REVIEW_CHECKLIST.md requirements
4. Ensure CI/CD pipeline passes all tests

## Practical Example for AI Agents
When implementing a new feature:

1. Start by checking tasks/CURRENT.md for detailed requirements
2. Update logs/DAILY_LOG.md with your plan
3. Implement the feature with proper docstrings and comments
4. Add tests to the CI/CD pipeline
5. Document decisions in logs/DECISION_LOG.md
6. Update tasks/CURRENT.md with progress
7. Move completed task to tasks/COMPLETED.md

## Remember
- All comments and docstrings must stay with revisions
- Update comments and hints to be accurate as code evolves
- Document all significant decisions and changes
- Never compromise on data integrity or security
- Maintain backward compatibility for all changes