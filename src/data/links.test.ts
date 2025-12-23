/**
 * Tests for Link CRUD Operations
 */

import type { Network } from '@/types';

import { addBehaviour, deleteBehaviour } from './behaviours';
import {
  addBehaviourOutcomeLink,
  addOutcomeValueLink,
  getLinkById,
  getAllLinks,
  getOutgoingLinks,
  getIncomingLinks,
  updateBehaviourOutcomeLink,
  updateOutcomeValueLink,
  deleteLink,
} from './links';
import { createEmptyNetwork } from './network';
import { addOutcome, deleteOutcome } from './outcomes';
import { addValue } from './values';

interface TestNetwork {
  network: Network;
  behaviourId: string;
  outcomeId: string;
  valueId: string;
}

// Helper to create a populated network
function createTestNetwork(): TestNetwork {
  let network = createEmptyNetwork();
  const b = addBehaviour(network, { label: 'Walk', frequency: 'daily', cost: 'low' });
  network = b.data!.network;
  const o = addOutcome(network, { label: 'Better sleep' });
  network = o.data!.network;
  const v = addValue(network, { label: 'Health', importance: 'high', neglect: 'adequately-met' });
  network = v.data!.network;
  return {
    network,
    behaviourId: b.data!.behaviour.id,
    outcomeId: o.data!.outcome.id,
    valueId: v.data!.value.id,
  };
}

describe('addBehaviourOutcomeLink', () => {
  it('creates a link between behaviour and outcome', () => {
    const { network, behaviourId, outcomeId } = createTestNetwork();

    const result = addBehaviourOutcomeLink(network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });

    expect(result.success).toBe(true);
    expect(result.data?.link.type).toBe('behaviour-outcome');
    expect(result.data?.link.id).toMatch(/^l-/);
  });

  it('rejects link with invalid source', () => {
    const { network, outcomeId } = createTestNetwork();

    const result = addBehaviourOutcomeLink(network, {
      sourceId: 'b-invalid',
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('rejects duplicate link', () => {
    const { network, behaviourId, outcomeId } = createTestNetwork();

    const first = addBehaviourOutcomeLink(network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });

    const result = addBehaviourOutcomeLink(first.data!.network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'negative',
      reliability: 'sometimes',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });
});

describe('addOutcomeValueLink', () => {
  it('creates a link between outcome and value', () => {
    const { network, outcomeId, valueId } = createTestNetwork();

    const result = addOutcomeValueLink(network, {
      sourceId: outcomeId,
      targetId: valueId,
      valence: 'positive',
      strength: 'strong',
    });

    expect(result.success).toBe(true);
    expect(result.data?.link.type).toBe('outcome-value');
  });

  it('rejects link with invalid target', () => {
    const { network, outcomeId } = createTestNetwork();

    const result = addOutcomeValueLink(network, {
      sourceId: outcomeId,
      targetId: 'v-invalid',
      valence: 'positive',
      strength: 'strong',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});

describe('getLink queries', () => {
  it('finds link by ID', () => {
    const { network, behaviourId, outcomeId } = createTestNetwork();
    const { data } = addBehaviourOutcomeLink(network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });

    const found = getLinkById(data!.network, data!.link.id);
    expect(found?.id).toBe(data!.link.id);
  });

  it('gets outgoing links', () => {
    const { network, behaviourId, outcomeId } = createTestNetwork();
    const { data } = addBehaviourOutcomeLink(network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });

    const outgoing = getOutgoingLinks(data!.network, behaviourId);
    expect(outgoing).toHaveLength(1);
  });

  it('gets incoming links', () => {
    const { network, behaviourId, outcomeId } = createTestNetwork();
    const { data } = addBehaviourOutcomeLink(network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });

    const incoming = getIncomingLinks(data!.network, outcomeId);
    expect(incoming).toHaveLength(1);
  });
});

describe('updateLink', () => {
  it('updates behaviour-outcome link', () => {
    const { network, behaviourId, outcomeId } = createTestNetwork();
    const { data } = addBehaviourOutcomeLink(network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });

    const result = updateBehaviourOutcomeLink(data!.network, data!.link.id, {
      reliability: 'always',
    });

    expect(result.success).toBe(true);
    expect(result.data?.link.reliability).toBe('always');
  });

  it('updates outcome-value link', () => {
    const { network, outcomeId, valueId } = createTestNetwork();
    const { data } = addOutcomeValueLink(network, {
      sourceId: outcomeId,
      targetId: valueId,
      valence: 'positive',
      strength: 'moderate',
    });

    const result = updateOutcomeValueLink(data!.network, data!.link.id, {
      strength: 'strong',
    });

    expect(result.success).toBe(true);
    expect(result.data?.link.strength).toBe('strong');
  });
});

describe('deleteLink', () => {
  it('removes link from network', () => {
    const { network, behaviourId, outcomeId } = createTestNetwork();
    const { data } = addBehaviourOutcomeLink(network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });

    const result = deleteLink(data!.network, data!.link.id);

    expect(result.success).toBe(true);
    expect(getAllLinks(result.data!.network)).toHaveLength(0);
  });
});

describe('cascade delete', () => {
  it('deleting behaviour removes its outgoing links', () => {
    const { network, behaviourId, outcomeId } = createTestNetwork();
    const { data } = addBehaviourOutcomeLink(network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });

    const result = deleteBehaviour(data!.network, behaviourId);

    expect(result.success).toBe(true);
    expect(getAllLinks(result.data!.network)).toHaveLength(0);
  });

  it('deleting outcome removes incident links', () => {
    const { network: initialNetwork, behaviourId, outcomeId, valueId } = createTestNetwork();
    let network = initialNetwork;

    // Create B→O link
    const boResult = addBehaviourOutcomeLink(network, {
      sourceId: behaviourId,
      targetId: outcomeId,
      valence: 'positive',
      reliability: 'usually',
    });
    network = boResult.data!.network;

    // Create O→V link
    const ovResult = addOutcomeValueLink(network, {
      sourceId: outcomeId,
      targetId: valueId,
      valence: 'positive',
      strength: 'strong',
    });
    network = ovResult.data!.network;

    expect(getAllLinks(network)).toHaveLength(2);

    // Delete outcome - should remove both links
    const result = deleteOutcome(network, outcomeId);

    expect(result.success).toBe(true);
    expect(getAllLinks(result.data!.network)).toHaveLength(0);
  });
});
