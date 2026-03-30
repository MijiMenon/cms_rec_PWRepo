import { testConfig } from '../../POM-Tests/test.config';
import {
  TestEnvironmentConfig,
  DomainPaths,
  Credentials,
  UrlConfig,
} from '../../POM-Tests/test.config';
import { logger } from './logger';

/**
 * ConfigReader - Centralized configuration reader for test data
 * Provides access to environment-specific URLs, domain paths, and credentials
 * Follows the DataProvider pattern with caching and logging
 */
export class ConfigReader {
  private static cache: Map<string, any> = new Map();
  private static cacheEnabled: boolean = true;
  private static currentEnvironment: string | null = null;

  /**
   * Enable or disable caching
   */
  static setCaching(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
    logger.info(`ConfigReader caching ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clear the configuration cache
   */
  static clearCache(): void {
    this.cache.clear();
    this.currentEnvironment = null;
    logger.info('ConfigReader cache cleared');
  }

  /**
   * Get the current environment name
   * Priority: 1) Explicitly set, 2) TEST_ENV env var, 3) Default to 'QA'
   */
  static getEnvironmentName(): string {
    if (this.currentEnvironment) {
      return this.currentEnvironment;
    }

    const envName = process.env.TEST_ENV || 'QA';
    logger.info(`Current test environment: ${envName}`);
    return envName;
  }

  /**
   * Set the current environment explicitly
   */
  static setEnvironment(envName: string): void {
    if (!this.hasEnvironment(envName)) {
      const available = this.getAvailableEnvironments().join(', ');
      throw new Error(
        `Environment "${envName}" not found. Available environments: ${available}`
      );
    }
    this.currentEnvironment = envName;
    this.clearCache(); // Clear cache when environment changes
    logger.info(`Environment set to: ${envName}`);
  }

  /**
   * Get environment configuration
   */
  static getEnvironmentConfig(envName?: string): TestEnvironmentConfig {
    const env = envName || this.getEnvironmentName();
    const cacheKey = `env_${env}`;

    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (!testConfig.environments[env]) {
      const available = this.getAvailableEnvironments().join(', ');
      throw new Error(
        `Environment "${env}" not found in test.config.ts. Available: ${available}`
      );
    }

    const config = testConfig.environments[env];

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, config);
    }

    return config;
  }

  /**
   * Check if environment exists
   */
  static hasEnvironment(envName: string): boolean {
    return envName in testConfig.environments;
  }

  /**
   * Get list of available environments
   */
  static getAvailableEnvironments(): string[] {
    return Object.keys(testConfig.environments);
  }

  /**
   * Build base URL from URL config
   * Pattern: {protocol}://{envPrefix}repohighway.{domain}
   * Example: https://qa2repohighway.devservices.dh.com
   */
  static buildBaseUrl(urlConfig: UrlConfig, envPrefixOverride?: string): string {
    const prefix = envPrefixOverride || process.env.ENV_PREFIX || urlConfig.envPrefix;
    const subdomain = process.env.SUBDOMAIN || urlConfig.subdomain;
    const domain = urlConfig.domain;

    // Construct: protocol://prefix+subdomain.domain
    // e.g., https://qa2repohighway.devservices.dh.com
    const baseUrl = `${urlConfig.protocol}://${prefix}${subdomain}.${domain}`;

    logger.info(`Built base URL: ${baseUrl} (prefix: ${prefix}, subdomain: ${subdomain})`);
    return baseUrl;
  }

  /**
   * Get base URL for environment
   * Priority: 1) BASE_URL env var, 2) Built from urlConfig, 3) Legacy baseUrl
   */
  static getBaseUrl(envName?: string): string {
    // Environment variable override (highest priority)
    if (process.env.BASE_URL) {
      logger.info(`Using BASE_URL from environment: ${process.env.BASE_URL}`);
      return process.env.BASE_URL;
    }

    const config = this.getEnvironmentConfig(envName);

    // Build from urlConfig (preferred method)
    if (config.urlConfig) {
      return this.buildBaseUrl(config.urlConfig);
    }

    // Fallback to legacy baseUrl (for local/other configs)
    if (config.baseUrl) {
      logger.warn(`Using legacy baseUrl for ${config.name}. Consider migrating to urlConfig.`);
      return config.baseUrl;
    }

    throw new Error(`No baseUrl or urlConfig found for environment: ${config.name}`);
  }

  /**
   * Get domain path for a specific key
   */
  static getDomainPath(pathKey: string, envName?: string): string {
    const config = this.getEnvironmentConfig(envName);
    const path = config.domainPaths[pathKey as keyof DomainPaths];

    if (!path) {
      const availablePaths = Object.keys(config.domainPaths).join(', ');
      throw new Error(
        `Domain path "${pathKey}" not found for environment "${config.name}". Available paths: ${availablePaths}`
      );
    }

    return path;
  }

  /**
   * Get complete URL (base URL + domain path)
   * This is the main method for constructing URLs in tests
   */
  static getUrl(pathKey: string, envName?: string): string {
    const baseUrl = this.getBaseUrl(envName);
    const path = this.getDomainPath(pathKey, envName);

    // Remove trailing slash from base URL if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    const fullUrl = `${cleanBaseUrl}${cleanPath}`;
    logger.info(`Constructed URL for "${pathKey}": ${fullUrl}`);

    return fullUrl;
  }

  /**
   * Get all domain paths for environment
   */
  static getAllDomainPaths(envName?: string): DomainPaths {
    const config = this.getEnvironmentConfig(envName);
    return config.domainPaths;
  }

  /**
   * Get credentials by key
   * Supports environment variable overrides for username and password
   */
  static getCredentials(credentialKey: string, envName?: string): Credentials {
    const config = this.getEnvironmentConfig(envName);
    const credentials = config.credentials[credentialKey];

    if (!credentials) {
      const availableKeys = Object.keys(config.credentials).join(', ');
      throw new Error(
        `Credentials "${credentialKey}" not found for environment "${config.name}". Available: ${availableKeys}`
      );
    }

    // Check for environment variable overrides
    const envKeyPrefix = credentialKey.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const usernameOverride = process.env[`${envKeyPrefix}_USERNAME`];
    const passwordOverride = process.env[`${envKeyPrefix}_PASSWORD`];

    const finalCredentials = {
      username: usernameOverride || credentials.username,
      password: passwordOverride || credentials.password,
    };

    if (usernameOverride) {
      logger.info(
        `Using username override from environment for "${credentialKey}": ${usernameOverride}`
      );
    }
    if (passwordOverride) {
      logger.info(
        `Using password override from environment for "${credentialKey}"`
      );
    }

    logger.info(
      `Retrieved credentials for: ${credentialKey} (username: ${finalCredentials.username})`
    );

    return finalCredentials;
  }

  /**
   * Get all credentials for environment
   */
  static getAllCredentials(envName?: string): Record<string, Credentials> {
    const config = this.getEnvironmentConfig(envName);
    return config.credentials;
  }

  /**
   * Check if credentials exist
   */
  static hasCredentials(credentialKey: string, envName?: string): boolean {
    const config = this.getEnvironmentConfig(envName);
    return credentialKey in config.credentials;
  }

  /**
   * Get list of available credential keys
   */
  static getAvailableCredentialKeys(envName?: string): string[] {
    const config = this.getEnvironmentConfig(envName);
    return Object.keys(config.credentials);
  }

  /**
   * Validate configuration structure
   * Returns true if valid, throws error if invalid
   */
  static validateConfig(): boolean {
    logger.info('Validating test configuration...');

    const environments = this.getAvailableEnvironments();

    if (environments.length === 0) {
      throw new Error('No environments defined in test.config.ts');
    }

    for (const envName of environments) {
      const config = testConfig.environments[envName];

      // Check required fields
      if (!config.name) {
        throw new Error(`Environment "${envName}" missing required field: name`);
      }

      if (!config.baseUrl) {
        throw new Error(
          `Environment "${envName}" missing required field: baseUrl`
        );
      }

      if (!config.domainPaths) {
        throw new Error(
          `Environment "${envName}" missing required field: domainPaths`
        );
      }

      if (!config.credentials) {
        throw new Error(
          `Environment "${envName}" missing required field: credentials`
        );
      }

      // Validate urlConfig if present
      if (config.urlConfig) {
        if (!config.urlConfig.protocol) {
          throw new Error(`Environment "${envName}" urlConfig missing required field: protocol`);
        }
        if (!config.urlConfig.envPrefix) {
          throw new Error(`Environment "${envName}" urlConfig missing required field: envPrefix`);
        }
        if (!config.urlConfig.subdomain) {
          throw new Error(`Environment "${envName}" urlConfig missing required field: subdomain`);
        }
        if (!config.urlConfig.domain) {
          throw new Error(`Environment "${envName}" urlConfig missing required field: domain`);
        }
      }

      // Check domain paths are not empty
      const pathKeys = Object.keys(config.domainPaths);
      if (pathKeys.length === 0) {
        throw new Error(
          `Environment "${envName}" has no domain paths defined`
        );
      }

      // Check credentials are not empty
      const credentialKeys = Object.keys(config.credentials);
      if (credentialKeys.length === 0) {
        throw new Error(
          `Environment "${envName}" has no credentials defined`
        );
      }

      // Validate each credential has username and password
      for (const credKey of credentialKeys) {
        const cred = config.credentials[credKey];
        if (!cred.username || !cred.password) {
          throw new Error(
            `Credentials "${credKey}" in environment "${envName}" missing username or password`
          );
        }
      }
    }

    logger.info('Configuration validation passed');
    return true;
  }

  /**
   * Log current configuration summary
   */
  static logConfigSummary(): void {
    const env = this.getEnvironmentName();
    const config = this.getEnvironmentConfig(env);

    logger.info('=== Configuration Summary ===');
    logger.info(`Environment: ${config.name}`);
    logger.info(`Base URL: ${config.baseUrl}`);
    logger.info(
      `Domain Paths: ${Object.keys(config.domainPaths).length} defined`
    );
    logger.info(
      `Credentials: ${Object.keys(config.credentials).length} users defined`
    );
    logger.info(
      `Credential Keys: ${Object.keys(config.credentials).join(', ')}`
    );
    logger.info('=============================');
  }

  /**
   * Get database configuration from environment variables
   *
   * Required environment variables:
   * - DB_SERVER: Database server address (can include port as "server,port")
   * - DB_USER: Database username
   * - DB_PASSWORD: Database password
   *
   * Optional environment variables:
   * - DB_PORT: Database port (default: 1558, ignored if port is in DB_SERVER)
   * - DB_ENCRYPT: Enable encryption (default: true)
   * - DB_TRUST_SERVER_CERTIFICATE: Trust server certificate (default: true)
   * - DB_REQUEST_TIMEOUT: Request timeout in ms (default: 30000)
   * - DB_CONNECTION_TIMEOUT: Connection timeout in ms (default: 15000)
   * - DB_POOL_MIN: Minimum pool size (default: 0)
   * - DB_POOL_MAX: Maximum pool size (default: 10)
   * - DB_POOL_IDLE_TIMEOUT: Pool idle timeout in ms (default: 30000)
   *
   * Note: Database name is not specified - connection uses the default database for the user
   *
   * @returns DatabaseConfig object
   * @throws Error if required configuration is missing
   */
  static getDatabaseConfig(): any {
    const server = process.env.DB_SERVER;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;

    if (!server || !user || !password) {
      const missing = [];
      if (!server) missing.push('DB_SERVER');
      if (!user) missing.push('DB_USER');
      if (!password) missing.push('DB_PASSWORD');

      throw new Error(
        `Missing required database configuration: ${missing.join(', ')}. ` +
        `Please check your .env file.`
      );
    }

    // Parse server string if it contains port in format "server,port"
    let actualServer = server;
    let actualPort = parseInt(process.env.DB_PORT || '1558');

    if (server.includes(',')) {
      const parts = server.split(',');
      actualServer = parts[0];
      actualPort = parseInt(parts[1]);
    }

    const config = {
      server: actualServer,
      port: actualPort,
      user,
      password,
      options: {
        encrypt: process.env.DB_ENCRYPT !== 'false', // default true
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false', // default true (matches reference)
        requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '30000'),
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '15000'),
        pool: {
          min: parseInt(process.env.DB_POOL_MIN || '0'), // default 0 (matches reference)
          max: parseInt(process.env.DB_POOL_MAX || '10'),
          idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'), // matches reference
        },
        enableArithAbort: true,
      },
    };

    logger.info(`Database config loaded for: ${config.server}:${config.port}`);
    return config;
  }
}
