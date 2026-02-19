import { Page, Locator } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { logger } from '../../POM-Framework/utilities/logger';

/**
 * LoginPage - Page Object for Login functionality
 */
export class LoginPage extends BasePage {
  protected pageUrl: string = '/login';

  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;
  private readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.usernameInput = page.locator('#UserName, input[name="UserName"], input[type="text"]');
    this.passwordInput = page.locator('#UserPassword, input[name="UserPassword"]');
    this.loginButton = page.locator('#bSubmit, button[value="Login"], button[type="submit"]');
    this.errorMessage = page.locator('.error-message, .alert-danger, [role="alert"]');
    this.successMessage = page.locator('.success-message, .alert-success');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot Password")');

  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    logger.info('Navigating to login page');
    await this.navigate();
  }

  /**
   * Enter username
   */
  async enterUsername(username: string): Promise<void> {
    logger.info(`Entering username: ${username}`);
    await this.fill(this.usernameInput, username);
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    logger.info('Entering password');
    await this.fill(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    logger.info('Clicking login button');
    await this.click(this.loginButton);
  }

  /**
   * Perform complete login
   */
  async login(username: string, password: string): Promise<void> {
    logger.info(`Performing login for user: ${username}`);
    await this.enterUsername(username);
    await this.enterPassword(password);

    // Click and wait for navigation
    await Promise.all([
      this.page.waitForLoadState('networkidle', { timeout: 30000 }),
      this.clickLoginButton()
    ]);

    logger.info('Login button clicked, waiting for navigation to complete');
  }


  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    logger.info('Getting error message');
    await this.waitForElement(this.errorMessage, 'visible', 5000);
    return await this.getText(this.errorMessage);
  }

  /**
   * Get success message
   */
  async getSuccessMessage(): Promise<string> {
    logger.info('Getting success message');
    await this.waitForElement(this.successMessage, 'visible', 5000);
    return await this.getText(this.successMessage);
  }

  /**
   * Check if error message is displayed
   */
  async isErrorMessageDisplayed(): Promise<boolean> {
    try {
      return await this.isVisible(this.errorMessage);
    } catch {
      return false;
    }
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.loginButton);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    logger.info('Clicking forgot password link');
    await this.click(this.forgotPasswordLink);
  }

  /**
   * Get page title text
   */
  async getPageTitle(): Promise<string> {
    return await this.getTitle();
  }

  /**
   * Verify login page is loaded
   */
  async verifyLoginPageLoaded(): Promise<void> {
    logger.info('Verifying login page is loaded');
    await this.verifyElementVisible(this.usernameInput);
    await this.verifyElementVisible(this.passwordInput);
    await this.verifyElementVisible(this.loginButton);
  }

  /**
   * Clear login form
   */
  async clearLoginForm(): Promise<void> {
    logger.info('Clearing login form');
    await this.fill(this.usernameInput, '');
    await this.fill(this.passwordInput, '');
  }
}
