# Framework Architecture

## Overview

This framework implements a **three-layer architecture** that separates concerns and promotes maintainability, reusability, and scalability.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        TEST LAYER                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • Test specifications (*.spec.ts)                  │   │
│  │  • Data-driven test logic                           │   │
│  │  • Test assertions and verifications                │   │
│  │  • Fixtures integration                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      FEATURE LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • Business scenarios (LoginFeature, etc.)          │   │
│  │  • Workflow orchestration                           │   │
│  │  • Multi-page interactions                          │   │
│  │  • Business logic encapsulation                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       PAGE LAYER                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • Page Objects (LoginPage, HomePage, etc.)         │   │
│  │  • UI element locators                              │   │
│  │  • Basic page actions                               │   │
│  │  • Page-specific methods                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  • Reusable UI components (Header, Footer, etc.)    │   │
│  │  • Component-specific actions                       │   │
│  │  • Cross-page components                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Test Layer (`src/tests/`)

**Responsibility**: Define test cases and orchestrate test execution

**Contains**:
- Test specifications (`.spec.ts` files)
- Data-driven test logic
- Test assertions
- Test setup and teardown

**Example**:
```typescript
test('Login with CSV data', async ({ loginFeature, dataProvider }) => {
  const testData = await dataProvider.getCsvData('loginData.csv');

  for (const data of testData) {
    await loginFeature.performSuccessfulLogin(data.username, data.password);
  }
});
```

**Rules**:
- ✅ Use fixtures to inject dependencies
- ✅ Call feature methods, not page methods directly
- ✅ Read test data from external sources
- ❌ Don't implement business logic here
- ❌ Don't interact with page elements directly

---

### 2. Feature Layer (`src/features/`)

**Responsibility**: Encapsulate business scenarios and workflows

**Contains**:
- Feature classes (LoginFeature, CheckoutFeature, etc.)
- Business scenario implementations
- Multi-page workflows
- Step-by-step scenario logging

**Example**:
```typescript
export class LoginFeature extends BaseFeature {
  async performSuccessfulLogin(username: string, password: string): Promise<void> {
    this.logStep('Navigate to login page');
    await this.loginPage.navigateToLogin();

    this.logStep('Enter credentials');
    await this.loginPage.login(username, password);

    this.logStep('Verify home page loaded');
    await this.homePage.verifyHomePageLoaded();
  }
}
```

**Rules**:
- ✅ Orchestrate multiple page objects
- ✅ Implement business scenarios
- ✅ Log scenario steps
- ✅ Handle scenario-level error handling
- ❌ Don't contain test assertions (leave to tests)
- ❌ Don't interact with page elements directly (use pages)

---

### 3. Page Layer (`src/pages/`)

**Responsibility**: Represent pages and their elements

**Contains**:
- Page object classes
- Element locators
- Page-specific actions
- Page navigation methods

**Example**:
```typescript
export class LoginPage extends BasePage {
  private readonly usernameInput = page.locator('#username');
  private readonly passwordInput = page.locator('#password');
  private readonly loginButton = page.locator('#login-btn');

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
```

**Rules**:
- ✅ Define locators as class members
- ✅ Implement page-specific actions
- ✅ Extend BasePage for common functionality
- ❌ Don't implement business logic
- ❌ Don't call other pages (that's feature layer's job)

---

### 4. Component Layer (`src/components/`)

**Responsibility**: Reusable UI components that appear across multiple pages

**Contains**:
- Component classes (HeaderComponent, FooterComponent, etc.)
- Component-specific locators
- Component actions

**Example**:
```typescript
export class HeaderComponent extends BaseComponent {
  async navigateToHome(): Promise<void> {
    await this.click('.nav-home');
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.click('.logout-link');
  }
}
```

---

## Data Flow

```
Test Data (CSV/Excel)
    ↓
DataProvider (reads and caches data)
    ↓
Test Layer (iterates through data)
    ↓
Feature Layer (executes business scenarios)
    ↓
Page Layer (performs UI actions)
    ↓
Browser (actual interactions)
```

## Utilities & Supporting Layers

### Data Readers (`src/utils/dataReaders/`)
- CSV Reader
- Excel Reader
- Data Provider (unified interface with caching)

### Utilities (`src/utils/`)
- Logger (Winston-based logging)
- Screenshot Helper (failure capture)
- Helpers (common utilities)

### Configuration (`src/config/`)
- Environment configurations
- Test settings

### Fixtures (`src/fixtures/`)
- Playwright custom fixtures
- Dependency injection
- Page/Feature/Component initialization

### Hooks (`src/hooks/`)
- Global setup (runs before all tests)
- Global teardown (runs after all tests)

## Benefits of This Architecture

### 1. **Separation of Concerns**
Each layer has a single responsibility, making code easier to understand and maintain.

### 2. **Reusability**
- Features can be reused across multiple tests
- Pages can be reused across multiple features
- Components can be used by any page

### 3. **Maintainability**
- Locator changes only affect page objects
- Business logic changes only affect features
- Test data changes don't require code changes

### 4. **Scalability**
Easy to add new:
- Tests (just create new test files)
- Features (new business scenarios)
- Pages (new page objects)
- Components (new reusable components)

### 5. **Testability**
- Each layer can be tested independently
- Mock dependencies easily
- Clear boundaries for unit testing

### 6. **Readability**
Tests read like business requirements:
```typescript
await loginFeature.performSuccessfulLogin(username, password);
await checkoutFeature.completeOrderWithCreditCard(orderData);
```

## Design Patterns Used

### 1. **Page Object Model (POM)**
Pages encapsulate UI elements and actions.

### 2. **Feature Pattern** (Business Logic Layer)
Features encapsulate business scenarios.

### 3. **Dependency Injection**
Fixtures provide dependencies to tests.

### 4. **Factory Pattern**
DataProvider creates appropriate readers based on file type.

### 5. **Singleton Pattern**
Logger and utilities use singleton pattern.

### 6. **Strategy Pattern**
Different data readers (CSV, Excel) implement common interface.

## Code Organization Best Practices

### Naming Conventions

**Files**:
- Pages: `LoginPage.ts`, `HomePage.ts`
- Features: `LoginFeature.ts`, `CheckoutFeature.ts`
- Tests: `login.spec.ts`, `checkout.spec.ts`
- Components: `HeaderComponent.ts`, `ModalComponent.ts`

**Classes**:
- Pages: `LoginPage`, `HomePage`
- Features: `LoginFeature`, `CheckoutFeature`
- Components: `HeaderComponent`, `FooterComponent`

**Methods**:
- Features: `performSuccessfulLogin()`, `completeCheckout()`
- Pages: `login()`, `clickButton()`, `fillForm()`
- Tests: `test('description', async () => {})`

### File Organization

```
src/
├── pages/           # One file per page
├── features/        # One file per feature area
├── components/      # One file per component
├── tests/           # Organized by feature/module
└── utils/           # Organized by utility type
```

## Extension Points

### Adding New Features

1. Create page objects in `src/pages/`
2. Create feature class in `src/features/`
3. Add fixture in `src/fixtures/index.ts`
4. Write tests in `src/tests/`

### Adding New Utilities

1. Create utility in `src/utils/`
2. Export from appropriate index file
3. Import in features/pages as needed

### Adding New Test Data Sources

1. Create reader in `src/utils/dataReaders/`
2. Update DataProvider to support new type
3. Use via DataProvider in tests

---

## Summary

This three-layer architecture ensures:
- **Tests** focus on what to test
- **Features** focus on how to test (business logic)
- **Pages** focus on where to interact (UI elements)

Each layer has clear boundaries and responsibilities, making the framework maintainable, scalable, and easy to understand.
