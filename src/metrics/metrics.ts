/**
 * Metrics Computation
 *
 * Computes leverage, fragility, conflict index, and coverage metrics.
 * See docs/metrics-and-insights.md for specification.
 */

import type { Network, Behaviour, Value, BehaviourMetrics, ValueMetrics } from '@/types';

import { costToNumber, importanceToNumber, neglectToNumber } from './mappings';
import { groupPathsByBehaviour, groupPathsByValue, BehaviourPaths, ValueSupport } from './paths';

// ============================================================================
// Constants
// ============================================================================

/** Sentinel value for infinite fragility (orphan values) */
export const INFINITE_FRAGILITY = Infinity;

/** Threshold for flagging fragile values (from spec) */
export const FRAGILITY_THRESHOLD = 3.0;

/** Threshold for flagging conflict behaviours (from spec) */
export const CONFLICT_THRESHOLD = 0.5;

/** Number of top behaviours to highlight */
export const TOP_LEVERAGE_COUNT = 5;

// ============================================================================
// Leverage Score
// ============================================================================

/**
 * Compute leverage score for a behaviour.
 *
 * Leverage = TotalInfluence / Cost
 *
 * Where TotalInfluence is the sum of influence across all paths to values
 * (already weighted by importance in path computation).
 */
export function computeLeverageScore(behaviour: Behaviour, paths: BehaviourPaths): number {
  const cost = costToNumber(behaviour.cost);
  const totalInfluence = paths.netInfluence;

  return totalInfluence / cost;
}

// ============================================================================
// Coverage
// ============================================================================

/**
 * Compute coverage for a behaviour.
 *
 * Coverage = number of distinct values reached via positive paths.
 */
export function computeCoverage(paths: BehaviourPaths): number {
  return paths.positiveValueIds.size;
}

// ============================================================================
// Conflict Index
// ============================================================================

/**
 * Compute conflict index for a behaviour.
 *
 * ConflictIndex = min(PositiveInfluence, NegativeInfluence)
 *
 * High conflict = behaviour has substantial effects in both directions.
 */
export function computeConflictIndex(paths: BehaviourPaths): number {
  return Math.min(paths.positiveInfluence, paths.negativeInfluence);
}

// ============================================================================
// Fragility Score
// ============================================================================

/**
 * Compute fragility score for a value.
 *
 * Fragility = (Importance × Neglect) / SupportStrength
 *
 * If SupportStrength = 0 (orphan value), fragility is INFINITE_FRAGILITY.
 */
export function computeFragilityScore(value: Value, support: ValueSupport): number {
  const importance = importanceToNumber(value.importance);
  const neglect = neglectToNumber(value.neglect);
  const supportStrength = support.positiveSupport;

  if (supportStrength <= 0) {
    return INFINITE_FRAGILITY;
  }

  return (importance * neglect) / supportStrength;
}

// ============================================================================
// Aggregate Metrics
// ============================================================================

/**
 * Compute all metrics for all behaviours.
 */
export function computeAllBehaviourMetrics(network: Network): Map<string, BehaviourMetrics> {
  const pathsByBehaviour = groupPathsByBehaviour(network);
  const result = new Map<string, BehaviourMetrics>();

  for (const behaviour of network.behaviours) {
    const paths = pathsByBehaviour.get(behaviour.id);
    if (!paths) continue;

    result.set(behaviour.id, {
      behaviourId: behaviour.id,
      leverageScore: computeLeverageScore(behaviour, paths),
      coverage: computeCoverage(paths),
      conflictIndex: computeConflictIndex(paths),
      positiveInfluence: paths.positiveInfluence,
      negativeInfluence: paths.negativeInfluence,
    });
  }

  return result;
}

/**
 * Compute all metrics for all values.
 */
export function computeAllValueMetrics(network: Network): Map<string, ValueMetrics> {
  const pathsByValue = groupPathsByValue(network);
  const result = new Map<string, ValueMetrics>();

  for (const value of network.values) {
    const support = pathsByValue.get(value.id);
    if (!support) continue;

    result.set(value.id, {
      valueId: value.id,
      fragilityScore: computeFragilityScore(value, support),
      supportStrength: support.positiveSupport,
      supportingBehaviours: Array.from(support.supportingBehaviourIds),
    });
  }

  return result;
}

// ============================================================================
// Insight Getters
// ============================================================================

export interface LeverageInsight {
  behaviour: Behaviour;
  metrics: BehaviourMetrics;
  supportedValues: Value[];
  viaOutcomes: string[];
}

export interface FragilityInsight {
  value: Value;
  metrics: ValueMetrics;
  supportingBehaviours: Behaviour[];
  isOrphan: boolean;
}

export interface ConflictInsight {
  behaviour: Behaviour;
  metrics: BehaviourMetrics;
  positiveValues: Value[];
  negativeValues: Value[];
}

/**
 * Get top leverage behaviours with explanations.
 */
export function getTopLeverageBehaviours(
  network: Network,
  count: number = TOP_LEVERAGE_COUNT
): LeverageInsight[] {
  const behaviourMetrics = computeAllBehaviourMetrics(network);
  const pathsByBehaviour = groupPathsByBehaviour(network);

  // Sort by leverage (descending)
  const sorted = Array.from(behaviourMetrics.entries())
    .filter(([_, m]) => m.leverageScore > 0) // Only positive leverage
    .sort((a, b) => b[1].leverageScore - a[1].leverageScore)
    .slice(0, count);

  return sorted.map(([behaviourId, metrics]) => {
    const behaviour = network.behaviours.find((b) => b.id === behaviourId);
    const paths = pathsByBehaviour.get(behaviourId);

    if (!behaviour || !paths) {
      throw new Error(`Behaviour not found: ${behaviourId}`);
    }

    // Get supported values
    const supportedValues = network.values.filter((v) => paths.positiveValueIds.has(v.id));

    // Get outcomes involved
    const viaOutcomes = network.outcomes
      .filter((o) => paths.outcomeIds.has(o.id))
      .map((o) => o.label);

    return {
      behaviour,
      metrics,
      supportedValues,
      viaOutcomes,
    };
  });
}

/**
 * Get fragile values (fragility > threshold or orphans).
 */
export function getFragileValues(
  network: Network,
  threshold: number = FRAGILITY_THRESHOLD
): FragilityInsight[] {
  const valueMetrics = computeAllValueMetrics(network);

  // Sort by fragility (descending), orphans first
  const sorted = Array.from(valueMetrics.entries())
    .filter(([_, m]) => m.fragilityScore > threshold || m.fragilityScore === INFINITE_FRAGILITY)
    .sort((a, b) => {
      // Infinite fragility (orphans) always first
      if (a[1].fragilityScore === INFINITE_FRAGILITY && b[1].fragilityScore !== INFINITE_FRAGILITY) {
        return -1;
      }
      if (b[1].fragilityScore === INFINITE_FRAGILITY && a[1].fragilityScore !== INFINITE_FRAGILITY) {
        return 1;
      }
      return b[1].fragilityScore - a[1].fragilityScore;
    });

  return sorted.map(([valueId, metrics]) => {
    const value = network.values.find((v) => v.id === valueId);
    if (!value) {
      throw new Error(`Value not found: ${valueId}`);
    }

    const supportingBehaviours = network.behaviours.filter((b) =>
      metrics.supportingBehaviours.includes(b.id)
    );

    return {
      value,
      metrics,
      supportingBehaviours,
      isOrphan: metrics.fragilityScore === INFINITE_FRAGILITY,
    };
  });
}

/**
 * Get conflict behaviours (conflict index > threshold).
 */
export function getConflictBehaviours(
  network: Network,
  threshold: number = CONFLICT_THRESHOLD
): ConflictInsight[] {
  const behaviourMetrics = computeAllBehaviourMetrics(network);
  const pathsByBehaviour = groupPathsByBehaviour(network);

  // Sort by conflict index (descending)
  const sorted = Array.from(behaviourMetrics.entries())
    .filter(([_, m]) => m.conflictIndex > threshold)
    .sort((a, b) => b[1].conflictIndex - a[1].conflictIndex);

  return sorted.map(([behaviourId, metrics]) => {
    const behaviour = network.behaviours.find((b) => b.id === behaviourId);
    const paths = pathsByBehaviour.get(behaviourId);

    if (!behaviour || !paths) {
      throw new Error(`Behaviour not found: ${behaviourId}`);
    }

    const positiveValues = network.values.filter((v) => paths.positiveValueIds.has(v.id));
    const negativeValues = network.values.filter((v) => paths.negativeValueIds.has(v.id));

    return {
      behaviour,
      metrics,
      positiveValues,
      negativeValues,
    };
  });
}

// ============================================================================
// Full Network Analysis
// ============================================================================

export interface NetworkAnalysis {
  behaviourMetrics: Map<string, BehaviourMetrics>;
  valueMetrics: Map<string, ValueMetrics>;
  topLeverage: LeverageInsight[];
  fragileValues: FragilityInsight[];
  conflictBehaviours: ConflictInsight[];
}

/**
 * Perform full network analysis.
 */
export function analyzeNetwork(network: Network): NetworkAnalysis {
  return {
    behaviourMetrics: computeAllBehaviourMetrics(network),
    valueMetrics: computeAllValueMetrics(network),
    topLeverage: getTopLeverageBehaviours(network),
    fragileValues: getFragileValues(network),
    conflictBehaviours: getConflictBehaviours(network),
  };
}
