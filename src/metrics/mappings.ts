/**
 * Numeric Mappings for Metrics Computation
 *
 * Maps qualitative attributes to numeric values for calculations.
 * See docs/metrics-and-insights.md for specification.
 */

import type { Reliability, Strength, Cost, Importance, Neglect, Valence } from '@/types';

// ============================================================================
// Link Reliability (Behaviour → Outcome)
// ============================================================================

const RELIABILITY_VALUES: Record<Reliability, number> = {
  always: 1.0,
  usually: 0.75,
  sometimes: 0.5,
  rarely: 0.25,
};

export function reliabilityToNumber(reliability: Reliability): number {
  return RELIABILITY_VALUES[reliability];
}

// ============================================================================
// Link Strength (Outcome → Value)
// ============================================================================

const STRENGTH_VALUES: Record<Strength, number> = {
  strong: 1.0,
  moderate: 0.6,
  weak: 0.3,
};

export function strengthToNumber(strength: Strength): number {
  return STRENGTH_VALUES[strength];
}

// ============================================================================
// Link Valence
// ============================================================================

const VALENCE_MULTIPLIERS: Record<Valence, number> = {
  positive: 1,
  negative: -1,
};

export function valenceToMultiplier(valence: Valence): number {
  return VALENCE_MULTIPLIERS[valence];
}

// ============================================================================
// Behaviour Cost (used as divisor - lower cost = higher efficiency)
// ============================================================================

const COST_VALUES: Record<Cost, number> = {
  trivial: 1,
  low: 2,
  medium: 4,
  high: 8,
  'very-high': 16,
};

export function costToNumber(cost: Cost): number {
  return COST_VALUES[cost];
}

// ============================================================================
// Value Importance
// ============================================================================

const IMPORTANCE_VALUES: Record<Importance, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function importanceToNumber(importance: Importance): number {
  return IMPORTANCE_VALUES[importance];
}

// ============================================================================
// Value Neglect
// ============================================================================

const NEGLECT_VALUES: Record<Neglect, number> = {
  'severely-neglected': 4,
  'somewhat-neglected': 3,
  'adequately-met': 2,
  'well-satisfied': 1,
};

export function neglectToNumber(neglect: Neglect): number {
  return NEGLECT_VALUES[neglect];
}

// ============================================================================
// Exports for constants (useful for tests)
// ============================================================================

export const MAPPINGS = {
  reliability: RELIABILITY_VALUES,
  strength: STRENGTH_VALUES,
  valence: VALENCE_MULTIPLIERS,
  cost: COST_VALUES,
  importance: IMPORTANCE_VALUES,
  neglect: NEGLECT_VALUES,
} as const;
