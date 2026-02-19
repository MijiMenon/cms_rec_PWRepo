import { FullConfig } from '@playwright/test';
import { logger } from '../utilities/logger';
import { DataProvider } from '../utilities/data-readers/dataProvider';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Global Teardown - Runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  logger.info('='.repeat(80));
  logger.info('GLOBAL TEARDOWN - START');
  logger.info('='.repeat(80));

  try {
    // Generate Allure report from results
    generateAllureReport();

    // Clear data provider cache
    DataProvider.clearCache();
    logger.info('Data provider cache cleared');

    // Clean up authentication state if exists
    cleanupAuthState();

    // Generate test summary
    generateTestSummary();

    logger.info('Global teardown completed successfully');
  } catch (error) {
    logger.error(`Global teardown failed: ${error}`);
  } finally {
    logger.info('='.repeat(80));
    logger.info('GLOBAL TEARDOWN - END');
    logger.info('='.repeat(80));
  }
}

/**
 * Generate Allure report from results
 */
function generateAllureReport(): void {
  const runDir = process.env.TEST_RUN_DIR;
  if (!runDir) {
    logger.warn('Run directory not found, skipping Allure report generation');
    return;
  }

  const allureResultsPath = path.join(runDir, 'allure-results');
  const allureReportPath = path.join(runDir, 'allure-report');

  if (!fs.existsSync(allureResultsPath)) {
    logger.warn('Allure results not found, skipping report generation');
    return;
  }

  logger.info('Generating Allure report...');

  try {
    // Generate Allure report using npx
    const command = `npx allure generate "${allureResultsPath}" --clean -o "${allureReportPath}"`;
    execSync(command, { stdio: 'inherit' });

    logger.info(`Allure report generated successfully: ${allureReportPath}`);
    logger.info(`Open report with: npx allure open "${allureReportPath}"`);
  } catch (error) {
    logger.error(`Failed to generate Allure report: ${error}`);
  }
}

/**
 * Clean up authentication state file
 */
function cleanupAuthState(): void {
  const authStatePath = path.join(process.cwd(), 'auth-state.json');

  if (fs.existsSync(authStatePath)) {
    fs.unlinkSync(authStatePath);
    logger.info('Authentication state file removed');
  }
}

/**
 * Generate test execution summary
 */
function generateTestSummary(): void {
  logger.info('Generating test execution summary...');

  const runDir = process.env.TEST_RUN_DIR || 'Not set';
  const summary = {
    timestamp: new Date().toISOString(),
    environment: process.env.TEST_ENV || 'QA',
    baseUrl: process.env.BASE_URL,
    runDirectory: runDir,
    reportLocations: {
      runFolder: runDir,
      htmlReport: path.join(runDir, 'html-report/index.html'),
      allureResults: path.join(runDir, 'allure-results'),
      allureReport: path.join(runDir, 'allure-report'),
      screenshots: path.join(runDir, 'screenshots'),
    },
  };

  // Save summary in root
  const summaryPath = path.join(process.cwd(), 'test-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // Save summary in run folder
  if (runDir !== 'Not set') {
    const runSummaryPath = path.join(runDir, 'test-summary.json');
    fs.writeFileSync(runSummaryPath, JSON.stringify(summary, null, 2));
    logger.info(`Test summary saved to run folder: ${runSummaryPath}`);
  }

  logger.info(`Test summary saved: ${summaryPath}`);
  logger.info(`Environment: ${summary.environment}`);
  logger.info(`Run directory: ${runDir}`);
  logger.info(`Reports available at: ${summary.reportLocations.htmlReport}`);
}

export default globalTeardown;
