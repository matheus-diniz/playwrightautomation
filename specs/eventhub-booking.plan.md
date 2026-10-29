# EventHub Event Creation and Booking Test Plan

## Application Overview

Validate fresh EventHub sandbox account setup, login behavior, admin event creation, public event discovery, one-seat booking, booking history, and seat inventory reduction at https://eventhub.rahulshettyacademy.com. The login and event-management routes redirect unauthenticated visitors to /login, and the login screen exposes a Register link; a fresh sandbox account is therefore required for authenticated scenarios. Use isolated data and unique values per run, and keep credentials in secure environment configuration rather than committing them.

## Test Scenarios

### 1. EventHub web flows

**Runner:** Cucumber (`npm test`)

**Feature:** `features/eventhub.feature`

**Step definitions:** `features/step_definitions/eventhub_ui.steps.js`

**Page objects:** `pages/eventhub/`

**Authentication API helper:** `api/EventHubAuthApi.js`

#### 1.1. Create a fresh EventHub sandbox account

**Scenario:** `Register a fresh EventHub account` in `features/eventhub.feature`

**Steps:**
  1. Start with no account for the generated email address. Open https://eventhub.rahulshettyacademy.com/register.
    - expect: The Create your account form is visible with email, password, and confirm-password fields.
  2. Generate a unique email address for this run. Enter it in the email field. Enter a password meeting the visible requirements (at least 8 characters, uppercase letter, number, and symbol), repeat it in Confirm Password, and click Create Account.
    - expect: Account creation succeeds and the application shows its success state or directs the user to the next authentication state.
    - expect: The unique email can be used by the login scenario.
  3. Record the generated credentials in the test runner's secure environment/configuration for the authenticated scenarios; do not hard-code or print the password.
    - expect: No credential is committed to source control or included in test output.

#### 1.2. Reject invalid EventHub credentials

**Scenario:** `Reject invalid EventHub credentials` in `features/eventhub.feature`

**Steps:**
  1. Start signed out with a fresh browser context. Open https://eventhub.rahulshettyacademy.com/login.
    - expect: The sign-in form is visible, including the email field with placeholder you@email.com, the Password field, and the Sign In button.
  2. Enter a syntactically valid but unregistered email address and a non-empty incorrect password, then click the login button (#login-btn).
    - expect: The user is not authenticated and remains on the login flow.
    - expect: An explicit visible validation or authentication error is shown.
    - expect: The Browse Events link is not shown as an authenticated-success state.

#### 1.3. Create an event, book one ticket, and verify seat reduction

**Scenario:** `Create an event, book one ticket, and verify seat reduction` in `features/eventhub.feature`

**Steps:**
  1. Assumption: begin with a registered sandbox account and load its credentials from secure test configuration (`TEST_USER_EMAIL` and `TEST_USER_PASSWORD`). The reusable `EventHubLoginPage.login(user)` method navigates to `/login`, fills the credentials, submits the form, and verifies that Browse Events is visible. The Cucumber scenario calls this before protected actions.
    - expect: Login succeeds and Browse Events is visible before protected event-management actions begin.
  2. Navigate to BASE_URL + '/admin/events'. Generate and store eventTitle = `Test Event ${Date.now()}`. Fill #event-title-input with eventTitle; fill #admin-event-form textarea with a non-empty description; fill City and Venue by their labels; fill Event Date & Time using a futureDateValue() helper; fill Price ($) with 100 and Total Seats with 50. Click #add-event-btn.
    - expect: A visible toast reports Event created!.
    - expect: The submitted title and valid future date are accepted.
  3. Navigate to BASE_URL + '/events'. Locate all [data-testid="event-card"] cards and assert the first card is visible. Filter the cards for the one containing eventTitle and wait up to 5 seconds for the matched card to be visible. Find the seat-count text within that card (the text containing 'seat'), parse its integer, and store it as seatsBeforeBooking.
    - expect: The newly created event card is found and visible.
    - expect: seatsBeforeBooking parses to 50.
  4. Within the matched event card, click the button [data-testid="book-now-btn"].
    - expect: The booking flow for the selected event opens.
  5. Assert #ticket-count displays 1 by default. Fill Full Name by label, #customer-email, and the phone field by placeholder +91 98765 43210. Click .confirm-booking-btn.
    - expect: The booking is accepted for exactly one ticket.
  6. Locate .booking-ref and use its first match. Assert it is visible, read its inner text, trim it, and store it as bookingRef.
    - expect: A non-empty booking reference is displayed and stored.
  7. Click View My Bookings. Assert the URL is exactly BASE_URL + '/bookings'. Locate all #booking-card elements and assert the first is visible. Filter the booking cards to the one containing a .booking-ref element matching bookingRef.
    - expect: The bookings page is reached and at least one booking card is visible.
    - expect: The card matching bookingRef is visible and contains eventTitle.
  8. Navigate to BASE_URL + '/events'. Assert the first event card is visible. Filter cards by eventTitle and assert the matched card is visible. Read and parse the seat-count text using the same method as before and store it as seatsAfterBooking.
    - expect: The created event remains visible after booking.
    - expect: seatsAfterBooking parses to 49.
  9. Compare seatsAfterBooking with seatsBeforeBooking.
    - expect: seatsAfterBooking === seatsBeforeBooking - 1.
    - expect: The test fails if the booking reference is missing, the wrong event appears in My Bookings, or the inventory does not decrease by exactly one seat.

#### 1.4. Prevent event creation when required fields are missing

**Scenario:** `Prevent EventHub event creation when required fields are missing` in `features/eventhub.feature`

**Steps:**
  1. Start signed in with a fresh sandbox account. Navigate to BASE_URL + '/admin/events' and leave the required event fields blank.
    - expect: The admin event form is visible.
  2. Click #add-event-btn without entering required values.
    - expect: Required-field validation is shown and prevents event creation.
    - expect: No Event created! success toast appears and no event with an empty title is added to /events.
