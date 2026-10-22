# Playwright E2E Automation

End-to-end browser automation built with [Playwright Test](https://playwright.dev/docs/intro) and JavaScript. The project applies reusable Page Objects, isolated test scenarios, accessible locators, and Playwright's auto-waiting assertions to exercise login, account creation, shopping cart, checkout, and order management.

The suites cover three practice applications:

- [EventHub](https://eventhub.rahulshettyacademy.com)
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
│   ├── eventhub/
│   │   ├── EventHubCrossUserBookingTests.spec.js
│   │   ├── EventHubFixturesTests.spec.js
│   │   ├── EventHubInterceptTests.spec.js
│   │   ├── fixtures.js
│   │   └── helpers.js
│   ├── letsshop/
│   │   ├── ClientDashboardTests.spec.js
│   │   ├── LetsShopDashboardTests.spec.js
│   │   ├── LetsShopOrdersTests.spec.js
│   │   └── LetsShopWebAPITests.spec.js
│   └── UIBasicTestStep.spec.js
├── playwright.config.js
└── package.json
```

Page Objects encapsulate screen-specific locators and interactions. Tests describe user-visible scenarios and assert outcomes. Each Playwright test receives its own browser context and prepares its required state, so tests can run independently.

## Coverage

### EventHub

- Mock the events API to verify the sandbox banner for different event counts.
- Verify that one user cannot view another user's booking.
- Use custom fixtures to authenticate through the UI, create an event through the API, verify it, and delete the test event.
- The cross-user scenario registers uniquely named sandbox users and creates a booking through the EventHub API.

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

The Let's Shop and EventHub suites use the same test account through `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`. The Playwright configuration loads these values from a local `.env` file using `dotenv`.

Create `.env` in the repository root:

```env
TEST_USER_EMAIL=your-test-account-email
TEST_USER_PASSWORD=your-test-account-password
```

`.env` is ignored by Git. Do not commit credentials; configure CI credentials as protected secrets. These tests interact with a shared external practice application and create or delete orders, so use a dedicated test account.

## Running tests

Run all tests:

```bash
npx playwright test
```

Run a specific suite:

```bash
npx playwright test tests/letsshop/LetsShopDashboardTests.spec.js
npx playwright test tests/letsshop/LetsShopOrdersTests.spec.js
npx playwright test tests/letsshop/ClientDashboardTests.spec.js
npx playwright test tests/letsshop/LetsShopWebAPITests.spec.js
npx playwright test tests/UIBasicTestStep.spec.js
npx playwright test tests/eventhub/EventHubInterceptTests.spec.js
npx playwright test tests/eventhub/EventHubCrossUserBookingTests.spec.js
npx playwright test tests/eventhub/EventHubFixturesTests.spec.js
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
