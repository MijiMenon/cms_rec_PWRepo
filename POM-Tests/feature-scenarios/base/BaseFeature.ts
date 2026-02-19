import { Page } from '@playwright/test';
import { logger } from '../../../POM-Framework/utilities/logger';

/**
 * BaseFeature - Abstract base class for all feature/scenario classes
 * Features encapsulate business logic and orchestrate page objects
 * Flow: Test -> Feature -> Page
 */
export abstract class BaseFeature {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Log feature step
   */
  protected logStep(step: string): void {
    logger.info(`[FEATURE STEP] ${step}`);
  }

  /**
   * Log feature start
   */
  protected logFeatureStart(featureName: string): void {
    logger.info(`${'='.repeat(60)}`);
    logger.info(`FEATURE: ${featureName} - START`);
    logger.info(`${'='.repeat(60)}`);
  }

  /**
   * Log feature end
   */
  protected logFeatureEnd(featureName: string): void {
    logger.info(`${'='.repeat(60)}`);
    logger.info(`FEATURE: ${featureName} - END`);
    logger.info(`${'='.repeat(60)}`);
  }

  /**
   * Wait utility
   */
  protected async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Get current page URL
   */
  protected getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Take screenshot
   */
  protected async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}_${Date.now()}.png`, fullPage: true });
    logger.info(`Screenshot taken: ${name}`);
  }
}
