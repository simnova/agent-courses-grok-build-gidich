Feature: Healthcheck endpoint
  As a developer or agent running in an isolated worktree
  I want a standard, always-available healthcheck
  So that I can verify the api is wired correctly and gates pass in parallel environments

  Scenario: The healthcheck returns ok status
    Given the API is available
    When I request the healthcheck endpoint
    Then the response status should be 200
    And the response should indicate service is "ok"
    And the response should include a recent timestamp
    And the response should identify service "axc-api"

  # Extension point scenario for future
  # Scenario: Healthcheck can report experiment context (not yet implemented)
