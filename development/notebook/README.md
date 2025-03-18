# Development Notebook for Stripe Connect Marketplace

## ATTENTION AI AGENTS
This development notebook is designed to help you manage the development of the Stripe Connect Marketplace application. It provides structured documentation, task tracking, and guidelines to ensure consistent development across AI collaborators.

## Notebook Structure
The notebook is organized as follows:

- **README.md** - This file, providing an overview of the notebook structure
- **AI_AGENT_GUIDE.md** - Specific instructions for AI agents working on this project
- **tasks/** - Task tracking and management
  - CURRENT.md - Currently active tasks
  - BACKLOG.md - Tasks planned for future implementation
  - COMPLETED.md - Tasks that have been completed
  - BLOCKED.md - Tasks that are blocked and reasons
- **logs/** - Development logs
  - DAILY_LOG.md - Daily development activities and progress
  - FAILURE_LOG.md - Documentation of failures and resolution steps
  - DECISION_LOG.md - Record of important architectural and implementation decisions
- **workflows/** - CI/CD and deployment workflows
  - CI_COMPLIANCE.md - Compliance requirements for CI/CD pipeline
  - RELEASE_PROCESS.md - Steps for releasing new versions
- **docs/** - Documentation
  - STANDARDS.md - Coding standards and guidelines
  - REVIEW_CHECKLIST.md - Checklist for code reviews

## Workflow for AI Agents
1. **Orientation**: Read through this README.md and AI_AGENT_GUIDE.md to understand the project structure and guidelines.
2. **Task Review**: Check the tasks/CURRENT.md file to understand the currently active tasks.
3. **Implementation**: Implement the required changes, following the coding standards in docs/STANDARDS.md.
4. **Documentation**: Update the logs/DAILY_LOG.md with your progress and any decisions made.
5. **Testing**: Ensure all tests pass before submitting changes.
6. **Handoff**: Update task status and provide detailed notes for the next AI agent.

## Critical Rules
1. **Test Coverage**: All changes must have associated tests.
2. **Documentation**: Document all significant changes and decisions.
3. **Error Handling**: Implement robust error handling for all user-facing features.
4. **Security**: Follow security best practices, especially for payment processing.
5. **Compliance**: Ensure all code follows Stripe Connect compliance requirements.

## Current Status
The Stripe Connect Marketplace is under active development, with a focus on addressing test failures in the Stripe integration, authentication flow, and payment processing. The current priority is to fix these issues to establish a stable testing infrastructure.

Priority areas:
1. Fixing Stripe Connect vendor onboarding
2. Resolving payment intent creation failures
3. Addressing authentication route issues
4. Fixing UI test failures for registration and login