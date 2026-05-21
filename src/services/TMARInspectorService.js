/**
 * TMAR Inspector Service
 * Phase 1: function cataloging, execution monitoring, and report generation.
 */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeId(moduleName, functionName) {
  return `${moduleName}.${functionName}`;
}

export function createInspector(options = {}) {
  const now = typeof options.now === 'function' ? options.now : () => Date.now();
  const maxEvents = Number.isInteger(options.maxEvents) && options.maxEvents > 0 ? options.maxEvents : 5000;

  const catalog = new Map();
  const events = [];
  const verifications = [];
  const fixes = [];
  const enhancements = [];

  function pushEvent(event) {
    events.push(event);
    if (events.length > maxEvents) {
      events.splice(0, events.length - maxEvents);
    }
  }

  function registerFunction(definition = {}) {
    const moduleName = (definition.moduleName || '').trim();
    const functionName = (definition.functionName || '').trim();

    if (!moduleName || !functionName) {
      throw new Error('moduleName and functionName are required');
    }

    const id = definition.id || normalizeId(moduleName, functionName);
    const existing = catalog.get(id);

    const record = {
      id,
      moduleName,
      functionName,
      appSurface: definition.appSurface || 'src',
      tags: Array.isArray(definition.tags) ? [...definition.tags] : [],
      severity: definition.severity || 'MEDIUM',
      description: definition.description || '',
      addedAt: existing?.addedAt || new Date(now()).toISOString(),
      updatedAt: new Date(now()).toISOString()
    };

    catalog.set(id, record);
    return clone(record);
  }

  function registerFunctions(definitions = []) {
    if (!Array.isArray(definitions)) {
      throw new Error('definitions must be an array');
    }
    return definitions.map(registerFunction);
  }

  function instrumentFunction(fn, definition = {}) {
    if (typeof fn !== 'function') {
      throw new Error('fn must be a function');
    }

    const metadata = registerFunction(definition);

    return function inspectedFunction(...args) {
      const startedAtMs = now();
      const startedAtIso = new Date(startedAtMs).toISOString();

      const baseEvent = {
        type: 'execution',
        id: metadata.id,
        moduleName: metadata.moduleName,
        functionName: metadata.functionName,
        appSurface: metadata.appSurface,
        argsCount: args.length,
        startedAt: startedAtIso
      };

      try {
        const result = fn.apply(this, args);

        if (result && typeof result.then === 'function') {
          return result
            .then((resolved) => {
              const endedAtMs = now();
              pushEvent({
                ...baseEvent,
                status: 'ok',
                endedAt: new Date(endedAtMs).toISOString(),
                durationMs: endedAtMs - startedAtMs
              });
              return resolved;
            })
            .catch((error) => {
              const endedAtMs = now();
              pushEvent({
                ...baseEvent,
                status: 'error',
                endedAt: new Date(endedAtMs).toISOString(),
                durationMs: endedAtMs - startedAtMs,
                errorName: error?.name || 'Error',
                errorMessage: error?.message || String(error)
              });
              throw error;
            });
        }

        const endedAtMs = now();
        pushEvent({
          ...baseEvent,
          status: 'ok',
          endedAt: new Date(endedAtMs).toISOString(),
          durationMs: endedAtMs - startedAtMs
        });

        return result;
      } catch (error) {
        const endedAtMs = now();
        pushEvent({
          ...baseEvent,
          status: 'error',
          endedAt: new Date(endedAtMs).toISOString(),
          durationMs: endedAtMs - startedAtMs,
          errorName: error?.name || 'Error',
          errorMessage: error?.message || String(error)
        });
        throw error;
      }
    };
  }

  function recordVerification(verification = {}) {
    if (!verification.functionId || !verification.ruleId) {
      throw new Error('verification requires functionId and ruleId');
    }

    const record = {
      functionId: verification.functionId,
      ruleId: verification.ruleId,
      passed: Boolean(verification.passed),
      severity: verification.severity || 'MEDIUM',
      message: verification.message || '',
      createdAt: new Date(now()).toISOString()
    };

    verifications.push(record);
    return clone(record);
  }

  function recordFix(fix = {}) {
    if (!fix.functionId || !fix.fixId) {
      throw new Error('fix requires functionId and fixId');
    }

    const record = {
      functionId: fix.functionId,
      fixId: fix.fixId,
      applied: Boolean(fix.applied),
      safeAutoFix: Boolean(fix.safeAutoFix),
      notes: fix.notes || '',
      createdAt: new Date(now()).toISOString()
    };

    fixes.push(record);
    return clone(record);
  }

  function recordEnhancement(item = {}) {
    if (!item.functionId || !item.enhancementId) {
      throw new Error('enhancement requires functionId and enhancementId');
    }

    const record = {
      functionId: item.functionId,
      enhancementId: item.enhancementId,
      priority: item.priority || 'P2',
      notes: item.notes || '',
      createdAt: new Date(now()).toISOString()
    };

    enhancements.push(record);
    return clone(record);
  }

  function getEvents(filters = {}) {
    const type = filters.type || null;
    const status = filters.status || null;
    const functionId = filters.functionId || null;
    const limit = Number.isInteger(filters.limit) && filters.limit > 0 ? filters.limit : events.length;

    const filtered = events.filter((event) => {
      if (type && event.type !== type) return false;
      if (status && event.status !== status) return false;
      if (functionId && event.id !== functionId) return false;
      return true;
    });

    return clone(filtered.slice(Math.max(filtered.length - limit, 0)));
  }

  function getCoverageSummary() {
    const totalFunctions = catalog.size;
    const executedIds = new Set(events.map((event) => event.id));
    const failedIds = new Set(events.filter((event) => event.status === 'error').map((event) => event.id));
    const passCount = verifications.filter((v) => v.passed).length;
    const failCount = verifications.length - passCount;

    return {
      totalFunctions,
      executedFunctions: executedIds.size,
      unexecutedFunctions: Math.max(totalFunctions - executedIds.size, 0),
      failedFunctions: failedIds.size,
      verificationPassCount: passCount,
      verificationFailCount: failCount,
      fixesRecorded: fixes.length,
      enhancementsRecorded: enhancements.length
    };
  }

  function generateReport() {
    const failureCounts = {};
    const durationBuckets = {};

    events.forEach((event) => {
      if (!durationBuckets[event.id]) {
        durationBuckets[event.id] = { total: 0, count: 0 };
      }
      durationBuckets[event.id].total += event.durationMs || 0;
      durationBuckets[event.id].count += 1;

      if (event.status === 'error') {
        failureCounts[event.id] = (failureCounts[event.id] || 0) + 1;
      }
    });

    const topFailures = Object.entries(failureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ id, count }));

    const slowestFunctions = Object.entries(durationBuckets)
      .map(([id, bucket]) => ({
        id,
        averageDurationMs: bucket.count === 0 ? 0 : Number((bucket.total / bucket.count).toFixed(2)),
        samples: bucket.count
      }))
      .sort((a, b) => b.averageDurationMs - a.averageDurationMs)
      .slice(0, 10);

    return {
      generatedAt: new Date(now()).toISOString(),
      coverage: getCoverageSummary(),
      topFailures,
      slowestFunctions,
      verifications: clone(verifications),
      fixes: clone(fixes),
      enhancements: clone(enhancements)
    };
  }

  function getCatalog() {
    return clone(Array.from(catalog.values()));
  }

  function reset() {
    catalog.clear();
    events.length = 0;
    verifications.length = 0;
    fixes.length = 0;
    enhancements.length = 0;
  }

  return {
    registerFunction,
    registerFunctions,
    instrumentFunction,
    recordVerification,
    recordFix,
    recordEnhancement,
    getCatalog,
    getEvents,
    getCoverageSummary,
    generateReport,
    reset
  };
}
