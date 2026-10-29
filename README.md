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

## AI-assisted test engineering workflow

I use Playwright's planning and browser tools to accelerate discovery while keeping test design and implementation grounded in the application and this repository's conventions.

1. **Start with the codebase.** Review the target portal's feature file, step definitions, Page Objects, API helpers, and Cucumber hooks. Identify reusable authentication, test-data, and cleanup flows before deciding what to add.
2. **Turn requirements into a test plan.** Use the Playwright Test Planner to organize scenarios, actions, and expected outcomes. Keep plans under `specs/` so the intended behavior is explicit before implementation.
3. **Explore to verify, not to assume.** Use the Playwright Test Generator and Playwright MCP browser tools to inspect the live UI, confirm selectors and page states, and check asynchronous behavior. Feed observed discrepancies back into the plan rather than relying on guessed locators.
4. **Implement in the project's test architecture.** Translate the verified plan into Gherkin scenarios under `features/`, Cucumber step definitions under `features/step_definitions/`, and reusable UI behavior in portal-specific Page Objects under `pages/`. Keep shared API operations in class-based helpers under `api/`.
5. **Keep the tool boundary clear.** Browser planning and generator tools support exploration; they do not create executable tests for this project. Do not generate Playwright Test `.spec.js` or `.spec.ts` files. Cucumber remains the runner and Gherkin remains the executable test specification.
6. **Use credentials and test data safely.** Cucumber loads `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` from the local `.env` through the existing support setup. Do not place secrets in prompts, source files, or logs. Isolated browser-agent sessions may not inherit local environment variables, so use the project's local Cucumber flow for authenticated execution.
7. **Verify the implementation.** Run `npx cucumber-js --dry-run`, then execute the changed feature or scenarios with the appropriate tag expression. Review failures, preserve unrelated portal flows, and rely on CI only after local validation.

This workflow combines browser-based discovery with repository-aware implementation and executable Cucumber validation, keeping the resulting tests maintainable and consistent with the rest of the suite.

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

## GitHub Actions

The `Cucumber Tests` workflow runs on pushes to `master` and on pull requests targeting `master`. After a run, download the `cucumber-report` artifact from the workflow run page to view the HTML report.

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
