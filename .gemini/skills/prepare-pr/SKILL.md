---
name: prepare-pr
description: Prepare a pull request by summarizing changes, proposing a commit message, and suggesting a detailed PR description. Use when the user wants to "create a PR", "prepare for commit", or "wrap up my work".
---

# prepare-pr

This skill helps package your changes into a high-quality pull request.

## Guidelines

- Refer to the project's [README](../../../README.md) for contribution guidelines.

## Workflow

1.  **Summarize Changes**:
    - Use `git status` and `git diff` to identify and summarize what changed.
2.  **Verify Build**:
    - Trigger `backend-verify` and/or `frontend-verify` skills as applicable.
3.  **Propose Commit Message**: Create a concise, descriptive message (e.g., `feat(api): add booking creation endpoint`).
4.  **Draft PR Description**:
    - **Summary**: High-level explanation of the changes.
    - **Technical Details**: Specific architectural or logic changes made.
    - **Verification**: List of commands run to verify the changes.
5.  **Review Step**: Prompt the user to review the drafted content and decide whether to stage/commit the changes.
