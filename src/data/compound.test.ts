import type { Network } from '@/types';

import { addBehaviour } from './behaviours';
import { addLinkToNewTarget } from './compound';
import { createEmptyNetwork } from './network';
import { addOutcome } from './outcomes';

function setup(): { network: Network; behaviourId: string; outcomeId: string } {
  const b = addBehaviour(createEmptyNetwork(), {
    label: 'Morning run',
    frequency: 'daily',
    cost: 'medium',
    contextTags: [],
  });
  if (!b.success || b.data === undefined) throw new Error(b.error);
  const o = addOutcome(b.data.network, { label: 'More energy' });
  if (!o.success || o.data === undefined) throw new Error(o.error);
  return {
    network: o.data.network,
    behaviourId: b.data.behaviour.id,
    outcomeId: o.data.outcome.id,
  };
}

describe('addLinkToNewTarget', () => {
  it('creates a new outcome and links the behaviour to it', () => {
    const { network, behaviourId } = setup();
    const result = addLinkToNewTarget(network, {
      type: 'behaviour-outcome',
      sourceId: behaviourId,
      targetLabel: 'Better sleep',
      valence: 'positive',
      reliability: 'usually',
    });

    expect(result.success).toBe(true);
    const data = result.data!;
    expect(data.target.type).toBe('outcome');
    expect(data.target.label).toBe('Better sleep');
    expect(data.network.outcomes).toHaveLength(2);
    expect(data.link.sourceId).toBe(behaviourId);
    expect(data.link.targetId).toBe(data.target.id);
    expect(data.network.links).toContainEqual(data.link);
  });

  it('creates a new value and links the outcome to it', () => {
    const { network, outcomeId } = setup();
    const result = addLinkToNewTarget(network, {
      type: 'outcome-value',
      sourceId: outcomeId,
      targetLabel: 'Health',
      valence: 'positive',
      strength: 'strong',
    });

    expect(result.success).toBe(true);
    const data = result.data!;
    expect(data.target.type).toBe('value');
    expect(data.network.values).toHaveLength(1);
    expect(data.link.type).toBe('outcome-value');
    expect(data.link.targetId).toBe(data.target.id);
  });

  it('fails without changes when the label already exists', () => {
    const { network, behaviourId } = setup();
    const result = addLinkToNewTarget(network, {
      type: 'behaviour-outcome',
      sourceId: behaviourId,
      targetLabel: 'more energy',
      valence: 'positive',
      reliability: 'usually',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(network.outcomes).toHaveLength(1);
  });

  it('fails without creating the node when the source does not exist', () => {
    const { network } = setup();
    const outcomeResult = addLinkToNewTarget(network, {
      type: 'behaviour-outcome',
      sourceId: 'b-missing',
      targetLabel: 'Orphan outcome',
      valence: 'positive',
      reliability: 'usually',
    });
    const valueResult = addLinkToNewTarget(network, {
      type: 'outcome-value',
      sourceId: 'o-missing',
      targetLabel: 'Orphan value',
      valence: 'negative',
      strength: 'weak',
    });

    expect(outcomeResult.success).toBe(false);
    expect(valueResult.success).toBe(false);
    expect(outcomeResult.data).toBeUndefined();
    expect(valueResult.data).toBeUndefined();
  });

  it('reports a value label clash', () => {
    const { network, outcomeId } = setup();
    const first = addLinkToNewTarget(network, {
      type: 'outcome-value',
      sourceId: outcomeId,
      targetLabel: 'Health',
      valence: 'positive',
      strength: 'strong',
    });
    const second = addLinkToNewTarget(first.data!.network, {
      type: 'outcome-value',
      sourceId: outcomeId,
      targetLabel: 'HEALTH',
      valence: 'positive',
      strength: 'strong',
    });
    expect(second.success).toBe(false);
  });
});
