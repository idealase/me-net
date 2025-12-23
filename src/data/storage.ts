/**
 * Persistence Layer for M-E Net
 *
 * Handles saving and loading network data to/from localStorage.
 * See docs/data-model.md for the Network structure.
 */

import type { Network } from '@/types';

import { createEmptyNetwork } from './network';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'me-net-network';
const CURRENT_VERSION = '1.0.0';

// ============================================================================
// Types
// ============================================================================

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Save
// ============================================================================

/**
 * Save a network to localStorage.
 * Adds version metadata for future migration support.
 */
export function saveNetwork(network: Network): StorageResult<void> {
  try {
    const networkWithVersion: Network = {
      ...network,
      version: CURRENT_VERSION,
    };
    const json = JSON.stringify(networkWithVersion);
    localStorage.setItem(STORAGE_KEY, json);
    return { success: true };
  } catch (error) {
    // Handle quota exceeded or other storage errors
    const message = error instanceof Error ? error.message : 'Unknown storage error';
    return { success: false, error: `Failed to save network: ${message}` };
  }
}

// ============================================================================
// Load
// ============================================================================

/**
 * Load a network from localStorage.
 * Returns an empty network if no data exists.
 * Returns an error if data is corrupted.
 */
export function loadNetwork(): StorageResult<Network> {
  try {
    const json = localStorage.getItem(STORAGE_KEY);

    // No existing data - return empty network
    if (json === null) {
      return { success: true, data: createEmptyNetwork() };
    }

    // Parse JSON
    const parsed: unknown = JSON.parse(json);

    // Validate structure
    const validation = validateNetworkStructure(parsed);
    if (!validation.valid) {
      return { success: false, error: `Invalid network data: ${validation.error}` };
    }

    return { success: true, data: parsed as Network };
  } catch (error) {
    // JSON parse error or other issues
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to load network: ${message}` };
  }
}

// ============================================================================
// Clear
// ============================================================================

/**
 * Clear all network data from localStorage.
 */
export function clearNetwork(): StorageResult<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to clear network: ${message}` };
  }
}

// ============================================================================
// Validation
// ============================================================================

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that parsed JSON has the required Network structure.
 * Does not validate individual entity attributes (that's for CRUD layer).
 */
export function validateNetworkStructure(data: unknown): ValidationResult {
  if (data === null || typeof data !== 'object') {
    return { valid: false, error: 'Data must be an object' };
  }

  const obj = data as Record<string, unknown>;

  // Check required arrays exist
  if (!Array.isArray(obj.behaviours)) {
    return { valid: false, error: 'Missing or invalid "behaviours" array' };
  }
  if (!Array.isArray(obj.outcomes)) {
    return { valid: false, error: 'Missing or invalid "outcomes" array' };
  }
  if (!Array.isArray(obj.values)) {
    return { valid: false, error: 'Missing or invalid "values" array' };
  }
  if (!Array.isArray(obj.links)) {
    return { valid: false, error: 'Missing or invalid "links" array' };
  }

  // Check version exists (string)
  if (typeof obj.version !== 'string') {
    return { valid: false, error: 'Missing or invalid "version" string' };
  }

  return { valid: true };
}

// ============================================================================
// Export for testing
// ============================================================================

export const STORAGE_KEY_FOR_TESTING = STORAGE_KEY;
