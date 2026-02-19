import { Page } from '@playwright/test';
import { BaseFeature } from './base/BaseFeature';
import { AssignmentPage } from '../page-objects/AssignmentPage';
import type { AssignmentData } from '../page-objects/AssignmentPage';
import { logger } from '../../POM-Framework/utilities/logger';
import { th } from '@faker-js/faker/.';

/**
 * AssignmentCreationFeature - Encapsulates assignment creation business scenarios
 * Orchestrates AssignmentPage to execute assignment creation workflows
 */
export class AssignmentCreationFeature extends BaseFeature {
  private assignmentPage: AssignmentPage;

  constructor(page: Page) {
    super(page);
    this.assignmentPage = new AssignmentPage(page);
  }

  /**
   * Scenario: Perform assignment creation with provided data
   */
  async performAssignmentCreation(assignmentData: AssignmentData): Promise<void> {
    this.logFeatureStart('Assignment Creation Scenario');

    try {
      this.logStep('Opening manual assignment form');
      await this.assignmentPage.openManualAssignment();

      this.logStep('Filling debtor details');
      await this.assignmentPage.fillDebtorDetails(assignmentData.debtorDetails);

      this.logStep('Filling agreement details');
      await this.assignmentPage.fillAgreementDetails(assignmentData.agreementDetails);

      this.logStep('Submitting assignment');
      await this.assignmentPage.submitAssignment();

      logger.info('Assignment created successfully');

      this.logFeatureEnd('Assignment Creation Scenario');
      await this.assignmentPage.logoutUser();
      this.logStep('Logged out user after assignment creation');
      
    } catch (error) {
      logger.error(`Assignment creation scenario failed: ${error}`);
      await this.takeScreenshot('assignment_creation_failure');
      throw error;
    }
  }
}
