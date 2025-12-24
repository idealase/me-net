/**
 * Tests for Example Network (Tutorial Mode)
 */

import { createExampleNetwork, isExampleNetwork } from './example-network';
import { createEmptyNetwork } from './network';

describe('createExampleNetwork', () => {
  it('should create a network with version 1.0.0', () => {
    const network = createExampleNetwork();
    expect(network.version).toBe('1.0.0');
  });

  it('should create 4 behaviours', () => {
    const network = createExampleNetwork();
    expect(network.behaviours).toHaveLength(4);
  });

  it('should create behaviours with expected labels', () => {
    const network = createExampleNetwork();
    const labels = network.behaviours.map((b) => b.label);
    expect(labels).toContain('Exercise regularly');
    expect(labels).toContain('Meal prep on Sundays');
    expect(labels).toContain('Meditate daily');
    expect(labels).toContain('Stay up late gaming');
  });

  it('should create 4 outcomes', () => {
    const network = createExampleNetwork();
    expect(network.outcomes).toHaveLength(4);
  });

  it('should create outcomes with expected labels', () => {
    const network = createExampleNetwork();
    const labels = network.outcomes.map((o) => o.label);
    expect(labels).toContain('Better physical fitness');
    expect(labels).toContain('More energy');
    expect(labels).toContain('Reduced stress');
    expect(labels).toContain('Less sleep');
  });

  it('should create 3 values', () => {
    const network = createExampleNetwork();
    expect(network.values).toHaveLength(3);
  });

  it('should create values with expected labels', () => {
    const network = createExampleNetwork();
    const labels = network.values.map((v) => v.label);
    expect(labels).toContain('Health');
    expect(labels).toContain('Happiness');
    expect(labels).toContain('Productivity');
  });

  it('should create 12 links total', () => {
    const network = createExampleNetwork();
    // 5 behaviour-outcome + 7 outcome-value = 12 links
    expect(network.links).toHaveLength(12);
  });

  it('should create behaviour-outcome links with correct type', () => {
    const network = createExampleNetwork();
    const boLinks = network.links.filter((l) => l.type === 'behaviour-outcome');
    expect(boLinks).toHaveLength(5);
    boLinks.forEach((link) => {
      expect(link.type).toBe('behaviour-outcome');
      expect(link).toHaveProperty('reliability');
    });
  });

  it('should create outcome-value links with correct type', () => {
    const network = createExampleNetwork();
    const ovLinks = network.links.filter((l) => l.type === 'outcome-value');
    expect(ovLinks).toHaveLength(7);
    ovLinks.forEach((link) => {
      expect(link.type).toBe('outcome-value');
      expect(link).toHaveProperty('strength');
    });
  });

  it('should include both positive and negative valence links', () => {
    const network = createExampleNetwork();
    const positiveLinks = network.links.filter((l) => l.valence === 'positive');
    const negativeLinks = network.links.filter((l) => l.valence === 'negative');
    expect(positiveLinks.length).toBeGreaterThan(0);
    expect(negativeLinks.length).toBeGreaterThan(0);
  });

  it('should have valid link references (all sourceIds exist)', () => {
    const network = createExampleNetwork();
    const allNodeIds = new Set([
      ...network.behaviours.map((b) => b.id),
      ...network.outcomes.map((o) => o.id),
      ...network.values.map((v) => v.id),
    ]);

    network.links.forEach((link) => {
      expect(allNodeIds.has(link.sourceId)).toBe(true);
      expect(allNodeIds.has(link.targetId)).toBe(true);
    });
  });

  it('should have behaviour-outcome links pointing from behaviours to outcomes', () => {
    const network = createExampleNetwork();
    const behaviourIds = new Set(network.behaviours.map((b) => b.id));
    const outcomeIds = new Set(network.outcomes.map((o) => o.id));

    const boLinks = network.links.filter((l) => l.type === 'behaviour-outcome');
    boLinks.forEach((link) => {
      expect(behaviourIds.has(link.sourceId)).toBe(true);
      expect(outcomeIds.has(link.targetId)).toBe(true);
    });
  });

  it('should have outcome-value links pointing from outcomes to values', () => {
    const network = createExampleNetwork();
    const outcomeIds = new Set(network.outcomes.map((o) => o.id));
    const valueIds = new Set(network.values.map((v) => v.id));

    const ovLinks = network.links.filter((l) => l.type === 'outcome-value');
    ovLinks.forEach((link) => {
      expect(outcomeIds.has(link.sourceId)).toBe(true);
      expect(valueIds.has(link.targetId)).toBe(true);
    });
  });

  it('should have unique IDs for all nodes', () => {
    const network = createExampleNetwork();
    const allIds = [
      ...network.behaviours.map((b) => b.id),
      ...network.outcomes.map((o) => o.id),
      ...network.values.map((v) => v.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('should have unique IDs for all links', () => {
    const network = createExampleNetwork();
    const linkIds = network.links.map((l) => l.id);
    const uniqueIds = new Set(linkIds);
    expect(uniqueIds.size).toBe(linkIds.length);
  });

  it('should have unique labels within each node type', () => {
    const network = createExampleNetwork();

    const behaviourLabels = network.behaviours.map((b) => b.label.toLowerCase());
    expect(new Set(behaviourLabels).size).toBe(behaviourLabels.length);

    const outcomeLabels = network.outcomes.map((o) => o.label.toLowerCase());
    expect(new Set(outcomeLabels).size).toBe(outcomeLabels.length);

    const valueLabels = network.values.map((v) => v.label.toLowerCase());
    expect(new Set(valueLabels).size).toBe(valueLabels.length);
  });
});

describe('isExampleNetwork', () => {
  it('should return true for example network', () => {
    const network = createExampleNetwork();
    expect(isExampleNetwork(network)).toBe(true);
  });

  it('should return false for empty network', () => {
    const network = createEmptyNetwork();
    expect(isExampleNetwork(network)).toBe(false);
  });

  it('should return false for network with different behaviours', () => {
    const network = createExampleNetwork();
    // Replace all behaviour labels
    network.behaviours = network.behaviours.map((b, i) => ({
      ...b,
      label: `Custom behaviour ${i}`,
    }));
    expect(isExampleNetwork(network)).toBe(false);
  });

  it('should return true if at least 3 example behaviour labels match', () => {
    const network = createExampleNetwork();
    // Change only 1 behaviour label
    const firstBehaviour = network.behaviours[0]!;
    network.behaviours[0] = { ...firstBehaviour, label: 'Custom behaviour' };
    expect(isExampleNetwork(network)).toBe(true);
  });

  it('should be case-insensitive for label matching', () => {
    const network = createExampleNetwork();
    // Change case of labels
    network.behaviours = network.behaviours.map((b) => ({
      ...b,
      label: b.label.toUpperCase(),
    }));
    expect(isExampleNetwork(network)).toBe(true);
  });
});
