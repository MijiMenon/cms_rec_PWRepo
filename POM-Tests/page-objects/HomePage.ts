import { Page, Locator, FrameLocator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { logger } from '../../POM-Framework/utilities/logger';

/**
 * HomePage - Page Object for Home/Dashboard page
 */
export class HomePage extends BasePage {
  protected pageUrl: string = '/home';

  // Locators
  private readonly frame: FrameLocator;
  private readonly pageHeading: Locator;
  private readonly welcomeMessage: Locator;
  private readonly userProfileLink: Locator;
  private readonly logoutButton: Locator;
  private readonly searchBox: Locator;
  private readonly notificationBell: Locator;
  private readonly settingsLink: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.frame = this.page.frameLocator('frame[name="middle"]');
    this.pageHeading = this.frame.locator('h1, .page-title, .header-title').first();
    this.welcomeMessage = this.frame.locator('#Table1 > tbody > tr > td > span > span');
    this.userProfileLink = this.frame.locator('a[href*="profile"], .user-profile');
    this.logoutButton = this.frame.locator('#Menu1_Menu1_30 > nobr, a:has-text("Logout"), a:has-text("Log Out"), button:has-text("Logout"), [data-testid="logout"]');
    this.searchBox = this.frame.locator('input[type="search"], #search, .search-input');
    this.notificationBell = this.frame.locator('.notification-icon, [data-testid="notifications"]');
    this.settingsLink = this.frame.locator('a[href*="settings"], .settings-link');
  }

  /**
   * Wait for main frame to load
   */
  async waitForFrameLoad(timeout: number = 30000): Promise<void> {
    logger.info('Waiting for middle frame to load');
    try {
      // Wait for frame to be attached
      await this.page.waitForSelector('frame[name="middle"]', { timeout });

      // Wait for a key element inside frame to be visible
      await this.logoutButton.waitFor({ state: 'visible', timeout });

      logger.info('Middle frame loaded successfully');
    } catch (error) {
      logger.error(`Frame failed to load: ${error}`);
      throw new Error(`Middle frame did not load within ${timeout}ms`);
    }
  }

  /**
   * Navigate to home page
   */
  async navigateToHome(): Promise<void> {
    logger.info('Navigating to home page');
    await this.navigate();
  }

  /**
   * Get welcome message
   */
  async getWelcomeMessage(): Promise<string> {
    logger.info('Getting welcome message');
    await this.waitForElement(this.welcomeMessage);
    return await this.getText(this.welcomeMessage);
  }

  /**
   * Get page heading
   */
  async getPageHeading(): Promise<string> {
    logger.info('Getting page heading');
    return await this.getTitle();
  }

  /**
   * Click user profile
   */
  async clickUserProfile(): Promise<void> {
    logger.info('Clicking user profile');
    await this.click(this.userProfileLink);
  }

  /**
   * Click logout button
   */
  async clickLogout(): Promise<void> {
    logger.info('Clicking logout button');
    await this.click(this.logoutButton);
    await this.waitForPageLoad();
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    logger.info('Performing logout');
    await this.clickLogout();
  }

  /**
   * Search for content
   */
  async search(query: string): Promise<void> {
    logger.info(`Searching for: ${query}`);
    await this.fill(this.searchBox, query);
    await this.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Check if user is logged in
   */
  async isUserLoggedIn(): Promise<boolean> {
    try {
      logger.info('Checking if user is logged in by verifying logout button');

      // First ensure frame is loaded
      await this.waitForFrameLoad(15000);

      // Then check if logout button is visible with reasonable timeout
      await this.logoutButton.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      logger.warn(`User not logged in or logout button not found: ${error}`);
      return false;
    }
  }

  /**
   * Click notifications
   */
  async clickNotifications(): Promise<void> {
    logger.info('Clicking notifications');
    await this.click(this.notificationBell);
  }

  /**
   * Click settings
   */
  async clickSettings(): Promise<void> {
    logger.info('Clicking settings');
    await this.click(this.settingsLink);
  }

  /**
   * Verify home page is loaded
   */
  async verifyHomePageLoaded(): Promise<void> {
    logger.info('Verifying home page is loaded');

    // Wait for frame to load first
    await this.waitForFrameLoad();

    // Then verify elements
    await this.verifyElementVisible(this.logoutButton);
  }

  /**
   * Get current user name from welcome message
   */
  async getCurrentUserName(): Promise<string> {
    const welcomeText = await this.getWelcomeMessage();
    // Extract username from "Welcome, John!" format
    const match = welcomeText.match(/Welcome,?\s+(.+?)!/);
    return match ? match[1].trim() : '';
  }
}
