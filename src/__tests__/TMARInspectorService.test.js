/**
 * Tests for TMARInspectorService
 */

import { describe, test, expect } from '@jest/globals';
import { createInspector } from '../services/TMARInspectorService.js';

describe('TMARInspectorService', () => {
  test('registers functions and reports coverage', () => {
    const inspector = createInspector();

    inspector.registerFunction({
      moduleName: 'AccountService',
      functionName: 'validateAccount',
      appSurface: 'src'
    });

    const coverage = inspector.getCoverageSummary();
    expect(coverage.totalFunctions).toBe(1);
    expect(coverage.executedFunctions).toBe(0);
  });

  test('instruments sync functions and logs success', () => {
    const inspector = createInspector();
    const sum = inspector.instrumentFunction(
      (a, b) => a + b,
      { moduleName: 'MathService', functionName: 'sum', appSurface: 'src' }
    );

    const value = sum(2, 3);
    expect(value).toBe(5);

    const events = inspector.getEvents();
    expect(events.length).toBe(1);
    expect(events[0].status).toBe('ok');
    expect(events[0].id).toBe('MathService.sum');
  });

  test('instruments async functions and logs failures', async () => {
    const inspector = createInspector();
    const failing = inspector.instrumentFunction(
      async () => { throw new Error('network failed'); },
      { moduleName: 'SyncService', functionName: 'push', appSurface: 'gas' }
    );

    await expect(failing()).rejects.toThrow('network failed');

    const events = inspector.getEvents({ status: 'error' });
    expect(events.length).toBe(1);
    expect(events[0].errorMessage).toBe('network failed');
  });

  test('records verification/fix/enhancement and generates report', () => {
    const inspector = createInspector();

    inspector.registerFunction({ moduleName: 'DocBuilder', functionName: 'buildAndPreviewPackage' });
    inspector.recordVerification({
      functionId: 'DocBuilder.buildAndPreviewPackage',
      ruleId: 'pdf-autofill-check',
      passed: false,
      severity: 'HIGH',
      message: 'No mapped fields were populated.'
    });
    inspector.recordFix({
      functionId: 'DocBuilder.buildAndPreviewPackage',
      fixId: 'add-fill-patterns',
      applied: true,
      safeAutoFix: false,
      notes: 'Manual review required for legal correctness.'
    });
    inspector.recordEnhancement({
      functionId: 'DocBuilder.buildAndPreviewPackage',
      enhancementId: 'structured-fill-diagnostics',
      priority: 'P1',
      notes: 'Add unmatched field telemetry.'
    });

    const report = inspector.generateReport();

    expect(report.coverage.totalFunctions).toBe(1);
    expect(report.coverage.verificationFailCount).toBe(1);
    expect(report.fixes.length).toBe(1);
    expect(report.enhancements.length).toBe(1);
  });
});
