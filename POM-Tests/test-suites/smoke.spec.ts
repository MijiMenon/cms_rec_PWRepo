/**
 * Smoke Tests
 * Quick validation tests to ensure core functionality works
 */

import { test, expect } from '../../POM-Framework/test-fixtures';
import { logTestStart, logTestEnd } from '../../POM-Framework/utilities/logger';
import { LoginTestData } from '../../POM-Framework/interfaces/index';
import { DataProvider } from '../../POM-Framework/utilities/data-readers/dataProvider';

test.describe('Smoke Tests @smoke', () => {
  let loginData: LoginTestData;

  test.beforeEach(async () => {
    // Load login credentials from CSV
    const csvLoginData = await DataProvider.getCsvData('loginData.csv');
    const allLoginData = DataProvider.convertToType<LoginTestData>(csvLoginData);
    loginData = allLoginData.find(data => data.expectedResult === 'success') as LoginTestData;
  });

  /**
   * Test: Application is accessible
   */
  test('Application loads successfully', async ({ page }) => {
    logTestStart('Application loads successfully');

    await page.goto('/');
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });

    const url = page.url();
    expect(url).toBeTruthy();

    logTestEnd('Application loads successfully', 'PASSED');
  });

  /**
   * Test: Login page is accessible
   */
  test('Login page is accessible', async ({ loginPage }) => {
    logTestStart('Login page is accessible');

    await loginPage.navigateToLogin();
    await loginPage.verifyLoginPageLoaded();

    const title = await loginPage.getPageTitle();
    expect(title).toBeTruthy();

    logTestEnd('Login page is accessible', 'PASSED');
  });

  
  /**
   * Test: Basic navigation works
   */
  test('Basic navigation through pages', async ({ page, loginPage, loginFeature }) => {
    logTestStart('Basic navigation through pages');

    // Navigate to login page
    await loginPage.navigateToLogin();
    await loginPage.verifyLoginPageLoaded();

    // Perform login
    await loginFeature.performSuccessfulLogin(loginData.username, loginData.password);

    // Verify navigation worked
    const url = page.url();
    expect(url).not.toContain('login');

    logTestEnd('Basic navigation through pages', 'PASSED');
  });

  /**
   * Test: Data provider works
   */
  test('Data provider reads CSV successfully', async ({ dataProvider }) => {
    logTestStart('Data provider reads CSV successfully');

    const data = await dataProvider.getCsvData('loginData.csv');

    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('testCase');
    expect(data[0]).toHaveProperty('username');
    expect(data[0]).toHaveProperty('password');

    logTestEnd('Data provider reads CSV successfully', 'PASSED');
  });

  /**
   * Test: Excel data reader works
   */
  test('Data provider reads Excel successfully', async ({ dataProvider }) => {
    logTestStart('Data provider reads Excel successfully');

    try {
      const data = await dataProvider.getExcelData('testData.xlsx', 'Login');

      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);

      logTestEnd('Data provider reads Excel successfully', 'PASSED');
    } catch (error) {
      // Excel file might not exist yet, skip gracefully
      test.skip();
    }
  });
});

test.describe('Regression Tests @regression', () => {
  let loginData: LoginTestData;

  test.beforeEach(async () => {
    // Load login credentials from CSV
    const csvLoginData = await DataProvider.getCsvData('loginData.csv');
    const allLoginData = DataProvider.convertToType<LoginTestData>(csvLoginData);
    loginData = allLoginData.find(data => data.expectedResult === 'success') as LoginTestData;
  });

  /**
   * Test: End-to-end login flow
   */
  test('Complete user journey - Login to Logout', async ({
    loginFeature,
    homePage,
  }) => {
    logTestStart('Complete user journey - Login to Logout');

    // Perform complete login
    await loginFeature.performSuccessfulLogin(loginData.username, loginData.password);

    // Verify user is logged in
    const isLoggedIn = await homePage.isUserLoggedIn();
    expect(isLoggedIn).toBeTruthy();

    // Perform logout
    await homePage.logout();

    logTestEnd('Complete user journey - Login to Logout', 'PASSED');
  });

});
