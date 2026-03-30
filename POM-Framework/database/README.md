# Database Integration Guide

This directory contains the database integration layer for the automation framework, providing SQL Server connectivity and query management.

## 📁 Folder Structure

```
database/
├── DatabaseHelper.ts          # Main database connection and query execution class
├── queries/
│   ├── AssignmentQueries.ts   # Assignment-related SQL queries
│   ├── UserQueries.ts         # User-related SQL queries
│   └── index.ts               # Export all query classes
└── README.md                  # This file
```

## 🔧 Configuration

### 1. Update `.env` File

Add the following database configuration to your `.env` file:

```env
# Database Configuration
DB_SERVER=mssrecdbvwqa01.dhltd.corp
DB_PORT=1433
DB_DATABASE=YourDatabaseName
DB_USER=Connector
DB_PASSWORD=Re7Kp2M!

# Optional Settings
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_REQUEST_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=15000
```

**⚠️ IMPORTANT:**
- Update `DB_DATABASE` with your actual database name
- Keep credentials secure and never commit the `.env` file to version control

### 2. Connection String

The connection string is automatically built from environment variables:
```
Server: mssrecdbvwqa01.dhltd.corp
Port: 1433
Database: [Your DB Name]
User: Connector
Password: Re7Kp2M!
```

To update the connection string, simply modify the variables in your `.env` file.

## 🚀 Usage

### Initialize Database (Automatic)

The database connection is automatically initialized in `globalSetup.ts` before tests run:

```typescript
// Automatically happens in globalSetup
await DatabaseHelper.initialize();
await DatabaseHelper.testConnection();
```

### Using Query Classes in Tests

```typescript
import { test, expect } from '@playwright/test';
import { AssignmentQueries, UserQueries } from '../POM-Framework/database/queries';
import { DatabaseHelper } from '../POM-Framework/database/DatabaseHelper';

test('Verify assignment in database', async () => {
  // Get assignment by contract number
  const assignment = await AssignmentQueries.getAssignmentByContractNumber('BNS_143147');

  expect(assignment).not.toBeNull();
  expect(assignment.Status).toBe('Active');
});
```

### Check Database Connection

```typescript
const isConnected = await DatabaseHelper.isConnected();
if (!isConnected) {
  test.skip(); // Skip test if DB not available
}
```

## 📚 Available Query Methods

### AssignmentQueries

| Method | Description | Returns |
|--------|-------------|---------|
| `getAssignmentByContractNumber(contractNumber)` | Get assignment by contract number | Assignment object or null |
| `getAssignmentById(assignmentId)` | Get assignment by ID | Assignment object or null |
| `getAssignmentsByStatus(status)` | Get all assignments with status | Array of assignments |
| `getAssignmentsByPriority(priority)` | Get assignments by priority | Array of assignments |
| `getAssignmentsByUser(assignedTo)` | Get assignments for user | Array of assignments |
| `getAssignmentsByDateRange(start, end)` | Get assignments in date range | Array of assignments |
| `getLatestAssignment()` | Get most recent assignment | Assignment object or null |
| `getAssignmentStatistics()` | Get assignment statistics | Statistics object |
| `assignmentExists(contractNumber)` | Check if assignment exists | Boolean |
| `updateAssignmentStatus(id, status)` | Update assignment status | Number of rows affected |
| `deleteTestAssignments(pattern)` | Delete test data | Number of rows deleted |

### UserQueries

| Method | Description | Returns |
|--------|-------------|---------|
| `getUserByUsername(username)` | Get user by username | User object or null |
| `getUserById(userId)` | Get user by ID | User object or null |
| `getUserByEmail(email)` | Get user by email | User object or null |
| `getUserRole(username)` | Get user's role | String or null |
| `isUserActive(username)` | Check if user is active | Boolean |
| `getUsersByRole(role)` | Get all users with role | Array of users |
| `getActiveUsers()` | Get all active users | Array of users |
| `userExists(username)` | Check if user exists | Boolean |
| `getUserFullName(username)` | Get user's full name | String or null |
| `getUserCount(role?)` | Count users by role | Number |
| `getUserStatistics()` | Get user statistics | Statistics object |
| `updateLastLoginDate(username)` | Update last login timestamp | Number of rows affected |
| `updateUserStatus(username, isActive)` | Activate/deactivate user | Number of rows affected |

### DatabaseHelper (Low-Level Methods)

| Method | Description |
|--------|-------------|
| `executeQuery(query, params?)` | Execute SELECT query |
| `executeNonQuery(query, params?)` | Execute INSERT/UPDATE/DELETE |
| `querySingle(query, params?)` | Execute query, return single row |
| `executeStoredProcedure(name, params?)` | Execute stored procedure |
| `executeTransaction(queries)` | Execute multiple queries in transaction |
| `isConnected()` | Check if database is connected |
| `testConnection()` | Test database connection |
| `close()` | Close database connection |

## 💡 Examples

### Example 1: Verify Assignment Creation

```typescript
test('Create assignment and verify in database', async ({ page }) => {
  const contractNumber = 'TEST_12345';

  // 1. Create assignment via UI
  await page.goto('/assignments/create');
  await page.fill('#contractNumber', contractNumber);
  await page.click('#submit');

  // 2. Verify in database
  const assignment = await AssignmentQueries.getAssignmentByContractNumber(contractNumber);

  expect(assignment).not.toBeNull();
  expect(assignment.ContractNumber).toBe(contractNumber);
  expect(assignment.Status).toBe('Active');
});
```

### Example 2: Get User Role Before Test

```typescript
test('Admin-only test', async ({ credentials }) => {
  // Check user role from database
  const role = await UserQueries.getUserRole(credentials.username);

  if (role !== 'Admin') {
    test.skip(); // Skip if not admin
  }

  // Perform admin actions...
});
```

### Example 3: Custom Query

```typescript
test('Execute custom query', async () => {
  const query = `
    SELECT TOP 10
      ContractNumber,
      Status,
      Priority
    FROM Assignments
    WHERE CreatedDate >= DATEADD(day, -7, GETDATE())
    ORDER BY CreatedDate DESC
  `;

  const result = await DatabaseHelper.executeQuery(query);

  expect(result.recordset.length).toBeGreaterThan(0);
});
```

### Example 4: Parametrized Query

```typescript
test('Query with parameters', async () => {
  const query = `
    SELECT * FROM Assignments
    WHERE Status = @status
    AND Priority = @priority
  `;

  const result = await DatabaseHelper.executeQuery(query, {
    status: 'Active',
    priority: 'CRITICAL'
  });

  expect(result.recordset).toBeDefined();
});
```

### Example 5: Test Data Cleanup

```typescript
test.afterAll(async () => {
  // Clean up test data
  await AssignmentQueries.deleteTestAssignments('TEST');
});
```

## 🏗️ Adding New Query Classes

To add a new query class (e.g., `AuditQueries.ts`):

1. Create the file in `database/queries/`:

```typescript
// database/queries/AuditQueries.ts
import { DatabaseHelper } from '../DatabaseHelper';
import { logger } from '../../utilities/logger';

export class AuditQueries {
  static async getAuditLogs(userId: number): Promise<any[]> {
    logger.info(`Fetching audit logs for user: ${userId}`);

    const query = `
      SELECT * FROM AuditLogs
      WHERE UserId = @userId
      ORDER BY Timestamp DESC
    `;

    const result = await DatabaseHelper.executeQuery(query, { userId });
    return result.recordset;
  }
}
```

2. Export it in `queries/index.ts`:

```typescript
export { AssignmentQueries } from './AssignmentQueries';
export { UserQueries } from './UserQueries';
export { AuditQueries } from './AuditQueries'; // Add this line
```

3. Use it in tests:

```typescript
import { AuditQueries } from '../POM-Framework/database/queries';

const logs = await AuditQueries.getAuditLogs(userId);
```

## 🔍 Troubleshooting

### Connection Issues

If you get connection errors:

1. **Check network connectivity:**
   ```bash
   ping mssrecdbvwqa01.dhltd.corp
   ```

2. **Verify credentials:**
   - Ensure `DB_USER` and `DB_PASSWORD` are correct
   - Check if the user has access to the database

3. **Check firewall:**
   - Ensure port 1433 is open
   - Check if SQL Server allows remote connections

4. **Enable detailed logging:**
   ```typescript
   // In your test
   const config = DatabaseHelper.getConfigInfo();
   console.log('DB Config:', config);
   ```

### Query Errors

If queries fail:

1. **Check table/column names** match your database schema
2. **Verify SQL syntax** for SQL Server (not MySQL/PostgreSQL)
3. **Check parameter names** start with `@` in queries
4. **Review logs** in the console for detailed error messages

### Skipping Database Tests

If database is not configured, tests will gracefully skip:

```typescript
test('My test', async () => {
  if (!await DatabaseHelper.isConnected()) {
    test.skip(); // Skip if DB not available
  }

  // Test logic...
});
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use read-only credentials** for tests when possible
3. **Limit database permissions** to only what tests need
4. **Clean up test data** after test execution
5. **Use parameterized queries** to prevent SQL injection

## 📊 Performance Tips

1. **Use connection pooling** (already configured)
2. **Limit result sets** with `TOP` or `WHERE` clauses
3. **Create indexes** on frequently queried columns
4. **Cache repeated queries** when appropriate
5. **Close connections** in globalTeardown (already configured)

## 🎯 Best Practices

1. **Keep queries in query classes** - Don't write SQL in test files
2. **Use descriptive method names** - `getUserByUsername` not `getUser`
3. **Add JSDoc comments** - Document parameters and return types
4. **Handle null results** - Check if query returned data
5. **Log database operations** - Use logger for debugging
6. **Test with small datasets first** - Verify queries work correctly
7. **Use transactions** for multiple related operations

## 📖 Additional Resources

- [mssql npm package documentation](https://www.npmjs.com/package/mssql)
- [SQL Server T-SQL Reference](https://docs.microsoft.com/en-us/sql/t-sql/)
- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)

## 🤝 Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Review the example test file: `POM-Tests/test-suites/database-examples/AssignmentWithDBValidation.spec.ts`
3. Contact the automation team
