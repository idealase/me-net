/**
 * Tests for Numeric Mappings
 */

import {
  reliabilityToNumber,
  strengthToNumber,
  valenceToMultiplier,
  costToNumber,
  importanceToNumber,
  neglectToNumber,
  MAPPINGS,
} from './mappings';

describe('reliabilityToNumber', () => {
  it('maps always to 1.0', () => {
    expect(reliabilityToNumber('always')).toBe(1.0);
  });

  it('maps usually to 0.75', () => {
    expect(reliabilityToNumber('usually')).toBe(0.75);
  });

  it('maps sometimes to 0.5', () => {
    expect(reliabilityToNumber('sometimes')).toBe(0.5);
  });

  it('maps rarely to 0.25', () => {
    expect(reliabilityToNumber('rarely')).toBe(0.25);
  });
});

describe('strengthToNumber', () => {
  it('maps strong to 1.0', () => {
    expect(strengthToNumber('strong')).toBe(1.0);
  });

  it('maps moderate to 0.6', () => {
    expect(strengthToNumber('moderate')).toBe(0.6);
  });

  it('maps weak to 0.3', () => {
    expect(strengthToNumber('weak')).toBe(0.3);
  });
});

describe('valenceToMultiplier', () => {
  it('maps positive to 1', () => {
    expect(valenceToMultiplier('positive')).toBe(1);
  });

  it('maps negative to -1', () => {
    expect(valenceToMultiplier('negative')).toBe(-1);
  });
});

describe('costToNumber', () => {
  it('maps trivial to 1', () => {
    expect(costToNumber('trivial')).toBe(1);
  });

  it('maps low to 2', () => {
    expect(costToNumber('low')).toBe(2);
  });

  it('maps medium to 4', () => {
    expect(costToNumber('medium')).toBe(4);
  });

  it('maps high to 8', () => {
    expect(costToNumber('high')).toBe(8);
  });

  it('maps very-high to 16', () => {
    expect(costToNumber('very-high')).toBe(16);
  });
});

describe('importanceToNumber', () => {
  it('maps critical to 4', () => {
    expect(importanceToNumber('critical')).toBe(4);
  });

  it('maps high to 3', () => {
    expect(importanceToNumber('high')).toBe(3);
  });

  it('maps medium to 2', () => {
    expect(importanceToNumber('medium')).toBe(2);
  });

  it('maps low to 1', () => {
    expect(importanceToNumber('low')).toBe(1);
  });
});

describe('neglectToNumber', () => {
  it('maps severely-neglected to 4', () => {
    expect(neglectToNumber('severely-neglected')).toBe(4);
  });

  it('maps somewhat-neglected to 3', () => {
    expect(neglectToNumber('somewhat-neglected')).toBe(3);
  });

  it('maps adequately-met to 2', () => {
    expect(neglectToNumber('adequately-met')).toBe(2);
  });

  it('maps well-satisfied to 1', () => {
    expect(neglectToNumber('well-satisfied')).toBe(1);
  });
});

describe('MAPPINGS constant', () => {
  it('exports all mapping objects', () => {
    expect(MAPPINGS.reliability).toBeDefined();
    expect(MAPPINGS.strength).toBeDefined();
    expect(MAPPINGS.valence).toBeDefined();
    expect(MAPPINGS.cost).toBeDefined();
    expect(MAPPINGS.importance).toBeDefined();
    expect(MAPPINGS.neglect).toBeDefined();
  });
});
