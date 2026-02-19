# Data-Driven Test Automation Framework

A comprehensive test automation framework built with TypeScript, Playwright, and the Page Object Model (POM) design pattern. Features data-driven testing, parallel execution, HTML reporting, and CI/CD integration.

## 🏗️ Architecture

The framework follows a **three-layer architecture** for clean separation of concerns:

```
Test Layer → Feature Layer → Page Layer
```

- **Test Layer**: Contains test cases and data-driven test logic
- **Feature Layer**: Encapsulates business scenarios and workflows
- **Page Layer**: Contains page objects representing UI elements and basic actions

## 📁 Project Structure

```
automation-framework/
├── src/
│   ├── pages/              # Page Objects (UI elements & actions)
│   │   ├── base/
│   │   │   └── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── HomePage.ts
│   ├── features/           # Feature/Scenario classes (business logic)
│   │   ├── base/
│   │   │   └── BaseFeature.ts
│   │   └── LoginFeature.ts
│   ├── components/         # Reusable UI components
│   │   ├── base/
│   │   │   └── BaseComponent.ts
│   │   └── HeaderComponent.ts
│   ├── tests/              # Test specifications
│   │   ├── login.spec.ts
│   │   └── smoke.spec.ts
│   ├── fixtures/           # Playwright fixtures for DI
│   │   └── index.ts
│   ├── utils/              # Utilities
│   │   ├── dataReaders/
│   │   │   ├── csvReader.ts
│   │   │   ├── excelReader.ts
│   │   │   └── dataProvider.ts
│   │   ├── logger.ts
│   │   ├── screenshotHelper.ts
│   │   └── helpers.ts
│   ├── config/             # Environment configurations
│   │   └── environments.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── hooks/              # Global setup/teardown
│       ├── globalSetup.ts
│       └── globalTeardown.ts
├── data/                   # Test data files
│   ├── csv/
│   │   └── loginData.csv
│   └── excel/
│       ├── testData.xlsx
│       └── createTestData.ts
├── .github/workflows/      # CI/CD pipelines
│   └── test.yml
├── reports/                # Test reports
├── test-results/           # Test artifacts
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
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
   BASE_URL=https://your-app-url.com
   TEST_ENV=staging
   TEST_USERNAME=your-username
   TEST_PASSWORD=your-password
   ```

5. **Generate Excel test data**
   ```bash
   npx ts-node data/excel/createTestData.ts
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
npx playwright test src/tests/login.spec.ts

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

- **HTML Report**: `reports/html/index.html`
- **JSON Report**: `reports/json/results.json`
- **JUnit Report**: `reports/junit/results.xml`
- **Allure Results**: `allure-results/`
- **Screenshots**: `screenshots/`
- **Logs**: `logs/test-execution.log`

## 📝 Writing Tests

### Three-Layer Pattern

#### 1. Page Object Layer

```typescript
// src/pages/LoginPage.ts
export class LoginPage extends BasePage {
  protected pageUrl: string = '/login';

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
```

#### 2. Feature Layer

```typescript
// src/features/LoginFeature.ts
export class LoginFeature extends BaseFeature {
  private loginPage: LoginPage;
  private homePage: HomePage;

  async performSuccessfulLogin(username: string, password: string): Promise<void> {
    this.logStep('Navigate to login page');
    await this.loginPage.navigateToLogin();

    this.logStep('Enter credentials and login');
    await this.loginPage.login(username, password);

    this.logStep('Verify home page loaded');
    await this.homePage.verifyHomePageLoaded();
  }
}
```

#### 3. Test Layer

```typescript
// src/tests/login.spec.ts
import { test, expect } from '../fixtures';

test('Login with CSV data', async ({ loginFeature, dataProvider }) => {
  const testData = await dataProvider.getCsvData('loginData.csv');

  for (const data of testData) {
    await loginFeature.performSuccessfulLogin(data.username, data.password);
  }
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
  testDir: './src/tests',
  fullyParallel: true,
  workers: 4,
  retries: 2,
  use: {
    baseURL: 'https://your-app.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

### Environment Configuration

Edit `src/config/environments.ts`:

```typescript
export const environments = {
  dev: {
    baseUrl: 'https://dev.example.com',
    apiUrl: 'https://api-dev.example.com',
  },
  // Add more environments
};
```

## 🛠️ Utilities

### Logger

```typescript
import { logger, logTestStart, logTestEnd, logStep } from '../utils/logger';

logTestStart('My Test');
logStep('Step 1: Navigate to page');
logger.info('Custom log message');
logTestEnd('My Test', 'PASSED');
```

### Screenshot Helper

```typescript
import { ScreenshotHelper } from '../utils/screenshotHelper';

// Capture screenshot
await ScreenshotHelper.capture(page, 'screenshot-name');

// Capture on failure
await ScreenshotHelper.captureOnFailure(page, testName);

// Capture specific element
await ScreenshotHelper.captureElement(page, '#element-id', 'element-name');
```

### Helpers

```typescript
import { Helpers } from '../utils/helpers';

// Generate random data
const email = Helpers.generateRandomEmail();
const phone = Helpers.generateRandomPhone();
const randomStr = Helpers.generateRandomString(10);

// Retry with exponential backoff
await Helpers.retry(async () => {
  // Your flaky operation
}, 3, 1000);

// Wait for condition
await Helpers.waitForCondition(() => isReady, 10000);
```

## 🔄 CI/CD Integration

### GitHub Actions

The framework includes a comprehensive GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
- Runs tests on push/PR
- Matrix strategy for parallel execution
- Multiple browser support
- Artifact uploads (reports, screenshots)
- Allure report generation
- Optional Slack notifications
```

### Setup GitHub Secrets

Add these secrets to your GitHub repository:

- `BASE_URL`: Application URL
- `TEST_USERNAME`: Test user username
- `TEST_PASSWORD`: Test user password
- `SLACK_WEBHOOK_URL` (optional): For notifications

### Manual Workflow Trigger

Go to Actions → Playwright Tests → Run workflow

Select environment and browser options.

## 📦 Test Data Management

### CSV Format

```csv
testCase,username,password,expectedResult,errorMessage
Valid Login,admin@example.com,Admin123!,success,
Invalid Login,admin@example.com,wrong,failure,Invalid credentials
```

### Excel Format

Create multi-sheet Excel files:
```bash
npx ts-node data/excel/createTestData.ts
```

This generates `testData.xlsx` with multiple sheets (Login, Users, etc.)

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
# Check data/csv/loginData.csv exists
# Generate Excel file:
npx ts-node data/excel/createTestData.ts
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

## 📚 Additional Resources

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
