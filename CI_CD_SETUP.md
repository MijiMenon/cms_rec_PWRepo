# CI/CD Pipeline Configuration Guide

This guide explains how to configure the GitHub Actions CI/CD pipeline for the Playwright automation framework.

## Table of Contents
- [Pipeline Overview](#pipeline-overview)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [GitHub Pages Setup](#github-pages-setup)
- [Workflow Triggers](#workflow-triggers)
- [Test Execution Jobs](#test-execution-jobs)
- [Artifact Management](#artifact-management)
- [Optional Integrations](#optional-integrations)
- [Troubleshooting](#troubleshooting)

---

## Pipeline Overview

The CI/CD pipeline consists of 4 main jobs:

1. **test** - Runs full test suite across multiple browsers (Chromium, Firefox, WebKit) with sharding
2. **smoke-test** - Runs critical smoke tests on Chromium only
3. **report** - Generates and deploys Allure reports
4. **notify** - Sends test execution summaries

### Workflow File Location
`.github/workflows/test.yml`

---

## GitHub Secrets Configuration

### Required Secrets

Navigate to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

#### 1. ENV_PREFIX
- **Description**: Environment prefix for dynamic URL building
- **Example Value**: `qa2` (for qa2repohighway.devservices.dh.com)
- **Usage**: Builds URLs like `https://{ENV_PREFIX}repohighway.devservices.dh.com`

```bash
# Set in GitHub Secrets
Name: ENV_PREFIX
Secret: qa2
```

#### 2. AUTH_CREDENTIAL_KEY
- **Description**: Credential key to use from test.config.ts
- **Example Value**: `RBCClient` or `TDFClient`
- **Default**: `RBCClient` (if not set)
- **Available Options**:
  - `RBCClient`
  - `TDFClient`
  - `testUser2`
  - `readOnlyUser`

```bash
# Set in GitHub Secrets
Name: AUTH_CREDENTIAL_KEY
Secret: RBCClient
```

### Optional Secrets

#### 3. SLACK_WEBHOOK_URL (Optional)
- **Description**: Slack webhook for test failure notifications
- **Required**: Only if enabling Slack notifications
- **Setup**: Uncomment lines 201-219 in test.yml

```bash
# Set in GitHub Secrets
Name: SLACK_WEBHOOK_URL
Secret: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## GitHub Pages Setup

To enable Allure report hosting on GitHub Pages:

### Step 1: Enable GitHub Pages
1. Go to **Settings → Pages**
2. Under "Source", select **Deploy from a branch**
3. Select branch: **gh-pages**
4. Select folder: **/ (root)**
5. Click **Save**

### Step 2: Configure Workflow Permissions
1. Go to **Settings → Actions → General**
2. Scroll to "Workflow permissions"
3. Select: **Read and write permissions**
4. Check: **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

### Step 3: Access Reports
After pipeline runs, reports will be available at:
```
https://{your-username}.github.io/{repo-name}/reports/{run-number}/
```

Example:
```
https://MijiMenon.github.io/cms_rec_PWRepo/reports/1/
```

---

## Workflow Triggers

### 1. Push to Main/Develop
```yaml
on:
  push:
    branches: [main, develop]
```
Automatically runs on every push to main or develop branch.

### 2. Pull Request
```yaml
on:
  pull_request:
    branches: [main, develop]
```
Runs when PR is created/updated targeting main or develop.

### 3. Scheduled Execution
```yaml
on:
  schedule:
    - cron: '0 2 * * *'
```
Runs daily at 2 AM UTC.

### 4. Manual Trigger (workflow_dispatch)
1. Go to **Actions → Playwright Tests → Run workflow**
2. Select:
   - **Branch**: main/develop
   - **Environment**: dev/QA/prod
   - **Browser**: all/chromium/firefox/webkit
3. Click **Run workflow**

---

## Test Execution Jobs

### Job 1: Full Test Suite (test)
- **Browsers**: Chromium, Firefox, WebKit
- **Sharding**: 4 parallel shards per browser (12 jobs total)
- **Timeout**: 60 minutes
- **Artifacts**: Test results, screenshots, Allure results

**Matrix Strategy:**
```yaml
matrix:
  browser: [chromium, firefox, webkit]
  shard: [1, 2, 3, 4]
```

This creates 12 parallel jobs:
- chromium-1, chromium-2, chromium-3, chromium-4
- firefox-1, firefox-2, firefox-3, firefox-4
- webkit-1, webkit-2, webkit-3, webkit-4

### Job 2: Smoke Tests (smoke-test)
- **Browser**: Chromium only
- **Tests**: Tagged with `@Smoke`
- **Purpose**: Quick validation of critical features
- **Runs**: In parallel with full test suite

### Job 3: Allure Report (report)
- **Runs After**: test job completes
- **Actions**:
  - Downloads all Allure results from shards
  - Merges results from all browsers
  - Generates consolidated HTML report
  - Deploys to GitHub Pages (main branch only)

### Job 4: Notifications (notify)
- **Runs After**: test and smoke-test complete
- **Actions**:
  - Creates test summary in GitHub Actions UI
  - Optionally sends Slack notifications (if configured)

---

## Artifact Management

### Artifacts Generated

| Artifact Name | Content | Retention |
|---------------|---------|-----------|
| `test-results-{browser}-{shard}` | HTML, JSON, JUnit reports | 30 days |
| `screenshots-{browser}-{shard}` | Failure screenshots | 30 days |
| `allure-results-{browser}-{shard}` | Raw Allure data | 30 days |
| `allure-report` | Generated HTML report | 30 days |
| `smoke-test-results` | Smoke test outputs | 7 days |

### Accessing Artifacts
1. Go to **Actions → Select workflow run**
2. Scroll to "Artifacts" section
3. Click artifact name to download

---

## Running the Pipeline

### Method 1: Automatic (Push/PR)
```bash
# Make changes and push
git add .
git commit -m "Your changes"
git push origin main
```

Pipeline will start automatically.

### Method 2: Manual Trigger
1. Go to GitHub repository
2. Click **Actions** tab
3. Select **Playwright Tests** workflow
4. Click **Run workflow** button (right side)
5. Configure options:
   - Environment: QA
   - Browser: all
6. Click **Run workflow**

### Method 3: API Trigger
```bash
# Using GitHub CLI
gh workflow run test.yml \
  --ref main \
  -f environment=QA \
  -f browser=chromium

# Using curl
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/MijiMenon/cms_rec_PWRepo/actions/workflows/test.yml/dispatches \
  -d '{"ref":"main","inputs":{"environment":"QA","browser":"all"}}'
```

---

## Optional Integrations

### Slack Notifications

#### Step 1: Create Slack Incoming Webhook
1. Go to Slack workspace → Apps → Incoming Webhooks
2. Add to Slack → Choose channel
3. Copy Webhook URL

#### Step 2: Add Secret to GitHub
```bash
Name: SLACK_WEBHOOK_URL
Secret: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

#### Step 3: Uncomment in test.yml
Uncomment lines 201-219 in `.github/workflows/test.yml`

### Email Notifications

GitHub automatically sends email notifications for failed workflows to:
- Workflow trigger author
- Repository watchers (if configured)

Configure in: **Settings → Notifications → GitHub Actions**

---

## Troubleshooting

### Issue 1: Tests Fail with "Credentials not found"
**Cause**: AUTH_CREDENTIAL_KEY secret not set or invalid

**Solution**:
```bash
# Check available credentials in POM-Tests/test.config.ts
# Set GitHub secret AUTH_CREDENTIAL_KEY to one of:
# RBCClient, TDFClient, testUser2, readOnlyUser
```

### Issue 2: Base URL is undefined
**Cause**: ENV_PREFIX secret not set

**Solution**:
```bash
# Set GitHub secret ENV_PREFIX to your environment prefix
# Example: qa2, dev, prod
```

### Issue 3: Allure Report Not Deploying
**Cause**: GitHub Pages not enabled or workflow permissions insufficient

**Solution**:
1. Enable GitHub Pages (Settings → Pages)
2. Grant workflow write permissions (Settings → Actions → General)
3. Check workflow logs for errors

### Issue 4: Shards Timeout
**Cause**: Too many tests in one shard

**Solution**:
```yaml
# Increase number of shards in test.yml
matrix:
  shard: [1, 2, 3, 4, 5, 6]  # Increase from 4 to 6

# Update shard command
run: npx playwright test --project=${{ matrix.browser }} --shard=${{ matrix.shard }}/6
```

### Issue 5: Browser Installation Fails
**Cause**: Browser dependencies missing in runner

**Solution**:
```bash
# Already handled by --with-deps flag
npx playwright install --with-deps ${{ matrix.browser }}

# If issues persist, add system dependencies:
- name: Install system dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y \
      libnss3 \
      libatk-bridge2.0-0 \
      libdrm2 \
      libxkbcommon0 \
      libgbm1
```

### Viewing Logs
1. Go to **Actions** tab
2. Click on workflow run
3. Click on specific job (e.g., "test (chromium, 1)")
4. Expand steps to view detailed logs

---

## Pipeline Status Badge

Add to README.md:
```markdown
[![Playwright Tests](https://github.com/MijiMenon/cms_rec_PWRepo/actions/workflows/test.yml/badge.svg)](https://github.com/MijiMenon/cms_rec_PWRepo/actions/workflows/test.yml)
```

Result:
[![Playwright Tests](https://github.com/MijiMenon/cms_rec_PWRepo/actions/workflows/test.yml/badge.svg)](https://github.com/MijiMenon/cms_rec_PWRepo/actions/workflows/test.yml)

---

## Best Practices

### 1. Run Smoke Tests on Every PR
Smoke tests provide quick feedback without running the full suite.

### 2. Use Sharding for Large Test Suites
Current setup: 4 shards per browser = faster execution

### 3. Review Artifacts After Failures
- Check screenshots for visual issues
- Review HTML reports for detailed logs
- Examine Allure report for trends

### 4. Monitor Execution Time
- Review job duration in Actions tab
- Adjust shard count if jobs timeout
- Optimize slow tests

### 5. Clean Up Old Artifacts
GitHub automatically deletes artifacts after retention period (7-30 days).

---

## Summary

Your CI/CD pipeline is now configured with:
- ✅ Multi-browser testing (Chromium, Firefox, WebKit)
- ✅ Parallel execution with sharding (4 shards per browser)
- ✅ Smoke tests for quick validation
- ✅ Allure report generation and hosting
- ✅ Artifact management (reports, screenshots)
- ✅ Multiple trigger methods (push, PR, schedule, manual)
- ✅ Test execution summaries
- ✅ Optional Slack notifications

**Next Steps:**
1. Set GitHub secrets (ENV_PREFIX, AUTH_CREDENTIAL_KEY)
2. Enable GitHub Pages
3. Configure workflow permissions
4. Trigger first test run
5. Access Allure report on GitHub Pages

**Support:**
- View workflow logs in Actions tab
- Check this guide for troubleshooting
- Review test execution summaries after each run
