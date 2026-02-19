import { FullConfig, chromium } from '@playwright/test';
import { logger } from '../utilities/logger';
import { ScreenshotHelper } from '../utilities/screenshotHelper';
import { DataProvider } from '../utilities/data-readers/dataProvider';
import { Helpers } from '../utilities/helpers';
import { ConfigReader } from '../utilities/ConfigReader';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

/**
 * Get or create run-specific directory for current test run
 * Uses existing directory if already created by playwright.config
 */
function createRunDirectory(): string {
  // Use existing run directory if already set by playwright.config
  let runDir = process.env.TEST_RUN_DIR;

  if (!runDir) {
    // Create new run directory if not set
    const runFolderName = Helpers.getRunFolderName();
    runDir = path.join(process.cwd(), 'test-runs', runFolderName);

    if (!fs.existsSync(runDir)) {
      fs.mkdirSync(runDir, { recursive: true });
      logger.info(`Created test run directory: ${runDir}`);
    }

    // Store run directory path in environment variable
    process.env.TEST_RUN_DIR = runDir;
  }

  // Create screenshots subdirectory (reports are handled by Playwright config)
  const screenshotsDir = path.join(runDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    logger.info(`Created screenshots directory: ${screenshotsDir}`);
  }

  return runDir;
}

/**
 * Get current test run directory
 */
export function getRunDirectory(): string {
  return process.env.TEST_RUN_DIR || path.join(process.cwd(), 'test-runs', 'latest');
}

/**
 * Create necessary directories
 */
function createDirectories(): void {
  const directories = [
    'logs',
    'test-runs',
  ];

  directories.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.info(`Created directory: ${dirPath}`);
    }
  });
}

/**
 * Global Setup - Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  logger.info('='.repeat(80));
  logger.info('GLOBAL SETUP - START');
  logger.info('='.repeat(80));

  try {
    // Load environment variables
    dotenv.config();
    logger.info(`Environment: ${process.env.TEST_ENV || 'QA'}`);
    const baseUrl = ConfigReader.getBaseUrl();
    logger.info(`Base URL: ${baseUrl}`);

    // Create run-specific directory
    const runDir = createRunDirectory();
    logger.info(`Test run directory: ${runDir}`);

    // Create necessary directories
    createDirectories();

    // Initialize screenshot helper with run directory
    ScreenshotHelper.setRunDirectory(runDir);

    // Clean old screenshots (older than 7 days)
    ScreenshotHelper.cleanOldScreenshots(7);

    // Enable data provider caching
    DataProvider.setCaching(true);

    // Validate test data files exist
    validateTestData();

    // Fetch and store credentials for tests
    fetchAndStoreCredentials();

    logger.info('Global setup completed successfully');
  } catch (error) {
    logger.error(`Global setup failed: ${error}`);
    throw error;
  } finally {
    logger.info('='.repeat(80));
    logger.info('GLOBAL SETUP - END');
    logger.info('='.repeat(80));
  }
}

/**
 * Validate test data files
 */
function validateTestData(): void {
  logger.info('Validating test data files...');

  const testDataFiles = [
    'data/csv/loginData.csv',
  ];

  let allFilesExist = true;

  testDataFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      logger.info(`✓ Test data file exists: ${file}`);
    } else {
      logger.warn(`✗ Test data file missing: ${file}`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    logger.warn('Some test data files are missing. Tests may fail.');
  }
}

/**
 * Fetch and store login credentials in environment variables
 * Credentials are read from test.config.ts via ConfigReader
 */
function fetchAndStoreCredentials(): void {
  logger.info('Fetching login credentials from test.config...');

  const env = process.env.TEST_ENV || 'QA';
  const credentialKey = process.env.AUTH_CREDENTIAL_KEY || 'RBCClient';

  try {
    const credentials = ConfigReader.getCredentials(credentialKey, env);

    // Store in environment variables for tests to access
    process.env.LOGIN_USERNAME = credentials.username;
    process.env.LOGIN_PASSWORD = credentials.password;
    process.env.CREDENTIAL_KEY = credentialKey;

    logger.info(`✓ Fetched credentials for: ${credentialKey} (username: ${credentials.username})`);
    logger.info(`✓ Credentials stored in environment variables for tests`);
  } catch (error) {
    logger.error(`Failed to fetch credentials: ${error}`);
    throw error;
  }
}

export default globalSetup;
