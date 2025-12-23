/**
 * Tests for Outcome CRUD Operations
 */

import { createEmptyNetwork } from './network';
import {
  addOutcome,
  getOutcomeById,
  getOutcomeByLabel,
  getAllOutcomes,
  updateOutcome,
  deleteOutcome,
} from './outcomes';

describe('addOutcome', () => {
  it('creates an outcome', () => {
    const network = createEmptyNetwork();
    const result = addOutcome(network, { label: 'Reduced anxiety' });

    expect(result.success).toBe(true);
    expect(result.data?.outcome.label).toBe('Reduced anxiety');
    expect(result.data?.outcome.type).toBe('outcome');
    expect(result.data?.outcome.id).toMatch(/^o-/);
  });

  it('rejects empty label', () => {
    const network = createEmptyNetwork();
    const result = addOutcome(network, { label: '' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects duplicate label', () => {
    let network = createEmptyNetwork();
    network = addOutcome(network, { label: 'Better sleep' }).data!.network;

    const result = addOutcome(network, { label: 'better sleep' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });
});

describe('getOutcome', () => {
  it('finds by ID', () => {
    const network = createEmptyNetwork();
    const { data } = addOutcome(network, { label: 'Test' });

    const found = getOutcomeById(data!.network, data!.outcome.id);
    expect(found?.label).toBe('Test');
  });

  it('finds by label', () => {
    const network = createEmptyNetwork();
    const { data } = addOutcome(network, { label: 'Better Sleep' });

    const found = getOutcomeByLabel(data!.network, 'better sleep');
    expect(found?.label).toBe('Better Sleep');
  });
});

describe('getAllOutcomes', () => {
  it('returns all outcomes', () => {
    let network = createEmptyNetwork();
    network = addOutcome(network, { label: 'A' }).data!.network;
    network = addOutcome(network, { label: 'B' }).data!.network;

    expect(getAllOutcomes(network)).toHaveLength(2);
  });
});

describe('updateOutcome', () => {
  it('updates outcome fields', () => {
    const network = createEmptyNetwork();
    const { data } = addOutcome(network, { label: 'Sleep' });

    const result = updateOutcome(data!.network, data!.outcome.id, { notes: 'Important' });

    expect(result.success).toBe(true);
    expect(result.data?.outcome.notes).toBe('Important');
  });

  it('returns error for non-existent ID', () => {
    const network = createEmptyNetwork();
    const result = updateOutcome(network, 'o-999', { notes: 'test' });

    expect(result.success).toBe(false);
  });
});

describe('deleteOutcome', () => {
  it('removes outcome from network', () => {
    const network = createEmptyNetwork();
    const { data } = addOutcome(network, { label: 'Test' });

    const result = deleteOutcome(data!.network, data!.outcome.id);

    expect(result.success).toBe(true);
    expect(result.data?.network.outcomes).toHaveLength(0);
  });
});
