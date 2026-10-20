# Playwright Test Automation Learning Project

A hands-on learning and practice project for browser test automation with
[Playwright Test](https://playwright.dev/docs/intro). The exercises in this
repository are based on the Udemy course
[Playwright Tutorials - Automation Testing](https://www.udemy.com/course/playwright-tutorials-automation-testing).

This repository is for learning purposes. It currently contains UI tests for
the demo login page at
[`rahulshettyacademy.com/loginpagePractise`](https://rahulshettyacademy.com/loginpagePractise/).

## What the project practices

- Organizing tests with Playwright Test.
- Locating and interacting with form controls using accessible roles.
- Reusing setup and form actions with hooks and helper functions.
- Checking both successful and unsuccessful login outcomes.
- Using Playwright's retrying assertions, such as `toHaveTitle()` and
  `toBeVisible()`.
- Capturing screenshots and generating an HTML test report.

## Prerequisites

- [Node.js](https://nodejs.org/) and npm.
- Chromium, installed through Playwright's browser installer.

## Setup

Clone the repository, then run these commands from its root:

```bash
npm install
npx playwright install chromium
```

## Run the tests

Run all tests:

```bash
npx playwright test
```

Run a specific test file:

```bash
npx playwright test tests/UIBasicTestStep.spec.js
```

Open the HTML report after a run:

```bash
npx playwright show-report
```

The current configuration runs tests in headless Chromium, captures screenshots
for every test, and uses Playwright's HTML reporter. The configuration is in
[`playwright.config.js`](./playwright.config.js).

## Current test coverage

The tests in [`tests/UIBasicTestStep.spec.js`](./tests/UIBasicTestStep.spec.js)
cover:

- Rejection of invalid login credentials.
- Acceptance of the demo credentials and display of the shop page.
- Selection of user type and role, and ensuring the terms checkbox is checked.

The demo credentials in the test are intended only for this public practice
site. Do not use real or sensitive credentials in test code.

## Repository layout

```text
.
├── tests/
│   └── UIBasicTestStep.spec.js
├── playwright.config.js
├── package.json
└── README.md
```

