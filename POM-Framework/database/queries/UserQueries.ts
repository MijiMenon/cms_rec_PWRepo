import { DatabaseHelper } from '../DatabaseHelper';
import { logger } from '../../utilities/logger';

/**
 * UserQueries - SQL queries related to users
 * Contains all database operations for user management
 */
export class UserQueries {

  /**
   * Get user by username
   * @param username - The username to search for
   * @returns User record or null if not found
   *
   * @example
   * const user = await UserQueries.getUserByUsername('john.doe');
   */
  static async getUserByUsername(username: string): Promise<any> {
    logger.info(`Fetching user: ${username}`);

    const query = `
      SELECT
        UserID,
        Username,
        Email,
        FirstName,
        LastName,
        Role,
        IsActive,
        CreatedDate,
        LastLoginDate
      FROM Users
      WHERE Username = @username
    `;

    return await DatabaseHelper.querySingle(query, { username });
  }

  /**
   * Get user by user ID
   * @param userId - The user ID
   * @returns User record or null if not found
   *
   * @example
   * const user = await UserQueries.getUserById(12345);
   */
  static async getUserById(userId: number): Promise<any> {
    logger.info(`Fetching user with ID: ${userId}`);

    const query = `
      SELECT
        UserID,
        Username,
        Email,
        FirstName,
        LastName,
        Role,
        IsActive,
        CreatedDate,
        LastLoginDate
      FROM Users
      WHERE UserID = @userId
    `;

    return await DatabaseHelper.querySingle(query, { userId });
  }

  /**
   * Get user by email
   * @param email - The email address
   * @returns User record or null if not found
   *
   * @example
   * const user = await UserQueries.getUserByEmail('john.doe@example.com');
   */
  static async getUserByEmail(email: string): Promise<any> {
    logger.info(`Fetching user by email: ${email}`);

    const query = `
      SELECT
        UserID,
        Username,
        Email,
        FirstName,
        LastName,
        Role,
        IsActive
      FROM Users
      WHERE Email = @email
    `;

    return await DatabaseHelper.querySingle(query, { email });
  }

  /**
   * Get user role
   * @param username - The username
   * @returns User role or null if user not found
   *
   * @example
   * const role = await UserQueries.getUserRole('john.doe');
   */
  static async getUserRole(username: string): Promise<string | null> {
    const user = await this.getUserByUsername(username);
    return user?.Role || null;
  }

  /**
   * Check if user is active
   * @param username - The username to check
   * @returns true if user is active, false otherwise
   *
   * @example
   * const isActive = await UserQueries.isUserActive('john.doe');
   */
  static async isUserActive(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return user?.IsActive === true || user?.IsActive === 1;
  }

  /**
   * Get all users by role
   * @param role - The role to filter by (e.g., 'Admin', 'User', 'Manager')
   * @returns Array of users with the specified role
   *
   * @example
   * const admins = await UserQueries.getUsersByRole('Admin');
   */
  static async getUsersByRole(role: string): Promise<any[]> {
    logger.info(`Fetching users with role: ${role}`);

    const query = `
      SELECT
        UserID,
        Username,
        Email,
        FirstName,
        LastName,
        Role,
        IsActive
      FROM Users
      WHERE Role = @role
      ORDER BY Username
    `;

    const result = await DatabaseHelper.executeQuery(query, { role });
    return result.recordset;
  }

  /**
   * Get all active users
   * @returns Array of active users
   *
   * @example
   * const activeUsers = await UserQueries.getActiveUsers();
   */
  static async getActiveUsers(): Promise<any[]> {
    logger.info('Fetching all active users');

    const query = `
      SELECT
        UserID,
        Username,
        Email,
        FirstName,
        LastName,
        Role,
        LastLoginDate
      FROM Users
      WHERE IsActive = 1
      ORDER BY Username
    `;

    const result = await DatabaseHelper.executeQuery(query);
    return result.recordset;
  }

  /**
   * Update user's last login date
   * @param username - The username
   * @returns Number of rows affected
   *
   * @example
   * await UserQueries.updateLastLoginDate('john.doe');
   */
  static async updateLastLoginDate(username: string): Promise<number> {
    logger.info(`Updating last login date for user: ${username}`);

    const query = `
      UPDATE Users
      SET LastLoginDate = GETDATE()
      WHERE Username = @username
    `;

    return await DatabaseHelper.executeNonQuery(query, { username });
  }

  /**
   * Update user status (activate/deactivate)
   * @param username - The username
   * @param isActive - true to activate, false to deactivate
   * @returns Number of rows affected
   *
   * @example
   * await UserQueries.updateUserStatus('john.doe', false);
   */
  static async updateUserStatus(username: string, isActive: boolean): Promise<number> {
    logger.info(`Updating user status for ${username} to: ${isActive ? 'Active' : 'Inactive'}`);

    const query = `
      UPDATE Users
      SET IsActive = @isActive, ModifiedDate = GETDATE()
      WHERE Username = @username
    `;

    return await DatabaseHelper.executeNonQuery(query, { username, isActive: isActive ? 1 : 0 });
  }

  /**
   * Check if user exists by username
   * @param username - The username to check
   * @returns true if user exists, false otherwise
   *
   * @example
   * const exists = await UserQueries.userExists('john.doe');
   */
  static async userExists(username: string): Promise<boolean> {
    logger.info(`Checking if user exists: ${username}`);

    const query = `
      SELECT COUNT(*) as UserCount
      FROM Users
      WHERE Username = @username
    `;

    const result = await DatabaseHelper.querySingle<{ UserCount: number }>(
      query,
      { username }
    );

    return (result?.UserCount || 0) > 0;
  }

  /**
   * Get user's full name
   * @param username - The username
   * @returns Full name (FirstName + LastName) or null
   *
   * @example
   * const fullName = await UserQueries.getUserFullName('john.doe');
   */
  static async getUserFullName(username: string): Promise<string | null> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return null;
    }
    return `${user.FirstName || ''} ${user.LastName || ''}`.trim();
  }

  /**
   * Get user count by role
   * @param role - The role to count (optional, if not provided returns total count)
   * @returns Number of users with the specified role
   *
   * @example
   * const adminCount = await UserQueries.getUserCount('Admin');
   */
  static async getUserCount(role?: string): Promise<number> {
    let query = `
      SELECT COUNT(*) as UserCount
      FROM Users
    `;

    const params: any = {};

    if (role) {
      query += ' WHERE Role = @role';
      params.role = role;
      logger.info(`Counting users with role: ${role}`);
    } else {
      logger.info('Counting all users');
    }

    const result = await DatabaseHelper.querySingle<{ UserCount: number }>(query, params);
    return result?.UserCount || 0;
  }

  /**
   * Get recently logged in users
   * @param days - Number of days to look back (default: 7)
   * @returns Array of users who logged in within the specified days
   *
   * @example
   * const recentUsers = await UserQueries.getRecentlyLoggedInUsers(7);
   */
  static async getRecentlyLoggedInUsers(days: number = 7): Promise<any[]> {
    logger.info(`Fetching users who logged in within last ${days} days`);

    const query = `
      SELECT
        UserID,
        Username,
        Email,
        FirstName,
        LastName,
        Role,
        LastLoginDate
      FROM Users
      WHERE LastLoginDate >= DATEADD(day, -@days, GETDATE())
      ORDER BY LastLoginDate DESC
    `;

    const result = await DatabaseHelper.executeQuery(query, { days });
    return result.recordset;
  }

  /**
   * Search users by name (FirstName or LastName)
   * @param searchTerm - Search term to match against names
   * @returns Array of matching users
   *
   * @example
   * const users = await UserQueries.searchUsersByName('John');
   */
  static async searchUsersByName(searchTerm: string): Promise<any[]> {
    logger.info(`Searching users by name: ${searchTerm}`);

    const query = `
      SELECT
        UserID,
        Username,
        Email,
        FirstName,
        LastName,
        Role,
        IsActive
      FROM Users
      WHERE FirstName LIKE @searchTerm OR LastName LIKE @searchTerm
      ORDER BY FirstName, LastName
    `;

    const result = await DatabaseHelper.executeQuery(query, {
      searchTerm: `%${searchTerm}%`
    });
    return result.recordset;
  }

  /**
   * Get user statistics
   * @returns Summary statistics for users
   *
   * @example
   * const stats = await UserQueries.getUserStatistics();
   */
  static async getUserStatistics(): Promise<any> {
    logger.info('Fetching user statistics');

    const query = `
      SELECT
        COUNT(*) as TotalUsers,
        SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as ActiveUsers,
        SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) as InactiveUsers,
        COUNT(DISTINCT Role) as TotalRoles
      FROM Users
    `;

    return await DatabaseHelper.querySingle(query);
  }
}
