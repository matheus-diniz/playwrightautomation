Feature: EventHub access and event listings

  @web
  Scenario: Register a fresh EventHub account
    Given I open the EventHub registration page
    When I register a unique EventHub account
    Then the EventHub account registration succeeds

  @web
  Scenario: Reject invalid EventHub credentials
    Given I open the EventHub login page
    When I sign in to EventHub with invalid credentials
    Then the EventHub login error is displayed

  @web
  Scenario: Create an event, book one ticket, and verify seat reduction
    Given I sign in to EventHub with configured credentials
    When I create a unique EventHub event with 50 seats
    And I book one ticket for the created EventHub event
    Then the booking is listed in My Bookings
    And the EventHub event has one fewer available seat

  @web
  Scenario: Prevent EventHub event creation when required fields are missing
    Given I sign in to EventHub with configured credentials
    When I submit the blank EventHub event form
    Then EventHub required-field validation prevents creation

  @api @web
  Scenario: A user cannot view another user's booking
    Given two EventHub users are registered
    And the first user creates a booking through the API
    When the second user opens the first user's booking
    Then access to the booking is denied

  @api @web
  Scenario: Display an event created through the API
    Given I create an EventHub event through the API
    When I open the EventHub events page as an authenticated user
    Then the created event is displayed

  @web
  Scenario: Show the sandbox banner when six events are returned
    Given the EventHub API is mocked to return 6 events
    When I open the EventHub events page as an authenticated user
    Then 6 event cards are displayed
    And the sandbox banner shows 9 bookings

  @web
  Scenario: Hide the sandbox banner when four events are returned
    Given the EventHub API is mocked to return 4 events
    When I open the EventHub events page as an authenticated user
    Then 4 event cards are displayed
    And the sandbox banner is not displayed
