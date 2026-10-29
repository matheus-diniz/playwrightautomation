# EventHub Refund Eligibility Check

## Application Overview

Validate EventHub refund eligibility for a single-ticket booking and a three-ticket group booking. The live application is available at https://eventhub.rahulshettyacademy.com. Existing browser exploration confirms visitors are routed to /login when not authenticated; use the configured TEST_USER_EMAIL and TEST_USER_PASSWORD without exposing credentials. Each scenario must create its own booking and verify booking details and the asynchronously displayed refund result.

## Test Scenarios

### 1. EventHub refund eligibility

**Seed:** `tests/seed.spec.ts`

#### 1.1. Single-ticket booking is eligible for refund

**File:** `features/eventhub.feature`

**Steps:**
  1. Begin with a fresh browser context and an existing EventHub test account; sign in using the project's configured credential helper.
    - expect: Login succeeds and authenticated EventHub navigation is available.
  2. Open /events and choose the first [data-testid="event-card"]. Click its [data-testid="book-now-btn"]. Leave ticket quantity at its default of 1, fill Full Name, the configured account email, and Phone, then click .confirm-booking-btn.
    - expect: The booking is accepted and a booking reference is displayed.
  3. Click View My Bookings, verify the URL is /bookings, and click the first View Details link.
    - expect: The booking detail page displays Booking Information.
  4. Read the booking reference and h1 event title.
    - expect: The first character of the booking reference equals the first character of the event title.
  5. Click Check Refund Eligibility. Immediately verify #refund-spinner is visible, then verify it becomes hidden within 6 seconds.
    - expect: The eligibility request shows a spinner promptly and hides it within the specified timeout.
  6. Inspect #refund-result.
    - expect: The result is visible and contains Eligible for refund.
    - expect: The result contains Single-ticket bookings qualify for a full refund.

#### 1.2. Group booking of three tickets is not eligible for refund

**File:** `features/eventhub.feature`

**Steps:**
  1. Begin with a fresh browser context and an existing EventHub test account; sign in using the project's configured credential helper.
    - expect: Login succeeds and authenticated EventHub navigation is available.
  2. Open /events and choose the first [data-testid="event-card"]. Click its [data-testid="book-now-btn"]. Click button:has-text("+") twice and verify quantity is 3. Fill Full Name, the configured account email, and Phone, then click .confirm-booking-btn.
    - expect: The booking is accepted for exactly 3 tickets and a booking reference is displayed.
  3. Click View My Bookings, verify the URL is /bookings, and click the first View Details link.
    - expect: The booking detail page displays Booking Information.
  4. Read the booking reference and h1 event title.
    - expect: The first character of the booking reference equals the first character of the event title.
  5. Click Check Refund Eligibility. Immediately verify #refund-spinner is visible, then verify it becomes hidden within 6 seconds.
    - expect: The eligibility request shows a spinner promptly and hides it within the specified timeout.
  6. Inspect #refund-result.
    - expect: The result is visible and contains Not eligible for refund.
    - expect: The result contains Group bookings (3 tickets) are non-refundable.
