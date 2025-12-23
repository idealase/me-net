/**
 * Tests for Behaviour CRUD Operations
 */

import {
  addBehaviour,
  getBehaviourById,
  getBehaviourByLabel,
  getAllBehaviours,
  getBehavioursByTag,
  updateBehaviour,
  deleteBehaviour,
} from './behaviours';
import { createEmptyNetwork } from './network';

describe('addBehaviour', () => {
  it('creates a behaviour with required fields', () => {
    const network = createEmptyNetwork();
    const result = addBehaviour(network, {
      label: 'Morning walk',
      frequency: 'daily',
      cost: 'low',
    });

    expect(result.success).toBe(true);
    expect(result.data?.behaviour.label).toBe('Morning walk');
    expect(result.data?.behaviour.type).toBe('behaviour');
    expect(result.data?.behaviour.id).toMatch(/^b-/);
  });

  it('rejects empty label', () => {
    const network = createEmptyNetwork();
    const result = addBehaviour(network, {
      label: '   ',
      frequency: 'daily',
      cost: 'low',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects duplicate label (case-insensitive)', () => {
    let network = createEmptyNetwork();
    const first = addBehaviour(network, { label: 'Walk', frequency: 'daily', cost: 'low' });
    network = first.data!.network;

    const result = addBehaviour(network, { label: 'WALK', frequency: 'weekly', cost: 'medium' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });
});

describe('getBehaviour', () => {
  it('finds by ID', () => {
    const network = createEmptyNetwork();
    const { data } = addBehaviour(network, { label: 'Test', frequency: 'daily', cost: 'low' });

    const found = getBehaviourById(data!.network, data!.behaviour.id);
    expect(found?.label).toBe('Test');
  });

  it('finds by label (case-insensitive)', () => {
    const network = createEmptyNetwork();
    const { data } = addBehaviour(network, { label: 'Morning Walk', frequency: 'daily', cost: 'low' });

    const found = getBehaviourByLabel(data!.network, 'morning walk');
    expect(found?.label).toBe('Morning Walk');
  });

  it('returns undefined for non-existent ID', () => {
    const network = createEmptyNetwork();
    expect(getBehaviourById(network, 'b-999')).toBeUndefined();
  });
});

describe('getAllBehaviours', () => {
  it('returns all behaviours', () => {
    let network = createEmptyNetwork();
    network = addBehaviour(network, { label: 'A', frequency: 'daily', cost: 'low' }).data!.network;
    network = addBehaviour(network, { label: 'B', frequency: 'weekly', cost: 'medium' }).data!.network;

    expect(getAllBehaviours(network)).toHaveLength(2);
  });
});

describe('getBehavioursByTag', () => {
  it('filters by context tag', () => {
    let network = createEmptyNetwork();
    network = addBehaviour(network, { label: 'A', frequency: 'daily', cost: 'low', contextTags: ['morning'] }).data!.network;
    network = addBehaviour(network, { label: 'B', frequency: 'daily', cost: 'low', contextTags: ['evening'] }).data!.network;

    const morning = getBehavioursByTag(network, 'morning');
    expect(morning).toHaveLength(1);
    expect(morning[0]!.label).toBe('A');
  });
});

describe('updateBehaviour', () => {
  it('updates behaviour fields', () => {
    const network = createEmptyNetwork();
    const { data } = addBehaviour(network, { label: 'Walk', frequency: 'daily', cost: 'low' });

    const result = updateBehaviour(data!.network, data!.behaviour.id, { frequency: 'weekly' });

    expect(result.success).toBe(true);
    expect(result.data?.behaviour.frequency).toBe('weekly');
    expect(result.data?.behaviour.label).toBe('Walk'); // unchanged
  });

  it('rejects update to duplicate label', () => {
    let network = createEmptyNetwork();
    network = addBehaviour(network, { label: 'Walk', frequency: 'daily', cost: 'low' }).data!.network;
    const second = addBehaviour(network, { label: 'Run', frequency: 'daily', cost: 'medium' });

    const result = updateBehaviour(second.data!.network, second.data!.behaviour.id, { label: 'Walk' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });

  it('returns error for non-existent ID', () => {
    const network = createEmptyNetwork();
    const result = updateBehaviour(network, 'b-999', { frequency: 'weekly' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});

describe('deleteBehaviour', () => {
  it('removes behaviour from network', () => {
    const network = createEmptyNetwork();
    const { data } = addBehaviour(network, { label: 'Walk', frequency: 'daily', cost: 'low' });

    const result = deleteBehaviour(data!.network, data!.behaviour.id);

    expect(result.success).toBe(true);
    expect(result.data?.network.behaviours).toHaveLength(0);
  });

  it('returns error for non-existent ID', () => {
    const network = createEmptyNetwork();
    const result = deleteBehaviour(network, 'b-999');

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});
