@plugin-management @critical
Feature: Plugin Management
  As a user
  I want to manage plugins easily
  So that I can customize my dashboard

  Background:
    Given I am logged into the dashboard
    And I have access to the plugin manager

  @happy-path @critical
  Scenario: Install a plugin successfully
    Given I am on the plugin manager page
    When I click "Install" on the "Reading Core" plugin
    Then I should see "Plugin installed successfully"
    And the plugin should appear in my installed plugins list
    And I should see the plugin's widgets on my dashboard

  @error-handling @network-failure
  Scenario: Handle installation failure gracefully
    Given I am on the plugin manager page
    And the network is experiencing issues
    When I click "Install" on a plugin
    Then I should see "Unable to install plugin"
    And I should see "Please check your connection and try again"
    And I should see a "Retry" button

  @accessibility @screen-reader @wcag
  Scenario: Plugin manager is accessible
    Given I am using a screen reader
    When I navigate to the plugin manager
    Then all plugin cards should have proper ARIA labels
    And all buttons should have descriptive text
    And the page should be navigable by keyboard only

  @uninstall @cleanup
  Scenario: Uninstall a plugin successfully
    Given I have installed the "Reading Core" plugin
    When I click "Uninstall" on the "Reading Core" plugin
    Then I should see "Plugin uninstalled successfully"
    And the plugin should be removed from my installed plugins list
    And the plugin's widgets should disappear from my dashboard

  @performance @loading
  Scenario: Plugin installation shows loading state
    Given I am on the plugin manager page
    When I click "Install" on a plugin
    Then I should see "Installing plugin..."
    And the install button should be disabled
    And I should see a loading spinner
    When the installation completes
    Then I should see "Plugin installed successfully"
    And the loading state should clear

  @validation @input
  Scenario: Plugin manager validates user input
    Given I am on the plugin manager page
    When I try to install a plugin without proper permissions
    Then I should see "Insufficient permissions"
    And I should see "Please contact your administrator"
    And the install button should remain enabled

  @search @discovery
  Scenario: Find plugins through search
    Given I am on the plugin manager page
    When I search for "reading"
    Then I should see plugins related to reading
    And the search results should be relevant
    And I should see a "Clear search" option

  @categories @organization
  Scenario: Browse plugins by category
    Given I am on the plugin manager page
    When I click on the "Productivity" category
    Then I should see only productivity plugins
    And the category filter should be active
    And I should see the category name in the header 