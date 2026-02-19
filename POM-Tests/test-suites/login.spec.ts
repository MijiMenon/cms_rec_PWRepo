/**
 * Data-Driven Login Tests
 * Flow: Test -> LoginFeature -> LoginPage/HomePage
 */
import { test, expect } from '../../POM-Framework/test-fixtures';
import { LoginTestData } from '../../POM-Framework/interfaces';
import { logTestStart, logTestEnd, logTestData } from '../../POM-Framework/utilities/logger';
import globalSetup from '@hooks/globalSetup';
import globalTeardown from '@hooks/globalTeardown';



test.describe('Login Feature - Data Driven Tests', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await globalSetup(testInfo.config as any);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await globalTeardown(testInfo.config as any);
  });

  /**
   * Data-driven test: Read from CSV and execute login scenarios
   */
  test('Login with CSV test data', async ({ page, loginFeature, dataProvider }) => {
    logTestStart('Login with CSV test data');

    // Read test data from CSV
    const testData = await dataProvider.getCsvData('loginData.csv');
    const loginData = dataProvider.convertToType<LoginTestData>(testData);

    // Iterate through each test case
    for (const data of loginData) {
      logTestData(data);

      if (data.expectedResult === 'success') {
        // Test successful login scenario
        await test.step(`Test Case: ${data.testCase}`, async () => {
          await loginFeature.performSuccessfulLogin(data.username, data.password);
        });

      } 
    }

    logTestEnd('Login with CSV test data', 'PASSED');
  });  

  /**
   * Test: Login-Logout flow from CSV data
   */
  test('Complete login-logout flow', async ({ loginFeature, dataProvider }) => {
    logTestStart('Complete login-logout flow');

    const testData = await dataProvider.getCsvData('loginData.csv');
    const validLogin = testData.find(
      (data) => data.expectedResult === 'success'
    ) as LoginTestData;

    logTestData(validLogin);

    // Execute login-logout flow through feature
    await loginFeature.performLoginLogoutFlow(validLogin.username, validLogin.password);

    logTestEnd('Complete login-logout flow', 'PASSED');
  });

  
  /**
   * Test: Login-Logout flow using config URLs and credentials
   */
  test('Login-Logout flow with config URLs and credentials', async ({ loginFeature }) => {
    logTestStart('Login-Logout flow with config URLs and credentials');

    // Execute login-logout flow through feature using config data
    await loginFeature.performSuccessfulLoginWithConfigCreds();

    logTestEnd('Login-Logout flow with config URLs and credentials', 'PASSED');
  });
});

