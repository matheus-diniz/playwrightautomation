Feature: EventHub access and event listings

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

