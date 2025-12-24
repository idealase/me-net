/**
 * Persistence Layer for M-E Net
 *
 * Handles saving and loading network data to/from localStorage.
 * See docs/data-model.md for the Network structure.
 */

import type { Network } from '@/types';

import { createExampleNetwork, isExampleNetwork } from './example-network';
import { createEmptyNetwork, isNetworkEmpty } from './network';

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

// ============================================================================
// Example Network
// ============================================================================

export interface LoadExampleOptions {
  /** If true, will overwrite existing data without warning. Defaults to false. */
  force?: boolean;
}

export interface LoadExampleResult {
  success: boolean;
  /** Set if user has existing data and force was not true */
  hasExistingData?: boolean;
  error?: string;
}

/**
 * Load the example "Healthy Living" network for tutorial purposes.
 *
 * By default, will not overwrite existing user data. Set force: true to override.
 * Returns hasExistingData: true if there is existing data that would be overwritten.
 */
export function loadExampleNetwork(options: LoadExampleOptions = {}): LoadExampleResult {
  const { force = false } = options;

  // Check for existing data
  const existingResult = loadNetwork();
  if (!existingResult.success) {
    return { success: false, error: existingResult.error };
  }

  const existingNetwork = existingResult.data!;

  // If there's existing user data and force is not set, warn the user
  if (!isNetworkEmpty(existingNetwork) && !force) {
    return { success: false, hasExistingData: true };
  }

  // Create and save the example network
  const exampleNetwork = createExampleNetwork();
  const saveResult = saveNetwork(exampleNetwork);

  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  return { success: true };
}

/**
 * Check if the currently loaded network is the example network.
 */
export function isCurrentNetworkExample(): boolean {
  const result = loadNetwork();
  if (!result.success || !result.data) {
    return false;
  }
  return isExampleNetwork(result.data);
}

