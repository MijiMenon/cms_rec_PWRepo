import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';

/**
 * Screenshot Helper - Utility class for capturing screenshots
 */
export class ScreenshotHelper {
  private static screenshotsDir = path.join(process.cwd(), 'POM-Tests/screenshots');

  /**
   * Set run-specific directory for screenshots
   */
  static setRunDirectory(runDir: string): void {
    this.screenshotsDir = path.join(runDir, 'screenshots');
    this.init();
    logger.info(`Screenshots will be saved to: ${this.screenshotsDir}`);
  }

  /**
   * Initialize screenshots directory
   */
  static init(): void {
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
      logger.info(`Created screenshots directory: ${this.screenshotsDir}`);
    }
  }

  /**
   * Take a screenshot with timestamp
   */
  static async capture(page: Page, name: string, fullPage: boolean = true): Promise<string> {
    this.init();

    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedName}_${timestamp}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    try {
      await page.screenshot({
        path: filepath,
        fullPage,
      });
      logger.info(`Screenshot captured: ${filepath}`);
      return filepath;
    } catch (error) {
      logger.error(`Failed to capture screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take screenshot on test failure
   */
  static async captureOnFailure(page: Page, testName: string): Promise<string> {
    logger.warn(`Test failed: ${testName}. Capturing screenshot...`);
    return await this.capture(page, `FAILED_${testName}`, true);
  }

  /**
   * Take screenshot of specific element
   */
  static async captureElement(page: Page, selector: string, name: string): Promise<string> {
    this.init();

    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `element_${sanitizedName}_${timestamp}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    try {
      const element = page.locator(selector);
      await element.screenshot({ path: filepath });
      logger.info(`Element screenshot captured: ${filepath}`);
      return filepath;
    } catch (error) {
      logger.error(`Failed to capture element screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take multiple screenshots during a test flow
   */
  static async captureFlow(page: Page, testName: string, stepName: string): Promise<string> {
    const name = `${testName}_step_${stepName}`;
    return await this.capture(page, name, false);
  }

  /**
   * Clean old screenshots
   */
  static cleanOldScreenshots(daysOld: number = 7): void {
    if (!fs.existsSync(this.screenshotsDir)) {
      return;
    }

    const now = Date.now();
    const files = fs.readdirSync(this.screenshotsDir);

    files.forEach(file => {
      const filepath = path.join(this.screenshotsDir, file);
      const stats = fs.statSync(filepath);
      const fileAge = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24); // days

      if (fileAge > daysOld) {
        fs.unlinkSync(filepath);
        logger.info(`Deleted old screenshot: ${file}`);
      }
    });
  }
}
