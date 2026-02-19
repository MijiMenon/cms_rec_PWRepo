# Credentials Usage Guide

## Overview

The framework provides **three ways** to use credentials in tests:

1. **Fixture-based (Recommended)** - Use `credentials` fixture with configurable `credentialKey`
2. **GlobalSetup** - Pre-fetched credentials from globalSetup (via environment variables)
3. **Direct ConfigReader** - Fetch credentials on-demand in tests

---

## Method 1: Fixture-Based Credentials (Recommended)

This is the **most flexible** approach - each test can specify which credential to use.

### Basic Usage

```typescript
import { test, expect } from '../../POM-Framework/test-fixtures';

test('Test with default credentials', async ({ page, credentials, loginFeature }) => {
  // Uses default credential: RBCClientUser
  console.log('Username:', credentials.username); // MIJIRBC
  console.log('Password:', credentials.password); // Assetuse@1

  await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
});
```

### Using Different Credentials Per Test

```typescript
import { test, expect } from '../../POM-Framework/test-fixtures';

test.describe('Multi-User Tests', () => {

  // Test 1: Use RBC Client User (default)
  test('Login as RBC Client User', async ({ page, credentials, loginFeature }) => {
    // credentialKey defaults to 'RBCClientUser'
    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
  });

  // Test 2: Use Admin credentials
  test('Login as Admin', async ({ page, credentials, loginFeature }) => {
    // Override credentialKey for this test
    test.use({ credentialKey: 'admin' });

    // credentials fixture will automatically fetch admin credentials
    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
  });

  // Test 3: Use Test User 1
  test('Login as Test User 1', async ({ page, credentials, loginFeature }) => {
    test.use({ credentialKey: 'testUser1' });

    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
  });

  // Test 4: Use Read-Only User
  test('Login as Read-Only User', async ({ page, credentials, loginFeature }) => {
    test.use({ credentialKey: 'readOnlyUser' });

    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
  });
});
```

### Using Different Credentials in beforeEach

```typescript
import { test, expect } from '../../POM-Framework/test-fixtures';

test.describe('Assignment Tests', () => {

  // Override credential for ALL tests in this describe block
  test.use({ credentialKey: 'admin' });

  test.beforeEach(async ({ page, credentials, loginFeature }) => {
    // All tests in this block will use 'admin' credentials
    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
  });

  test('Test 1 - uses admin', async ({ credentials }) => {
    console.log('Current user:', credentials.username); // admin@example.com
  });

  test('Test 2 - uses admin', async ({ credentials }) => {
    console.log('Current user:', credentials.username); // admin@example.com
  });
});
```

### Example: Updated AssignmentCreation.spec.ts

```typescript
import { test } from '../../POM-Framework/test-fixtures';
import { AssignmentCreationFeature } from '../feature-scenarios/AssignmentCreationFeature';
import { LoginFeature } from '../feature-scenarios/LoginFeature';
import { DataProvider } from '../../POM-Framework/utilities/data-readers/dataProvider';

test.describe('Assignment Creation Tests', () => {
  // Use RBCClientUser for all tests in this suite
  test.use({ credentialKey: 'RBCClientUser' });

  test('@Priority Create assignment', async ({ page, credentials }) => {
    const loginFeature = new LoginFeature(page);
    const assignmentFeature = new AssignmentCreationFeature(page);

    // Load assignment data
    const assignmentData = await DataProvider.getTestDataFromJson(
      'POM-Tests/test-data/json/assignmentData.json'
    );

    // Login with fixture credentials
    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);

    // Create assignment
    await assignmentFeature.performAssignmentCreation(assignmentData);
  });
});
```

---

## Method 2: GlobalSetup Pre-Fetched Credentials

GlobalSetup fetches credentials **once** and stores them in environment variables.

### Usage

```typescript
import { test } from '../../POM-Framework/test-fixtures';

test('Test with globalSetup credentials', async ({ page, loginFeature }) => {
  // Access pre-fetched credentials from environment variables
  const username = process.env.LOGIN_USERNAME!;
  const password = process.env.LOGIN_PASSWORD!;
  const credentialKey = process.env.CREDENTIAL_KEY!;

  console.log('Using:', credentialKey); // RBCClientUser (default)

  await loginFeature.performSuccessfulLogin(username, password);
});
```

### Limitation

**Cannot change per test** - globalSetup runs once before all tests, so all tests get the same credentials unless you use fixtures (Method 1).

### Configuration

Set which credential globalSetup fetches via environment variable:

```bash
# .env file or command line
AUTH_CREDENTIAL_KEY=admin npm test
```

---

## Method 3: Direct ConfigReader Call

Fetch credentials directly in your test when needed.

### Usage

```typescript
import { test } from '../../POM-Framework/test-fixtures';
import { ConfigReader } from '../../POM-Framework/utilities/ConfigReader';

test('Test with direct ConfigReader', async ({ page, loginFeature }) => {
  // Fetch credentials on-demand
  const credentials = ConfigReader.getCredentials('admin');

  await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
});
```

### Multiple Users in One Test

```typescript
test('Multi-user workflow', async ({ page, loginFeature }) => {
  // Login as admin
  const adminCreds = ConfigReader.getCredentials('admin');
  await loginFeature.performSuccessfulLogin(adminCreds.username, adminCreds.password);

  // Do admin tasks...
  await loginFeature.logout();

  // Login as read-only user
  const readOnlyCreds = ConfigReader.getCredentials('readOnlyUser');
  await loginFeature.performSuccessfulLogin(readOnlyCreds.username, readOnlyCreds.password);

  // Do read-only tasks...
});
```

---

## Available Credential Keys

From `test.config.ts`:

### QA Environment
- `RBCClientUser` → MIJIRBC / Assetuse@1
- `testUser1` → staginguser1@example.com / StagingUser123!
- `testUser2` → staginguser2@example.com / StagingUser456!
- `readOnlyUser` → readonly@example.com / ReadOnly123!

### Dev Environment
- `admin` → admin@example.com / Admin123!
- `testUser1` → testuser1@example.com / TestUser123!
- `testUser2` → testuser2@example.com / TestUser456!
- `readOnlyUser` → readonly@example.com / ReadOnly123!

### Prod Environment
- `admin` → prod.admin@example.com / ProdAdmin123!
- `testUser1` → produser1@example.com / ProdUser123!
- `testUser2` → produser2@example.com / ProdUser456!
- `readOnlyUser` → prod.readonly@example.com / ProdReadOnly123!

---

## Comparison: Which Method to Use?

| Method | Use When | Pros | Cons |
|--------|----------|------|------|
| **Fixture** | Different credentials per test | ✅ Flexible<br>✅ Per-test config<br>✅ Clean syntax | None |
| **GlobalSetup** | All tests use same credentials | ✅ Pre-fetched<br>✅ Fast | ❌ Cannot change per test |
| **ConfigReader** | Complex multi-user scenarios | ✅ On-demand<br>✅ Multiple users per test | ❌ Repetitive code |

**Recommendation**: Use **Method 1 (Fixtures)** for most cases - it's the most flexible and cleanest approach.

---

## Environment Configuration

### Change Default Credential Key

```bash
# .env file
AUTH_CREDENTIAL_KEY=admin
```

### Change Environment

```bash
# Use dev environment
TEST_ENV=dev

# Use prod environment
TEST_ENV=prod
```

### Override Specific Credentials

```bash
# Override username/password for a specific credential key
RBCCLIENTUSER_USERNAME=custom_user
RBCCLIENTUSER_PASSWORD=custom_pass
```

---

## Complete Example: Multiple Tests, Different Users

```typescript
import { test, expect } from '../../POM-Framework/test-fixtures';

test.describe('User Permission Tests', () => {

  test('Admin can create assignments', async ({ page, credentials, loginFeature }) => {
    test.use({ credentialKey: 'admin' });

    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
    // Test admin functionality
  });

  test('Regular user can view assignments', async ({ page, credentials, loginFeature }) => {
    test.use({ credentialKey: 'testUser1' });

    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
    // Test regular user functionality
  });

  test('Read-only user cannot create', async ({ page, credentials, loginFeature }) => {
    test.use({ credentialKey: 'readOnlyUser' });

    await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
    // Verify read-only restrictions
  });
});
```

---

## Summary

✅ **Use fixtures** (`credentials` + `credentialKey`) for flexible per-test credential configuration
✅ **Use globalSetup credentials** if all tests use the same credential
✅ **Use ConfigReader directly** for complex multi-user workflows within a single test

The fixture approach gives you the best of both worlds: clean syntax and per-test flexibility! 🎯
