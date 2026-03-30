# Bridge API Integration

This module provides integration between Playwright tests and FlaUI tests via a Bridge API.

## Overview

The Bridge API allows Playwright tests to invoke FlaUI test cases remotely, enabling:
- Hybrid test execution (Playwright + FlaUI)
- Cross-platform test orchestration
- Data sharing between test frameworks
- Centralized test execution tracking

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Playwright    │         │   Bridge API    │         │     FlaUI       │
│   Test Suite    │◄───────►│   (ASP.NET)     │◄───────►│   Test Suite    │
└─────────────────┘  HTTP   └─────────────────┘  NUnit  └─────────────────┘
```

## Files

- `bridge.types.ts` - TypeScript type definitions for Bridge API
- `bridge.helpers.ts` - Helper functions for Bridge API interaction
- `index.ts` - Module entry point

## Configuration

### Environment Variable

Set the Bridge API URL in your `.env` file:

```bash
BRIDGE_API_URL=http://localhost:5000
```

If not set, defaults to `http://localhost:5000`.

### Bridge API Endpoints

The Bridge API provides the following endpoints:

- `POST /api/execution/submit` - Submit test execution
- `GET /api/execution/{executionId}` - Get execution status
- `GET /api/health` - Health check
- `POST /api/data/share` - Share data between tests
- `GET /api/data/{key}` - Retrieve shared data

## Usage

### Basic Test Invocation

```typescript
import { test, expect } from '@playwright/test';
import { BridgeHelpers } from '../../bridge/bridge.helpers';

test('Invoke FlaUI Test', async () => {
  // Ensure Bridge API is available
  await BridgeHelpers.ensureBridgeAvailable();

  // Execute FlaUI test
  const result = await BridgeHelpers.executeFlaUITest(
    'FullWorkflowTest',           // Test name
    { contractNumber: 'RBC_53083' }, // Parameters
    300000                         // Timeout (5 minutes)
  );

  // Verify results
  expect(result.status).toBe('Completed');
  console.log('Result:', result.result);
});
```

### Advanced Usage

#### Share Data with FlaUI

```typescript
// Share data that FlaUI tests can access
const testData = {
  contractNumber: 'RBC_53083',
  environment: 'qa1',
};

await BridgeHelpers.shareWithFlaUI('test-input', testData, 3600);
```

#### Retrieve Results from FlaUI

```typescript
// After FlaUI test completes, retrieve shared results
const results = await BridgeHelpers.retrieveData('test-output');

if (results.exists) {
  console.log('FlaUI Results:', results.data);
}
```

#### Custom Timeout and Poll Interval

```typescript
const result = await BridgeHelpers.executeFlaUITest(
  'LongRunningTest',
  { mode: 'full' },
  600000,  // 10 minute timeout
  5000     // Poll every 5 seconds
);
```

## API Reference

### BridgeHelpers Class

#### `ensureBridgeAvailable(): Promise<void>`
Checks if Bridge API is available and healthy.

**Throws:** Error if Bridge API is unavailable

#### `executeFlaUITest(testName, parameters?, timeout?, pollInterval?): Promise<ExecuteFlaUITestResult>`
Executes a FlaUI test and waits for completion.

**Parameters:**
- `testName` (string) - Name of the FlaUI test to execute
- `parameters` (object, optional) - Test parameters
- `timeout` (number, optional) - Max wait time in ms (default: 300000)
- `pollInterval` (number, optional) - Poll interval in ms (default: 2000)

**Returns:** ExecuteFlaUITestResult with status, result, and duration

**Throws:** Error if test fails or times out

#### `submitTestExecution(testName, testType, parameters?): Promise<TestExecutionResponse>`
Submits a test execution request without waiting.

**Parameters:**
- `testName` (string) - Name of the test
- `testType` ('FlaUI' | 'Playwright') - Test framework type
- `parameters` (object, optional) - Test parameters

**Returns:** TestExecutionResponse with executionId

#### `getExecutionStatus(executionId): Promise<TestExecutionStatus>`
Gets the current status of a test execution.

**Parameters:**
- `executionId` (string) - Execution ID from submitTestExecution

**Returns:** TestExecutionStatus

#### `waitForExecution(executionId, timeout?, pollInterval?): Promise<TestExecutionStatus>`
Polls execution status until completion.

**Parameters:**
- `executionId` (string) - Execution ID to monitor
- `timeout` (number, optional) - Max wait time in ms
- `pollInterval` (number, optional) - Poll interval in ms

**Returns:** Final TestExecutionStatus

#### `shareWithFlaUI(key, data, ttlSeconds?): Promise<DataShareResponse>`
Shares data with FlaUI tests via Bridge API cache.

**Parameters:**
- `key` (string) - Unique key for data
- `data` (any) - Data to share
- `ttlSeconds` (number, optional) - Time to live (default: 3600)

**Returns:** DataShareResponse

#### `retrieveData(key): Promise<DataRetrieveResponse>`
Retrieves shared data from Bridge API.

**Parameters:**
- `key` (string) - Data key

**Returns:** DataRetrieveResponse with exists flag and data

## Example Test Suite

See `src/tests/bridge/flaui.fullworkflow.spec.ts` for complete examples.

## Troubleshooting

### Bridge API Not Available

**Error:** `Bridge API is not available at http://localhost:5000`

**Solution:**
1. Start the Bridge API server
2. Verify the URL in your `.env` file
3. Check network connectivity

### Test Execution Timeout

**Error:** `Test execution timed out after 300000ms`

**Solution:**
1. Increase timeout parameter
2. Check if FlaUI test is actually running
3. Review Bridge API logs for errors

### Test Not Found

**Error:** `FlaUI test 'TestName' failed: Unknown error`

**Solution:**
1. Verify test name matches exactly (case-sensitive)
2. Check FlaUI test assembly path in Bridge API
3. Ensure test is marked with [Test] attribute in FlaUI

## Prerequisites

1. **Bridge API Running**: The ASP.NET Bridge API server must be running
2. **FlaUI Project Accessible**: Bridge API must have access to FlaUI test assemblies
3. **NUnit Console Runner**: Required for FlaUI test execution
4. **Network Access**: Playwright tests must reach Bridge API URL

## Related Documentation

- [Bridge API Controller Documentation](../../../BridgeAPI/Controllers/ExecutionController.cs)
- [FlaUI Test Suite](../../../FlaUI/Recovery.UIAutomation.Tests/)
- [Playwright Configuration](../../playwright.config.ts)

## Contributing

When adding new bridge functionality:
1. Update type definitions in `bridge.types.ts`
2. Add helper methods in `bridge.helpers.ts`
3. Update this README with examples
4. Add test cases in `src/tests/bridge/`
