import * as sql from 'mssql';
import { DatabaseConfig, QueryResult } from '../interfaces';
import { ConfigReader } from '../utilities/ConfigReader';
import { logger } from '../utilities/logger';

/**
 * DatabaseHelper - Centralized database connection and query execution
 * Provides connection pooling, error handling, and logging
 *
 * Usage:
 *   await DatabaseHelper.initialize();
 *   const result = await DatabaseHelper.executeQuery('SELECT * FROM Users');
 *   await DatabaseHelper.close();
 */
export class DatabaseHelper {
  private static pool: sql.ConnectionPool | null = null;
  private static config: DatabaseConfig | null = null;
  private static isInitializing: boolean = false;

  /**
   * Initialize database connection pool
   * Safe to call multiple times - will reuse existing connection
   */
  static async initialize(): Promise<void> {
    if (this.pool && this.pool.connected) {
      logger.info('Database pool already initialized and connected');
      return;
    }

    if (this.isInitializing) {
      logger.info('Database initialization already in progress, waiting...');
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;

    try {
      const config = ConfigReader.getDatabaseConfig();
      this.config = config;

      logger.info(`Initializing database connection to: ${config.server}:${config.port}`);
      logger.info(`Connection details:`);
      logger.info(`  - Server: ${config.server}`);
      logger.info(`  - Port: ${config.port}`);
      logger.info(`  - User: ${config.user}`);
      logger.info(`  - Password length: ${config.password?.length ?? 0}`);
      logger.info(`  - Encrypt: ${config.options?.encrypt ?? true}`);
      logger.info(`  - TrustServerCertificate: ${config.options?.trustServerCertificate ?? true}`);

      // Use config object without database (connects to default database)
      const mssqlConfig: sql.config = {
        server: config.server,
        port: config.port,
        user: config.user,
        password: config.password,
        options: {
          encrypt: config.options?.encrypt ?? false,
          trustServerCertificate: config.options?.trustServerCertificate ?? true,
          enableArithAbort: config.options?.enableArithAbort ?? true,
        },
        requestTimeout: config.options?.requestTimeout ?? 30000,
        connectionTimeout: config.options?.connectionTimeout ?? 15000,
        pool: {
          min: config.options?.pool?.min ?? 0,
          max: config.options?.pool?.max ?? 10,
          idleTimeoutMillis: (config.options?.pool as any)?.idleTimeoutMillis ?? 30000,
        },
      };

      logger.info(`Creating connection pool`);
      logger.info(`  - Server: ${config.server}:${config.port}`);
      logger.info(`  - User: ${config.user}`);

      this.pool = new sql.ConnectionPool(mssqlConfig);

      await this.pool.connect();

      logger.info('✓ Database connection pool initialized successfully');
      logger.info(`  - Server: ${config.server}:${config.port}`);
      logger.info(`  - Pool: ${config.options?.pool?.min ?? 0}-${config.options?.pool?.max ?? 10} connections`);

    } catch (error: any) {
      logger.error('❌ Failed to initialize database connection:', error);
      logger.error(`Error details: ${error.message}`);
      if (error.code) logger.error(`Error code: ${error.code}`);
      if (error.number) logger.error(`Error number: ${error.number}`);
      if (error.state) logger.error(`Error state: ${error.state}`);
      if (error.class) logger.error(`Error class: ${error.class}`);
      if (error.lineNumber) logger.error(`Line number: ${error.lineNumber}`);
      if (error.serverName) logger.error(`Server name: ${error.serverName}`);
      throw new Error(`Database initialization failed: ${error.message}`);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Get the connection pool (initialize if needed)
   */
  static async getPool(): Promise<sql.ConnectionPool> {
    if (!this.pool || !this.pool.connected) {
      await this.initialize();
    }
    return this.pool!;
  }

  /**
   * Execute a SELECT query
   * @param query - SQL query string
   * @param params - Query parameters (optional)
   * @returns Query result with recordset
   *
   * @example
   * const result = await DatabaseHelper.executeQuery('SELECT * FROM Users WHERE Username = @username', { username: 'john' });
   */
  static async executeQuery<T = any>(
    query: string,
    params?: Record<string, any>
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const pool = await this.getPool();

    try {
      const queryPreview = query.length > 150 ? query.substring(0, 150) + '...' : query;
      logger.info(`Executing query: ${queryPreview}`);

      const request = pool.request();

      // Add parameters if provided
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          request.input(key, value);
        }
        logger.info(`Query parameters: ${JSON.stringify(params)}`);
      }

      const result = await request.query<T>(query);

      const duration = Date.now() - startTime;
      logger.info(`✓ Query executed successfully in ${duration}ms. Rows returned: ${result.recordset.length}`);

      return result;
    } catch (error: any) {
      logger.error('❌ Query execution failed:', error);
      logger.error(`Query: ${query}`);
      logger.error(`Error message: ${error.message}`);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Execute a stored procedure
   * @param procedureName - Name of the stored procedure
   * @param params - Procedure parameters (optional)
   * @returns Query result
   *
   * @example
   * const result = await DatabaseHelper.executeStoredProcedure('sp_GetUserDetails', { userId: 123 });
   */
  static async executeStoredProcedure<T = any>(
    procedureName: string,
    params?: Record<string, any>
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const pool = await this.getPool();

    try {
      logger.info(`Executing stored procedure: ${procedureName}`);

      const request = pool.request();

      // Add parameters if provided
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          request.input(key, value);
        }
        logger.info(`SP parameters: ${JSON.stringify(params)}`);
      }

      const result = await request.execute<T>(procedureName);

      const duration = Date.now() - startTime;
      logger.info(`✓ Stored procedure executed in ${duration}ms`);

      return result;
    } catch (error: any) {
      logger.error('❌ Stored procedure execution failed:', error);
      logger.error(`Procedure: ${procedureName}`);
      logger.error(`Error message: ${error.message}`);
      throw new Error(`Stored procedure failed: ${error.message}`);
    }
  }

  /**
   * Execute an INSERT/UPDATE/DELETE query
   * @param query - SQL query string
   * @param params - Query parameters (optional)
   * @returns Number of rows affected
   *
   * @example
   * const rowsAffected = await DatabaseHelper.executeNonQuery('UPDATE Users SET IsActive = 1 WHERE UserId = @id', { id: 123 });
   */
  static async executeNonQuery(
    query: string,
    params?: Record<string, any>
  ): Promise<number> {
    const pool = await this.getPool();

    try {
      const queryPreview = query.length > 150 ? query.substring(0, 150) + '...' : query;
      logger.info(`Executing non-query: ${queryPreview}`);

      const request = pool.request();

      if (params) {
        for (const [key, value] of Object.entries(params)) {
          request.input(key, value);
        }
        logger.info(`Query parameters: ${JSON.stringify(params)}`);
      }

      const result = await request.query(query);
      const rowsAffected = result.rowsAffected[0];

      logger.info(`✓ Non-query executed. Rows affected: ${rowsAffected}`);

      return rowsAffected;
    } catch (error: any) {
      logger.error('❌ Non-query execution failed:', error);
      logger.error(`Query: ${query}`);
      logger.error(`Error message: ${error.message}`);
      throw new Error(`Database non-query failed: ${error.message}`);
    }
  }

  /**
   * Execute query and return single row
   * @param query - SQL query string
   * @param params - Query parameters (optional)
   * @returns Single row or null if no results
   *
   * @example
   * const user = await DatabaseHelper.querySingle('SELECT * FROM Users WHERE UserId = @id', { id: 123 });
   */
  static async querySingle<T = any>(
    query: string,
    params?: Record<string, any>
  ): Promise<T | null> {
    const result = await this.executeQuery<T>(query, params);
    return result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * Execute a transaction with multiple queries
   * @param queries - Array of query functions to execute
   * @returns Array of results
   *
   * @example
   * await DatabaseHelper.executeTransaction([
   *   (transaction) => transaction.request().query('INSERT INTO Users...'),
   *   (transaction) => transaction.request().query('UPDATE Audit...')
   * ]);
   */
  static async executeTransaction(
    queries: Array<(transaction: sql.Transaction) => Promise<any>>
  ): Promise<any[]> {
    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);

    try {
      logger.info('Starting database transaction');
      await transaction.begin();

      const results = [];
      for (let i = 0; i < queries.length; i++) {
        logger.info(`Executing transaction query ${i + 1}/${queries.length}`);
        const result = await queries[i](transaction);
        results.push(result);
      }

      await transaction.commit();
      logger.info('✓ Transaction committed successfully');

      return results;
    } catch (error: any) {
      logger.error('❌ Transaction failed, rolling back:', error);
      await transaction.rollback();
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Close database connection pool
   * Should be called in global teardown
   */
  static async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close();
        this.pool = null;
        this.config = null;
        logger.info('✓ Database connection pool closed');
      } catch (error: any) {
        logger.error('Error closing database pool:', error);
      }
    }
  }

  /**
   * Check if database connection is alive
   * @returns true if connected, false otherwise
   */
  static async isConnected(): Promise<boolean> {
    try {
      if (!this.pool || !this.pool.connected) {
        return false;
      }
      await this.pool.request().query('SELECT 1 AS HealthCheck');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test database connection
   * Useful for debugging connection issues
   */
  static async testConnection(): Promise<void> {
    logger.info('Testing database connection...');

    try {
      const isConnected = await this.isConnected();

      if (!isConnected) {
        throw new Error('Database connection test failed');
      }

      const result = await this.querySingle<{ CurrentTime: Date, DatabaseName: string }>(
        'SELECT GETDATE() AS CurrentTime, DB_NAME() AS DatabaseName'
      );

      logger.info('✓ Database connection test passed');
      logger.info(`  - Current Time: ${result?.CurrentTime}`);
      logger.info(`  - Database: ${result?.DatabaseName}`);

    } catch (error: any) {
      logger.error('❌ Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Get current configuration (without password)
   */
  static getConfigInfo(): any {
    if (!this.config) {
      return null;
    }

    return {
      server: this.config.server,
      port: this.config.port,
      user: this.config.user,
      isConnected: this.pool?.connected ?? false,
    };
  }
}
