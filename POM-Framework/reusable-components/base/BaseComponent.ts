import { Page, Locator } from '@playwright/test';
import { logger } from '../../utilities/logger';

/**
 * BaseComponent - Abstract base class for all reusable UI components
 * Use this for common components like headers, footers, navigation menus, etc.
 */
export abstract class BaseComponent {
  protected page: Page;
  protected rootLocator: Locator;

  constructor(page: Page, rootLocator: string | Locator) {
    this.page = page;
    this.rootLocator = typeof rootLocator === 'string' ? page.locator(rootLocator) : rootLocator;
  }

  /**
   * Get a child element within the component
   */
  protected getElement(locator: string): Locator {
    return this.rootLocator.locator(locator);
  }

  /**
   * Click on an element within the component
   */
  async click(locator: string): Promise<void> {
    logger.info(`Clicking element in component: ${locator}`);
    await this.getElement(locator).click();
  }

  /**
   * Fill input field within the component
   */
  async fill(locator: string, text: string): Promise<void> {
    logger.info(`Filling element in component: ${locator} with text: ${text}`);
    await this.getElement(locator).fill(text);
  }

  /**
   * Get text from element within the component
   */
  async getText(locator: string): Promise<string> {
    const text = await this.getElement(locator).textContent() || '';
    logger.info(`Getting text from component element: ${locator} - Text: ${text}`);
    return text.trim();
  }

  /**
   * Check if element is visible within the component
   */
  async isVisible(locator: string): Promise<boolean> {
    const visible = await this.getElement(locator).isVisible();
    logger.info(`Checking visibility of component element: ${locator} - Visible: ${visible}`);
    return visible;
  }

  /**
   * Wait for element within the component
   */
  async waitForElement(locator: string, timeout: number = 30000): Promise<void> {
    logger.info(`Waiting for element in component: ${locator}`);
    await this.getElement(locator).waitFor({ state: 'visible', timeout });
  }

  /**
   * Check if component is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.rootLocator.waitFor({ state: 'visible', timeout: 10000 });
      logger.info('Component is loaded');
      return true;
    } catch (error) {
      logger.error('Component failed to load');
      return false;
    }
  }

  /**
   * Hover over an element within the component
   */
  async hover(locator: string): Promise<void> {
    logger.info(`Hovering over element in component: ${locator}`);
    await this.getElement(locator).hover();
  }

  /**
   * Get attribute from element within the component
   */
  async getAttribute(locator: string, attribute: string): Promise<string | null> {
    const value = await this.getElement(locator).getAttribute(attribute);
    logger.info(`Getting attribute "${attribute}" from component element: ${locator} - Value: ${value}`);
    return value;
  }
}
