# Framework Structure - Complete Guide

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AUTOMATION FRAMEWORK - CLEAN STRUCTURE                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 📊 Visual Structure

```
📦 automation-framework/
│
├── 📄 ROOT (Configuration Files Only)
│   ├── package.json
│   ├── tsconfig.json
│   ├── playwright.config.ts
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── 📚 Documentation/
│       ├── README.md
│       ├── ARCHITECTURE.md
│       ├── QUICK_START.md
│       └── FRAMEWORK_STRUCTURE.md (this file)
│
├── 🛠️  POM-Framework/  ◄─────── FRAMEWORK COMPONENTS (Reusable Code)
│   │
│   ├── 📄 page-objects/           Page Object Model
│   │   ├── base/BasePage.ts       (30+ common methods)
│   │   ├── LoginPage.ts
│   │   └── HomePage.ts
│   │
│   ├── 🎯 feature-scenarios/      Business Logic & Scenarios
│   │   ├── base/BaseFeature.ts
│   │   └── LoginFeature.ts
│   │
│   ├── 🧩 reusable-components/    Reusable UI Components
│   │   ├── base/BaseComponent.ts
│   │   └── HeaderComponent.ts
│   │
│   ├── 🛠️  utilities/              Helper Functions & Tools
│   │   ├── data-readers/
│   │   │   ├── csvReader.ts
│   │   │   ├── excelReader.ts
│   │   │   └── dataProvider.ts
│   │   ├── ConfigReader.ts        Centralized config reader
│   │   ├── logger.ts
│   │   ├── screenshotHelper.ts
│   │   └── helpers.ts
│   │
│   ├── 📋 interfaces/             TypeScript Type Definitions
│   │   └── index.ts
│   │
│   ├── 🔌 test-hooks/             Global Setup/Teardown
│   │   ├── globalSetup.ts
│   │   └── globalTeardown.ts
│   │
│   └── 💉 test-fixtures/          Playwright Fixtures (DI)
│       └── index.ts
│
└── 🧪 POM-Tests/  ◄─────── TEST COMPONENTS (Test-Specific Code)
    │
    ├── ✅ test-suites/            Test Specifications
    │   ├── login.spec.ts
    │   ├── smoke.spec.ts
    │   └── AssignmentCreation.spec.ts
    │
    ├── 📄 page-objects/           Test-specific page objects
    │   ├── base/BasePage.ts
    │   ├── LoginPage.ts
    │   └── HomePage.ts
    │
    ├── 🎯 feature-scenarios/      Test-specific features
    │   ├── base/BaseFeature.ts
    │   ├── LoginFeature.ts
    │   └── AssignmentCreationFeature.ts
    │
    ├── ⚙️  test.config.ts          Test configuration & environments
    │
    ├── 📊 test-data/              Test Input Data
    │   ├── csv/
    │   │   └── loginData.csv
    │   ├── excel/
    │   │   ├── testData.xlsx
    │   │   └── createTestData.ts
    │   └── json/
    │       └── assignmentData.json
    │
    ├── 📁 test-results/           Test Artifacts (Generated)
    │   ├── traces/
    │   └── videos/
    │
    ├── 📈 test-reports/           Test Reports (Generated)
    │   ├── html/
    │   ├── json/
    │   └── junit/
    │
    ├── 📸 screenshots/            Failure Screenshots (Generated)
    │
    ├── 📝 logs/                   Test Logs (Generated)
    │   ├── test-execution.log
    │   └── errors.log
    │
    └── 📊 allure-results/         Allure Report Data (Generated)
```

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                              KEY BENEFITS                                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ✅ Clear Separation:   Framework vs Tests                                   ║
║  ✅ Meaningful Names:    Self-documenting folders                            ║
║  ✅ Professional:        Enterprise-grade structure                          ║
║  ✅ Scalable:            Easy to grow                                        ║
║  ✅ Team-Friendly:       Clear ownership                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 📁 Detailed Structure

The framework is organized into **2 main folders** for better readability and maintainability:

1. **POM-Framework** - All framework components (reusable code)
2. **POM-Tests** - All test-related files (tests, data, page objects, results)

---

## 📋 Folder Descriptions

### 🛠️ POM-Framework (Framework Components)

| Folder | Purpose | What to Put Here |
|--------|---------|------------------|
| **page-objects/** | Page Object Model base classes | Base page classes with common methods for all pages |
| **feature-scenarios/** | Business logic scenarios base | Base feature classes for orchestrating business flows |
| **reusable-components/** | Reusable UI components | Component classes for elements appearing across pages |
| **utilities/** | Helper functions & tools | ConfigReader, logger, screenshot helper, data readers |
| **interfaces/** | TypeScript type definitions | Interfaces, types, enums for type safety |
| **test-hooks/** | Global setup/teardown | Code that runs before/after ALL tests |
| **test-fixtures/** | Playwright fixtures | Dependency injection setup for tests |

### 🧪 POM-Tests (Test Components)

| Folder | Purpose | What to Put Here |
|--------|---------|------------------|
| **test-suites/** | Test specifications | Actual test files (*.spec.ts) with test cases |
| **page-objects/** | Test-specific page objects | Page classes for your application pages |
| **feature-scenarios/** | Test-specific features | Feature classes implementing business scenarios |
| **test.config.ts** | Test configuration | Environment configs, credentials, URL settings |
| **test-data/** | Test input data | CSV/Excel/JSON files with test data |
| **test-results/** | Test execution artifacts | Generated test results, traces, videos |
| **test-reports/** | Test reports | Generated HTML, JSON, JUnit reports |
| **screenshots/** | Test screenshots | Screenshots captured during test execution |
| **logs/** | Test execution logs | Logger output files |
| **allure-results/** | Allure report data | Allure-specific test results |

---

## 🎯 Clear Separation Benefits

### Why This Structure?

1. **Clear Separation of Concerns**
   - Framework code (reusable) is separate from test code (specific)
   - Easy to identify what's framework vs what's test

2. **Better Readability**
   - Meaningful folder names explain what goes where
   - No confusion about where to add new files

3. **Easier Maintenance**
   - Framework changes don't mix with test changes
   - Clear ownership and responsibility

4. **Professional Organization**
   - Follows industry best practices
   - Scales well as framework grows

5. **Team Collaboration**
   - Framework developers know where to work
   - Test developers know where to add tests
   - New team members understand structure quickly

---

## 📝 Where to Add New Files

### Adding New Page Objects
```
POM-Tests/page-objects/MyNewPage.ts
```

### Adding New Features/Scenarios
```
POM-Tests/feature-scenarios/MyNewFeature.ts
```

### Adding New Components
```
POM-Framework/reusable-components/MyNewComponent.ts
```

### Adding New Tests
```
POM-Tests/test-suites/my-new-test.spec.ts
```

### Adding New Test Data
```
POM-Tests/test-data/csv/mydata.csv
POM-Tests/test-data/excel/mydata.xlsx
POM-Tests/test-data/json/mydata.json
```

### Adding New Utilities
```
POM-Framework/utilities/myUtility.ts
```

### Adding New Type Definitions
```
POM-Framework/interfaces/index.ts (add to existing file)
```

---

## 🔄 Import Patterns

### Common Import Examples

```typescript
// Test configuration
import { testConfig } from '../../test.config';
import { ConfigReader } from '../../POM-Framework/utilities/ConfigReader';

// Page Objects
import { LoginPage } from '../page-objects/LoginPage';
import { HomePage } from '../page-objects/HomePage';

// Features
import { LoginFeature } from '../feature-scenarios/LoginFeature';

// Base classes from framework
import { BasePage } from '../../POM-Framework/page-objects/base/BasePage';
import { BaseFeature } from '../../POM-Framework/feature-scenarios/base/BaseFeature';

// Utilities
import { logger } from '../../POM-Framework/utilities/logger';
import { DataProvider } from '../../POM-Framework/utilities/data-readers/dataProvider';

// Interfaces
import { LoginTestData, TestData } from '../../POM-Framework/interfaces';

// Fixtures
import { test, expect } from '../../POM-Framework/test-fixtures';
```

---

## 🚀 Quick Navigation

**Want to**:
- ✏️ **Add a new page?** → `POM-Tests/page-objects/`
- 🎯 **Add a feature?** → `POM-Tests/feature-scenarios/`
- 🧩 **Add a component?** → `POM-Framework/reusable-components/`
- ✅ **Write a test?** → `POM-Tests/test-suites/`
- 📊 **Add test data?** → `POM-Tests/test-data/`
- ⚙️ **Configure environment?** → `POM-Tests/test.config.ts`
- 🛠️ **Add a utility?** → `POM-Framework/utilities/`
- 📋 **Check results?** → `POM-Tests/test-reports/html/index.html`
- 📷 **View screenshots?** → `POM-Tests/screenshots/`
- 📝 **Check logs?** → `POM-Tests/logs/test-execution.log`
- ⚙️ **Global config?** → Root level config files

---

## 🏗️ Architecture Flow

```
FLOW: Test → Feature → Page
            │           │
            │           └─ UI Interactions
            └─ Business Logic
```

### Execution Flow

1. **Test File** (`*.spec.ts`) - Defines test scenarios
2. **Feature Class** - Orchestrates business logic
3. **Page Object** - Interacts with UI elements
4. **Base Classes** - Provide common functionality
5. **Utilities** - Support logging, data, config

---

## 📊 Configuration Management

### ConfigReader (Centralized Configuration)

All environment configuration is managed through `ConfigReader`:

```typescript
// Get environment-specific URLs
const baseUrl = ConfigReader.getBaseUrl('QA');
// Returns: https://qa2repohighway.devservices.dh.com

// Get credentials
const creds = ConfigReader.getCredentials('RBCClientUser');
// Returns: { username: 'MIJIRBC', password: 'Assetuse@1' }

// Get domain paths
const loginPath = ConfigReader.getDomainPath('login');
// Returns: '/go.aspx'
```

### Environment Variables

Control behavior via `.env` file:
- `TEST_ENV` - Select environment (QA, dev, prod, local)
- `ENV_PREFIX` - Override URL prefix (qa1, qa2, qa3)
- `SUBDOMAIN` - Override subdomain (repohighway)
- `BASE_URL` - Override entire URL
- `AUTH_CREDENTIAL_KEY` - Select credential set

---

## ✨ Key Points

1. **POM-Framework** = Reusable code (base classes, utilities, interfaces)
2. **POM-Tests** = Test-specific code (tests, pages, features, data, results)
3. **Root Level** = Configuration only
4. **Meaningful Names** = Self-documenting structure
5. **Clear Organization** = Easy to navigate and maintain
6. **ConfigReader** = Single source of truth for configuration

---

## 📊 File Count Summary

**POM-Framework**: ~15 framework files
**POM-Tests**: ~15 test files + generated artifacts
**Root Level**: 8 configuration files + 4 documentation files

**Total**: 40+ organized files in a clean structure!

---

## 🔗 Related Documentation

- **[README.md](./README.md)** - Complete usage guide and getting started
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture details and design patterns
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference for common tasks

---

*Last Updated: Framework cleaned and optimized - February 2026*
