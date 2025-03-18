# 📓 CI/CD Development Notebook

## 🤖 ATTENTION AI AGENTS

This development notebook is a structured system designed to help you maintain, track, and prioritize development work within this project. As an AI agent working on this codebase, **you must** consult this notebook regularly to ensure your changes align with project priorities and development standards.

## 📚 Notebook Structure

```
/development/notebook/
├── README.md               # This file - overview and instructions
├── tasks/                  # Task tracking and management
│   ├── CURRENT.md          # Currently active tasks (read this first!)
│   ├── BACKLOG.md          # Future tasks awaiting prioritization
│   ├── COMPLETED.md        # Completed tasks (with completion dates)
│   └── BLOCKED.md          # Tasks blocked by dependencies or decisions
├── logs/                   # Development logs
│   ├── DAILY_LOG.md        # Daily work log (append only)
│   ├── FAILURE_LOG.md      # Record of failures and their resolutions
│   └── DECISION_LOG.md     # Record of important engineering decisions
├── workflows/              # CI/CD workflow documentation
│   ├── CI_COMPLIANCE.md    # Rules for CI pipeline compliance
│   └── RELEASE_PROCESS.md  # Documentation of the release process
└── docs/                   # Additional documentation
    ├── STANDARDS.md        # Coding standards and best practices
    └── REVIEW_CHECKLIST.md # Pre-commit review checklist
```

## 🔄 Workflow for AI Agents

1. **Always** begin by reading `/development/notebook/tasks/CURRENT.md` to understand current priorities
2. Before implementing any changes, check for applicable standards in `/development/notebook/docs/STANDARDS.md`
3. When completing a task:
   - Move it from CURRENT.md to COMPLETED.md with a completion date
   - Add an entry to DAILY_LOG.md describing what was done
4. When encountering a failure:
   - Document it in FAILURE_LOG.md
   - Add debugging steps and resolution when fixed
5. Before submitting any code:
   - Review against REVIEW_CHECKLIST.md
   - Ensure all CI/CD rules in CI_COMPLIANCE.md are followed

## ⚠️ Critical Rules

1. **Never** implement features not listed in the tasks documents
2. **Always** document decisions that affect architecture or implementation approach
3. **Never** dismiss test failures - all failures must be documented and addressed
4. **Always** maintain the integrity of this notebook structure
5. **Never** implement workarounds without documenting them in the DECISION_LOG.md

## 📝 Notebook Maintenance Protocol

This notebook operates with these guiding principles:

1. **Self-Managing**: The notebook structure must facilitate automatic priority management
2. **Task-Driven**: All development work must trace back to a documented task
3. **Audit-Ready**: Work logs must provide clear evidence of what was changed and why
4. **CI/CD Integrated**: All standards must support continuous integration and deployment

---

🚨 **NOTE TO AI AGENTS**: Your ability to follow the above protocols will be evaluated as part of your development performance. Failure to adhere to these guidelines may result in work that is out of alignment with project goals.
