@web
Feature: ProtoCommerce login
  As a shop user
  I want to authenticate with the appropriate credentials
  So that I can access the demo shop

  Background:
    Given I open the ProtoCommerce login page

  Scenario: Reject invalid credentials
    When I sign in to ProtoCommerce with invalid credentials
    Then I see the invalid credentials message

  Scenario: Accept valid credentials
    When I sign in to ProtoCommerce with valid credentials
    Then I see the ProtoCommerce shop

