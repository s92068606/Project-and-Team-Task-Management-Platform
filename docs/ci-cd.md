# CI/CD Workflow Explanation

The repository uses GitHub Actions to validate the codebase on every push and pull request.

Workflow steps:

1. Install dependencies.
2. Run API lint checks.
3. Run web lint checks.
4. Build both applications.

This provides a basic guardrail for code quality and build stability without requiring deployment infrastructure.

For deployment, see [docs/deployment.md](deployment.md).
