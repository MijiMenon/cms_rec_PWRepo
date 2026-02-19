// Assignment Creation Test Suite
import { test } from '../../POM-Framework/test-fixtures';
import type { AssignmentData } from '../page-objects/AssignmentPage';
import { AssignmentCreationFeature } from '../feature-scenarios/AssignmentCreationFeature';
import { LoginFeature } from '../feature-scenarios/LoginFeature';
import { LoginTestData } from '../../POM-Framework/interfaces/index';
import { logger, logTestStart, logTestEnd, logTestData } from '../../POM-Framework/utilities/logger';
import { DataProvider } from '../../POM-Framework/utilities/data-readers/dataProvider';

test.describe('Assignment Creation Feature Tests', () => {
  let assignmentCreationFeature: AssignmentCreationFeature;
  let loginFeature: LoginFeature;
  let assignmentData: AssignmentData;
  let loginData: LoginTestData;

  // Set 2-minute timeout for all tests in this suite (slow form loading)
  test.setTimeout(120000);

  // Configure credential key for all tests in this suite
  test.use({ credentialKey: 'RBCClient' });

  test.beforeEach(async ({ page, credentials }) => {
    // Initialize feature classes
    assignmentCreationFeature = new AssignmentCreationFeature(page);
    loginFeature = new LoginFeature(page);

    // Load test data from JSON
    assignmentData = await DataProvider.getTestDataFromJson(
      'POM-Tests\\test-data\\json\\assignmentData.json'
    ) as unknown as AssignmentData;

    logger.info('Setup for Assignment Creation Feature Tests completed');
  });

  test.afterEach(async () => {
    logger.info('Teardown for Assignment Creation Feature Tests completed');
  });

  // Test: Create assignment using JSON data

  test('@Priority Create assignment with JSON data', async ({ credentials }) => {
    logTestStart('Create assignment with JSON data');
    logTestData(assignmentData);

    await test.step('Login to application', async () => {
      await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
    });

    await test.step('Create new assignment', async () => {
      await assignmentCreationFeature.performAssignmentCreation(assignmentData);
    });

    logTestEnd('Create assignment with JSON data', 'PASSED');
  });
});
