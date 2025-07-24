# 🔒 GitHub Repository Setup Guide

This guide explains how to configure your GitHub repository to enforce pull request checks and maintain code quality.

## 🛡️ Branch Protection Rules

### Setting Up Branch Protection

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click **Settings** tab
   - Click **Branches** in the left sidebar

2. **Add Branch Protection Rule**
   - Click **Add rule**
   - Enter branch name pattern: `main` (or `develop`)

### 📋 Recommended Protection Settings

#### ✅ **Required Status Checks**
Enable: **Require status checks to pass before merging**

**Required Checks to Select:**
- `Quick Validation` (from PR Validation workflow)
- `Security & Quality` (from PR Validation workflow)
- `Backend (NestJS)` (from main CI workflow)
- `Frontend (React)` (from main CI workflow)
- `Docker Build & Test` (from main CI workflow)

**Additional Options:**
- ✅ **Require branches to be up to date before merging**
- ✅ **Require status checks to pass before merging**

#### 🔄 **Pull Request Requirements**
- ✅ **Require a pull request before merging**
- ✅ **Require approvals** (recommended: 1 approval minimum)
- ✅ **Dismiss stale approvals when new commits are pushed**
- ✅ **Require review from code owners** (if you have CODEOWNERS file)

#### 🚫 **Restrictions**
- ✅ **Restrict pushes that create files**
- ✅ **Do not allow bypassing the above settings**
- ❌ **Allow force pushes** (keep disabled for safety)
- ❌ **Allow deletions** (keep disabled for safety)

#### 👑 **Admin Enforcement**
- ✅ **Include administrators** (recommended for consistency)

## 🏷️ Required Labels Setup

Create the following labels in your repository for automatic PR labeling:

### Navigation to Labels
1. Go to **Issues** tab
2. Click **Labels**
3. Click **New label** for each:

### Recommended Labels

| Label | Color | Description |
|-------|-------|-------------|
| `backend` | `#ff6b35` | Changes to NestJS backend |
| `frontend` | `#4fc3f7` | Changes to React frontend |
| `shared-types` | `#9c27b0` | Changes to shared TypeScript types |
| `docker` | `#2196f3` | Changes to Docker configuration |
| `documentation` | `#4caf50` | Changes to documentation |
| `tests` | `#ff9800` | Changes to test files |
| `bug` | `#f44336` | Bug fixes |
| `enhancement` | `#00bcd4` | New features |
| `breaking-change` | `#e91e63` | Breaking changes |

## 🔧 Required Status Checks Configuration

### Automatic Setup
Once you push the workflows to your repository, GitHub will automatically detect them. After the first PR run:

1. Go to **Settings → Branches**
2. Edit your branch protection rule
3. Under **Required Status Checks**, you'll see:
   - `Quick Validation`
   - `Security & Quality`
   - And other workflow jobs

### Manual Configuration Steps

If checks don't appear automatically:

1. **Run workflows first**: Create a test PR to trigger all workflows
2. **Wait for completion**: Let all workflows complete at least once
3. **Configure protection**: The checks will then appear in the settings

## 📝 CODEOWNERS File (Optional)

Create `.github/CODEOWNERS` to automatically request reviews:

```bash
# Global owners (optional)
* @your-username

# Backend specific
backend/ @backend-team-member
backend/**/*.ts @backend-team-member

# Frontend specific  
frontend/ @frontend-team-member
frontend/**/*.ts @frontend-team-member
frontend/**/*.tsx @frontend-team-member

# Shared types (critical)
shared/ @your-username @backend-team-member @frontend-team-member

# Infrastructure
docker-compose.yml @devops-team-member
*/Dockerfile @devops-team-member
.github/ @your-username

# Documentation
docs/ @your-username
README.md @your-username
```

## 🚀 Workflow Triggers & Behavior

### PR Validation Workflow
**File**: `.github/workflows/pr-check.yml`
- **Triggers**: All PR activities (open, sync, reopen, ready for review)
- **Cancellation**: Automatically cancels previous runs on new commits
- **Draft PRs**: Skipped (only runs when ready for review)

### Main CI Pipeline
**File**: `.github/workflows/ci.yml`
- **Triggers**: Push to main/develop, PR to main/develop
- **Full testing**: Comprehensive testing including Docker and integration
- **Matrix builds**: Tests on Node.js 18 & 20

### Status Check
**File**: `.github/workflows/status.yml`
- **Triggers**: Scheduled (every 6 hours), manual
- **Purpose**: Repository health monitoring

## ✅ Verification Steps

After setup, test your configuration:

1. **Create a test branch**
   ```bash
   git checkout -b test-pr-protection
   ```

2. **Make a small change**
   ```bash
   echo "// Test change" >> shared/dto.ts
   git add .
   git commit -m "test: PR protection validation"
   git push origin test-pr-protection
   ```

3. **Create PR**
   - Open PR from test branch to main
   - Verify that status checks appear
   - Verify that merge is blocked until checks pass

4. **Check protection**
   - Try to merge before checks complete (should be blocked)
   - Wait for checks to complete
   - Verify merge becomes available

## 🛠️ Troubleshooting

### Status Checks Not Appearing
- Ensure workflows have run at least once
- Check workflow file syntax with GitHub's workflow validator
- Verify branch names match in workflow triggers

### Checks Always Failing
- Check workflow logs for specific errors
- Verify Node.js versions match your local development
- Ensure all required files exist in repository

### Permission Issues
- Ensure repository has Actions enabled
- Check if organization has restrictions on Actions
- Verify workflow permissions in Settings → Actions

## 📊 Monitoring & Insights

### GitHub Insights
- **Actions tab**: Monitor workflow runs and success rates
- **Insights → Pulse**: Track PR activity and merge patterns
- **Security tab**: Monitor dependabot alerts and security advisories

### Success Metrics
- **PR merge rate**: Should increase after initial setup
- **Failed check frequency**: Should decrease over time
- **Time to merge**: May initially increase but stabilizes

---

## 🎯 Summary Checklist

After completing this setup, your repository will have:

- ✅ **Branch protection** preventing direct pushes to main
- ✅ **Required status checks** ensuring code quality
- ✅ **Automated PR validation** with fast feedback
- ✅ **Security scanning** for basic vulnerability detection
- ✅ **Automatic labeling** for better PR organization
- ✅ **Comprehensive testing** before merge
- ✅ **Code owner reviews** (if CODEOWNERS configured)

Your development workflow is now protected and automated! 🚀 