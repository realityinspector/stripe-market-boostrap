# 🔄 CI/CD Compliance Guide

This document provides comprehensive guidelines for ensuring all code and development activities comply with the project's CI/CD pipeline requirements. Following these rules is **mandatory** for all development work.

## 🚨 CRITICAL NOTICE FOR AI AGENTS 🚨

As an AI agent working on this codebase, you **must** follow these compliance guidelines for all code changes. Failing to do so will result in broken builds, test failures, and deployment issues. The CI/CD pipeline automatically validates these requirements.

## 📋 Pre-Commit Checklist

Before committing any code changes, verify that:

1. **All tests pass locally**
   - Run `node testing/runTests.js` to ensure all tests pass
   - If any tests fail, they must be fixed or documented in KNOWN_ISSUES.md

2. **Code meets style guidelines**
   - No linting errors (run linter if available)
   - Consistent formatting
   - Follows naming conventions

3. **Documentation is updated**
   - New features are documented
   - API changes are reflected in documentation
   - Complex logic has explanatory comments

4. **No sensitive information**
   - No API keys or secrets in code
   - No personal data or credentials
   - Environment variables used for configuration

5. **Proper error handling**
   - All API endpoints handle errors gracefully
   - User-facing error messages are clear and helpful
   - Errors are logged appropriately

## 🏗️ CI Pipeline Stages

Our CI/CD pipeline consists of the following stages that will automatically run on your code:

### 1. Build Stage
- **Syntax Checking**: Validates JavaScript/TypeScript syntax
- **Dependency Installation**: Confirms all dependencies can be installed
- **Compilation**: Ensures code compiles correctly (if applicable)

### 2. Test Stage
- **Unit Tests**: Fast tests for individual components
- **Integration Tests**: Tests for component interactions
- **E2E Tests**: Full end-to-end workflow tests
- **API Tests**: Tests for API endpoints
- **UI Tests**: Tests for user interface components

### 3. Quality Stage
- **Code Coverage**: Measures test coverage percentage
- **Linting**: Checks code style and patterns
- **Security Scanning**: Identifies potential security issues
- **Performance Benchmarks**: Validates performance metrics

### 4. Deployment Stage
- **Environment Preparation**: Sets up deployment environment
- **Configuration Validation**: Checks environment configuration
- **Deployment Execution**: Deploys application to target environment
- **Smoke Tests**: Confirms basic functionality after deployment

## 🚫 Common CI/CD Failures

Avoid these common causes of CI/CD failures:

1. **Missing Dependencies**
   - Always update package.json when adding new dependencies
   - Ensure all dependencies are explicitly listed (no implicit dependencies)

2. **Inconsistent Environment Variables**
   - Document all required environment variables
   - Provide sensible defaults or clear error messages when variables are missing

3. **Flaky Tests**
   - Tests should be deterministic and reliable
   - Avoid time-dependent or network-dependent tests without proper mocking
   - Don't rely on specific test execution order

4. **Long-Running Tests**
   - Keep tests efficient and focused
   - Split large tests into smaller units
   - Use proper test categories (unit, integration, e2e)

5. **Incomplete Error Handling**
   - Always handle API errors appropriately
   - Provide user-friendly error messages
   - Log detailed error information for debugging

## 🛠️ Fixing CI/CD Failures

When the CI/CD pipeline fails:

1. **Read the Error Logs Carefully**
   - CI/CD logs provide detailed information about failures
   - Identify the specific test or stage that failed

2. **Reproduce Locally**
   - Attempt to reproduce the failure in your local environment
   - Use the same environment variables and configuration

3. **Fix the Root Cause**
   - Address the underlying issue, not just the symptom
   - Update tests if requirements have changed
   - Document any workarounds in DECISION_LOG.md

4. **Document Persistent Issues**
   - If an issue cannot be immediately resolved, document it in FAILURE_LOG.md
   - Add a clear description of the problem and planned resolution

## 📝 Special Instructions for AI Agents

When developing code as an AI agent:

1. **Always check CI/CD status before making changes**
   - Review recent test runs
   - Note any existing failures

2. **Test changes thoroughly before submitting**
   - Run the specific category of tests affected by your changes
   - Verify that your changes don't break existing functionality

3. **Document CI/CD-related decisions**
   - Any changes to test structure or CI/CD process should be documented
   - Explain the rationale for test modifications or exemptions

4. **Update the development notebook**
   - Record any CI/CD issues in FAILURE_LOG.md
   - Document successful fixes in DAILY_LOG.md

## 🔄 Continuous Improvement

The CI/CD pipeline is continuously improving. Watch for these upcoming changes:

1. **Automated Code Review**
   - Static analysis tools
   - Code quality metrics
   - Automated suggestions

2. **Performance Testing**
   - Load testing integration
   - Memory usage analysis
   - Response time benchmarking

3. **Enhanced Security Scanning**
   - Dependency vulnerability checking
   - Secret detection
   - OWASP compliance verification

---

**Remember**: A passing CI/CD pipeline is a requirement for all code changes. Do not circumvent or disable CI/CD checks under any circumstances.