# Advanced Features Guide

## Table of Contents
1. [Credentials Management](#credentials-management)
2. [Database Integration](#database-integration)
3. [Bridge API Integration](#bridge-api-integration)

---

## Credentials Management

### Overview

The framework provides **three ways** to use credentials in tests:

1. **Fixture-based (Recommended)** - Use `credentials` fixture with configurable `credentialKey`
2. **GlobalSetup** - Pre-fetched credentials from globalSetup (via environment variables)
3. **Direct ConfigReader** - Fetch credentials on-demand in tests

### Method 1: Fixture-Based Credentials (Recommended)

```typescript
import { test, expect } from '../../POM-Framework/test-fixtures';

test('Test with default credentials', async ({ page, credentials, loginFeature }) => {
  await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
});
```

**Using Different Credentials Per Test:**

```typescript
test.describe('Multi-User Tests', () => {
  test('Login as Admin', async ({ page, credentials, loginFeature }) => {
    test.use({ credentialKey: 'admin' });
    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
  });

  test('Login as Read-Only User', async ({ page, credentials, loginFeature }) => {
    test.use({ credentialKey: 'readOnlyUser' });
    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
  });
});
```

### Method 2: Direct ConfigReader Call

```typescript
import { ConfigReader } from '../../POM-Framework/utilities/ConfigReader';

test('Multi-user workflow', async ({ page, loginFeature }) => {
  const adminCreds = ConfigReader.getCredentials('admin');
  await loginFeature.performSuccessfulLogin(adminCreds.username, adminCreds.password);

  await loginFeature.logout();

  const readOnlyCreds = ConfigReader.getCredentials('readOnlyUser');
  await loginFeature.performSuccessfulLogin(readOnlyCreds.username, readOnlyCreds.password);
});
```

### Available Credential Keys

From `POM-Tests/test.config.ts`:

**QA Environment:**
- `RBCClientUser` → MIJIRBC / Assetuse@1
- `testUser1`, `testUser2`, `readOnlyUser`

**Dev/Prod Environments:**
- `admin`, `testUser1`, `testUser2`, `readOnlyUser`

### Environment Configuration

```bash
# .env file
AUTH_CREDENTIAL_KEY=admin  # Change default
TEST_ENV=dev               # Change environment
```

---

## Database Integration

### Overview

Full SQL Server database integration for querying and validating data directly from tests.

### Setup (3 Steps)

**Step 1: Configure Database Connection**

Edit `.env` file:

```env
DB_SERVER=mssrecdbvwqa01.dhltd.corp
DB_PORT=1433
DB_DATABASE=YourDatabaseName  ← UPDATE THIS
DB_USER=Connector
DB_PASSWORD=Re7Kp2M!
```

**Step 2: Verify Setup**

```bash
npx playwright test POM-Tests/test-suites/database-examples/AssignmentWithDBValidation.spec.ts
```

**Step 3: Start Using in Tests**

```typescript
import { AssignmentQueries, UserQueries } from '../POM-Framework/database/queries';

test('My test with database', async () => {
  const assignment = await AssignmentQueries.getAssignmentByContractNumber('BNS_143147');
  const user = await UserQueries.getUserByUsername('john.doe');
});
```

### Common Use Cases

**Use Case 1: Verify UI-Created Data**

```typescript
test('Create assignment and verify in DB', async ({ page }) => {
  // Create via UI
  await page.fill('#contractNumber', 'TEST_12345');
  await page.click('#submit');

  // Verify in database
  const assignment = await AssignmentQueries.getAssignmentByContractNumber('TEST_12345');
  expect(assignment).not.toBeNull();
  expect(assignment.Status).toBe('Active');
});
```

**Use Case 2: Get Test Data from Database**

```typescript
test('Use real data from database', async ({ page }) => {
  const assignment = await AssignmentQueries.getLatestAssignment();
  await page.goto(`/assignments/${assignment.AssignmentID}`);
});
```

**Use Case 3: Clean Up Test Data**

```typescript
test.afterAll(async () => {
  await AssignmentQueries.deleteTestAssignments('TEST');
});
```

### Available Query Methods

**Assignments:**
```typescript
await AssignmentQueries.getAssignmentByContractNumber('BNS_143147');
await AssignmentQueries.getAssignmentsByStatus('Active');
await AssignmentQueries.getLatestAssignment();
await AssignmentQueries.updateAssignmentStatus(12345, 'Completed');
```

**Users:**
```typescript
await UserQueries.getUserByUsername('john.doe');
await UserQueries.isUserActive('john.doe');
await UserQueries.getUserRole('john.doe');
await UserQueries.getUsersByRole('Admin');
```

### Important Notes

1. **Database is optional** - Tests skip gracefully if DB is not configured
2. **Connection is automatic** - No need to initialize in each test
3. **Cleanup happens automatically** - Connection closed in globalTeardown
4. **Credentials are secure** - `.env` file is gitignored

---

## Bridge API Integration

### Overview

The framework includes Bridge API integration for Windows desktop application automation using FlaUI.

### Key Components

- **BridgeAPI**: .NET Web API service
- **FlaUI Framework**: Windows UI automation framework
- **Bridge Helpers**: TypeScript/JavaScript helpers for communication

### Structure

```
BridgeAPI/                  # .NET Web API service
FlaUI/                      # Windows automation framework
POM-Framework/bridge/       # TypeScript/JS bridge helpers
POM-Tests/test-suites/bridge/   # Bridge integration tests
```

### Usage

Tests that require Windows desktop automation can use the bridge integration to communicate between Playwright tests and FlaUI automation.

See `POM-Tests/test-suites/bridge/` for example tests.

---

## Summary

| Feature | Configuration File | Documentation |
|---------|-------------------|---------------|
| **Credentials** | `POM-Tests/test.config.ts`, `.env` | This file |
| **Database** | `.env` (DB_* variables) | `POM-Framework/database/README.md` |
| **Bridge API** | `BridgeAPI/` configuration | `BridgeAPI/README.md` |

For more details on any feature, check the respective README files in their directories.
