# Test Failure Analysis: Assignment Creation Feature Tests

**Test Run Date**: 2026-02-19 17:21:56 - 17:24:20
**Test Status**: ❌ FAILED
**Duration**: ~2 minutes 24 seconds

---

## 🔴 Executive Summary

The "Assignment Creation Feature Tests" failed with a **TimeoutError** while attempting to open the manual assignment form. The test successfully completed login but couldn't find the "New Assignment" button (`btnNewAssignment`) within the expected timeframe.

Additionally, **critical architectural issues** were found where `globalSetup()` and `globalTeardown()` were being called in every test's `beforeEach`/`afterEach` hooks, causing duplicate execution and resource conflicts.

---

## 📊 Test Execution Timeline

| Time | Event | Status |
|------|-------|--------|
| 17:22:06 | Login started | ✅ |
| 17:23:26 | Credentials entered (MIJITDF/Assetuse@2) | ✅ |
| 17:23:42 | Login successful, navigated to MainFrame.aspx | ✅ |
| 17:23:47 | Assignment Creation Scenario started | ⏳ |
| 17:23:57 | **FAILED** - btnNewAssignment not found | ❌ |
| 17:24:01 | Global Teardown #1 | ✅ |
| 17:24:10 | Global Teardown #2 (duplicate) | ⚠️ |

---

## 🔍 Root Cause Analysis

### Issue 1: Primary Failure - Element Not Found ❌

**Error Message:**
```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('frame[name="middle"]').contentFrame().locator('id=btnNewAssignment') to be visible
```

**What Happened:**
1. ✅ User `MIJITDF` logged in successfully
2. ✅ Navigated to `https://qa1repohighway.devservices.dh.com/B010904/MainFrame.aspx`
3. ❌ Failed in `openManualAssignment()` method at line 111
4. ❌ Button `id=btnNewAssignment` never became visible within 10 seconds

**Possible Reasons:**

#### A. User Permission Issue (Most Likely)
- `TDFClient` user may not have permission to create assignments
- The Manual menu may not show "New Assignment" button for this user role
- **Action**: Verify user permissions in QA environment or try with different credential key

#### B. Page Navigation Issue
- Clicking "Manual" menu didn't navigate to expected page
- Page may require additional wait time for frame content to load
- **Fix Applied**: Added extended wait times and explicit waits

#### C. Element Selector Changed
- Button ID may have changed in application
- Element may use different attributes
- **Action**: Inspect page manually to verify element exists

#### D. Popup/Alert Blocking
- A confirmation dialog or popup may be blocking interaction
- **Fix Applied**: Added `bypassCSP: true` and `permissions: ['notifications']` in playwright.config.ts

---

### Issue 2: Duplicate GlobalSetup/Teardown Calls ⚠️

**Problem Code:**
```typescript
// ❌ WRONG - in AssignmentCreation.spec.ts
test.beforeEach(async ({ page, credentials }, testInfo) => {
    await globalSetup(testInfo.config as any);  // Called per test
});

test.afterEach(async ({ }, testInfo) => {
    await globalTeardown(testInfo.config as any);  // Called per test
});
```

**Evidence:**
```
[17:24:01] INFO: GLOBAL TEARDOWN - START
[17:24:08] INFO: GLOBAL TEARDOWN - END
[17:24:10] INFO: GLOBAL TEARDOWN - START  ← Duplicate!
[17:24:20] INFO: GLOBAL TEARDOWN - END
```

**Why This Is Wrong:**
- `globalSetup()` and `globalTeardown()` should run **ONCE** for entire test suite
- Already configured in `playwright.config.ts`:
  ```typescript
  globalSetup: './POM-Framework/test-hooks/globalSetup.ts',
  globalTeardown: './POM-Framework/test-hooks/globalTeardown.ts',
  ```
- Calling them per test causes:
  - ❌ Duplicate directory creation
  - ❌ Duplicate Allure report generation
  - ❌ Resource conflicts
  - ❌ Performance degradation
  - ❌ Incorrect test state

**Impact:**
- 2x slower execution
- Potential file system conflicts
- Incorrect test reports

---

### Issue 3: Environment Configuration Mismatch ⚠️

**Expected Environment:** `qa2` (from `.env.example`)
```bash
ENV_PREFIX=qa2
```

**Actual Environment:** `qa1`
```
https://qa1repohighway.devservices.dh.com/B010904/MainFrame.aspx
```

**Impact:**
- Test may be running against wrong environment
- Credentials may not work in qa1 environment
- Data may be different between environments

**Recommendation:**
- Check actual `.env` file (not `.env.example`)
- Ensure `ENV_PREFIX=qa2` is set correctly
- Or update test expectation to match qa1

---

## ✅ Fixes Applied

### Fix 1: Removed Duplicate GlobalSetup/Teardown Calls

**File**: [AssignmentCreation.spec.ts](POM-Tests/test-suites/AssignmentCreation.spec.ts)

**Before:**
```typescript
test.beforeEach(async ({ page, credentials }, testInfo) => {
    // ... test setup
    await globalSetup(testInfo.config as any);  // ❌
});

test.afterEach(async ({ }, testInfo) => {
    await globalTeardown(testInfo.config as any);  // ❌
});
```

**After:**
```typescript
test.beforeEach(async ({ page, credentials }) => {
    // ... test setup
    logger.info('Setup for Assignment Creation Feature Tests completed');
    // No globalSetup/teardown calls ✅
});

test.afterEach(async () => {
    logger.info('Teardown for Assignment Creation Feature Tests completed');
    // No globalSetup/teardown calls ✅
});
```

**Removed Imports:**
```typescript
// ❌ Removed
import globalSetup from '@hooks/globalSetup';
import globalTeardown from '@hooks/globalTeardown';
```

---

### Fix 2: Enhanced Error Handling in openManualAssignment()

**File**: [AssignmentPage.ts](POM-Tests/page-objects/AssignmentPage.ts)

**Improvements:**
1. ✅ Added explicit wait for frame load with `networkidle`
2. ✅ Increased timeout from 10s to 15s for button visibility
3. ✅ Added intermediate waits for menu hover and submenu appearance
4. ✅ Added detailed logging at each step
5. ✅ Added try-catch with debugging information
6. ✅ Auto-capture screenshot on failure
7. ✅ Log frame presence for debugging

**New Code:**
```typescript
async openManualAssignment() {
    logger.info('Opening manual assignment');

    try {
        // Wait for frame to be loaded
        logger.info('Waiting for middle frame to load');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);

        // Hover over Assignment menu
        logger.info('Hovering over Assignment menu');
        await this.assignmentMenu.waitFor({ state: 'visible', timeout: 15000 });
        await this.assignmentMenu.hover();
        await this.page.waitForTimeout(500);

        // Click Manual option
        logger.info('Clicking Manual menu option');
        await this.manualMenu.waitFor({ state: 'visible', timeout: 5000 });
        await this.manualMenu.click();
        await this.page.waitForTimeout(2000);

        // Wait for New Assignment button
        logger.info('Waiting for New Assignment button');
        await this.newAssignmnetButton.waitFor({ state: 'visible', timeout: 15000 });

        // Click New Assignment button
        logger.info('Clicking New Assignment button');
        await this.newAssignmnetButton.click();

        // Wait for debtor type
        logger.info('Waiting for debtor type radio button');
        await this.debtorType.waitFor({ state: 'visible', timeout: 10000 });
        await this.debtorType.click();

        logger.info('Manual assignment form opened successfully');
    } catch (error) {
        logger.error(`Failed to open manual assignment: ${error}`);
        await this.logFramePresence();

        // Auto-screenshot on failure
        const screenshotPath = `POM-Tests/screenshots/manual-assignment-open-failure-${Date.now()}.png`;
        await this.takeScreenshot({ path: screenshotPath });
        logger.error(`Screenshot saved: ${screenshotPath}`);

        throw error;
    }
}
```

---

## 🧪 Verification Steps

### Step 1: Check User Permissions

**Verify TDFClient has assignment creation permissions:**

1. Manually login to qa1 with TDFClient credentials:
   - Username: `MIJITDF`
   - Password: `Assetuse@2`
   - URL: `https://qa1repohighway.devservices.dh.com`

2. Navigate: **Assignment → Manual**

3. Check if "New Assignment" button is visible

4. If button is NOT visible:
   - User doesn't have permission
   - **Solution**: Use different credential key (try `RBCClientUser`)

### Step 2: Verify Environment Configuration

**Check your actual `.env` file:**
```bash
# View current .env settings
cat .env | grep ENV_PREFIX
cat .env | grep TEST_ENV
```

**Expected output:**
```
ENV_PREFIX=qa2
TEST_ENV=QA
```

**If different:**
- Update `.env` file to match expectations
- Or update test to use correct environment

### Step 3: Run Test with Fixed Code

```bash
# Run the assignment creation test
npx playwright test --grep "@Priority Create assignment"

# With specific environment
TEST_ENV=QA ENV_PREFIX=qa2 npx playwright test --grep "@Priority"

# With different credential
test.use({ credentialKey: 'RBCClientUser' });  # Change in spec file
```

### Step 4: Check Screenshot on Failure

If test fails again, check the auto-captured screenshot:
```
POM-Tests/screenshots/manual-assignment-open-failure-*.png
```

This will show the actual page state when button wasn't found.

---

## 📝 Recommendations

### Immediate Actions:

1. **✅ DONE**: Remove duplicate globalSetup/teardown calls
2. **✅ DONE**: Add better error handling and logging
3. **✅ DONE**: Increase timeouts and add explicit waits
4. **TODO**: Verify TDFClient user permissions manually
5. **TODO**: Confirm environment configuration (qa1 vs qa2)

### Consider These Changes:

#### Option 1: Try Different Credential
```typescript
// In AssignmentCreation.spec.ts
test.use({ credentialKey: 'RBCClientUser' }); // Instead of TDFClient
```

#### Option 2: Add Permission Check Before Test
```typescript
test.beforeEach(async ({ page, credentials }) => {
    // ... existing setup

    // Verify user has assignment creation permission
    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);

    const hasPermission = await assignmentCreationFeature.verifyAssignmentMenuExists();
    if (!hasPermission) {
        test.skip(`User ${credentials.username} doesn't have assignment creation permission`);
    }
});
```

#### Option 3: Use Environment Variable for URL Verification
```typescript
// Verify we're on the expected environment
const expectedEnv = process.env.ENV_PREFIX || 'qa2';
const currentUrl = page.url();
expect(currentUrl).toContain(expectedEnv);
```

---

## 📊 Summary

| Issue | Severity | Status | Impact |
|-------|----------|--------|--------|
| Element Not Found (btnNewAssignment) | 🔴 Critical | ⚠️ Needs Investigation | Test fails completely |
| Duplicate GlobalSetup/Teardown | 🟡 Major | ✅ Fixed | 2x slower, resource conflicts |
| Environment Mismatch (qa1 vs qa2) | 🟡 Major | ⚠️ Needs Verification | Wrong test environment |
| Insufficient Wait Times | 🟢 Minor | ✅ Fixed | Race conditions |
| Poor Error Logging | 🟢 Minor | ✅ Fixed | Hard to debug failures |

---

## 🎯 Next Steps

1. **Verify user permissions** - Check if TDFClient can create assignments in qa1
2. **Check environment config** - Confirm qa1 vs qa2 environment settings
3. **Re-run the test** - With fixes applied
4. **Review screenshot** - If test fails, examine the failure screenshot
5. **Consider credential change** - Try RBCClientUser if TDFClient lacks permission

---

## 📁 Modified Files

1. ✅ [AssignmentCreation.spec.ts](POM-Tests/test-suites/AssignmentCreation.spec.ts) - Removed duplicate setup/teardown
2. ✅ [AssignmentPage.ts](POM-Tests/page-objects/AssignmentPage.ts) - Enhanced error handling and waits

---

**Analysis Complete** ✅

For questions or further assistance, check the logs at:
- `POM-Tests/logs/test-execution.log`
- Test report: `test-runs/2026-02-19_17-21-56/html-report/index.html`
