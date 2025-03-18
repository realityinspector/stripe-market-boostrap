# Stripe Connect Marketplace Development Notebook

## ATTENTION AI AGENTS
This development notebook contains all documentation, tasks, decisions, and standards for the Stripe Connect Marketplace project. Use this notebook as your primary guide for development.

## Project Overview

The Stripe Connect Marketplace is a mobile platform for connecting vendors and customers, with a robust payment processing system powered by Stripe Connect. The platform supports:

- Vendor onboarding with Stripe Connect
- Product listing and management
- Customer shopping and checkout
- Payment processing and vendor payouts
- Administrative oversight and platform management

The system follows a Bootstrap Flywheel Pattern with admin-first development, emphasizing data integrity, security, and comprehensive testing.

## Notebook Structure

This development notebook is organized into several sections:

- **Tasks**: Current, backlog, completed, and blocked tasks
  - `/tasks/CURRENT.md` - Active tasks being worked on
  - `/tasks/BACKLOG.md` - Future tasks not yet started
  - `/tasks/COMPLETED.md` - Tasks that have been completed
  - `/tasks/BLOCKED.md` - Tasks that are blocked by dependencies

- **Logs**: Development logs, failure records, and decisions
  - `/logs/DAILY_LOG.md` - Daily development activities and progress
  - `/logs/FAILURE_LOG.md` - Record of failures and their resolutions
  - `/logs/DECISION_LOG.md` - Documentation of key decisions made

- **Workflows**: CI/CD and release processes
  - `/workflows/CI_COMPLIANCE.md` - CI/CD compliance requirements
  - `/workflows/RELEASE_PROCESS.md` - Release process documentation

- **Docs**: Standards and review guidelines
  - `/docs/STANDARDS.md` - Development standards for the project
  - `/docs/REVIEW_CHECKLIST.md` - Checklist for code reviews

## Workflow for AI Agents

When working on this project, follow this workflow:

1. **Read the AI_AGENT_GUIDE.md** for AI-specific guidance
2. **Check CURRENT.md** for active tasks and priority
3. **Focus on blocked tasks first** if you can unblock them
4. **Document your work** in DAILY_LOG.md
5. **Follow the standards** in STANDARDS.md
6. **Record significant decisions** in DECISION_LOG.md
7. **Log failures** in FAILURE_LOG.md
8. **Update task statuses** as you make progress

## Critical Rules

1. **Safe Database Operations**: Never perform destructive database operations. Use ORMs for safe migrations.
2. **Security First**: Implement proper authentication, authorization, and CSRF protection.
3. **Data Integrity**: Ensure data integrity at all layers of the application.
4. **Comprehensive Testing**: Maintain high test coverage across all components.
5. **Documentation**: Document all significant changes, decisions, and features.
6. **Error Handling**: Implement robust error handling for all operations.
7. **API Design**: Follow RESTful API design principles with consistent error responses.
8. **Responsive Design**: Ensure all interfaces work on various device sizes.
9. **Performance**: Monitor and optimize performance of key operations.
10. **Stripe Integration**: Follow Stripe's best practices for Connect marketplace integration.

## Key Technologies

- **Frontend**: React Native for mobile applications
- **Backend**: Express.js REST API
- **Database**: PostgreSQL for data storage
- **Payment Processing**: Stripe Connect
- **Testing**: Comprehensive automated testing suite
- **CI/CD**: Automated deployment pipeline with quality checks

## Project Status

- Current test success rate: 27/33 (82%)
- Critical issues: Authentication, Stripe Connect onboarding
- In progress: Fixing failed tests, implementing CSRF protection