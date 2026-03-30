# Data-Driven Test Automation Framework

A comprehensive test automation framework built with TypeScript, Playwright, and the Page Object Model (POM) design pattern. Features data-driven testing, parallel execution, database integration, HTML reporting, and CI/CD integration.

## 🏗️ Architecture

The framework follows a **three-layer architecture** for clean separation of concerns:

```
Test Layer → Feature Layer → Page Layer
```

- **Test Layer**: Contains test cases and data-driven test logic
- **Feature Layer**: Encapsulates business scenarios and workflows
- **Page Layer**: Contains page objects representing UI elements and basic actions

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

## 📁 Project Structure

```
automation-framework/
│
├── 📄 ROOT (Configuration Files)
│   ├── package.json
│   ├── tsconfig.json
│   ├── playwright.config.ts
│   ├── .env / .env.example
│   └── .github/workflows/         # CI/CD pipelines
│       └── test.yml
│
├── 🛠️  POM-Framework/             # Reusable Framework Components
│   ├── page-objects/              # Base page classes
│   │   └── base/BasePage.ts
│   ├── feature-scenarios/         # Base feature classes
│   │   └── base/BaseFeature.ts
│   ├── reusable-components/       # UI components
│   │   └── base/BaseComponent.ts
│   ├── utilities/                 # Helper functions
│   │   ├── data-readers/          # CSV/Excel readers
│   │   ├── ConfigReader.ts
│   │   ├── logger.ts
│   │   └── screenshotHelper.ts
│   ├── database/                  # Database integration
│   │   ├── DatabaseHelper.ts
│   │   └── queries/               # Query classes
│   ├── bridge/                    # Bridge API integration
│   ├── interfaces/                # TypeScript types
│   ├── test-hooks/                # Global setup/teardown
│   └── test-fixtures/             # Playwright fixtures
│
└── 🧪 POM-Tests/                  # Test-Specific Components
    ├── test-suites/               # Test specifications
    │   ├── login.spec.ts
    │   ├── AssignmentCreation.spec.ts
    │   ├── database-examples/     # Database test examples
    │   └── bridge/                # Bridge API test examples
    ├── page-objects/              # Application page objects
    │   ├── base/BasePage.ts
    │   ├── LoginPage.ts
    │   └── AssignmentPage.ts
    ├── feature-scenarios/         # Business scenarios
    │   ├── base/BaseFeature.ts
    │   └── LoginFeature.ts
    ├── test.config.ts             # Environment configs
    ├── test-data/                 # Test data files
    │   ├── csv/
    │   ├── excel/
    │   └── json/
    ├── test-results/              # Generated artifacts
    ├── test-reports/              # Generated reports
    ├── screenshots/               # Failure screenshots
    └── logs/                      # Execution logs
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd automation-framework
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npm run install:browsers
   ```

4. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   # Environment Configuration
   TEST_ENV=QA
   ENV_PREFIX=qa2
   SUBDOMAIN=repohighway

   # Credentials (Optional - uses test.config.ts by default)
   AUTH_CREDENTIAL_KEY=RBCClientUser

   # Database Configuration (Optional)
   DB_SERVER=mssrecdbvwqa01.dhltd.corp
   DB_PORT=1433
   DB_DATABASE=YourDatabaseName
   DB_USER=Connector
   DB_PASSWORD=Re7Kp2M!
   ```

5. **Generate Excel test data** (Optional)
   ```bash
   npx ts-node POM-Tests/test-data/excel/createTestData.ts
   ```

6. **Run tests**
   ```bash
   npm test
   ```

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests with parallel workers
npm run test:parallel

# Run specific browser tests
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run tagged tests
npm run test:smoke        # Smoke tests only
npm run test:regression   # Regression tests only
```

### Advanced Usage

```bash
# Run specific test file
npx playwright test POM-Tests/test-suites/login.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Run tests with specific workers
npx playwright test --workers=2

# Run in debug mode with inspector
npx playwright test --debug

# Generate and view report
npm run report
```

## 📊 Reports

### HTML Report

After test execution:
```bash
npm run report
```
Opens the HTML report at `reports/html/index.html`

### Allure Report

```bash
# Generate Allure report
npm run allure:generate

# Open Allure report
npm run allure:open

# Generate and serve in one command
npm run allure:serve
```

### Report Locations

- **HTML Report**: `POM-Tests/test-reports/html/index.html`
- **JSON Report**: `POM-Tests/test-reports/json/results.json`
- **JUnit Report**: `POM-Tests/test-reports/junit/results.xml`
- **Allure Results**: `POM-Tests/allure-results/`
- **Screenshots**: `POM-Tests/screenshots/`
- **Logs**: `POM-Tests/logs/test-execution.log`

## 📝 Writing Tests

### Three-Layer Pattern

#### 1. Page Object Layer

```typescript
// POM-Tests/page-objects/LoginPage.ts
import { BasePage } from '../../POM-Framework/page-objects/base/BasePage';

export class LoginPage extends BasePage {
  protected pageUrl: string = '/go.aspx';

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
```

#### 2. Feature Layer

```typescript
// POM-Tests/feature-scenarios/LoginFeature.ts
import { BaseFeature } from '../../POM-Framework/feature-scenarios/base/BaseFeature';
import { LoginPage } from '../page-objects/LoginPage';

export class LoginFeature extends BaseFeature {
  private loginPage: LoginPage;

  async performSuccessfulLogin(username: string, password: string): Promise<void> {
    this.logStep('Navigate to login page');
    await this.loginPage.navigateToLogin();

    this.logStep('Enter credentials and login');
    await this.loginPage.login(username, password);

    this.logStep('Verify home page loaded');
    await this.page.waitForLoadState('networkidle');
  }
}
```

#### 3. Test Layer

```typescript
// POM-Tests/test-suites/login.spec.ts
import { test, expect } from '../../POM-Framework/test-fixtures';

test('Login with credentials', async ({ loginFeature, credentials }) => {
  await loginFeature.performSuccessfulLogin(
    credentials.username,
    credentials.password
  );
});
```

### Data-Driven Testing

#### CSV Data

```typescript
// Read CSV file
const testData = await dataProvider.getCsvData('loginData.csv');

// Filter data
const validLogins = testData.filter(d => d.expectedResult === 'success');

// Iterate and test
for (const data of testData) {
  await test.step(`Test: ${data.testCase}`, async () => {
    await loginFeature.performSuccessfulLogin(data.username, data.password);
  });
}
```

#### Excel Data

```typescript
// Read Excel file (specific sheet)
const testData = await dataProvider.getExcelData('testData.xlsx', 'Login');

// Read all sheets
const allSheets = await ExcelReader.readAllSheets('testData.xlsx');

// Access specific sheet data
const loginData = allSheets['Login'];
const userData = allSheets['Users'];
```

## 🔧 Configuration

### Playwright Configuration

Edit `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './POM-Tests/test-suites',
  fullyParallel: true,
  workers: 4,
  retries: 2,
  use: {
    baseURL: process.env.BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Environment Configuration

The framework uses `ConfigReader` for centralized configuration management:

```typescript
import { ConfigReader } from './POM-Framework/utilities/ConfigReader';

// Get environment-specific URLs
const baseUrl = ConfigReader.getBaseUrl('QA');

// Get credentials
const creds = ConfigReader.getCredentials('RBCClientUser');

// Get database config
const dbConfig = ConfigReader.getDatabaseConfig();
```

Edit `POM-Tests/test.config.ts` to add environments and credentials.

## 🛠️ Utilities

### Logger

```typescript
import { logger, logTestStart, logTestEnd, logStep } from './POM-Framework/utilities/logger';

logTestStart('My Test');
logStep('Step 1: Navigate to page');
logger.info('Custom log message');
logTestEnd('My Test', 'PASSED');
```

### Screenshot Helper

```typescript
import { ScreenshotHelper } from './POM-Framework/utilities/screenshotHelper';

// Capture screenshot
await ScreenshotHelper.capture(page, 'screenshot-name');

// Capture on failure
await ScreenshotHelper.captureOnFailure(page, testName);

// Capture specific element
await ScreenshotHelper.captureElement(page, '#element-id', 'element-name');
```

### ConfigReader

```typescript
import { ConfigReader } from './POM-Framework/utilities/ConfigReader';

// Get base URL for environment
const baseUrl = ConfigReader.getBaseUrl('QA');

// Get credentials
const creds = ConfigReader.getCredentials('RBCClientUser');

// Get database configuration
const dbConfig = ConfigReader.getDatabaseConfig();

// Get domain paths
const loginPath = ConfigReader.getDomainPath('login');
```

### Database Integration

```typescript
import { AssignmentQueries, UserQueries } from './POM-Framework/database/queries';

// Query assignments
const assignment = await AssignmentQueries.getAssignmentByContractNumber('BNS_143147');

// Query users
const user = await UserQueries.getUserByUsername('john.doe');

// Custom queries
import { DatabaseHelper } from './POM-Framework/database/DatabaseHelper';
const results = await DatabaseHelper.executeQuery('SELECT * FROM...');
```

See [FEATURES.md](FEATURES.md) for advanced features including credentials and database usage.

## 🔄 CI/CD Integration

### GitHub Actions

The framework includes a comprehensive GitHub Actions workflow that runs on Chromium with 4 parallel workers:

```yaml
# .github/workflows/test.yml
- Runs tests on push/PR
- Parallel execution with 4 shards (Chromium only)
- Smoke tests for quick validation
- Artifact uploads (reports, screenshots)
- Allure report generation and GitHub Pages deployment
- Optional Slack notifications
```

### Setup GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

- `ENV_PREFIX`: Environment prefix (e.g., qa2)
- `AUTH_CREDENTIAL_KEY`: Credential key from test.config.ts (e.g., RBCClientUser)
- `SLACK_WEBHOOK_URL` (optional): For Slack notifications

### GitHub Pages Setup

1. Enable GitHub Pages (Settings → Pages)
2. Source: Deploy from branch `gh-pages`
3. Grant workflow permissions (Settings → Actions → General → Read and write permissions)

### Manual Workflow Trigger

1. Go to Actions → Playwright Tests → Run workflow
2. Select branch and environment
3. View Allure reports at: `https://{username}.github.io/{repo}/reports/{run-number}/`

See [CI_CD_SETUP.md](CI_CD_SETUP.md) for complete CI/CD configuration guide.

## 📦 Test Data Management

### CSV Format

Create CSV files in `POM-Tests/test-data/csv/`:

```csv
testCase,username,password,expectedResult,errorMessage
Valid Login,admin@example.com,Admin123!,success,
Invalid Login,admin@example.com,wrong,failure,Invalid credentials
```

### Excel Format

Create Excel files with multiple sheets:
```bash
npx ts-node POM-Tests/test-data/excel/createTestData.ts
```

This generates `testData.xlsx` with multiple sheets (Login, Users, etc.)

### JSON Format

Create JSON files in `POM-Tests/test-data/json/`:

```json
{
  "ContractNumber": "BNS_143147",
  "Priority": "CRITICAL",
  "Description": "Test Assignment"
}
```

### Using Test Data

```typescript
import { DataProvider } from './POM-Framework/utilities/data-readers/dataProvider';

// CSV data
const csvData = await dataProvider.getCsvData('loginData.csv');

// Excel data
const excelData = await dataProvider.getExcelData('testData.xlsx', 'Login');

// JSON data
const jsonData = await DataProvider.getTestDataFromJson('assignmentData.json');
```

## 🎯 Best Practices

### 1. Use the Three-Layer Pattern

✅ **DO**: Test → Feature → Page
```typescript
await loginFeature.performSuccessfulLogin(username, password);
```

❌ **DON'T**: Test → Page (skip feature layer)
```typescript
await loginPage.login(username, password);
```

### 2. Keep Tests Data-Driven

✅ **DO**: Read from external data sources
```typescript
const testData = await dataProvider.getCsvData('loginData.csv');
```

❌ **DON'T**: Hardcode test data in tests
```typescript
await login('user@example.com', 'password123');
```

### 3. Use Descriptive Names

✅ **DO**: Clear, descriptive naming
```typescript
async performSuccessfulLogin(username: string, password: string)
```

❌ **DON'T**: Vague naming
```typescript
async doLogin(u: string, p: string)
```

### 4. Log Important Steps

```typescript
this.logStep('Navigate to login page');
this.logStep('Enter credentials');
this.logStep('Verify login successful');
```

### 5. Handle Errors Gracefully

```typescript
try {
  await loginFeature.performSuccessfulLogin(username, password);
} catch (error) {
  await ScreenshotHelper.captureOnFailure(page, testName);
  throw error;
}
```

## 🐛 Troubleshooting

### Common Issues

**1. Browsers not installed**
```bash
npm run install:browsers
```

**2. Test data files missing**
```bash
# Check POM-Tests/test-data/csv/ exists
# Generate Excel file:
npx ts-node POM-Tests/test-data/excel/createTestData.ts
```

**3. Permission errors on npm install**
```bash
# Clear npm cache
npm cache clean --force
# Try again
npm install
```

**4. Tests timing out**
- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify application is accessible

**5. TypeScript errors**
```bash
# Check TypeScript version
npx tsc --version
# Rebuild
npm run build
```

**6. Database connection fails**
- Verify `DB_DATABASE` is set correctly in `.env`
- Check network connectivity to database server
- Tests will skip gracefully if database is not configured

**7. Credentials not found**
- Verify `AUTH_CREDENTIAL_KEY` in `.env` matches a key in `test.config.ts`
- Check that credentials are defined for the selected environment

## 📚 Additional Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete architecture guide with 3-layer pattern and folder structure
- [FEATURES.md](FEATURES.md) - Advanced features: credentials management and database integration
- [CI_CD_SETUP.md](CI_CD_SETUP.md) - Complete CI/CD pipeline configuration guide
- [QUICK_START.md](QUICK_START.md) - Quick reference for common tasks

### External Resources

- [Playwright Documentation](https://playwright.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Allure Report](https://docs.qameta.io/allure/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

ISC

## 👥 Authors

Your Team Name

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the QA team

---

**Happy Testing! 🎉**
