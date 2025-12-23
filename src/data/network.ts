/**
 * Network Factory for M-E Net
 *
 * Provides functions for creating and working with Network objects.
 */

import type { Network } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const CURRENT_VERSION = '1.0.0';

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a new empty network with the correct structure.
 */
export function createEmptyNetwork(): Network {
  return {
    version: CURRENT_VERSION,
    behaviours: [],
    outcomes: [],
    values: [],
    links: [],
  };
}

/**
 * Create a network with initial data (useful for testing and import).
 */
export function createNetwork(partial: Partial<Network> = {}): Network {
  return {
    version: partial.version ?? CURRENT_VERSION,
    behaviours: partial.behaviours ?? [],
    outcomes: partial.outcomes ?? [],
    values: partial.values ?? [],
    links: partial.links ?? [],
    exportedAt: partial.exportedAt,
  };
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Check if a network is empty (no nodes).
 */
export function isNetworkEmpty(network: Network): boolean {
  return (
    network.behaviours.length === 0 &&
    network.outcomes.length === 0 &&
    network.values.length === 0
  );
}

/**
 * Get total node count.
 */
export function getNodeCount(network: Network): number {
  return network.behaviours.length + network.outcomes.length + network.values.length;
}

/**
 * Get total link count.
 */
export function getLinkCount(network: Network): number {
  return network.links.length;
}

/**
 * Get network statistics summary.
 */
export interface NetworkStats {
  behaviours: number;
  outcomes: number;
  values: number;
  links: number;
  totalNodes: number;
}

export function getNetworkStats(network: Network): NetworkStats {
  return {
    behaviours: network.behaviours.length,
    outcomes: network.outcomes.length,
    values: network.values.length,
    links: network.links.length,
    totalNodes: getNodeCount(network),
  };
}
