import { Page } from '@playwright/test';
import { BaseFeature } from './base/BaseFeature';
import { LoginPage } from '../page-objects/LoginPage';
import { HomePage } from '../page-objects/HomePage';
import { ConfigReader } from '../../POM-Framework/utilities/ConfigReader';
import { logger } from '../../POM-Framework/utilities/logger';

/**
 * LoginFeature - Encapsulates login-related business scenarios
 * Orchestrates LoginPage and HomePage to execute login flows
 */
export class LoginFeature extends BaseFeature {
  private loginPage: LoginPage;
  private homePage: HomePage;

  constructor(page: Page) {
    super(page);
    this.loginPage = new LoginPage(page);
    this.homePage = new HomePage(page);
  }

  /**
   * Scenario: Perform successful login
   */
  async performSuccessfulLogin(username: string, password: string): Promise<void> {
    this.logFeatureStart('Successful Login Scenario');

    try {
      this.logStep('Navigate to login page');
      await this.loginPage.navigateToLogin();

      this.logStep('Verify login page is loaded');
      await this.loginPage.verifyLoginPageLoaded();
            
      this.logStep('Clear any existing input');
      await this.loginPage.clearLoginForm();

      this.logStep(`Enter credentials for user: ${username}`);
      await this.loginPage.login(username, password);

      this.logStep('Wait for redirect after login');
      try {
        await this.page.waitForURL(/\/(home|dashboard|main|go\.aspx)/, { timeout: 15000 });
        logger.info('Successfully redirected after login');
      } catch {
        // If URL pattern doesn't match, check if we're not on login page
        const currentUrl = this.page.url();
        logger.info(`Current URL after login: ${currentUrl}`);
        if (currentUrl.includes('/login') || currentUrl.endsWith('/go.aspx')) {
          const actualTitle = await this.page.title();
          if (actualTitle === 'Login') {
            throw new Error('Still on login page - login may have failed');
          }
        }
      }

      this.logStep('Verify user is logged in');
      const isLoggedIn = await this.homePage.isUserLoggedIn();
      if (!isLoggedIn) {
        throw new Error('User is not logged in after successful login');
      }

      logger.info(`User ${username} successfully logged in`);
      this.logFeatureEnd('Successful completion of Login Scenario');
    } catch (error) {
      logger.error(`Login scenario failed: ${error}`);
      await this.takeScreenshot('login_failure');
      throw error;
    }
  }

  
  

  /**
   * Scenario: Perform successful login using ConfigReader credentials
   * Uses centralized config for URL and credentials
   */
  async performSuccessfulLoginWithConfigCreds(credentialKey: string = 'RBCClientUser'): Promise<void> {
    this.logFeatureStart('Successful Login Scenario (Config Credentials)');

    try {
      // Get credentials from ConfigReader
      const credentials = ConfigReader.getCredentials(credentialKey);

      this.logStep('Navigate to login page using ConfigReader');
      await this.page.goto(ConfigReader.getBaseUrl('QA'));

      this.logStep('Verify login page is loaded');
      await this.loginPage.verifyLoginPageLoaded();

      this.logStep('Clear any existing input');
      await this.loginPage.clearLoginForm();

      this.logStep(`Enter credentials for user: ${credentialKey}`);
      await this.loginPage.login(credentials.username, credentials.password);

      this.logStep('Wait for redirect after login');
      try {
        await this.page.waitForURL(/\/(home|dashboard|main|go\.aspx)/, { timeout: 15000 });
        logger.info('Successfully redirected after login');
      } catch {
        // If URL pattern doesn't match, check if we're not on login page
        const currentUrl = this.page.url();
        logger.info(`Current URL after login: ${currentUrl}`);
        if (currentUrl.includes('/login') || currentUrl.endsWith('/go.aspx')) {
          const actualTitle = await this.page.title();
          if (actualTitle === 'Login') {
            throw new Error('Still on login page - login may have failed');
          }
        }
      }

      this.logStep('Verify user is logged in');
      const isLoggedIn = await this.homePage.isUserLoggedIn();
      if (!isLoggedIn) {
        throw new Error('User is not logged in after successful login');
      }

      logger.info(`User ${credentialKey} (${credentials.username}) successfully logged in`);
      this.logFeatureEnd('Successful Login Scenario (Config Credentials)');
    } catch (error) {
      logger.error(`Login scenario with config credentials failed: ${error}`);
      await this.takeScreenshot('login_config_failure');
      throw error;
    }
  }

  /**
   * Scenario: Complete login and logout flow
   */
  async performLoginLogoutFlow(username: string, password: string): Promise<void> {
    this.logFeatureStart('Login-Logout Flow Scenario');

    try {
      this.logStep('Perform login');
      await this.performSuccessfulLogin(username, password);

      this.logStep('Wait for dashboard to stabilize');
      await this.wait(1000);

      this.logStep('Perform logout');
      await this.homePage.logout();

      this.logStep('Verify user is redirected to login page');
      await this.loginPage.verifyLoginPageLoaded();

      logger.info('Login-Logout flow completed successfully');
      this.logFeatureEnd('Login-Logout Flow Scenario');
    } catch (error) {
      logger.error(`Login-Logout flow failed: ${error}`);
      await this.takeScreenshot('login_logout_failure');
      throw error;
    }
  }
  


}
