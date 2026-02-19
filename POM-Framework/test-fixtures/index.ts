import { test as base } from '@playwright/test';
import { LoginPage } from '../../POM-Tests/page-objects/LoginPage';
import { HomePage } from '../../POM-Tests/page-objects/HomePage';
import { LoginFeature } from '../../POM-Tests/feature-scenarios/LoginFeature';
import { HeaderComponent } from '../reusable-components/HeaderComponent';
import { DataProvider } from '../utilities/data-readers/dataProvider';
import { ScreenshotHelper } from '../utilities/screenshotHelper';
import { ConfigReader } from '../utilities/ConfigReader';
import { logger } from '../utilities/logger';
import type { Credentials } from '../../POM-Tests/test.config';

/**
 * Extended test fixtures with page objects, features, and utilities
 */
type TestFixtures = {
  // Page Objects
  loginPage: LoginPage;
  homePage: HomePage;

  // Features
  loginFeature: LoginFeature;

  // Components
  headerComponent: HeaderComponent;

  // Utilities
  dataProvider: typeof DataProvider;
  screenshotHelper: typeof ScreenshotHelper;
  configReader: typeof ConfigReader;

  // Credentials - can be configured per test
  credentials: Credentials;
  credentialKey: string;
};

/**
 * Extend Playwright test with custom fixtures
 */
export const test = base.extend<TestFixtures>({
  // Page Object Fixtures
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  // Feature Fixtures
  loginFeature: async ({ page }, use) => {
    const loginFeature = new LoginFeature(page);
    await use(loginFeature);
  },

  // Component Fixtures
  headerComponent: async ({ page }, use) => {
    const headerComponent = new HeaderComponent(page);
    await use(headerComponent);
  },

  // Utility Fixtures
  dataProvider: async ({}, use) => {
    await use(DataProvider);
  },

  screenshotHelper: async ({}, use) => {
    await use(ScreenshotHelper);
  },

  configReader: async ({}, use) => {
    await use(ConfigReader);
  },

  // Credential Key - defaults to globalSetup value or RBCClient
  credentialKey: ['RBCClient', { option: true }],

  // Credentials - fetched based on credentialKey
  credentials: async ({ credentialKey }, use) => {
    const env = process.env.TEST_ENV || 'QA';
    logger.info(`Fetching credentials for: ${credentialKey} (Environment: ${env})`);
    const credentials = ConfigReader.getCredentials(credentialKey, env);
    await use(credentials);
  },
});

/**
 * Export expect from Playwright
 */
export { expect } from '@playwright/test';

/**
 * Custom test with automatic screenshot on failure
 */
export const testWithScreenshot = base.extend<TestFixtures>({
  page: async ({ page }, use, testInfo) => {
    await use(page);

    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = testInfo.outputPath(`failure-${testInfo.title}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      logger.error(`Test failed. Screenshot saved: ${screenshotPath}`);
    }
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginFeature: async ({ page }, use) => {
    const loginFeature = new LoginFeature(page);
    await use(loginFeature);
  },

  headerComponent: async ({ page }, use) => {
    const headerComponent = new HeaderComponent(page);
    await use(headerComponent);
  },

  dataProvider: async ({}, use) => {
    await use(DataProvider);
  },

  screenshotHelper: async ({}, use) => {
    await use(ScreenshotHelper);
  },

  configReader: async ({}, use) => {
    await use(ConfigReader);
  },

  // Credential Key - defaults to globalSetup value or RBCClient
  credentialKey: ['RBCClient', { option: true }],

  // Credentials - fetched based on credentialKey
  credentials: async ({ credentialKey }, use) => {
    const env = process.env.TEST_ENV || 'QA';
    logger.info(`Fetching credentials for: ${credentialKey} (Environment: ${env})`);
    const credentials = ConfigReader.getCredentials(credentialKey, env);
    await use(credentials);
  },
});
