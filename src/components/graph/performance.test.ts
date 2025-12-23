import { describe, it, expect } from 'vitest';

import { createEmptyNetwork } from '@/data/network';
import type { Network } from '@/types';

import { NetworkGraph } from './NetworkGraph';

function buildLargeNetwork(): Network {
  const network = createEmptyNetwork();
  const now = new Date().toISOString();

  const behaviourCount = 70;
  const outcomeCount = 70;
  const valueCount = 60;

  network.behaviours = Array.from({ length: behaviourCount }, (_, index) => ({
    id: `b-perf-${index}`,
    type: 'behaviour',
    label: `Behaviour ${index + 1}`,
    frequency: 'weekly',
    cost: 'medium',
    contextTags: [],
    createdAt: now,
    updatedAt: now,
  }));

  network.outcomes = Array.from({ length: outcomeCount }, (_, index) => ({
    id: `o-perf-${index}`,
    type: 'outcome',
    label: `Outcome ${index + 1}`,
    createdAt: now,
    updatedAt: now,
  }));

  network.values = Array.from({ length: valueCount }, (_, index) => ({
    id: `v-perf-${index}`,
    type: 'value',
    label: `Value ${index + 1}`,
    importance: 'high',
    neglect: 'adequately-met',
    createdAt: now,
    updatedAt: now,
  }));

  const behaviourOutcomeLinks = 300;
  const outcomeValueLinks = 200;

  for (let i = 0; i < behaviourOutcomeLinks; i += 1) {
    const source = network.behaviours[i % behaviourCount];
    const target = network.outcomes[(i * 3) % outcomeCount];
    if (!source || !target) {
      continue;
    }
    network.links.push({
      id: `l-perf-bo-${i}`,
      type: 'behaviour-outcome',
      sourceId: source.id,
      targetId: target.id,
      valence: i % 10 === 0 ? 'negative' : 'positive',
      reliability: 'usually',
      createdAt: now,
      updatedAt: now,
    });
  }

  for (let i = 0; i < outcomeValueLinks; i += 1) {
    const source = network.outcomes[i % outcomeCount];
    const target = network.values[(i * 2) % valueCount];
    if (!source || !target) {
      continue;
    }
    network.links.push({
      id: `l-perf-ov-${i}`,
      type: 'outcome-value',
      sourceId: source.id,
      targetId: target.id,
      valence: 'positive',
      strength: 'moderate',
      createdAt: now,
      updatedAt: now,
    });
  }

  return network;
}

describe('NetworkGraph performance', () => {
  it('renders 200 nodes and 500 edges in under one second', () => {
    const container = document.createElement('div');
    container.style.width = '1200px';
    container.style.height = '800px';
    document.body.appendChild(container);

    const graph = new NetworkGraph(container, { width: 1200, height: 800 });
    const largeNetwork = buildLargeNetwork();

    const start = performance.now();
    graph.setNetwork(largeNetwork);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000);

    graph.destroy();
    container.remove();
  });
});
