/**
 * Tests for Export & Import Module
 */

import type { Network, Behaviour, Outcome, Value, BehaviourOutcomeLink, OutcomeValueLink } from '@/types';
import { generateId, now } from '@/utils/id';

import {
  prepareNetworkForExport,
  serializeNetwork,
  generateExportFilename,
  parseNetworkJson,
  generateSummaryReportData,
  formatSummaryReportAsMarkdown,
  generateReportFilename,
  networksAreEqual,
} from './export';
import { createNetwork } from './network';

// ============================================================================
// Test Fixtures
// ============================================================================

function createTestBehaviour(label: string): Behaviour {
  return {
    id: generateId('b'),
    type: 'behaviour',
    label,
    frequency: 'daily',
    cost: 'low',
    contextTags: ['test'],
    createdAt: now(),
    updatedAt: now(),
  };
}

function createTestOutcome(label: string): Outcome {
  return {
    id: generateId('o'),
    type: 'outcome',
    label,
    createdAt: now(),
    updatedAt: now(),
  };
}

function createTestValue(label: string): Value {
  return {
    id: generateId('v'),
    type: 'value',
    label,
    importance: 'high',
    neglect: 'somewhat-neglected',
    createdAt: now(),
    updatedAt: now(),
  };
}

function createTestNetwork(): Network {
  const behaviour = createTestBehaviour('Morning exercise');
  const outcome = createTestOutcome('Better mood');
  const value = createTestValue('Happiness');

  const boLink: BehaviourOutcomeLink = {
    id: generateId('l'),
    type: 'behaviour-outcome',
    sourceId: behaviour.id,
    targetId: outcome.id,
    valence: 'positive',
    reliability: 'usually',
    createdAt: now(),
    updatedAt: now(),
  };

  const ovLink: OutcomeValueLink = {
    id: generateId('l'),
    type: 'outcome-value',
    sourceId: outcome.id,
    targetId: value.id,
    valence: 'positive',
    strength: 'strong',
    createdAt: now(),
    updatedAt: now(),
  };

  return createNetwork({
    behaviours: [behaviour],
    outcomes: [outcome],
    values: [value],
    links: [boLink, ovLink],
  });
}

// ============================================================================
// Export Tests
// ============================================================================

describe('prepareNetworkForExport', () => {
  it('adds exportedAt timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-23T10:00:00.000Z'));

    const network = createNetwork();
    const exported = prepareNetworkForExport(network);

    expect(exported.exportedAt).toBe('2025-12-23T10:00:00.000Z');
    vi.useRealTimers();
  });

  it('sets version', () => {
    const network = createNetwork();
    const exported = prepareNetworkForExport(network);

    expect(exported.version).toBe('1.0.0');
  });

  it('preserves all network data', () => {
    const network = createTestNetwork();
    const exported = prepareNetworkForExport(network);

    expect(exported.behaviours).toEqual(network.behaviours);
    expect(exported.outcomes).toEqual(network.outcomes);
    expect(exported.values).toEqual(network.values);
    expect(exported.links).toEqual(network.links);
  });
});

describe('serializeNetwork', () => {
  it('produces valid JSON', () => {
    const network = createTestNetwork();
    const json = serializeNetwork(network);

    expect(() => JSON.parse(json) as unknown).not.toThrow();
  });

  it('produces formatted JSON with indentation', () => {
    const network = createNetwork();
    const json = serializeNetwork(network);

    // Formatted JSON contains newlines
    expect(json).toContain('\n');
    expect(json).toContain('  '); // 2-space indentation
  });

  it('includes all required fields', () => {
    const network = createTestNetwork();
    const json = serializeNetwork(network);
    const parsed = JSON.parse(json) as Record<string, unknown>;

    expect(parsed).toHaveProperty('version');
    expect(parsed).toHaveProperty('exportedAt');
    expect(parsed).toHaveProperty('behaviours');
    expect(parsed).toHaveProperty('outcomes');
    expect(parsed).toHaveProperty('values');
    expect(parsed).toHaveProperty('links');
  });
});

describe('generateExportFilename', () => {
  it('generates filename with date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-23T14:30:45.000Z'));

    const filename = generateExportFilename();

    expect(filename).toMatch(/^me-net-2025-12-23-14-30-45\.json$/);
    vi.useRealTimers();
  });

  it('accepts custom prefix', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-23T14:30:45.000Z'));

    const filename = generateExportFilename('my-network');

    expect(filename).toMatch(/^my-network-2025-12-23-14-30-45\.json$/);
    vi.useRealTimers();
  });
});

// ============================================================================
// Import Tests
// ============================================================================

describe('parseNetworkJson', () => {
  it('parses valid network JSON', () => {
    const network = createTestNetwork();
    const json = serializeNetwork(network);

    const result = parseNetworkJson(json);

    expect(result.success).toBe(true);
    expect(result.network).toBeDefined();
    expect(result.network?.behaviours.length).toBe(1);
    expect(result.network?.outcomes.length).toBe(1);
    expect(result.network?.values.length).toBe(1);
    expect(result.network?.links.length).toBe(2);
  });

  it('rejects invalid JSON syntax', () => {
    const result = parseNetworkJson('{ invalid json }');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse JSON');
  });

  it('rejects missing behaviours array', () => {
    const result = parseNetworkJson('{"version":"1.0.0","outcomes":[],"values":[],"links":[]}');

    expect(result.success).toBe(false);
    expect(result.error).toContain('behaviours');
  });

  it('rejects missing version', () => {
    const result = parseNetworkJson('{"behaviours":[],"outcomes":[],"values":[],"links":[]}');

    expect(result.success).toBe(false);
    expect(result.error).toContain('version');
  });

  it('rejects behaviour with missing id', () => {
    const json = JSON.stringify({
      version: '1.0.0',
      behaviours: [{ type: 'behaviour', label: 'Test' }],
      outcomes: [],
      values: [],
      links: [],
    });

    const result = parseNetworkJson(json);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Behaviour at index 0 missing valid id');
  });

  it('rejects behaviour with wrong type', () => {
    const json = JSON.stringify({
      version: '1.0.0',
      behaviours: [{ id: 'b-1', type: 'outcome', label: 'Test' }],
      outcomes: [],
      values: [],
      links: [],
    });

    const result = parseNetworkJson(json);

    expect(result.success).toBe(false);
    expect(result.error).toContain('invalid type');
  });

  it('rejects link with invalid valence', () => {
    const json = JSON.stringify({
      version: '1.0.0',
      behaviours: [{ id: 'b-1', type: 'behaviour', label: 'Test' }],
      outcomes: [{ id: 'o-1', type: 'outcome', label: 'Outcome' }],
      values: [],
      links: [{ id: 'l-1', type: 'behaviour-outcome', sourceId: 'b-1', targetId: 'o-1', valence: 'neutral' }],
    });

    const result = parseNetworkJson(json);

    expect(result.success).toBe(false);
    expect(result.error).toContain('invalid valence');
  });

  it('rejects link referencing non-existent node', () => {
    const json = JSON.stringify({
      version: '1.0.0',
      behaviours: [{ id: 'b-1', type: 'behaviour', label: 'Test' }],
      outcomes: [],
      values: [],
      links: [{ id: 'l-1', type: 'behaviour-outcome', sourceId: 'b-1', targetId: 'o-missing', valence: 'positive' }],
    });

    const result = parseNetworkJson(json);

    expect(result.success).toBe(false);
    expect(result.error).toContain('non-existent target');
  });

  it('preserves exportedAt from imported data', () => {
    const network = createTestNetwork();
    const json = serializeNetwork(network);

    const result = parseNetworkJson(json);

    expect(result.success).toBe(true);
    expect(result.network?.exportedAt).toBeDefined();
  });
});

// ============================================================================
// Round-Trip Tests (SC-4)
// ============================================================================

describe('round-trip export/import', () => {
  it('preserves network data through export and import', () => {
    const original = createTestNetwork();
    const json = serializeNetwork(original);
    const result = parseNetworkJson(json);

    expect(result.success).toBe(true);
    expect(networksAreEqual(original, result.network!)).toBe(true);
  });

  it('preserves complex network with multiple entities', () => {
    const b1 = createTestBehaviour('Walk');
    const b2 = createTestBehaviour('Meditate');
    const o1 = createTestOutcome('Calm');
    const o2 = createTestOutcome('Focus');
    const v1 = createTestValue('Peace');
    const v2 = createTestValue('Productivity');

    const links: Array<BehaviourOutcomeLink | OutcomeValueLink> = [
      {
        id: generateId('l'),
        type: 'behaviour-outcome',
        sourceId: b1.id,
        targetId: o1.id,
        valence: 'positive',
        reliability: 'usually',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: generateId('l'),
        type: 'behaviour-outcome',
        sourceId: b2.id,
        targetId: o2.id,
        valence: 'positive',
        reliability: 'always',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: generateId('l'),
        type: 'outcome-value',
        sourceId: o1.id,
        targetId: v1.id,
        valence: 'positive',
        strength: 'strong',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: generateId('l'),
        type: 'outcome-value',
        sourceId: o2.id,
        targetId: v2.id,
        valence: 'positive',
        strength: 'moderate',
        createdAt: now(),
        updatedAt: now(),
      },
    ];

    const original = createNetwork({
      behaviours: [b1, b2],
      outcomes: [o1, o2],
      values: [v1, v2],
      links,
    });

    const json = serializeNetwork(original);
    const result = parseNetworkJson(json);

    expect(result.success).toBe(true);
    expect(networksAreEqual(original, result.network!)).toBe(true);
  });

  it('preserves behaviour contextTags', () => {
    const behaviour: Behaviour = {
      id: 'b-tags',
      type: 'behaviour',
      label: 'Exercise',
      frequency: 'daily',
      cost: 'medium',
      contextTags: ['morning', 'health', 'routine'],
      notes: 'Important for wellbeing',
      createdAt: now(),
      updatedAt: now(),
    };

    const original = createNetwork({ behaviours: [behaviour] });
    const json = serializeNetwork(original);
    const result = parseNetworkJson(json);

    expect(result.success).toBe(true);
    expect(result.network).toBeDefined();
    const imported = result.network!.behaviours[0];
    expect(imported).toBeDefined();
    expect(imported!.contextTags).toEqual(['morning', 'health', 'routine']);
    expect(imported!.notes).toBe('Important for wellbeing');
  });

  it('preserves negative valence links', () => {
    const b = createTestBehaviour('Late night work');
    const o = createTestOutcome('Poor sleep');
    const v = createTestValue('Health');

    const negativeLink: BehaviourOutcomeLink = {
      id: generateId('l'),
      type: 'behaviour-outcome',
      sourceId: b.id,
      targetId: o.id,
      valence: 'negative',
      reliability: 'usually',
      createdAt: now(),
      updatedAt: now(),
    };

    const original = createNetwork({
      behaviours: [b],
      outcomes: [o],
      values: [v],
      links: [negativeLink],
    });

    const json = serializeNetwork(original);
    const result = parseNetworkJson(json);

    expect(result.success).toBe(true);
    expect(result.network).toBeDefined();
    const importedLink = result.network!.links[0];
    expect(importedLink).toBeDefined();
    expect(importedLink!.valence).toBe('negative');
  });
});

// ============================================================================
// Network Equality Tests
// ============================================================================

describe('networksAreEqual', () => {
  it('returns true for identical networks', () => {
    const network = createTestNetwork();
    expect(networksAreEqual(network, network)).toBe(true);
  });

  it('returns true for equivalent networks', () => {
    const a = createTestNetwork();
    const json = JSON.stringify(a);
    const b = JSON.parse(json) as Network;

    expect(networksAreEqual(a, b)).toBe(true);
  });

  it('returns false for different behaviour counts', () => {
    const a = createTestNetwork();
    const b = createNetwork({ ...a, behaviours: [] });

    expect(networksAreEqual(a, b)).toBe(false);
  });

  it('returns false for different behaviour labels', () => {
    const a = createTestNetwork();
    const b: Network = {
      ...a,
      behaviours: a.behaviours.map((beh) => ({ ...beh, label: 'Different' })),
    };

    expect(networksAreEqual(a, b)).toBe(false);
  });

  it('returns false for missing behaviour id', () => {
    const a = createTestNetwork();
    const b: Network = {
      ...a,
      behaviours: a.behaviours.map((beh) => ({ ...beh, id: 'different-id' })),
    };

    expect(networksAreEqual(a, b)).toBe(false);
  });
});

// ============================================================================
// Summary Report Tests
// ============================================================================

describe('generateSummaryReportData', () => {
  it('includes network statistics', () => {
    const network = createTestNetwork();
    const data = generateSummaryReportData(network, [], [], []);

    expect(data.stats.behaviours).toBe(1);
    expect(data.stats.outcomes).toBe(1);
    expect(data.stats.values).toBe(1);
    expect(data.stats.links).toBe(2);
  });

  it('includes top leverage behaviours', () => {
    const network = createTestNetwork();
    const topLeverage = [
      {
        behaviour: { label: 'Walk' },
        metrics: { leverageScore: 2.5 },
        supportedValues: [{ label: 'Health' }],
        viaOutcomes: ['Energy'],
      },
    ];

    const data = generateSummaryReportData(network, topLeverage, [], []);

    expect(data.topLeverageBehaviours.length).toBe(1);
    const topItem = data.topLeverageBehaviours[0];
    expect(topItem).toBeDefined();
    expect(topItem!.label).toBe('Walk');
    expect(topItem!.score).toBe(2.5);
  });

  it('includes orphan values', () => {
    const network = createTestNetwork();
    const orphans = [{ value: { label: 'Peace' } }];

    const data = generateSummaryReportData(network, [], orphans, []);

    expect(data.orphanValues.length).toBe(1);
    const orphanItem = data.orphanValues[0];
    expect(orphanItem).toBeDefined();
    expect(orphanItem!.label).toBe('Peace');
  });

  it('includes conflict behaviours', () => {
    const network = createTestNetwork();
    const conflicts = [
      {
        behaviour: { label: 'Late Work' },
        metrics: { conflictIndex: 1.5 },
        positiveValues: [{ label: 'Achievement' }],
        negativeValues: [{ label: 'Health' }],
      },
    ];

    const data = generateSummaryReportData(network, [], [], conflicts);

    expect(data.conflictBehaviours.length).toBe(1);
    const conflictItem = data.conflictBehaviours[0];
    expect(conflictItem).toBeDefined();
    expect(conflictItem!.label).toBe('Late Work');
    expect(conflictItem!.positiveValues).toContain('Achievement');
    expect(conflictItem!.negativeValues).toContain('Health');
  });

  it('generates suggestions for orphan values', () => {
    const network = createTestNetwork();
    const orphans = [{ value: { label: 'Peace' } }, { value: { label: 'Joy' } }];

    const data = generateSummaryReportData(network, [], orphans, []);

    expect(data.suggestions.some((s) => s.includes('orphan value'))).toBe(true);
  });

  it('generates suggestions for conflicts', () => {
    const network = createTestNetwork();
    const conflicts = [
      {
        behaviour: { label: 'Late Work' },
        metrics: { conflictIndex: 1.5 },
        positiveValues: [{ label: 'Achievement' }],
        negativeValues: [{ label: 'Health' }],
      },
    ];

    const data = generateSummaryReportData(network, [], [], conflicts);

    expect(data.suggestions.some((s) => s.includes('conflicting effects'))).toBe(true);
  });

  it('generates default suggestion when network is complete', () => {
    const network = createNetwork();
    const data = generateSummaryReportData(network, [], [], []);

    expect(data.suggestions.some((s) => s.includes('looks complete'))).toBe(true);
  });
});

describe('formatSummaryReportAsMarkdown', () => {
  it('produces valid markdown with headers', () => {
    const network = createTestNetwork();
    const data = generateSummaryReportData(network, [], [], []);
    const markdown = formatSummaryReportAsMarkdown(data);

    expect(markdown).toContain('# M-E Net Summary Report');
    expect(markdown).toContain('## Network Statistics');
    expect(markdown).toContain('## Top Leverage Behaviours');
    expect(markdown).toContain('## Orphan Values');
    expect(markdown).toContain('## Conflict Behaviours');
    expect(markdown).toContain('## Suggested Next Steps');
  });

  it('includes statistics values', () => {
    const network = createTestNetwork();
    const data = generateSummaryReportData(network, [], [], []);
    const markdown = formatSummaryReportAsMarkdown(data);

    expect(markdown).toContain('**Behaviours:** 1');
    expect(markdown).toContain('**Outcomes:** 1');
    expect(markdown).toContain('**Values:** 1');
    expect(markdown).toContain('**Links:** 2');
  });

  it('formats top leverage entries', () => {
    const topLeverage = [
      {
        behaviour: { label: 'Walk' },
        metrics: { leverageScore: 2.5 },
        supportedValues: [{ label: 'Health' }, { label: 'Energy' }],
        viaOutcomes: ['Better mood'],
      },
    ];

    const data = generateSummaryReportData(createNetwork(), topLeverage, [], []);
    const markdown = formatSummaryReportAsMarkdown(data);

    expect(markdown).toContain('### Walk');
    expect(markdown).toContain('**Leverage Score:** 2.5');
    expect(markdown).toContain('Health, Energy');
    expect(markdown).toContain('Better mood');
  });

  it('shows placeholder for empty sections', () => {
    const data = generateSummaryReportData(createNetwork(), [], [], []);
    const markdown = formatSummaryReportAsMarkdown(data);

    expect(markdown).toContain('_No behaviours with positive leverage found._');
    expect(markdown).toContain('_All values are connected to behaviours. Great job!_');
    expect(markdown).toContain('_No conflicting behaviours detected._');
  });
});

describe('generateReportFilename', () => {
  it('generates filename with date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-23T14:30:45.000Z'));

    const filename = generateReportFilename();

    expect(filename).toBe('me-net-report-2025-12-23.md');
    vi.useRealTimers();
  });
});
