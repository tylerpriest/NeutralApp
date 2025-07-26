/**
 * Test suite for Relentless Mode failure tracking and escalation
 * Tests the logic described in .cursor/rules/00-relentless-mode-rule.mdc
 */

describe('Relentless Mode Failure Tracking', () => {
  // Mock failure tracking state
  let typescript_failures = 0;
  let test_failures = 0;
  let service_failures = 0;
  let multi_perspective_triggered = false;
  let triggered_gate = '';

  // Mock function to simulate multi-perspective analysis trigger
  const trigger_multi_perspective_analysis = (gateName: string) => {
    multi_perspective_triggered = true;
    triggered_gate = gateName;
  };

  // Reset state before each test
  beforeEach(() => {
    typescript_failures = 0;
    test_failures = 0;
    service_failures = 0;
    multi_perspective_triggered = false;
    triggered_gate = '';
  });

  // Simulate quality gate checking logic
  const checkQualityGates = (
    typescript_compiles: boolean,
    test_pass_rate: number,
    services_working: boolean
  ) => {
    // TypeScript gate
    if (!typescript_compiles) {
      typescript_failures++;
      if (typescript_failures >= 3) {
        trigger_multi_perspective_analysis("TypeScript Compilation");
      }
    } else {
      typescript_failures = 0;
    }

    // Test suite gate
    if (test_pass_rate < 80) {
      test_failures++;
      if (test_failures >= 3) {
        trigger_multi_perspective_analysis("Core Test Suite");
      }
    } else {
      test_failures = 0;
    }

    // Critical services gate
    if (!services_working) {
      service_failures++;
      if (service_failures >= 3) {
        trigger_multi_perspective_analysis("Critical Services");
      }
    } else {
      service_failures = 0;
    }
  };

  describe('Individual Gate Failure Tracking', () => {
    test('should track TypeScript compilation failures independently', () => {
      // First failure
      checkQualityGates(false, 90, true);
      expect(typescript_failures).toBe(1);
      expect(multi_perspective_triggered).toBe(false);

      // Second failure
      checkQualityGates(false, 90, true);
      expect(typescript_failures).toBe(2);
      expect(multi_perspective_triggered).toBe(false);

      // Third failure - should trigger escalation
      checkQualityGates(false, 90, true);
      expect(typescript_failures).toBe(3);
      expect(multi_perspective_triggered).toBe(true);
      expect(triggered_gate).toBe("TypeScript Compilation");
    });

    test('should track core test suite failures independently', () => {
      // First failure (75% pass rate)
      checkQualityGates(true, 75, true);
      expect(test_failures).toBe(1);
      expect(multi_perspective_triggered).toBe(false);

      // Second failure (70% pass rate)
      checkQualityGates(true, 70, true);
      expect(test_failures).toBe(2);
      expect(multi_perspective_triggered).toBe(false);

      // Third failure - should trigger escalation
      checkQualityGates(true, 65, true);
      expect(test_failures).toBe(3);
      expect(multi_perspective_triggered).toBe(true);
      expect(triggered_gate).toBe("Core Test Suite");
    });

    test('should track critical services failures independently', () => {
      // First failure
      checkQualityGates(true, 90, false);
      expect(service_failures).toBe(1);
      expect(multi_perspective_triggered).toBe(false);

      // Second failure
      checkQualityGates(true, 90, false);
      expect(service_failures).toBe(2);
      expect(multi_perspective_triggered).toBe(false);

      // Third failure - should trigger escalation
      checkQualityGates(true, 90, false);
      expect(service_failures).toBe(3);
      expect(multi_perspective_triggered).toBe(true);
      expect(triggered_gate).toBe("Critical Services");
    });
  });

  describe('Counter Reset Logic', () => {
    test('should reset TypeScript failure counter on success', () => {
      // Build up failures
      checkQualityGates(false, 90, true);
      checkQualityGates(false, 90, true);
      expect(typescript_failures).toBe(2);

      // Success should reset counter
      checkQualityGates(true, 90, true);
      expect(typescript_failures).toBe(0);
      expect(multi_perspective_triggered).toBe(false);
    });

    test('should reset test failure counter on success', () => {
      // Build up failures
      checkQualityGates(true, 75, true);
      checkQualityGates(true, 70, true);
      expect(test_failures).toBe(2);

      // Success should reset counter (85% pass rate)
      checkQualityGates(true, 85, true);
      expect(test_failures).toBe(0);
      expect(multi_perspective_triggered).toBe(false);
    });

    test('should reset service failure counter on success', () => {
      // Build up failures
      checkQualityGates(true, 90, false);
      checkQualityGates(true, 90, false);
      expect(service_failures).toBe(2);

      // Success should reset counter
      checkQualityGates(true, 90, true);
      expect(service_failures).toBe(0);
      expect(multi_perspective_triggered).toBe(false);
    });
  });

  describe('Independent Gate Tracking', () => {
    test('should track failures for different gates independently', () => {
      // TypeScript fails twice
      checkQualityGates(false, 90, true);
      checkQualityGates(false, 90, true);
      expect(typescript_failures).toBe(2);
      expect(test_failures).toBe(0);
      expect(service_failures).toBe(0);

      // Tests fail once
      checkQualityGates(true, 75, true);
      expect(typescript_failures).toBe(0); // Reset because TypeScript now passes
      expect(test_failures).toBe(1);
      expect(service_failures).toBe(0);

      // Services fail twice
      checkQualityGates(true, 85, false);
      checkQualityGates(true, 85, false);
      expect(typescript_failures).toBe(0);
      expect(test_failures).toBe(0); // Reset because tests now pass
      expect(service_failures).toBe(2);
    });

    test('should only trigger escalation for the specific failing gate', () => {
      // Build up TypeScript failures to threshold
      checkQualityGates(false, 90, true);
      checkQualityGates(false, 90, true);
      checkQualityGates(false, 90, true);
      
      expect(multi_perspective_triggered).toBe(true);
      expect(triggered_gate).toBe("TypeScript Compilation");
      expect(typescript_failures).toBe(3);
      expect(test_failures).toBe(0);
      expect(service_failures).toBe(0);
    });
  });

  describe('Escalation Threshold', () => {
    test('should trigger escalation exactly at 3 consecutive failures', () => {
      // 1 failure - no trigger
      checkQualityGates(false, 90, true);
      expect(multi_perspective_triggered).toBe(false);

      // 2 failures - no trigger
      checkQualityGates(false, 90, true);
      expect(multi_perspective_triggered).toBe(false);

      // 3 failures - should trigger
      checkQualityGates(false, 90, true);
      expect(multi_perspective_triggered).toBe(true);
    });

    test('should not trigger escalation before 3 consecutive failures', () => {
      // 2 failures then success
      checkQualityGates(false, 90, true);
      checkQualityGates(false, 90, true);
      checkQualityGates(true, 90, true);
      expect(multi_perspective_triggered).toBe(false);

      // 2 more failures - still shouldn't trigger (counter was reset)
      checkQualityGates(false, 90, true);
      checkQualityGates(false, 90, true);
      expect(multi_perspective_triggered).toBe(false);
    });
  });
});