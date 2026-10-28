# Playwright E2E Automation

End-to-end browser automation built with [Cucumber.js](https://cucumber.io/docs/installation/) and [Playwright](https://playwright.dev/docs/intro). Scenarios are written in Gherkin, implemented by step definitions, and use reusable Page Objects and Playwright assertions to exercise login, account creation, shopping cart, checkout, API behavior, and order management.

The suites cover three practice applications:

- [EventHub](https://eventhub.rahulshettyacademy.com)
- [Let's Shop](https://rahulshettyacademy.com/client/)
- [ProtoCommerce login practice](https://rahulshettyacademy.com/loginpagePractise/)

## Project structure

```text
.
├── pages/
│   ├── EventHubLoginPage.js
│   ├── LetsShopLoginPage.js
│   ├── LetsShopDashboardPage.js
│   ├── LetsShopCartPage.js
│   ├── LetsShopCheckoutPage.js
│   └── LetsShopOrdersPage.js
├── api/
│   ├── AuthApi.js
│   └── OrdersApi.ts
├── features/
│   ├── eventhub.feature
│   ├── letsshop.feature
│   ├── protocommerce.feature
│   ├── step_definitions/
│   │   ├── eventhub.steps.js
│   │   ├── letsshop.steps.js
│   │   └── protocommerce.steps.js
│   └── support/
│       └── world.js
├── playwright.config.js
└── package.json
```

Page Objects encapsulate screen-specific locators and interactions. Gherkin feature files describe user-visible scenarios, while step definitions implement them. Cucumber hooks create an isolated Playwright context for each scenario. All scenarios exercise the web UI; some use API calls to prepare test data. The `@api` tag identifies those hybrid scenarios, and `@web` selects scenarios that exercise the UI. Tags can be used to filter execution.

## Coverage

### EventHub

- Mock the events API to verify the sandbox banner for different event counts.
- Verify that one user cannot view another user's booking.
- Authenticate through the UI, create an event through the API, verify it, and delete the test event.
- The cross-user scenario registers uniquely named sandbox users and creates a booking through the EventHub API.

### Let's Shop

- Sign in with environment-provided credentials for the website login, cart, checkout, and order scenarios. API-backed scenarios authenticate through the API.
- Add a product to the cart, verify it, and remove it.
- Navigate from the cart to checkout.
- Verify negative checkout paths when required payment details or shipping country are missing.
- Complete an order without a coupon and verify the order confirmation.
- Capture the generated order ID in the Cucumber report.
- Create orders for the order-management scenarios, then view an order by ID or delete it and verify the success alert.

### ProtoCommerce

- Reject invalid login credentials.
- Accept valid demo credentials and verify the shop page.
- Select user type and role, and verify the terms checkbox.

### Account creation

The account-creation scenario uses Faker-generated identity data, including a unique, lowercase email address.

## Requirements and setup

- Node.js and npm.
- Chromium, installed through Playwright.

Install dependencies and the browser from the repository root:

```bash
npm install
npx playwright install chromium
```

## Credentials

The Let's Shop and EventHub suites use the same test account through `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`. Cucumber's support setup loads these values from a local `.env` file using `dotenv`.

Create `.env` in the repository root:

```env
TEST_USER_EMAIL=your-test-account-email
TEST_USER_PASSWORD=your-test-account-password
```

`.env` is ignored by Git. Do not commit credentials; configure CI credentials as protected secrets. These tests interact with a shared external practice application and create or delete orders, so use a dedicated test account.

## Running tests

Run all scenarios:

```bash
npm test
```

Run scenarios by tag:

```bash
npm run test:api
npm run test:web
```

Generate the Cucumber HTML report:

```bash
npx cucumber-js --format progress --format html:cucumber-report.html
```

Check the TypeScript types in the Orders API client:

```bash
npm run typecheck
```

Open `cucumber-report.html` from the repository root in your browser.

Scenarios run in headless Chromium at a desktop viewport. Failed scenarios include a screenshot and a Playwright trace (`.zip`) as attachments in the Cucumber report. Open the trace with `npx playwright show-trace <trace-file.zip>`. Traces may contain page data and should be treated as sensitive artifacts.

## Test data and order IDs

Order IDs are passed between steps in memory within each scenario rather than through a shared file. The ID is also attached as plain text to the corresponding Cucumber report entry for convenient inspection. This keeps scenarios independent and avoids relying on execution order or shared mutable data.
