import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { ConfigReader } from './POM-Framework/utilities/ConfigReader';

dotenv.config();

// Get or create run directory for this test execution
function getRunDirectory(): string {
  // Check if already set by globalSetup
  if (process.env.TEST_RUN_DIR) {
    return process.env.TEST_RUN_DIR;
  }

  // Create new run directory
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const runFolderName = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

  const runDir = path.join(process.cwd(), 'test-runs', runFolderName);

  // Create directory if it doesn't exist
  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir, { recursive: true });
  }

  // Store for other processes
  process.env.TEST_RUN_DIR = runDir;

  return runDir;
}

const runDir = getRunDirectory();

export default defineConfig({
  testDir: './POM-Tests/test-suites',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: path.join(runDir, 'html-report'), open: 'never' }],
    ['json', { outputFile: path.join(runDir, 'json-report', 'results.json') }],
    ['junit', { outputFile: path.join(runDir, 'junit-report', 'results.xml') }],
    ['list'],
    ['allure-playwright', {
      outputFolder: path.join(runDir, 'allure-results'),
      detail: true,
      suiteTitle: true
    }]
  ],

  use: {
    baseURL: ConfigReader.getBaseUrl(),  // Dynamic URL based on TEST_ENV and ENV_PREFIX
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    headless: process.env.HEADLESS !== 'false', // Respects HEADLESS env var (CI runs headless)
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    // ADD THESE FOR POP-UP HANDLING:
    permissions: ['notifications'], // Allow notifications
    acceptDownloads: true,           // Auto-accept downloads
    bypassCSP: true,                 // Bypass Content Security Policy (if blocking popups)

  },

  globalSetup: './POM-Framework/test-hooks/globalSetup.ts',
  globalTeardown: './POM-Framework/test-hooks/globalTeardown.ts',

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     viewport: { width: 1920, height: 1080 }
    //   },
    // },
    // {
    //   name: 'mobile-chrome',
    //   use: {
    //     ...devices['Pixel 5']
    //   },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: {
    //     ...devices['iPhone 13']
    //   },
    // },
  ],

  outputDir: path.join(runDir, 'test-results'),
});
