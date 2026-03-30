import { DatabaseHelper } from '../DatabaseHelper';
import { logger } from '../../utilities/logger';

/**
 * AssignmentQueries - SQL queries related to assignments
 * Contains all database operations for assignment management
 */
export class AssignmentQueries {

  /**
   * Get assignment by contract number
   * @param contractNumber - The contract number to search for
   * @returns Assignment record or null if not found
   *
   * @example
   * const contractID = await AssignmentQueries.getContractNumberFromLoanNumber('BNS_143147');
   */
  static async getContractNumberFromLoanNumber(loanNumber: string): Promise<any> {
    logger.info(`Fetching contractID for Assignment: ${loanNumber}`);

    const query = 
      `select R.contractnumber 
      from [RMS].[dbo].[Inventory] R  join 
      RMS.Assignment.Account A 
      on R.AccountCode=A.DebtorAccountId 
      where A.accountnumber = @loanNumber`
    ;
    return await DatabaseHelper.querySingle(query, { loanNumber });
  }

  /**
   * Get all assignments by status
   * @param status - Assignment status (e.g., 'Active', 'Completed', 'Pending')
   * @returns Array of assignments with the specified status
   *
   * @example
   * const activeAssignments = await AssignmentQueries.getAssignmentsByStatus('Active');
   */
  static async getAssignmentsByStatus(status: string): Promise<any[]> {
    logger.info(`Fetching assignments with status: ${status}`);

    const query = `
      SELECT
        AssignmentID,
        ContractNumber,
        Status,
        CreatedDate,
        AssignedTo,
        Priority
      FROM Assignments
      WHERE Status = @status
      ORDER BY CreatedDate DESC
    `;

    const result = await DatabaseHelper.executeQuery(query, { status });
    return result.recordset;
  }

  /**
   * Get assignments created within a date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Array of assignments created in the date range
   *
   * @example
   * const assignments = await AssignmentQueries.getAssignmentsByDateRange('2026-03-01', '2026-03-31');
   */
  static async getAssignmentsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    logger.info(`Fetching assignments between ${startDate} and ${endDate}`);

    const query = `
      SELECT
        AssignmentID,
        ContractNumber,
        Status,
        CreatedDate,
        AssignedTo
      FROM Assignments
      WHERE CreatedDate BETWEEN @startDate AND @endDate
      ORDER BY CreatedDate DESC
    `;

    const result = await DatabaseHelper.executeQuery(query, { startDate, endDate });
    return result.recordset;
  }

  /**
   * Get assignment details by Assignment ID
   * @param assignmentId - The assignment ID
   * @returns Full assignment details
   *
   * @example
   * const details = await AssignmentQueries.getAssignmentById(12345);
   */
  static async getAssignmentById(assignmentId: number): Promise<any> {
    logger.info(`Fetching assignment with ID: ${assignmentId}`);

    const query = `
      SELECT
        AssignmentID,
        ContractNumber,
        Status,
        Priority,
        Recipient,
        Reason,
        CreatedDate,
        ModifiedDate,
        AssignedTo,
        CreatedBy
      FROM Assignments
      WHERE AssignmentID = @assignmentId
    `;

    return await DatabaseHelper.querySingle(query, { assignmentId });
  }

  /**
   * Update assignment status
   * @param assignmentId - The assignment ID to update
   * @param newStatus - The new status value
   * @returns Number of rows affected
   *
   * @example
   * const rowsAffected = await AssignmentQueries.updateAssignmentStatus(12345, 'Completed');
   */
  static async updateAssignmentStatus(
    assignmentId: number,
    newStatus: string
  ): Promise<number> {
    logger.info(`Updating assignment ${assignmentId} to status: ${newStatus}`);

    const query = `
      UPDATE Assignments
      SET Status = @newStatus, ModifiedDate = GETDATE()
      WHERE AssignmentID = @assignmentId
    `;

    return await DatabaseHelper.executeNonQuery(query, { assignmentId, newStatus });
  }

  /**
   * Get assignment count by date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Total count of assignments in date range
   *
   * @example
   * const count = await AssignmentQueries.getAssignmentCountByDateRange('2026-03-01', '2026-03-31');
   */
  static async getAssignmentCountByDateRange(
    startDate: string,
    endDate: string
  ): Promise<number> {
    logger.info(`Counting assignments between ${startDate} and ${endDate}`);

    const query = `
      SELECT COUNT(*) as AssignmentCount
      FROM Assignments
      WHERE CreatedDate BETWEEN @startDate AND @endDate
    `;

    const result = await DatabaseHelper.querySingle<{ AssignmentCount: number }>(
      query,
      { startDate, endDate }
    );

    return result?.AssignmentCount || 0;
  }

  /**
   * Get assignments by assigned user
   * @param assignedTo - Username or user ID
   * @returns Array of assignments assigned to the user
   *
   * @example
   * const myAssignments = await AssignmentQueries.getAssignmentsByUser('john.doe');
   */
  static async getAssignmentsByUser(assignedTo: string): Promise<any[]> {
    logger.info(`Fetching assignments for user: ${assignedTo}`);

    const query = `
      SELECT
        AssignmentID,
        ContractNumber,
        Status,
        Priority,
        CreatedDate
      FROM Assignments
      WHERE AssignedTo = @assignedTo
      ORDER BY CreatedDate DESC
    `;

    const result = await DatabaseHelper.executeQuery(query, { assignedTo });
    return result.recordset;
  }

  /**
   * Get assignments by priority
   * @param priority - Priority level (e.g., 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW')
   * @returns Array of assignments with specified priority
   *
   * @example
   * const criticalAssignments = await AssignmentQueries.getAssignmentsByPriority('CRITICAL');
   */
  static async getAssignmentsByPriority(priority: string): Promise<any[]> {
    logger.info(`Fetching assignments with priority: ${priority}`);

    const query = `
      SELECT
        AssignmentID,
        ContractNumber,
        Status,
        Priority,
        CreatedDate,
        AssignedTo
      FROM Assignments
      WHERE Priority = @priority
      ORDER BY CreatedDate DESC
    `;

    const result = await DatabaseHelper.executeQuery(query, { priority });
    return result.recordset;
  }

  /**
   * Check if assignment exists by contract number
   * @param contractNumber - The contract number to check
   * @returns true if assignment exists, false otherwise
   *
   * @example
   * const exists = await AssignmentQueries.assignmentExists('BNS_143147');
   */
  static async assignmentExists(contractNumber: string): Promise<boolean> {
    logger.info(`Checking if assignment exists for contract: ${contractNumber}`);

    const query = `
      SELECT COUNT(*) as AssignmentCount
      FROM Assignments
      WHERE ContractNumber = @contractNumber
    `;

    const result = await DatabaseHelper.querySingle<{ AssignmentCount: number }>(
      query,
      { contractNumber }
    );

    return (result?.AssignmentCount || 0) > 0;
  }

  /**
   * Delete test assignments (for test cleanup)
   * @param contractNumberPattern - Pattern to match test assignments (e.g., 'TEST%')
   * @returns Number of rows deleted
   *
   * @example
   * const deleted = await AssignmentQueries.deleteTestAssignments('TEST');
   */
  static async deleteTestAssignments(contractNumberPattern: string): Promise<number> {
    logger.warn(`Deleting test assignments matching: ${contractNumberPattern}%`);

    const query = `
      DELETE FROM Assignments
      WHERE ContractNumber LIKE @pattern
    `;

    return await DatabaseHelper.executeNonQuery(query, {
      pattern: `${contractNumberPattern}%`
    });
  }

  /**
   * Get latest assignment
   * @returns Most recently created assignment
   *
   * @example
   * const latest = await AssignmentQueries.getLatestAssignment();
   */
  static async getLatestAssignment(): Promise<any> {
    logger.info('Fetching latest assignment');

    const query = `
      SELECT TOP 1
        AssignmentID,
        ContractNumber,
        Status,
        Priority,
        CreatedDate,
        AssignedTo
      FROM Assignments
      ORDER BY CreatedDate DESC
    `;

    return await DatabaseHelper.querySingle(query);
  }

  /**
   * Get assignment statistics
   * @returns Summary statistics for assignments
   *
   * @example
   * const stats = await AssignmentQueries.getAssignmentStatistics();
   */
  static async getAssignmentStatistics(): Promise<any> {
    logger.info('Fetching assignment statistics');

    const query = `
      SELECT
        COUNT(*) as TotalAssignments,
        SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as ActiveCount,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as CompletedCount,
        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as PendingCount,
        SUM(CASE WHEN Priority = 'CRITICAL' THEN 1 ELSE 0 END) as CriticalCount
      FROM Assignments
    `;

    return await DatabaseHelper.querySingle(query);
  }
}
