import { logger } from './logger';

/**
 * Common helper utilities
 */
export class Helpers {
  /**
   * Generate random string
   */
  static generateRandomString(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Generate random email
   */
  static generateRandomEmail(): string {
    const randomStr = this.generateRandomString(8);
    return `test_${randomStr}@example.com`;
  }

  /**
   * Generate random phone number
   */
  static generateRandomPhone(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    return `${areaCode}-${prefix}-${lineNumber}`;
  }

  /**
   * Format date to string
   */
  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  }

  /**
   * Sleep/wait utility
   */
  static async sleep(milliseconds: number): Promise<void> {
    logger.info(`Sleeping for ${milliseconds}ms`);
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        const waitTime = delay * Math.pow(2, i);
        logger.warn(`Retry attempt ${i + 1}/${maxRetries} failed. Waiting ${waitTime}ms...`);
        await this.sleep(waitTime);
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Check if string is valid email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize string for filename
   */
  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Get current timestamp
   */
  static getTimestamp(): string {
    return new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  }

  /**
   * Get run folder name with date and timestamp
   * Format: YYYY-MM-DD_HH-MM-SS
   */
  static getRunFolderName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  /**
   * Parse boolean from string
   */
  static parseBoolean(value: string): boolean {
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Wait for condition to be true
   */
  static async waitForCondition(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 10000,
    interval: number = 500
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.sleep(interval);
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }
}
