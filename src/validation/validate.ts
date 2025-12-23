/**
 * Validation Engine
 *
 * Core validation logic for detecting structural issues in the network.
 */

import type {
  Network,
  Behaviour,
  Outcome,
  Value,
  BehaviourOutcomeLink,
  OutcomeValueLink,
} from '@/types';

import {
  Warning,
  WarningState,
  ValidationResult,
  PathToValue,
  OutcomeConflict,
  ValueConflict,
  createEmptyValidationResult,
  generateWarningId,
  getSeverity,
  isWarningActive,
} from './types';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all behaviour-outcome links from the network.
 */
function getBehaviourOutcomeLinks(network: Network): BehaviourOutcomeLink[] {
  return network.links.filter(
    (link): link is BehaviourOutcomeLink => link.type === 'behaviour-outcome'
  );
}

/**
 * Get all outcome-value links from the network.
 */
function getOutcomeValueLinks(network: Network): OutcomeValueLink[] {
  return network.links.filter(
    (link): link is OutcomeValueLink => link.type === 'outcome-value'
  );
}

/**
 * Find a behaviour by ID.
 */
function findBehaviour(network: Network, id: string): Behaviour | undefined {
  return network.behaviours.find((b) => b.id === id);
}

/**
 * Find an outcome by ID.
 */
function findOutcome(network: Network, id: string): Outcome | undefined {
  return network.outcomes.find((o) => o.id === id);
}

/**
 * Find a value by ID.
 */
function findValue(network: Network, id: string): Value | undefined {
  return network.values.find((v) => v.id === id);
}

// ============================================================================
// Orphan Values Detection (V-1)
// ============================================================================

/**
 * Detect values with no incoming path from any behaviour.
 * A value is an orphan if:
 * - No outcome links to it, OR
 * - All outcomes that link to it have no behaviour links
 */
export function detectOrphanValues(network: Network): Warning[] {
  const warnings: Warning[] = [];
  const boLinks = getBehaviourOutcomeLinks(network);
  const ovLinks = getOutcomeValueLinks(network);

  // Build set of outcomes that have incoming behaviour links
  const outcomeIdsWithBehaviours = new Set(boLinks.map((l) => l.targetId));

  // For each value, check if it has a path from a behaviour
  for (const value of network.values) {
    // Get outcomes that link to this value
    const incomingOutcomeIds = ovLinks
      .filter((l) => l.targetId === value.id)
      .map((l) => l.sourceId);

    // Check if any of those outcomes have a behaviour link
    const hasPathFromBehaviour = incomingOutcomeIds.some((outcomeId) =>
      outcomeIdsWithBehaviours.has(outcomeId)
    );

    if (!hasPathFromBehaviour) {
      warnings.push({
        id: generateWarningId('orphan-value', value.id),
        type: 'orphan-value',
        nodeId: value.id,
        message: `"${value.label}" has no connection from any behaviour`,
        severity: getSeverity('orphan-value'),
        relatedNodeIds: incomingOutcomeIds,
        suggestion: 'Connect this value to an outcome, or use Why Ladder to trace a behaviour to this value.',
      });
    }
  }

  return warnings;
}

// ============================================================================
// Unexplained Behaviours Detection (V-2)
// ============================================================================

/**
 * Detect behaviours with no outgoing links.
 */
export function detectUnexplainedBehaviours(network: Network): Warning[] {
  const warnings: Warning[] = [];
  const boLinks = getBehaviourOutcomeLinks(network);

  // Build set of behaviours that have outgoing links
  const behaviourIdsWithLinks = new Set(boLinks.map((l) => l.sourceId));

  for (const behaviour of network.behaviours) {
    if (!behaviourIdsWithLinks.has(behaviour.id)) {
      warnings.push({
        id: generateWarningId('unexplained-behaviour', behaviour.id),
        type: 'unexplained-behaviour',
        nodeId: behaviour.id,
        message: `"${behaviour.label}" has no outcomes linked`,
        severity: getSeverity('unexplained-behaviour'),
        relatedNodeIds: [],
        suggestion: 'Use Why Ladder to explore what outcomes this behaviour produces.',
      });
    }
  }

  return warnings;
}

// ============================================================================
// Floating Outcomes Detection (V-3)
// ============================================================================

/**
 * Detect outcomes with no downstream links to values.
 */
export function detectFloatingOutcomes(network: Network): Warning[] {
  const warnings: Warning[] = [];
  const ovLinks = getOutcomeValueLinks(network);

  // Build set of outcomes that have downstream links
  const outcomeIdsWithDownstream = new Set(ovLinks.map((l) => l.sourceId));

  for (const outcome of network.outcomes) {
    if (!outcomeIdsWithDownstream.has(outcome.id)) {
      warnings.push({
        id: generateWarningId('floating-outcome', outcome.id),
        type: 'floating-outcome',
        nodeId: outcome.id,
        message: `"${outcome.label}" is not connected to any value`,
        severity: getSeverity('floating-outcome'),
        relatedNodeIds: [],
        suggestion: 'Ask "Why does this outcome matter?" to connect it to a value.',
      });
    }
  }

  return warnings;
}

// ============================================================================
// Outcome-Level Conflicts Detection (V-4)
// ============================================================================

/**
 * Detect behaviours with negative behaviour→outcome links.
 * These represent immediate harm caused by a behaviour.
 */
export function detectOutcomeLevelConflicts(network: Network): Warning[] {
  const warnings: Warning[] = [];
  const boLinks = getBehaviourOutcomeLinks(network);

  // Group negative links by behaviour
  const negativeByBehaviour = new Map<string, BehaviourOutcomeLink[]>();
  for (const link of boLinks) {
    if (link.valence === 'negative') {
      const existing = negativeByBehaviour.get(link.sourceId) ?? [];
      existing.push(link);
      negativeByBehaviour.set(link.sourceId, existing);
    }
  }

  for (const [behaviourId, negativeLinks] of negativeByBehaviour) {
    const behaviour = findBehaviour(network, behaviourId);
    if (!behaviour) continue;

    const negativeOutcomes = negativeLinks
      .map((l) => {
        const outcome = findOutcome(network, l.targetId);
        return outcome ? { id: outcome.id, label: outcome.label } : null;
      })
      .filter((o): o is { id: string; label: string } => o !== null);

    if (negativeOutcomes.length > 0) {
      const outcomeNames = negativeOutcomes.map((o) => `"${o.label}"`).join(', ');
      warnings.push({
        id: generateWarningId('outcome-level-conflict', behaviourId),
        type: 'outcome-level-conflict',
        nodeId: behaviourId,
        message: `"${behaviour.label}" has negative effects on: ${outcomeNames}`,
        severity: getSeverity('outcome-level-conflict'),
        relatedNodeIds: negativeOutcomes.map((o) => o.id),
        suggestion: 'Consider whether the benefits outweigh the costs, or find alternatives.',
      });
    }
  }

  return warnings;
}

// ============================================================================
// Value-Level Conflicts Detection (V-5)
// ============================================================================

/**
 * Compute all paths from behaviours to values with their effective valence.
 */
export function computePathsToValues(network: Network): PathToValue[] {
  const paths: PathToValue[] = [];
  const boLinks = getBehaviourOutcomeLinks(network);
  const ovLinks = getOutcomeValueLinks(network);

  // For each behaviour->outcome link
  for (const boLink of boLinks) {
    // Find all outcome->value links from this outcome
    const downstreamLinks = ovLinks.filter((l) => l.sourceId === boLink.targetId);

    for (const ovLink of downstreamLinks) {
      // Determine effective valence (negative * negative = positive, etc.)
      const effectiveValence =
        boLink.valence === ovLink.valence ? 'positive' : 'negative';

      // Compute weight based on reliability and strength
      const reliabilityWeight = getReliabilityWeight(boLink.reliability);
      const strengthWeight = getStrengthWeight(ovLink.strength);
      const valenceMultiplier = effectiveValence === 'positive' ? 1 : -1;
      const weight = reliabilityWeight * strengthWeight * valenceMultiplier;

      paths.push({
        behaviourId: boLink.sourceId,
        outcomeId: boLink.targetId,
        valueId: ovLink.targetId,
        valence: effectiveValence,
        weight,
      });
    }
  }

  return paths;
}

/**
 * Convert reliability to numeric weight.
 */
function getReliabilityWeight(reliability: string): number {
  switch (reliability) {
    case 'always':
      return 1.0;
    case 'usually':
      return 0.75;
    case 'sometimes':
      return 0.5;
    case 'rarely':
      return 0.25;
    default:
      return 0.5;
  }
}

/**
 * Convert strength to numeric weight.
 */
function getStrengthWeight(strength: string): number {
  switch (strength) {
    case 'strong':
      return 1.0;
    case 'moderate':
      return 0.6;
    case 'weak':
      return 0.3;
    default:
      return 0.5;
  }
}

/**
 * Detect behaviours with mixed positive/negative downstream effects on values.
 * A value-level conflict occurs when a behaviour helps some values while hurting others.
 */
export function detectValueLevelConflicts(network: Network): Warning[] {
  const warnings: Warning[] = [];
  const paths = computePathsToValues(network);

  // Group paths by behaviour
  const pathsByBehaviour = new Map<string, PathToValue[]>();
  for (const path of paths) {
    const existing = pathsByBehaviour.get(path.behaviourId) ?? [];
    existing.push(path);
    pathsByBehaviour.set(path.behaviourId, existing);
  }

  for (const [behaviourId, behaviourPaths] of pathsByBehaviour) {
    const behaviour = findBehaviour(network, behaviourId);
    if (!behaviour) continue;

    // Get unique values affected positively and negatively
    const positiveValueIds = new Set<string>();
    const negativeValueIds = new Set<string>();

    for (const path of behaviourPaths) {
      if (path.valence === 'positive') {
        positiveValueIds.add(path.valueId);
      } else {
        negativeValueIds.add(path.valueId);
      }
    }

    // Check if there's a conflict (both positive and negative effects)
    if (positiveValueIds.size > 0 && negativeValueIds.size > 0) {
      const positiveValues = Array.from(positiveValueIds)
        .map((id) => findValue(network, id))
        .filter((v): v is Value => v !== undefined)
        .map((v) => ({ id: v.id, label: v.label }));

      const negativeValues = Array.from(negativeValueIds)
        .map((id) => findValue(network, id))
        .filter((v): v is Value => v !== undefined)
        .map((v) => ({ id: v.id, label: v.label }));

      const positiveNames = positiveValues.map((v) => `"${v.label}"`).join(', ');
      const negativeNames = negativeValues.map((v) => `"${v.label}"`).join(', ');

      warnings.push({
        id: generateWarningId('value-level-conflict', behaviourId),
        type: 'value-level-conflict',
        nodeId: behaviourId,
        message: `"${behaviour.label}" creates a trade-off: helps ${positiveNames} but hurts ${negativeNames}`,
        severity: getSeverity('value-level-conflict'),
        relatedNodeIds: [...positiveValueIds, ...negativeValueIds],
        suggestion: 'Consider whether this trade-off aligns with your priorities.',
      });
    }
  }

  return warnings;
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Run all validation checks and return a comprehensive result.
 */
export function validateNetwork(network: Network, state?: WarningState): ValidationResult {
  const result = createEmptyValidationResult();
  const warningState = state ?? { snoozed: {}, dismissed: {} };

  // Collect all warnings
  const allWarnings = [
    ...detectOrphanValues(network),
    ...detectUnexplainedBehaviours(network),
    ...detectFloatingOutcomes(network),
    ...detectOutcomeLevelConflicts(network),
    ...detectValueLevelConflicts(network),
  ];

  result.warnings = allWarnings;

  // Build indexes
  for (const warning of allWarnings) {
    // By type
    result.byType[warning.type].push(warning);

    // By node ID
    result.byNodeId[warning.nodeId] ??= [];
    const nodeWarnings = result.byNodeId[warning.nodeId];
    if (nodeWarnings !== undefined) {
      nodeWarnings.push(warning);
    }

    // Counts
    result.counts.total++;
    result.counts.byType[warning.type]++;
    result.counts.bySeverity[warning.severity]++;

    // Active/snoozed/dismissed
    const snoozedUntil = warningState.snoozed[warning.id];
    if (warningState.dismissed[warning.id] === true) {
      result.counts.dismissed++;
    } else if (snoozedUntil !== undefined && snoozedUntil !== '' && new Date(snoozedUntil) > new Date()) {
      result.counts.snoozed++;
    } else {
      result.counts.active++;
    }
  }

  return result;
}

/**
 * Get active warnings only (not snoozed or dismissed).
 */
export function getActiveWarnings(result: ValidationResult, state: WarningState): Warning[] {
  return result.warnings.filter((w) => isWarningActive(w, state));
}

/**
 * Get warnings for a specific node.
 */
export function getWarningsForNode(result: ValidationResult, nodeId: string): Warning[] {
  return result.byNodeId[nodeId] ?? [];
}

/**
 * Get conflict details for a behaviour.
 */
export function getConflictDetails(
  network: Network,
  behaviourId: string
): { outcomeConflicts: OutcomeConflict[]; valueConflict: ValueConflict | null } {
  const boLinks = getBehaviourOutcomeLinks(network);
  const behaviour = findBehaviour(network, behaviourId);

  if (!behaviour) {
    return { outcomeConflicts: [], valueConflict: null };
  }

  // Outcome-level conflicts
  const outcomeConflicts: OutcomeConflict[] = boLinks
    .filter((l) => l.sourceId === behaviourId && l.valence === 'negative')
    .map((l) => {
      const outcome = findOutcome(network, l.targetId);
      return outcome
        ? {
            behaviourId,
            behaviourLabel: behaviour.label,
            outcomeId: outcome.id,
            outcomeLabel: outcome.label,
            valence: 'negative' as const,
          }
        : null;
    })
    .filter((c): c is OutcomeConflict => c !== null);

  // Value-level conflict
  const paths = computePathsToValues(network).filter((p) => p.behaviourId === behaviourId);
  const positiveValues: Array<{ id: string; label: string }> = [];
  const negativeValues: Array<{ id: string; label: string }> = [];
  const seenPositive = new Set<string>();
  const seenNegative = new Set<string>();

  for (const path of paths) {
    const value = findValue(network, path.valueId);
    if (!value) continue;

    if (path.valence === 'positive' && !seenPositive.has(path.valueId)) {
      positiveValues.push({ id: value.id, label: value.label });
      seenPositive.add(path.valueId);
    } else if (path.valence === 'negative' && !seenNegative.has(path.valueId)) {
      negativeValues.push({ id: value.id, label: value.label });
      seenNegative.add(path.valueId);
    }
  }

  const valueConflict =
    positiveValues.length > 0 && negativeValues.length > 0
      ? {
          behaviourId,
          behaviourLabel: behaviour.label,
          positiveValues,
          negativeValues,
        }
      : null;

  return { outcomeConflicts, valueConflict };
}
