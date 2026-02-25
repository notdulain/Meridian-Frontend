# Contribution Guidelines (Frontend)

Welcome to the **Meridian** Frontend repository! To keep our codebase clean, readable, and easy to maintain, please follow these standard contribution guidelines when working on the project.

## 🌱 Branching Strategy

We follow a standard feature-branch workflow that perfectly mirrors our backend architecture. This ensures seamless integration and deployments.

*   **`main`**: Production-ready code. Commits merged here automatically trigger a production deployment to Vercel.
*   **`develop`**: Active development branch. All feature branches merge here first for staging and QA.

Both `main` and `develop` are protected branches and **require at least 1 Pull Request approval** before merging. Direct pushes to these branches are blocked by repository rules.

### Naming Conventions

Always create your branch off from `develop`. Your branch name **must** include the issue key (e.g., `MER-123`) from your tracker to tightly couple the code to the ticket.

**Format:** `<issue-key>-<short-description>`

*   `MER-26-add-navigation-drawer`
*   `MER-42-fix-login-form-validation`
*   `MER-10-setup-shadcn-ui`

## 📝 Commit Messages

We write semantic commit messages so our git history is readable and easily parsed. **Every commit must start with its issue key.**

**Format:** `<issue-key> <type>(<scope>): <short description>`

**Types:**
*   `feat`: A new feature (e.g., adding a new page or component)
*   `fix`: A bug fix (e.g., fixing a UI glitch or API integration)
*   `docs`: Documentation only changes
*   `refactor`: A code change that neither fixes a bug nor adds a feature (e.g., extracting a reusable hook)
*   `test`: Adding missing tests or correcting existing tests
*   `chore`: Changes to the build process, package.json, or tool configurations

**Example:** 
`MER-26 feat(Dashboard): create dynamic charting component for deliveries`

## 🔄 Pull Request Process

1. Create a branch off `develop`.
2. Commit your changes in logical, bite-sized increments using proper commit messages.
3. Push your branch and open a PR against the `develop` branch.
4. Ensure your code compiles locally (e.g., `npm run build` or `npm run lint`) without errors.
5. Request a review from at least one other team member.
6. Once approved, squash and merge your branch into `develop`. Vercel will automatically generate a preview/staging URL for QA.

---

### 📋 Pull Request Template

When opening a PR, please use this template for your description to help reviewers understand your work:

```markdown
## Description
<!-- Briefly describe what this PR does and why it is needed. -->

## Changes Made
<!-- List the key technical changes made in this PR. -->
- Added Component X
- Updated Hook Y
- Removed Dependency Z

## UI Changes (If applicable)
<!-- Please include screenshots or screen recordings of any visual changes before/after. -->

## How to Test
<!-- Provide simple steps on how the reviewer can test your changes locally. -->
1. Checkout the branch locally.
2. Run `npm install` and `npm run dev`.
3. Ensure the backend is running via `docker-compose`.
4. Navigate to `http://localhost:3000/[route]` and perform [action].
5. Verify that [expected outcome] occurs.

## Related Tracking
<!-- Link to any relevant Jira tickets, Trello cards, or GitHub issues (e.g., Fixes #123) -->
```
