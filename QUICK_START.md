# Quick Start Guide

Get up and running with the test automation framework in minutes!

## 🚀 Installation (5 minutes)

```bash
# 1. Navigate to project
cd automation-framework

# 2. Install dependencies
npm install

# 3. Install browsers
npm run install:browsers

# 4. Setup environment
cp .env.example .env
# Edit .env with your settings

# 5. Generate test data
npx ts-node data/excel/createTestData.ts

# 6. Run tests
npm test
```

## 📝 Common Tasks

### Run Tests

```bash
# All tests
npm test

# Smoke tests only
npm run test:smoke

# Specific browser
npm run test:chromium

# Headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# Parallel execution
npm run test:parallel
```

### View Reports

```bash
# HTML report
npm run report

# Allure report
npm run allure:serve
```

### Create New Test

1. **Create page object** (`src/pages/MyPage.ts`):
```typescript
import { BasePage } from './base/BasePage';

export class MyPage extends BasePage {
  protected pageUrl = '/my-page';

  async doSomething(): Promise<void> {
    // Your logic
  }
}
```

2. **Create feature** (`src/features/MyFeature.ts`):
```typescript
import { BaseFeature } from './base/BaseFeature';
import { MyPage } from '../pages/MyPage';

export class MyFeature extends BaseFeature {
  private myPage: MyPage;

  constructor(page: Page) {
    super(page);
    this.myPage = new MyPage(page);
  }

  async performMyScenario(): Promise<void> {
    this.logStep('Starting scenario');
    await this.myPage.doSomething();
  }
}
```

3. **Add fixture** (`src/fixtures/index.ts`):
```typescript
myPage: async ({ page }, use) => {
  const myPage = new MyPage(page);
  await use(myPage);
},

myFeature: async ({ page }, use) => {
  const myFeature = new MyFeature(page);
  await use(myFeature);
},
```

4. **Write test** (`src/tests/my-test.spec.ts`):
```typescript
import { test, expect } from '../fixtures';

test('My test', async ({ myFeature }) => {
  await myFeature.performMyScenario();
});
```

### Create Test Data

**CSV** (`data/csv/mydata.csv`):
```csv
testCase,field1,field2,expectedResult
Test 1,value1,value2,success
Test 2,value3,value4,failure
```

**Excel** (`data/excel/createTestData.ts`):
```typescript
const myData = [
  { testCase: 'Test 1', field1: 'value1', field2: 'value2' },
  { testCase: 'Test 2', field1: 'value3', field2: 'value4' },
];

const sheet = XLSX.utils.json_to_sheet(myData);
XLSX.utils.book_append_sheet(workbook, sheet, 'MyData');
```

### Use Test Data in Tests

```typescript
test('Data-driven test', async ({ myFeature, dataProvider }) => {
  // CSV
  const csvData = await dataProvider.getCsvData('mydata.csv');

  // Excel
  const excelData = await dataProvider.getExcelData('testData.xlsx', 'MyData');

  // Iterate
  for (const data of csvData) {
    await myFeature.performMyScenario(data.field1, data.field2);
  }
});
```

## 🐛 Troubleshooting

### Tests failing?

```bash
# Check if browsers are installed
npx playwright install

# Check if test data exists
ls data/csv/
ls data/excel/

# View detailed logs
cat logs/test-execution.log

# Run single test in debug mode
npx playwright test src/tests/login.spec.ts --debug
```

### npm install failing?

```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Can't see browser?

```bash
# Run in headed mode
npm run test:headed

# Or
npx playwright test --headed
```

## 🔍 Debug Tips

### 1. Debug Single Test
```bash
npx playwright test src/tests/login.spec.ts --debug
```

### 2. Inspect Element Locators
```bash
npx playwright codegen https://your-app.com
```

### 3. Check Screenshots
Failed test screenshots are in: `screenshots/`

### 4. View Traces
```bash
npx playwright show-trace test-results/trace.zip
```

### 5. Check Logs
- Test execution: `logs/test-execution.log`
- Errors only: `logs/errors.log`

## 📊 Understanding Reports

### HTML Report
- Location: `reports/html/index.html`
- Shows: Test results, duration, errors
- View: `npm run report`

### Allure Report
- Location: `allure-report/`
- Shows: Detailed test execution, history, trends
- View: `npm run allure:serve`

### Screenshots
- Location: `screenshots/`
- Captured on: Test failure
- Naming: `FAILED_testname_timestamp.png`

### Logs
- Location: `logs/`
- Files: `test-execution.log`, `errors.log`
- Format: `[timestamp] LEVEL: message`

## 🎯 Tips for Success

### 1. Always Use the Three-Layer Pattern
```
Test → Feature → Page
```

### 2. Keep Test Data External
Use CSV/Excel files, not hardcoded values.

### 3. Log Important Steps
```typescript
this.logStep('Description of step');
```

### 4. Use Descriptive Names
```typescript
// Good
async performSuccessfulLogin(username: string, password: string)

// Bad
async doLogin(u: string, p: string)
```

### 5. Handle Errors
```typescript
try {
  await myFeature.performScenario();
} catch (error) {
  await ScreenshotHelper.captureOnFailure(page, testName);
  throw error;
}
```

## 🐳 Docker Usage

```bash
# Build image
docker build -t automation-framework .

# Run tests
docker run automation-framework

# Run specific tests
docker run automation-framework npm run test:smoke

# With custom environment
docker run -e BASE_URL=https://myapp.com automation-framework

# Using docker-compose
docker-compose up playwright-tests
```

## 🔗 Useful Links

- [Full README](./README.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Playwright Docs](https://playwright.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## ❓ Need Help?

1. Check `logs/test-execution.log`
2. Check `logs/errors.log`
3. Review screenshots in `screenshots/`
4. Read [README.md](./README.md)
5. Check [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Happy Testing! 🎉**
