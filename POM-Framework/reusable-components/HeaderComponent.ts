import { Page } from '@playwright/test';
import { BaseComponent } from './base/BaseComponent';
import { logger } from '../utilities/logger';

/**
 * HeaderComponent - Reusable header/navigation component
 */
export class HeaderComponent extends BaseComponent {
  // Locators (relative to header root)
  private readonly logo = '.logo, .brand';
  private readonly homeLink = 'a[href*="home"], .nav-home';
  private readonly productsLink = 'a[href*="products"], .nav-products';
  private readonly aboutLink = 'a[href*="about"], .nav-about';
  private readonly contactLink = 'a[href*="contact"], .nav-contact';
  private readonly userMenu = '.user-menu, .profile-dropdown';
  private readonly logoutLink = 'a:has-text("Logout")';
  private readonly searchIcon = '.search-icon, button[aria-label="Search"]';

  constructor(page: Page) {
    // Header is typically at the top of the page
    super(page, 'header, .header, .navbar, nav');
  }

  /**
   * Click logo to go home
   */
  async clickLogo(): Promise<void> {
    logger.info('Clicking header logo');
    await this.click(this.logo);
  }

  /**
   * Navigate to home
   */
  async navigateToHome(): Promise<void> {
    logger.info('Navigating to home via header');
    await this.click(this.homeLink);
  }

  /**
   * Navigate to products
   */
  async navigateToProducts(): Promise<void> {
    logger.info('Navigating to products via header');
    await this.click(this.productsLink);
  }

  /**
   * Navigate to about page
   */
  async navigateToAbout(): Promise<void> {
    logger.info('Navigating to about via header');
    await this.click(this.aboutLink);
  }

  /**
   * Navigate to contact page
   */
  async navigateToContact(): Promise<void> {
    logger.info('Navigating to contact via header');
    await this.click(this.contactLink);
  }

  /**
   * Open user menu
   */
  async openUserMenu(): Promise<void> {
    logger.info('Opening user menu');
    await this.click(this.userMenu);
  }

  /**
   * Logout from header
   */
  async logout(): Promise<void> {
    logger.info('Logging out via header');
    await this.openUserMenu();
    await this.click(this.logoutLink);
  }

  /**
   * Click search icon
   */
  async clickSearch(): Promise<void> {
    logger.info('Clicking search icon in header');
    await this.click(this.searchIcon);
  }

  /**
   * Verify header is visible
   */
  async verifyHeaderVisible(): Promise<boolean> {
    return await this.isLoaded();
  }

  /**
   * Get logo text
   */
  async getLogoText(): Promise<string> {
    return await this.getText(this.logo);
  }
}
