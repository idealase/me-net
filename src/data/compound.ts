/**
 * Compound Operations
 *
 * Operations that change more than one entity in a single, all-or-nothing
 * network update (for example creating a node and linking it at once).
 */

import type { Link, Network, Outcome, Reliability, Strength, Valence, Value } from '@/types';

import { addBehaviourOutcomeLink, addOutcomeValueLink, type CrudResult } from './links';
import { addOutcome } from './outcomes';
import { addValue } from './values';

// ============================================================================
// Types
// ============================================================================

export type LinkToNewTargetInput =
  | {
      type: 'behaviour-outcome';
      /** Existing behaviour ID */
      sourceId: string;
      /** Label for the outcome to create */
      targetLabel: string;
      valence: Valence;
      reliability: Reliability;
    }
  | {
      type: 'outcome-value';
      /** Existing outcome ID */
      sourceId: string;
      /** Label for the value to create */
      targetLabel: string;
      valence: Valence;
      strength: Strength;
    };

export interface LinkToNewTargetResult {
  network: Network;
  target: Outcome | Value;
  link: Link;
}

// ============================================================================
// Operations
// ============================================================================

/**
 * Create a new target node (outcome or value) and link the source to it.
 *
 * Either both the node and the link are created, or the original network is
 * left untouched and an error is returned.
 */
export function addLinkToNewTarget(
  network: Network,
  input: LinkToNewTargetInput
): CrudResult<LinkToNewTargetResult> {
  if (input.type === 'behaviour-outcome') {
    const nodeResult = addOutcome(network, { label: input.targetLabel });
    if (!nodeResult.success || nodeResult.data === undefined) {
      return { success: false, error: nodeResult.error ?? 'Failed to create outcome' };
    }
    const { outcome } = nodeResult.data;
    const linkResult = addBehaviourOutcomeLink(nodeResult.data.network, {
      sourceId: input.sourceId,
      targetId: outcome.id,
      valence: input.valence,
      reliability: input.reliability,
    });
    if (!linkResult.success || linkResult.data === undefined) {
      return { success: false, error: linkResult.error ?? 'Failed to create link' };
    }
    return {
      success: true,
      data: { network: linkResult.data.network, target: outcome, link: linkResult.data.link },
    };
  }

  const nodeResult = addValue(network, {
    label: input.targetLabel,
    importance: 'medium',
    neglect: 'adequately-met',
  });
  if (!nodeResult.success || nodeResult.data === undefined) {
    return { success: false, error: nodeResult.error ?? 'Failed to create value' };
  }
  const { value } = nodeResult.data;
  const linkResult = addOutcomeValueLink(nodeResult.data.network, {
    sourceId: input.sourceId,
    targetId: value.id,
    valence: input.valence,
    strength: input.strength,
  });
  if (!linkResult.success || linkResult.data === undefined) {
    return { success: false, error: linkResult.error ?? 'Failed to create link' };
  }
  return {
    success: true,
    data: { network: linkResult.data.network, target: value, link: linkResult.data.link },
  };
}
