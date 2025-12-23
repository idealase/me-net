/**
 * Path Computation for Metrics
 *
 * Computes all paths from behaviours through outcomes to values,
 * along with weighted influence values.
 */

import type {
  Network,
  Behaviour,
  Value,
  BehaviourOutcomeLink,
  OutcomeValueLink,
} from '@/types';

import {
  reliabilityToNumber,
  strengthToNumber,
  valenceToMultiplier,
  importanceToNumber,
} from './mappings';

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a single path from a behaviour through an outcome to a value.
 */
export interface PathToValue {
  behaviourId: string;
  outcomeId: string;
  valueId: string;
  boLinkId: string;
  ovLinkId: string;
  /** Product of valences: positive if both same sign, negative otherwise */
  effectiveValence: 'positive' | 'negative';
  /** Raw path weight: reliability × strength (without valence or importance) */
  pathWeight: number;
  /** Influence contribution: valence × reliability × strength × importance */
  influence: number;
}

/**
 * Summary of all paths from a behaviour to all values.
 */
export interface BehaviourPaths {
  behaviourId: string;
  paths: PathToValue[];
  /** Total positive influence across all paths */
  positiveInfluence: number;
  /** Total negative influence (absolute value) across all paths */
  negativeInfluence: number;
  /** Net influence (positive - negative) */
  netInfluence: number;
  /** Set of value IDs reached via positive paths */
  positiveValueIds: Set<string>;
  /** Set of value IDs reached via negative paths */
  negativeValueIds: Set<string>;
  /** Set of all outcome IDs in paths */
  outcomeIds: Set<string>;
}

/**
 * Summary of all paths supporting a value.
 */
export interface ValueSupport {
  valueId: string;
  paths: PathToValue[];
  /** Total positive support from all behaviours */
  positiveSupport: number;
  /** Total negative impact from all behaviours */
  negativeSupport: number;
  /** Net support (positive - negative abs) */
  netSupport: number;
  /** Set of behaviour IDs that support this value positively */
  supportingBehaviourIds: Set<string>;
  /** Set of behaviour IDs that harm this value */
  harmingBehaviourIds: Set<string>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getBehaviours(network: Network): Behaviour[] {
  return network.behaviours;
}

function getValues(network: Network): Value[] {
  return network.values;
}

function getBehaviourOutcomeLinks(network: Network): BehaviourOutcomeLink[] {
  return network.links.filter((l): l is BehaviourOutcomeLink => l.type === 'behaviour-outcome');
}

function getOutcomeValueLinks(network: Network): OutcomeValueLink[] {
  return network.links.filter((l): l is OutcomeValueLink => l.type === 'outcome-value');
}

function findValue(network: Network, id: string): Value | undefined {
  return network.values.find((v) => v.id === id);
}

// ============================================================================
// Path Computation
// ============================================================================

/**
 * Compute all paths from behaviours to values through outcomes.
 */
export function computeAllPaths(network: Network): PathToValue[] {
  const paths: PathToValue[] = [];
  const boLinks = getBehaviourOutcomeLinks(network);
  const ovLinks = getOutcomeValueLinks(network);

  // For each B→O link, find all O→V links and create paths
  for (const boLink of boLinks) {
    const outcomeId = boLink.targetId;

    // Find all O→V links from this outcome
    const relatedOVLinks = ovLinks.filter((l) => l.sourceId === outcomeId);

    for (const ovLink of relatedOVLinks) {
      const value = findValue(network, ovLink.targetId);
      if (!value) continue;

      // Compute effective valence: positive×positive=positive, negative×negative=positive, mixed=negative
      const boValence = valenceToMultiplier(boLink.valence);
      const ovValence = valenceToMultiplier(ovLink.valence);
      const combinedValence = boValence * ovValence;
      const effectiveValence: 'positive' | 'negative' = combinedValence > 0 ? 'positive' : 'negative';

      // Compute path weight (reliability × strength)
      const reliability = reliabilityToNumber(boLink.reliability);
      const strength = strengthToNumber(ovLink.strength);
      const pathWeight = reliability * strength;

      // Compute influence (valence × weight × importance)
      const importance = importanceToNumber(value.importance);
      const influence = combinedValence * pathWeight * importance;

      paths.push({
        behaviourId: boLink.sourceId,
        outcomeId,
        valueId: ovLink.targetId,
        boLinkId: boLink.id,
        ovLinkId: ovLink.id,
        effectiveValence,
        pathWeight,
        influence,
      });
    }
  }

  return paths;
}

/**
 * Group paths by behaviour and compute summaries.
 */
export function groupPathsByBehaviour(network: Network): Map<string, BehaviourPaths> {
  const allPaths = computeAllPaths(network);
  const behaviours = getBehaviours(network);
  const result = new Map<string, BehaviourPaths>();

  // Initialize for all behaviours (even those with no paths)
  for (const behaviour of behaviours) {
    result.set(behaviour.id, {
      behaviourId: behaviour.id,
      paths: [],
      positiveInfluence: 0,
      negativeInfluence: 0,
      netInfluence: 0,
      positiveValueIds: new Set(),
      negativeValueIds: new Set(),
      outcomeIds: new Set(),
    });
  }

  // Group paths
  for (const path of allPaths) {
    const summary = result.get(path.behaviourId);
    if (!summary) continue;

    summary.paths.push(path);
    summary.outcomeIds.add(path.outcomeId);

    if (path.influence > 0) {
      summary.positiveInfluence += path.influence;
      summary.positiveValueIds.add(path.valueId);
    } else if (path.influence < 0) {
      summary.negativeInfluence += Math.abs(path.influence);
      summary.negativeValueIds.add(path.valueId);
    }
  }

  // Compute net influence
  for (const summary of result.values()) {
    summary.netInfluence = summary.positiveInfluence - summary.negativeInfluence;
  }

  return result;
}

/**
 * Group paths by value and compute support summaries.
 */
export function groupPathsByValue(network: Network): Map<string, ValueSupport> {
  const allPaths = computeAllPaths(network);
  const values = getValues(network);
  const result = new Map<string, ValueSupport>();

  // Initialize for all values (even those with no paths)
  for (const value of values) {
    result.set(value.id, {
      valueId: value.id,
      paths: [],
      positiveSupport: 0,
      negativeSupport: 0,
      netSupport: 0,
      supportingBehaviourIds: new Set(),
      harmingBehaviourIds: new Set(),
    });
  }

  // Group paths
  for (const path of allPaths) {
    const summary = result.get(path.valueId);
    if (!summary) continue;

    summary.paths.push(path);

    if (path.influence > 0) {
      summary.positiveSupport += path.influence;
      summary.supportingBehaviourIds.add(path.behaviourId);
    } else if (path.influence < 0) {
      summary.negativeSupport += Math.abs(path.influence);
      summary.harmingBehaviourIds.add(path.behaviourId);
    }
  }

  // Compute net support
  for (const summary of result.values()) {
    summary.netSupport = summary.positiveSupport - summary.negativeSupport;
  }

  return result;
}

/**
 * Get all unique values reached by a behaviour (coverage).
 */
export function getValuesReachedByBehaviour(
  network: Network,
  behaviourId: string
): { positive: string[]; negative: string[] } {
  const pathsByBehaviour = groupPathsByBehaviour(network);
  const summary = pathsByBehaviour.get(behaviourId);

  if (!summary) {
    return { positive: [], negative: [] };
  }

  return {
    positive: Array.from(summary.positiveValueIds),
    negative: Array.from(summary.negativeValueIds),
  };
}

/**
 * Get all behaviours that support a value.
 */
export function getBehavioursSupportingValue(
  network: Network,
  valueId: string
): { supporting: string[]; harming: string[] } {
  const pathsByValue = groupPathsByValue(network);
  const summary = pathsByValue.get(valueId);

  if (!summary) {
    return { supporting: [], harming: [] };
  }

  return {
    supporting: Array.from(summary.supportingBehaviourIds),
    harming: Array.from(summary.harmingBehaviourIds),
  };
}

/**
 * Get outcomes involved in paths between behaviour and values.
 */
export function getOutcomesForBehaviour(network: Network, behaviourId: string): string[] {
  const pathsByBehaviour = groupPathsByBehaviour(network);
  const summary = pathsByBehaviour.get(behaviourId);

  if (!summary) {
    return [];
  }

  return Array.from(summary.outcomeIds);
}
