import { test, expect } from '../../../POM-Framework/test-fixtures';
import { BridgeHelpers } from '../../../POM-Framework/bridge/bridge.helpers';

/**
 * Invoke FlaUI FullWorkflowTest from Playwright via Bridge API
 *
 * Prerequisites:
 * - Bridge API must be running (default: http://localhost:5000)
 * - FlaUI test project must be accessible to Bridge API
 * - Set BRIDGE_API_URL environment variable if using custom URL
 */
test.describe('FlaUI Bridge - Full Workflow Test', () => {

  test.beforeAll(async () => {
    // Verify Bridge API is available before running tests
    await BridgeHelpers.ensureBridgeAvailable();
  });

  test('Invoke FullWorkflowTest via Bridge API', async () => {
    console.log('\n========================================');
    console.log('Invoking FlaUI FullWorkflowTest');
    console.log('========================================\n');

    // Prepare test data
    const testData = {
      contractNumber: 'RBCM26390',
      testName: 'FullWorkflowTest',
      timestamp: new Date().toISOString(),
      environment: process.env.TEST_ENV || 'qa1',
    };

    console.log('Test Data:', JSON.stringify(testData, null, 2));

    // Optional: Share data with FlaUI before execution
    await BridgeHelpers.shareWithFlaUI('fullworkflow-input', testData);
    console.log('✓ Test data shared with FlaUI\n');

    // Execute FlaUI test via Bridge API
    const result = await BridgeHelpers.executeFlaUITest(
      'FullWorkflowTest',    // FlaUI test name
      testData,              // Test parameters
      300000,                // Timeout: 5 minutes
      2000                   // Poll interval: 2 seconds
    );

    console.log('\n========================================');
    console.log('Test Execution Results');
    console.log('========================================');
    console.log('Execution ID:', result.executionId);
    console.log('Status:', result.status);
    console.log('Duration:', `${result.duration}ms`);
    console.log('Result:', JSON.stringify(result.result, null, 2));

    // Verify test completed successfully
    expect(result.status).toBe('Completed');
    expect(result.result).toBeDefined();

    console.log('\n✓ FullWorkflowTest completed successfully!');
    console.log('========================================\n');
  });

  test('Quick FullWorkflow Invocation', async () => {
    console.log('\n--- Quick Test Execution ---');

    const result = await BridgeHelpers.executeFlaUITest(
      'FullWorkflowTest',
      {
        contractNumber: 'RBCM26390',
        quickRun: true
      },
      300000
    );

    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.duration}ms`);

    expect(result.status).toBe('Completed');
    console.log('✓ Test completed\n');
  });

  test('Execute with Custom Parameters', async () => {
    console.log('\n--- Custom Parameters Test ---');

    const customParams = {
      contractNumber: 'RBCM26390',
      runMode: 'smoke',
      enableLogging: true,
      skipCleanup: false,
    };

    const result = await BridgeHelpers.executeFlaUITest(
      'FullWorkflowTest',
      customParams,
      300000
    );

    expect(result.status).toBe('Completed');
    console.log('✓ Custom parameters test completed\n');
  });

  test('Share and Retrieve Data Between Tests', async () => {
    console.log('\n--- Data Sharing Test ---');

    // Share data from Playwright
    const sharedData = {
      testId: 'TEST_001',
      artifacts: ['screenshot1.png', 'log1.txt'],
      metadata: {
        browser: 'chromium',
        timestamp: new Date().toISOString(),
      },
    };

    await BridgeHelpers.shareWithFlaUI('playwright-test-data', sharedData, 600);
    console.log('✓ Data shared with Bridge API');

    // Retrieve data back
    const retrieved = await BridgeHelpers.retrieveData('playwright-test-data');

    expect(retrieved.exists).toBe(true);
    expect(retrieved.data).toMatchObject(sharedData);

    console.log('✓ Data retrieved successfully');
    console.log('Retrieved:', JSON.stringify(retrieved.data, null, 2));
  });

  test('Handle FlaUI Test Failure Gracefully', async () => {
    console.log('\n--- Error Handling Test ---');

    // This test demonstrates error handling
    // Use a test name that might fail or doesn't exist
    try {
      await BridgeHelpers.executeFlaUITest(
        'NonExistentTest',
        {},
        30000 // Shorter timeout
      );

      // If we get here, test unexpectedly passed
      expect(true).toBe(false); // Force fail
    } catch (error: any) {
      console.log('✓ Error caught as expected:', error.message);
      expect(error.message).toContain('failed');
    }
  });
});

/**
 * Additional test suite for other FlaUI tests
 */
test.describe('FlaUI Bridge - Asset RMS Tests', () => {

  test.beforeAll(async () => {
    await BridgeHelpers.ensureBridgeAvailable();
  });

  test('Invoke Asset RMS Test', async () => {
    const result = await BridgeHelpers.executeFlaUITest(
      'AssetRmsTests.FullWorkflowTest', // Fully qualified test name
      {
        assetId: 'ASSET_001',
        action: 'create',
      },
      180000 // 3 minutes
    );

    expect(result.status).toBe('Completed');
    console.log('✓ Asset RMS test completed');
  });
});
