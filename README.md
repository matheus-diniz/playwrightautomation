# Playwright E2E Automation

End-to-end browser automation built with [Playwright Test](https://playwright.dev/docs/intro) and JavaScript. The project applies reusable Page Objects, isolated test scenarios, accessible locators, and Playwright's auto-waiting assertions to exercise login, account creation, shopping cart, checkout, and order management.

The suites cover two practice applications:

- [Let's Shop](https://rahulshettyacademy.com/client/)
- [ProtoCommerce login practice](https://rahulshettyacademy.com/loginpagePractise/)

## Project structure

```text
.
├── pages/
│   ├── LetsShopLoginPage.js
│   ├── LetsShopDashboardPage.js
│   ├── LetsShopCartPage.js
│   ├── LetsShopCheckoutPage.js
│   └── LetsShopOrdersPage.js
├── tests/
│   ├── LetsShopDashboardTests.spec.js
│   ├── LetsShopOrdersTests.spec.js
│   ├── ClientDashboardTests.spec.js
│   └── UIBasicTestStep.spec.js
├── playwright.config.js
└── package.json
```

Page Objects encapsulate screen-specific locators and interactions. Tests describe user-visible scenarios and assert outcomes. Each Playwright test receives its own browser context and prepares its required state, so tests can run independently.

## Coverage

### Let's Shop

- Login before each dashboard and order scenario using environment-provided credentials.
- Add a product to the cart, verify it, and remove it.
- Navigate from the cart to checkout.
- Verify negative checkout paths when required payment details or shipping country are missing.
- Complete an order without a coupon and verify the order confirmation.
- Capture the generated order ID in the Playwright report.
- Create an order for each Orders scenario, then view it by ID or delete it and verify the success alert.

### ProtoCommerce

- Reject invalid login credentials.
- Accept valid demo credentials and verify the shop page.
- Select user type and role, and verify the terms checkbox.

### Account creation

`ClientDashboardTests.spec.js` creates a user with Faker-generated identity data, including a unique, lowercase email address.

## Requirements and setup

- Node.js and npm.
- Chromium, installed through Playwright.

Install dependencies and the browser from the repository root:

```bash
npm install
npx playwright install chromium
```

## Credentials

The Let's Shop dashboard and Orders suites read `LETSHOP_EMAIL` and `LETSHOP_PASSWORD`. The Playwright configuration loads these values from a local `.env` file using `dotenv`.

Create `.env` in the repository root:

```env
LETSHOP_EMAIL=your-test-account-email
LETSHOP_PASSWORD=your-test-account-password
```

`.env` is ignored by Git. Do not commit credentials; configure CI credentials as protected secrets. These tests interact with a shared external practice application and create or delete orders, so use a dedicated test account.

## Running tests

Run all tests:

```bash
npx playwright test
```

Run a specific suite:

```bash
npx playwright test tests/LetsShopDashboardTests.spec.js
npx playwright test tests/LetsShopOrdersTests.spec.js
npx playwright test tests/ClientDashboardTests.spec.js
npx playwright test tests/UIBasicTestStep.spec.js
```

Run tests matching a title:

```bash
npx playwright test --grep "places order"
```

Open the HTML report:

```bash
npx playwright show-report
```

The configuration currently runs headless Chromium at a desktop viewport, captures screenshots, retains traces on failure, and generates the Playwright HTML report. See [`playwright.config.js`](./playwright.config.js).

## Test data and order IDs

Order IDs are passed between steps in memory within each test rather than through a shared file. The ID is also attached to the corresponding test result as `order-id.txt` for convenient inspection in the HTML report. This keeps tests independent and avoids relying on execution order or shared mutable data.
