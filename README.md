# Project Name

> Short description of what this project does.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Git Flow](#git-flow)
- [Pull Request Process](#pull-request-process)
- [Branch Protection Rules](#branch-protection-rules)

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/your-repo.git
cd your-repo

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Branching Strategy

This project follows **Git Flow**. The two long-lived branches are:

| Branch    | Purpose                             | Direct push |
| --------- | ----------------------------------- | ----------- |
| `main`    | Production-ready code               | Never       |
| `develop` | Integration branch for ongoing work | Allowed     |

All other branches are short-lived and must be created from — and merged back into — the correct base branch.

---

## Git Flow

### Branch Types

| Branch  | Naming convention                 | Branches from | Merges into        |
| ------- | --------------------------------- | ------------- | ------------------ |
| Feature | `feature/<ticket-or-description>` | `develop`     | `develop`          |
| Bug fix | `bugfix/<ticket-or-description>`  | `develop`     | `develop`          |
| Release | `release/<version>`               | `develop`     | `main` + `develop` |
| Hotfix  | `hotfix/<ticket-or-description>`  | `main`        | `main` + `develop` |

### Starting a New Feature

```bash
# Always start from an up-to-date develop
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/my-feature

# Work, commit, push
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

Then open a Pull Request from `feature/my-feature` → `develop`.

### Creating a Release

```bash
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Bump version, update changelog, final fixes...
git commit -m "chore: prepare release 1.2.0"
git push origin release/1.2.0
```

Open a PR from `release/1.2.0` → `main`, then a second PR from `release/1.2.0` → `develop` to back-merge any release fixes.

### Hotfixing Production

```bash
# Branch directly off main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

git commit -m "fix: patch critical bug"
git push origin hotfix/critical-bug
```

Open a PR into `main` **and** a separate PR into `develop` so the fix is not lost.

---

## Pull Request Process

1. Push your branch and open a PR against the correct target branch (usually `develop`).
2. Fill in the [PR template](.github/pull_request_template.md) — description, type of change, testing steps, and checklist.
3. Request at least one reviewer.
4. Address all review comments before merging.
5. Squash or merge once approved — do not merge your own PR without a review.

> PRs that do not follow the template or are missing a reviewer will not be merged.

---

## Branch Protection Rules

### `main`

- Requires a Pull Request — **direct pushes are disabled**
- PR must come from `develop`
- Requires at least **1 approving review**

### `develop`

- Requires a Pull Request from a `feature/*`, `bugfix/*`, `release/*`, or `hotfix/*` branch
- Requires at least **1 approving review**
- Status checks must pass before merging

> Any attempt to push directly to `main` will be rejected by the remote.

---

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

| Type       | When to use                                     |
| ---------- | ----------------------------------------------- |
| `feat`     | A new feature                                   |
| `fix`      | A bug fix                                       |
| `chore`    | Build process, tooling, or dependency updates   |
| `docs`     | Documentation only                              |
| `refactor` | Code change that is neither a fix nor a feature |
| `test`     | Adding or updating tests                        |
| `ci`       | CI/CD configuration changes                     |

**Examples:**

```bash
git commit -m "feat(auth): add OAuth2 login"
git commit -m "fix(api): handle null response from payment service"
git commit -m "docs: update README with Git Flow instructions"
```

---

## Questions?

Open an issue or reach out to the maintainers.
