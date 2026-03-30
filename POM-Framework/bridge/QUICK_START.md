# Quick Start - Bridge API Integration

Get started with FlaUI integration in 5 minutes.

## 1. Prerequisites

- Bridge API running on `http://localhost:5000`
- FlaUI tests accessible to Bridge API
- Playwright project set up

## 2. Configuration

Add to `.env`:
```bash
BRIDGE_API_URL=http://localhost:5000
```

## 3. Write Your First Test

Create `your-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { BridgeHelpers } from '../bridge';

test('My First FlaUI Bridge Test', async () => {
  // 1. Check Bridge API is ready
  await BridgeHelpers.ensureBridgeAvailable();

  // 2. Execute FlaUI test
  const result = await BridgeHelpers.executeFlaUITest(
    'FullWorkflowTest',              // Your FlaUI test name
    { contractNumber: 'RBC_53083' }, // Test parameters
    300000                            // 5 minute timeout
  );

  // 3. Verify results
  expect(result.status).toBe('Completed');
  console.log('Test completed in', result.duration, 'ms');
});
```

## 4. Run the Test

```bash
npx playwright test your-test.spec.ts
```

## That's it!

See `README.md` for advanced usage and API reference.

## Common FlaUI Test Names

Based on your FlaUI project, common test names might be:

- `FullWorkflowTest`
- `AssetRmsTests.FullWorkflowTest`
- `LoginTest`
- `CreateAssignmentTest`

Use the exact method name from your NUnit tests.

## Example: Data Sharing

```typescript
test('Share data with FlaUI', async () => {
  // Share data before test
  await BridgeHelpers.shareWithFlaUI('my-data', {
    user: 'testuser',
    config: { mode: 'full' }
  });

  // Run FlaUI test
  await BridgeHelpers.executeFlaUITest('MyTest');

  // Get results after test
  const output = await BridgeHelpers.retrieveData('test-output');
  console.log('FlaUI returned:', output.data);
});
```

## Troubleshooting

**Error: Bridge API is not available**
- Start Bridge API: `dotnet run` in BridgeAPI project
- Verify URL in `.env` matches running API

**Error: Test execution timed out**
- Increase timeout parameter (4th argument)
- Check if FlaUI test is actually running
- Review Bridge API logs

**Error: Test not found**
- Verify test name spelling (case-sensitive)
- Check NUnit Console Runner can find the test
- Ensure test has `[Test]` attribute in FlaUI project

## Next Steps

1. Read `README.md` for full API reference
2. Check example tests in `../tests/bridge/`
3. Review setup guide in root: `BRIDGE_API_SETUP.md`
