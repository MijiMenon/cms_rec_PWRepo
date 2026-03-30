import { test, expect } from '../../../POM-Framework/test-fixtures';
import { BridgeHelpers } from '../../../POM-Framework/bridge';

/**
 * Test suite for all available FlaUI Asset RMS tests
 * Invokes each FlaUI test via Bridge API
 */
test.describe('FlaUI Asset RMS - All Tests', () => {

  test.beforeAll(async () => {
    await BridgeHelpers.ensureBridgeAvailable();
    console.log('✓ Bridge API is ready\n');
  });

  /**
   * Test 1: Full Workflow Test
   * Searches contract RBC_53083 and performs Q Assignment workflow
   */
  test('1. FullWorkflowTest - Regression', async () => {
    console.log('\n=== Test 1: Full Workflow Test ===\n');

    const result = await BridgeHelpers.executeFlaUITest(
      'FullWorkflowTest',
      {
        contractNumber: 'BNS_143147',
        recipient: 'ANU AJITH;1001151',
        reason: 'CARPROOF;121',
        priority: 'CRITICAL'
      },
      600000 // 10 minutes timeout
    );

    expect(result.status).toBe('Completed');
    console.log('✓ FullWorkflowTest completed successfully');
  });

  /**
   * Test 2: Menu Navigation to Maintain Client Setup
   * Tests navigation and MSFlexGrid interaction
   */
  test('2. TestMenuNavigationToMaintainClientSetup - Smoke', async () => {
    console.log('\n=== Test 2: Menu Navigation to Maintain Client Setup ===\n');

    const result = await BridgeHelpers.executeFlaUITest(
      'TestMenuNavigationToMaintainClientSetup',
      { client: 'RBC' },
      300000
    );

    expect(result.status).toBe('Completed');
    console.log('✓ TestMenuNavigationToMaintainClientSetup completed');
  });

  /**
   * Test 3: Sale Date Added to Date Tab on RMS
   * Tests Sale Date workflow
   */
  test('3. SaleDateAddedToDateTabOnRMSTest - Smoke', async () => {
    console.log('\n=== Test 3: Sale Date Added to Date Tab ===\n');

    const result = await BridgeHelpers.executeFlaUITest(
      'SaleDateAddedToDateTabOnRMSTest',
      { contractNumber: 'RBCM26390' },
      300000
    );

    expect(result.status).toBe('Completed');
    console.log('✓ SaleDateAddedToDateTabOnRMSTest completed');
  });

  /**
   * Test 4: Look Up for Q History in Q Man Tab
   * Tests Q History lookup workflow
   */
  test('4. LookUpForQHistoryInQManTabOnRMSTest - Smoke', async () => {
    console.log('\n=== Test 4: Look Up for Q History ===\n');

    const result = await BridgeHelpers.executeFlaUITest(
      'LookUpForQHistoryInQManTabOnRMSTest',
      { contractNumber: 'RBCM26390' },
      300000
    );

    expect(result.status).toBe('Completed');
    console.log('✓ LookUpForQHistoryInQManTabOnRMSTest completed');
  });

  /**
   * Test 5: Verify Redemption Letter in Database Documents
   * Tests document verification workflow
   */
  test('5. VerifyRedemptionletteravailableintheDbasedocuments - Smoke', async () => {
    console.log('\n=== Test 5: Verify Redemption Letter ===\n');

    const result = await BridgeHelpers.executeFlaUITest(
      'VerifyRedemptionletteravailableintheDbasedocuments',
      { contractNumber: 'RBCM26390' },
      300000
    );

    expect(result.status).toBe('Completed');
    console.log('✓ VerifyRedemptionletteravailableintheDbasedocuments completed');
  });
});

/**
 * Test suite using fully qualified test names
 * This is more explicit and recommended for production use
 */
test.describe('FlaUI Asset RMS - Fully Qualified Names', () => {

  test.beforeAll(async () => {
    await BridgeHelpers.ensureBridgeAvailable();
  });

  test('Run FullWorkflowTest with fully qualified name', async () => {
    const result = await BridgeHelpers.executeFlaUITest(
      'Recovery.UIAutomation.Tests.AssetRms.AssetRmsTests.FullWorkflowTest',
      { contractNumber: 'RBCM26390' },
      600000
    );

    expect(result.status).toBe('Completed');
    console.log('Result:', result.result);
  });
});

/**
 * Test suite for running tests by category
 */
test.describe('FlaUI Asset RMS - By Category', () => {

  test.beforeAll(async () => {
    await BridgeHelpers.ensureBridgeAvailable();
  });

  test.describe('Regression Tests', () => {
    test('FullWorkflowTest', async () => {
      const result = await BridgeHelpers.executeFlaUITest(
        'FullWorkflowTest',
        {},
        600000
      );
      expect(result.status).toBe('Completed');
    });
  });

  test.describe('Smoke Tests', () => {
    const smokeTests = [
      'TestMenuNavigationToMaintainClientSetup',
      'SaleDateAddedToDateTabOnRMSTest',
      'LookUpForQHistoryInQManTabOnRMSTest',
      'VerifyRedemptionletteravailableintheDbasedocuments'
    ];

    for (const testName of smokeTests) {
      test(`${testName}`, async () => {
        const result = await BridgeHelpers.executeFlaUITest(
          testName,
          {},
          300000
        );
        expect(result.status).toBe('Completed');
      });
    }
  });
});
