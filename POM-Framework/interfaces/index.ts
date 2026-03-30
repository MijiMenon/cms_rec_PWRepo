import { Page } from '@playwright/test';

/**
 * Test data interface for login scenarios
 */
export interface LoginTestData {
  testCase: string;
  username: string;
  password: string;
  expectedResult: 'success' | 'failure';
  errorMessage?: string;
}

/**
 * Test data interface for user information
 */
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: AddressData;
}

/**
 * Address data interface
 */
export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Test context interface for fixtures
 */
export interface TestContext {
  page: Page;
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  level: string;
  logToFile: boolean;
  logFilePath: string;
}

/**
 * Screenshot options interface
 */
export interface ScreenshotOptions {
  path?: string;
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
  quality?: number;
}

/**
 * Data reader options interface
 */
export interface DataReaderOptions {
  filePath: string;
  sheetName?: string;
  hasHeader?: boolean;
}

/**
 * Generic test data type
 */
export type TestData = Record<string, any>;

/**
 * Test result status type
 */
export type TestStatus = 'passed' | 'failed' | 'skipped' | 'pending';

/**
 * Browser type
 */
export type BrowserType = 'chromium' | 'firefox' | 'webkit';

/**
 * Wait condition type
 */
export type WaitCondition = 'visible' | 'hidden' | 'attached' | 'detached';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  server: string;
  port: number; // Parsed from server string if in "server,port" format, or from DB_PORT
  database?: string; // Optional - if not provided, connects to user's default database
  user: string;
  password: string;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
    requestTimeout?: number;
    connectionTimeout?: number;
    pool?: {
      min?: number;
      max?: number;
      idleTimeoutMillis?: number;
    };
    enableArithAbort?: boolean;
  };
}

/**
 * Database query result interface
 */
export interface QueryResult<T = any> {
  recordset: T[];
  recordsets: T[][];
  rowsAffected: number[];
}
