/**
 * Tests for Value CRUD Operations
 */

import { createEmptyNetwork } from './network';
import {
  addValue,
  getValueById,
  getValueByLabel,
  getAllValues,
  getValuesByImportance,
  updateValue,
  deleteValue,
} from './values';

describe('addValue', () => {
  it('creates a value', () => {
    const network = createEmptyNetwork();
    const result = addValue(network, {
      label: 'Peace of mind',
      importance: 'high',
      neglect: 'somewhat-neglected',
    });

    expect(result.success).toBe(true);
    expect(result.data?.value.label).toBe('Peace of mind');
    expect(result.data?.value.type).toBe('value');
    expect(result.data?.value.id).toMatch(/^v-/);
  });

  it('rejects empty label', () => {
    const network = createEmptyNetwork();
    const result = addValue(network, { label: '', importance: 'high', neglect: 'adequately-met' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects duplicate label', () => {
    let network = createEmptyNetwork();
    network = addValue(network, { label: 'Health', importance: 'critical', neglect: 'adequately-met' }).data!.network;

    const result = addValue(network, { label: 'HEALTH', importance: 'high', neglect: 'well-satisfied' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });
});

describe('getValue', () => {
  it('finds by ID', () => {
    const network = createEmptyNetwork();
    const { data } = addValue(network, { label: 'Health', importance: 'high', neglect: 'adequately-met' });

    const found = getValueById(data!.network, data!.value.id);
    expect(found?.label).toBe('Health');
  });

  it('finds by label', () => {
    const network = createEmptyNetwork();
    const { data } = addValue(network, { label: 'Health', importance: 'high', neglect: 'adequately-met' });

    const found = getValueByLabel(data!.network, 'health');
    expect(found?.label).toBe('Health');
  });
});

describe('getAllValues', () => {
  it('returns all values', () => {
    let network = createEmptyNetwork();
    network = addValue(network, { label: 'A', importance: 'high', neglect: 'adequately-met' }).data!.network;
    network = addValue(network, { label: 'B', importance: 'low', neglect: 'well-satisfied' }).data!.network;

    expect(getAllValues(network)).toHaveLength(2);
  });
});

describe('getValuesByImportance', () => {
  it('filters by importance', () => {
    let network = createEmptyNetwork();
    network = addValue(network, { label: 'A', importance: 'critical', neglect: 'adequately-met' }).data!.network;
    network = addValue(network, { label: 'B', importance: 'low', neglect: 'well-satisfied' }).data!.network;

    const critical = getValuesByImportance(network, 'critical');
    expect(critical).toHaveLength(1);
    expect(critical[0]!.label).toBe('A');
  });
});

describe('updateValue', () => {
  it('updates value fields', () => {
    const network = createEmptyNetwork();
    const { data } = addValue(network, { label: 'Health', importance: 'medium', neglect: 'adequately-met' });

    const result = updateValue(data!.network, data!.value.id, { importance: 'critical' });

    expect(result.success).toBe(true);
    expect(result.data?.value.importance).toBe('critical');
  });

  it('returns error for non-existent ID', () => {
    const network = createEmptyNetwork();
    const result = updateValue(network, 'v-999', { importance: 'high' });

    expect(result.success).toBe(false);
  });
});

describe('deleteValue', () => {
  it('removes value from network', () => {
    const network = createEmptyNetwork();
    const { data } = addValue(network, { label: 'Health', importance: 'high', neglect: 'adequately-met' });

    const result = deleteValue(data!.network, data!.value.id);

    expect(result.success).toBe(true);
    expect(result.data?.network.values).toHaveLength(0);
  });
});
