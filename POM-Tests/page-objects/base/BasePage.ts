import { Page, Locator, expect } from '@playwright/test';
import { WaitCondition, ScreenshotOptions } from '../../../POM-Framework/interfaces';
import { logger } from '../../../POM-Framework/utilities/logger';

/**
 * BasePage - Abstract base class for all page objects
 * Provides common page interactions and utilities
 */
export abstract class BasePage {
  protected page: Page;
  protected abstract pageUrl: string;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page
   */
  async navigate(): Promise<void> {
    logger.info(`Navigating to: ${this.pageUrl}`);
    await this.page.goto(this.pageUrl);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click on an element
   */
  async click(locator: string | Locator, options?: { force?: boolean; timeout?: number }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Clicking element: ${locator}`);
    await element.click(options);
  }

  /**
   * Double click on an element
   */
  async doubleClick(locator: string | Locator): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Double clicking element: ${locator}`);
    await element.dblclick();
  }

  /**
   * Fill input field with text
   */
  async fill(locator: string | Locator, text: string, options?: { clear?: boolean }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Filling element: ${locator} with text: ${text}`);

    if (options?.clear) {
      await element.clear();
    }

    await element.fill(text);
  }

  /**
   * Type text with delay (simulates human typing)
   */
  async type(locator: string | Locator, text: string, delay: number = 50): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Typing into element: ${locator} with delay: ${delay}ms`);
    await element.type(text, { delay });
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator: string | Locator, value: string | string[]): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Selecting option: ${value} from element: ${locator}`);
    await element.selectOption(value);
  }

  /**
   * Check a checkbox or radio button
   */
  async check(locator: string | Locator): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Checking element: ${locator}`);
    await element.check();
  }

  /**
   * Uncheck a checkbox
   */
  async uncheck(locator: string | Locator): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Unchecking element: ${locator}`);
    await element.uncheck();
  }

  /**
   * Get text content from element
   */
  async getText(locator: string | Locator): Promise<string> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout: 15000 });
    const text = await element.textContent() || '';
    logger.info(`Getting text from element: ${locator} - Text: ${text}`);
    return text.trim();
  }

  /**
   * Get attribute value from element
   */
  async getAttribute(locator: string | Locator, attribute: string): Promise<string | null> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const value = await element.getAttribute(attribute);
    logger.info(`Getting attribute "${attribute}" from element: ${locator} - Value: ${value}`);
    return value;
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: string | Locator): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const visible = await element.isVisible();
    logger.info(`Checking visibility of element: ${locator} - Visible: ${visible}`);
    return visible;
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: string | Locator): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
     await element.waitFor({ state: 'visible', timeout: 15000 });
    const enabled = await element.isEnabled();
    logger.info(`Checking if element is enabled: ${locator} - Enabled: ${enabled}`);
    return enabled;
  }

  /**
   * Check if element is checked
   */
  async isChecked(locator: string | Locator): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const checked = await element.isChecked();
    logger.info(`Checking if element is checked: ${locator} - Checked: ${checked}`);
    return checked;
  }

  /**
   * Wait for element with specific condition
   */
  async waitForElement(
    locator: string | Locator,
    condition: WaitCondition = 'visible',
    timeout: number = 30000
  ): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Waiting for element: ${locator} to be ${condition}`);

    switch (condition) {
      case 'visible':
        await element.waitFor({ state: 'visible', timeout });
        break;
      case 'hidden':
        await element.waitFor({ state: 'hidden', timeout });
        break;
      case 'attached':
        await element.waitFor({ state: 'attached', timeout });
        break;
      case 'detached':
        await element.waitFor({ state: 'detached', timeout });
        break;
    }
  }

  /**
   * Wait for specific amount of time
   */
  async wait(milliseconds: number): Promise<void> {
    logger.info(`Waiting for ${milliseconds}ms`);
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Hover over an element
   */
  async hover(locator: string | Locator): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Hovering over element: ${locator}`);
    await element.hover();
  }

  /**
   * Press a key
   */
  async press(key: string): Promise<void> {
    logger.info(`Pressing key: ${key}`);
    await this.page.keyboard.press(key);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(options?: ScreenshotOptions): Promise<Buffer> {
    const screenshotPath = options?.path || `POM-Tests/screenshots/${Date.now()}.png`;
    logger.info(`Taking screenshot: ${screenshotPath}`);
    return await this.page.screenshot({
      path: screenshotPath,
      fullPage: options?.fullPage ?? true,
      type: options?.type ?? 'png',
    });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    const title = await this.page.title();
    logger.info(`Page title: ${title}`);
    return title;
  }

  /**
   * Get current URL
   */
  async getUrl(): Promise<string> {
    const url = this.page.url();
    logger.info(`Current URL: ${url}`);
    return url;
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: string | Locator): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Scrolling to element: ${locator}`);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Get element count
   */
  async getElementCount(locator: string | Locator): Promise<number> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    const count = await element.count();
    logger.info(`Element count for ${locator}: ${count}`);
    return count;
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    logger.info('Reloading page');
    await this.page.reload();
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    logger.info('Navigating back');
    await this.page.goBack();
  }

  /**
   * Go forward
   */
  async goForward(): Promise<void> {
    logger.info('Navigating forward');
    await this.page.goForward();
  }

  /**
   * Verify element text
   */
  async verifyElementText(locator: string | Locator, expectedText: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Verifying element text: ${locator} contains "${expectedText}"`);
    await expect(element).toHaveText(expectedText);
  }

  /**
   * Verify element is visible
   */
  async verifyElementVisible(locator: string | Locator): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    logger.info(`Verifying element is visible: ${locator}`);
    await expect(element).toBeVisible();
  }

  /**
   * Verify page title
   */
  async verifyTitle(expectedTitle: string): Promise<void> {
    logger.info(`Verifying page title: "${expectedTitle}"`);
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Verify URL contains text
   */
  async verifyUrlContains(text: string): Promise<void> {
    logger.info(`Verifying URL contains: "${text}"`);
    await expect(this.page).toHaveURL(new RegExp(text));
  }
}
