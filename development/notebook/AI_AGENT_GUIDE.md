# 🤖 AI Agent Development Guide

This comprehensive guide is specifically designed for AI agents working on the Stripe Connect Marketplace project. It provides a complete overview of how to interact with the development notebook structure and ensures AI agents comply with all project standards and practices.

## 🚨 ATTENTION AI AGENTS 🚨

You **must** read and follow this guide before making any changes to the codebase. Failure to follow these guidelines will result in low-quality contributions that may be rejected or cause issues in the system.

## 🧭 Development Notebook Navigation

The development notebook is your primary tool for understanding project status, current tasks, and development standards. Here's how to use it effectively:

### Daily Workflow

1. **Begin by checking tasks**
   ```
   /development/notebook/tasks/CURRENT.md
   ```
   This file contains the current high-priority tasks. Always work on critical tasks first.

2. **Review relevant standards**
   ```
   /development/notebook/docs/STANDARDS.md
   ```
   Ensure you understand the coding standards relevant to your task.

3. **Implement your changes** following all guidelines and standards

4. **Self-review your changes**
   ```
   /development/notebook/docs/REVIEW_CHECKLIST.md
   ```
   Use this comprehensive checklist to verify your changes meet all requirements.

5. **Document your work**
   ```
   /development/notebook/logs/DAILY_LOG.md
   ```
   Add an entry describing what you implemented and any decisions made.

6. **Update task status**
   - Move completed tasks from CURRENT.md to COMPLETED.md
   - Add new tasks discovered to CURRENT.md or BACKLOG.md as appropriate

### Documentation Reference

Use these files for specific guidance:

- **Architecture and Code Standards**
  ```
  /development/notebook/docs/STANDARDS.md
  ```

- **CI/CD Pipeline Compliance**
  ```
  /development/notebook/workflows/CI_COMPLIANCE.md
  ```

- **Release Process**
  ```
  /development/notebook/workflows/RELEASE_PROCESS.md
  ```

- **Task Management**
  ```
  /development/notebook/tasks/CURRENT.md
  /development/notebook/tasks/BACKLOG.md
  /development/notebook/tasks/COMPLETED.md
  /development/notebook/tasks/BLOCKED.md
  ```

- **Development Logs**
  ```
  /development/notebook/logs/DAILY_LOG.md
  /development/notebook/logs/FAILURE_LOG.md
  /development/notebook/logs/DECISION_LOG.md
  ```

## 🛠️ AI-Specific Development Guidelines

### Code Generation Guidelines

1. **Always follow established patterns**
   - Study existing code before implementing similar functionality
   - Maintain consistent naming, structure, and error handling

2. **Focus on long-term maintainability**
   - Write self-documenting code
   - Include comprehensive comments for complex logic
   - Break down complex functions into smaller, testable units

3. **Prioritize security and correctness**
   - Input validation on all user data
   - Proper error handling with meaningful messages
   - Careful handling of asynchronous operations

4. **Generate comprehensive tests**
   - Follow test templates in `/testing/templates/`
   - Test both success and error cases
   - Include edge case handling

### Documentation Guidelines

1. **Use standardized documentation formats**
   - Follow JSDoc for code documentation
   - Use markdown for project documentation
   - Maintain consistent style across documents

2. **Document the "why" not just the "what"**
   - Explain the reasoning behind complex decisions
   - Document trade-offs considered
   - Note any performance or security implications

3. **Keep documentation up-to-date**
   - Update documentation as code changes
   - Remove outdated information
   - Ensure examples reflect current behavior

### Task Management Guidelines

1. **One task at a time**
   - Focus on a single task until completion
   - Avoid making unrelated changes
   - Get clarification if a task is ambiguous

2. **Task completion criteria**
   - All requirements met
   - Tests pass
   - Documentation updated
   - Self-review completed
   - Development notebook updated

3. **Create new tasks for discovered issues**
   - Add to CURRENT.md for critical issues
   - Add to BACKLOG.md for non-critical issues
   - Include clear description and acceptance criteria

## ⚠️ Common AI Agent Pitfalls

Avoid these common issues:

1. **Implementing solutions without proper context**
   - Always review the entire codebase context before implementing
   - Understand how your changes fit into the larger system

2. **Ignoring established patterns**
   - Don't reinvent patterns that already exist
   - Follow the conventions established in the codebase

3. **Incomplete error handling**
   - Always consider what happens when things go wrong
   - Handle edge cases and unexpected inputs
   - Provide meaningful error messages

4. **Insufficient testing**
   - Don't just test the happy path
   - Test error conditions and edge cases
   - Verify integration with other components

5. **Poor documentation**
   - Document complex logic
   - Explain non-obvious decisions
   - Update relevant documentation

## 🔄 CI/CD Integration

The CI/CD pipeline will automatically check your changes for:

1. **Test coverage** - Ensure new code has adequate test coverage
2. **Code style** - Follow project style guidelines
3. **Security issues** - No security vulnerabilities introduced
4. **Build success** - Code builds and runs successfully
5. **Performance** - No significant performance regressions

Review `/development/notebook/workflows/CI_COMPLIANCE.md` for detailed CI/CD requirements.

## 🚀 Best Practices for AI Agents

1. **Understand before implementing**
   - Take time to understand the problem thoroughly
   - Review related code and documentation
   - Consider alternative approaches

2. **Think holistically**
   - Consider how your changes affect the entire system
   - Be mindful of security, performance, and user experience
   - Consider mobile and web implications

3. **Focus on quality over speed**
   - Thorough testing
   - Comprehensive documentation
   - Clean, readable code

4. **Leave the codebase better than you found it**
   - Fix small issues you encounter
   - Improve documentation where it's lacking
   - Refactor confusing code (with care)

5. **Document your thought process**
   - Record significant decisions in DECISION_LOG.md
   - Explain trade-offs considered
   - Note alternatives that were rejected and why

## 📋 AI Agent Compliance Checklist

Before submitting any code changes, verify:

- [ ] You've read and understood this guide
- [ ] Your changes follow the project's coding standards
- [ ] You've self-reviewed using REVIEW_CHECKLIST.md
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Development notebook is updated with your changes
- [ ] You've considered security implications
- [ ] Your changes are consistent with the architectural patterns

---

**Remember**: As an AI agent, your contributions should be indistinguishable from or better than those of human developers. This means not just mechanically following rules but understanding the context, purpose, and implications of your changes.