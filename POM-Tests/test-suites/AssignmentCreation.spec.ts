// Assignment Creation Test Suite
import { test } from '../../POM-Framework/test-fixtures';
import type { AssignmentData } from '../page-objects/AssignmentPage';
import { logger, logTestStart, logTestEnd, logTestData } from '../../POM-Framework/utilities/logger';
import { DataProvider } from '../../POM-Framework/utilities/data-readers/dataProvider';

test.describe('Assignment Creation Flow in Repo Highway', () => {
  let assignmentData: AssignmentData;
  // Set 2-minute timeout for all tests in this suite (slow form loading)
  test.setTimeout(120000);

  // Configure credential key for all tests in this suite
  test.use({ credentialKey: 'RBCClient' });

  test.beforeEach(async () => {
    // Load test data from JSON
    assignmentData = await DataProvider.getTestDataFromJson(
      'POM-Tests\\test-data\\json\\assignmentData.json'
    ) as unknown as AssignmentData;

    logger.info('Setup for Assignment Creation Feature Tests completed');
  });

  test.afterEach(async () => {
    logger.info('Teardown for Assignment Creation Feature Tests completed');
  });

  // Test: Create RH assignment using JSON data

  test('@Priority Create RH Assignment with JSON data', async ({ credentials, loginFeature, assignmentCreationFeature }) => {
    logTestStart('Create RH Assignment with JSON data');
    logTestData(assignmentData);

    await test.step('Login to application', async () => {
      await loginFeature.performSuccessfulLogin(credentials.username, credentials.password);
    });

    await test.step('Create new RH assignment', async () => {
      await assignmentCreationFeature.performAssignmentCreation(assignmentData);
    });

    logTestEnd('Create RH Assignment with JSON data', 'PASSED');
  });
});
