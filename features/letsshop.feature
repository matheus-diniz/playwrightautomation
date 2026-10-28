Feature: Let's Shop account and order workflows

  @web
  Scenario: Reject an invalid login
    Given I open the Let's Shop login page
    When I sign in to Let's Shop with invalid credentials
    Then the login error is displayed

  @web
  Scenario: Sign in with valid credentials
    Given I sign in to Let's Shop with valid credentials
    Then the dashboard is displayed

  @web
  Scenario: Create a new account
    Given I open the Let's Shop login page
    When I create a new Let's Shop account
    Then the account creation confirmation is displayed

  @web
  Scenario: Add a product to the cart
    Given I am signed in to Let's Shop
    When I add "ADIDAS ORIGINAL" to the cart
    And I open the cart
    Then "ADIDAS ORIGINAL" is present in the cart

  @web
  Scenario: Remove a product from the cart
    Given I am signed in to Let's Shop
    When I add "ADIDAS ORIGINAL" to the cart
    And I open the cart
    And I remove "ADIDAS ORIGINAL" from the cart
    Then "ADIDAS ORIGINAL" is not present in the cart

  @web
  Scenario: Proceed to checkout with a cart product
    Given I am signed in to Let's Shop
    When I add "ADIDAS ORIGINAL" to the cart
    And I open the cart
    And I proceed to checkout
    Then "ADIDAS ORIGINAL" is shown at checkout

  @web
  Scenario: Do not place an order without card details
    Given I am signed in to Let's Shop
    And I add "ADIDAS ORIGINAL" to the cart
    And I proceed from the cart to checkout
    When I enter shipping details
    And I attempt to place the order
    Then the order is not confirmed

  @web
  Scenario: Do not place an order without a shipping country
    Given I am signed in to Let's Shop
    And I add "ADIDAS ORIGINAL" to the cart
    And I proceed from the cart to checkout
    When I enter card details without selecting a country
    And I attempt to place the order
    Then the order is not confirmed

  @web
  Scenario: Place an order without a coupon
    Given I am signed in to Let's Shop
    And I add "ADIDAS ORIGINAL" to the cart
    And I proceed from the cart to checkout
    When I enter valid card and shipping details
    And I place the order
    Then the order confirmation is displayed

  @web
  Scenario: Find an order by its ID
    Given I am signed in to Let's Shop
    And I create an order through the website
    When I search for the order by its ID
    Then the order details are displayed

  @web
  Scenario: Delete an order by its ID
    Given I am signed in to Let's Shop
    And I create an order through the website
    When I delete the order by its ID
    Then the order deletion confirmation is displayed

  @api @web
  Scenario: Access the dashboard with a valid authentication token
    Given I open the Let's Shop dashboard with a valid authentication token
    Then the dashboard is available without the login form

  @api @web
  Scenario: Create an order through the API and find it in the dashboard
    Given I create an order through the Let's Shop API
    When I open the Let's Shop orders page
    Then I can view the API-created order
