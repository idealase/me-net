/**
 * Export & Import Module for M-E Net
 *
 * Handles network data export to JSON files, summary report generation,
 * and import with validation. See spec.md requirements E-1 through E-3.
 */

import type { Network, Node } from '@/types';

import { createNetwork } from './network';
import { validateNetworkStructure } from './storage';

// ============================================================================
// Constants
// ============================================================================

const APP_VERSION = '1.0.0';

// ============================================================================
// Types
// ============================================================================

export interface ExportedNetwork extends Network {
  exportedAt: string;
  version: string;
}

export interface ImportResult {
  success: boolean;
  network?: Network;
  error?: string;
}

export interface SummaryReportData {
  generatedAt: string;
  version: string;
  stats: {
    behaviours: number;
    outcomes: number;
    values: number;
    links: number;
  };
  topLeverageBehaviours: Array<{
    label: string;
    score: number;
    supportedValues: string[];
    viaOutcomes: string[];
  }>;
  orphanValues: Array<{
    label: string;
  }>;
  conflictBehaviours: Array<{
    label: string;
    conflictIndex: number;
    positiveValues: string[];
    negativeValues: string[];
  }>;
  suggestions: string[];
}

// ============================================================================
// Export Network JSON
// ============================================================================

/**
 * Prepare network data for export with timestamp and version.
 */
export function prepareNetworkForExport(network: Network): ExportedNetwork {
  return {
    ...network,
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Serialize network to JSON string for export.
 */
export function serializeNetwork(network: Network): string {
  const exportData = prepareNetworkForExport(network);
  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate a filename for the exported network.
 */
export function generateExportFilename(prefix: string = 'me-net'): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '-'); // HH-MM-SS
  return `${prefix}-${dateStr}-${timeStr}.json`;
}

/**
 * Trigger browser download of network JSON file.
 */
export function downloadNetworkAsJson(network: Network): void {
  const json = serializeNetwork(network);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = generateExportFilename();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Import Network JSON
// ============================================================================

/**
 * Parse and validate imported JSON string.
 */
export function parseNetworkJson(jsonString: string): ImportResult {
  try {
    const parsed: unknown = JSON.parse(jsonString);

    // Validate structure
    const validation = validateNetworkStructure(parsed);
    if (!validation.valid) {
      return { success: false, error: `Invalid network structure: ${validation.error}` };
    }

    // Additional validation for entity structure
    const obj = parsed as Record<string, unknown>;
    const entityValidation = validateEntityStructures(obj);
    if (!entityValidation.valid) {
      return { success: false, error: entityValidation.error };
    }

    // Create network from parsed data
    const network = createNetwork({
      version: obj.version as string,
      exportedAt: obj.exportedAt as string | undefined,
      behaviours: obj.behaviours as Network['behaviours'],
      outcomes: obj.outcomes as Network['outcomes'],
      values: obj.values as Network['values'],
      links: obj.links as Network['links'],
    });

    return { success: true, network };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return { success: false, error: `Failed to parse JSON: ${message}` };
  }
}

/**
 * Validate that entity arrays contain properly structured items.
 */
function validateEntityStructures(data: Record<string, unknown>): { valid: boolean; error?: string } {
  // Validate behaviours
  const behaviours = data.behaviours as unknown[];
  for (let i = 0; i < behaviours.length; i++) {
    const b = behaviours[i] as Record<string, unknown>;
    const bId = b.id;
    const bLabel = b.label;
    if (typeof bId !== 'string' || bId === '') {
      return { valid: false, error: `Behaviour at index ${i} missing valid id` };
    }
    if (typeof bLabel !== 'string' || bLabel === '') {
      return { valid: false, error: `Behaviour "${bId}" missing valid label` };
    }
    if (b.type !== 'behaviour') {
      return { valid: false, error: `Behaviour "${bId}" has invalid type` };
    }
  }

  // Validate outcomes
  const outcomes = data.outcomes as unknown[];
  for (let i = 0; i < outcomes.length; i++) {
    const o = outcomes[i] as Record<string, unknown>;
    const oId = o.id;
    const oLabel = o.label;
    if (typeof oId !== 'string' || oId === '') {
      return { valid: false, error: `Outcome at index ${i} missing valid id` };
    }
    if (typeof oLabel !== 'string' || oLabel === '') {
      return { valid: false, error: `Outcome "${oId}" missing valid label` };
    }
    if (o.type !== 'outcome') {
      return { valid: false, error: `Outcome "${oId}" has invalid type` };
    }
  }

  // Validate values
  const values = data.values as unknown[];
  for (let i = 0; i < values.length; i++) {
    const v = values[i] as Record<string, unknown>;
    const vId = v.id;
    const vLabel = v.label;
    if (typeof vId !== 'string' || vId === '') {
      return { valid: false, error: `Value at index ${i} missing valid id` };
    }
    if (typeof vLabel !== 'string' || vLabel === '') {
      return { valid: false, error: `Value "${vId}" missing valid label` };
    }
    if (v.type !== 'value') {
      return { valid: false, error: `Value "${vId}" has invalid type` };
    }
  }

  // Validate links
  const links = data.links as unknown[];
  for (let i = 0; i < links.length; i++) {
    const l = links[i] as Record<string, unknown>;
    const lId = l.id;
    const lSourceId = l.sourceId;
    const lTargetId = l.targetId;
    if (typeof lId !== 'string' || lId === '') {
      return { valid: false, error: `Link at index ${i} missing valid id` };
    }
    if (typeof lSourceId !== 'string' || lSourceId === '') {
      return { valid: false, error: `Link "${lId}" missing valid sourceId` };
    }
    if (typeof lTargetId !== 'string' || lTargetId === '') {
      return { valid: false, error: `Link "${lId}" missing valid targetId` };
    }
    if (l.type !== 'behaviour-outcome' && l.type !== 'outcome-value') {
      return { valid: false, error: `Link "${lId}" has invalid type` };
    }
    if (l.valence !== 'positive' && l.valence !== 'negative') {
      return { valid: false, error: `Link "${lId}" has invalid valence` };
    }
  }

  // Validate referential integrity
  const nodeIds = new Set<string>();
  for (const b of behaviours) {
    nodeIds.add((b as Record<string, unknown>).id as string);
  }
  for (const o of outcomes) {
    nodeIds.add((o as Record<string, unknown>).id as string);
  }
  for (const v of values) {
    nodeIds.add((v as Record<string, unknown>).id as string);
  }

  for (const l of links) {
    const link = l as Record<string, unknown>;
    const linkId = link.id as string;
    const linkSourceId = link.sourceId as string;
    const linkTargetId = link.targetId as string;
    if (!nodeIds.has(linkSourceId)) {
      return { valid: false, error: `Link "${linkId}" references non-existent source "${linkSourceId}"` };
    }
    if (!nodeIds.has(linkTargetId)) {
      return { valid: false, error: `Link "${linkId}" references non-existent target "${linkTargetId}"` };
    }
  }

  return { valid: true };
}

/**
 * Read file and parse as network JSON.
 */
export function importNetworkFromFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event): void => {
      const content = event.target?.result;
      if (typeof content !== 'string') {
        resolve({ success: false, error: 'Failed to read file content' });
        return;
      }
      resolve(parseNetworkJson(content));
    };

    reader.onerror = (): void => {
      resolve({ success: false, error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
}

// ============================================================================
// Summary Report Generation
// ============================================================================

/**
 * Generate summary report data from network and analysis.
 */
export function generateSummaryReportData(
  network: Network,
  topLeverage: Array<{
    behaviour: { label: string };
    metrics: { leverageScore: number };
    supportedValues: Array<{ label: string }>;
    viaOutcomes: string[];
  }>,
  orphanValues: Array<{ value: { label: string } }>,
  conflictBehaviours: Array<{
    behaviour: { label: string };
    metrics: { conflictIndex: number };
    positiveValues: Array<{ label: string }>;
    negativeValues: Array<{ label: string }>;
  }>
): SummaryReportData {
  const suggestions: string[] = [];

  // Generate suggestions based on analysis
  if (orphanValues.length > 0) {
    suggestions.push(
      `You have ${orphanValues.length} orphan value${orphanValues.length > 1 ? 's' : ''} with no supporting behaviours. Consider using Why Ladder to connect behaviours to these values.`
    );
  }

  if (conflictBehaviours.length > 0) {
    suggestions.push(
      `You have ${conflictBehaviours.length} behaviour${conflictBehaviours.length > 1 ? 's' : ''} with conflicting effects. Review these trade-offs and consider if alternatives exist.`
    );
  }

  const unexplainedBehaviours = network.behaviours.filter(
    (b) => !network.links.some((l) => l.sourceId === b.id)
  );
  if (unexplainedBehaviours.length > 0) {
    suggestions.push(
      `You have ${unexplainedBehaviours.length} behaviour${unexplainedBehaviours.length > 1 ? 's' : ''} without outcomes. Use Why Ladder to explore why you do these.`
    );
  }

  const floatingOutcomes = network.outcomes.filter(
    (o) => !network.links.some((l) => l.type === 'outcome-value' && l.sourceId === o.id)
  );
  if (floatingOutcomes.length > 0) {
    suggestions.push(
      `You have ${floatingOutcomes.length} outcome${floatingOutcomes.length > 1 ? 's' : ''} not connected to any value. Ask "Why does this matter?" to connect them.`
    );
  }

  const topBehaviour = topLeverage[0];
  if (topBehaviour !== undefined && topBehaviour.metrics.leverageScore > 0) {
    suggestions.push(
      `Your highest-leverage behaviour is "${topBehaviour.behaviour.label}". Consider prioritising this action.`
    );
  }

  if (suggestions.length === 0) {
    suggestions.push('Your network looks complete! Continue refining link attributes for more accurate insights.');
  }

  return {
    generatedAt: new Date().toISOString(),
    version: APP_VERSION,
    stats: {
      behaviours: network.behaviours.length,
      outcomes: network.outcomes.length,
      values: network.values.length,
      links: network.links.length,
    },
    topLeverageBehaviours: topLeverage.map((item) => ({
      label: item.behaviour.label,
      score: Math.round(item.metrics.leverageScore * 100) / 100,
      supportedValues: item.supportedValues.map((v) => v.label),
      viaOutcomes: item.viaOutcomes,
    })),
    orphanValues: orphanValues.map((item) => ({ label: item.value.label })),
    conflictBehaviours: conflictBehaviours.map((item) => ({
      label: item.behaviour.label,
      conflictIndex: Math.round(item.metrics.conflictIndex * 100) / 100,
      positiveValues: item.positiveValues.map((v) => v.label),
      negativeValues: item.negativeValues.map((v) => v.label),
    })),
    suggestions,
  };
}

/**
 * Format summary report as Markdown.
 */
export function formatSummaryReportAsMarkdown(data: SummaryReportData): string {
  const lines: string[] = [];

  lines.push('# M-E Net Summary Report');
  lines.push('');
  lines.push(`> Generated: ${new Date(data.generatedAt).toLocaleString()}`);
  lines.push(`> Version: ${data.version}`);
  lines.push('');

  // Network Statistics
  lines.push('## Network Statistics');
  lines.push('');
  lines.push(`- **Behaviours:** ${data.stats.behaviours}`);
  lines.push(`- **Outcomes:** ${data.stats.outcomes}`);
  lines.push(`- **Values:** ${data.stats.values}`);
  lines.push(`- **Links:** ${data.stats.links}`);
  lines.push('');

  // Top Leverage Behaviours
  lines.push('## Top Leverage Behaviours');
  lines.push('');
  if (data.topLeverageBehaviours.length === 0) {
    lines.push('_No behaviours with positive leverage found._');
  } else {
    for (const item of data.topLeverageBehaviours) {
      lines.push(`### ${item.label}`);
      lines.push('');
      lines.push(`- **Leverage Score:** ${item.score}`);
      lines.push(`- **Supports Values:** ${item.supportedValues.join(', ') || 'None'}`);
      lines.push(`- **Via Outcomes:** ${item.viaOutcomes.join(', ') || 'None'}`);
      lines.push('');
    }
  }

  // Orphan Values
  lines.push('## Orphan Values');
  lines.push('');
  if (data.orphanValues.length === 0) {
    lines.push('_All values are connected to behaviours. Great job!_');
  } else {
    lines.push('These values have no supporting behaviours:');
    lines.push('');
    for (const item of data.orphanValues) {
      lines.push(`- ${item.label}`);
    }
  }
  lines.push('');

  // Conflict Behaviours
  lines.push('## Conflict Behaviours');
  lines.push('');
  if (data.conflictBehaviours.length === 0) {
    lines.push('_No conflicting behaviours detected._');
  } else {
    for (const item of data.conflictBehaviours) {
      lines.push(`### ${item.label}`);
      lines.push('');
      lines.push(`- **Conflict Index:** ${item.conflictIndex}`);
      lines.push(`- **Helps:** ${item.positiveValues.join(', ')}`);
      lines.push(`- **Hurts:** ${item.negativeValues.join(', ')}`);
      lines.push('');
    }
  }

  // Suggestions
  lines.push('## Suggested Next Steps');
  lines.push('');
  for (const suggestion of data.suggestions) {
    lines.push(`- ${suggestion}`);
  }
  lines.push('');

  lines.push('---');
  lines.push('_Generated by M-E Net_');

  return lines.join('\n');
}

/**
 * Generate a filename for the summary report.
 */
export function generateReportFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  return `me-net-report-${dateStr}.md`;
}

/**
 * Trigger browser download of summary report.
 */
export function downloadSummaryReport(
  network: Network,
  topLeverage: Array<{
    behaviour: { label: string };
    metrics: { leverageScore: number };
    supportedValues: Array<{ label: string }>;
    viaOutcomes: string[];
  }>,
  orphanValues: Array<{ value: { label: string } }>,
  conflictBehaviours: Array<{
    behaviour: { label: string };
    metrics: { conflictIndex: number };
    positiveValues: Array<{ label: string }>;
    negativeValues: Array<{ label: string }>;
  }>
): void {
  const data = generateSummaryReportData(network, topLeverage, orphanValues, conflictBehaviours);
  const markdown = formatSummaryReportAsMarkdown(data);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = generateReportFilename();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Comparison Utilities (for round-trip testing)
// ============================================================================

/**
 * Compare two networks for equality (ignoring exportedAt).
 */
export function networksAreEqual(a: Network, b: Network): boolean {
  // Compare counts
  if (a.behaviours.length !== b.behaviours.length) return false;
  if (a.outcomes.length !== b.outcomes.length) return false;
  if (a.values.length !== b.values.length) return false;
  if (a.links.length !== b.links.length) return false;

  // Compare behaviours by id
  const aBehavioursById = new Map(a.behaviours.map((x) => [x.id, x]));
  for (const bBehaviour of b.behaviours) {
    const aBehaviour = aBehavioursById.get(bBehaviour.id);
    if (!aBehaviour) return false;
    if (!nodesAreEqual(aBehaviour, bBehaviour)) return false;
  }

  // Compare outcomes by id
  const aOutcomesById = new Map(a.outcomes.map((x) => [x.id, x]));
  for (const bOutcome of b.outcomes) {
    const aOutcome = aOutcomesById.get(bOutcome.id);
    if (!aOutcome) return false;
    if (!nodesAreEqual(aOutcome, bOutcome)) return false;
  }

  // Compare values by id
  const aValuesById = new Map(a.values.map((x) => [x.id, x]));
  for (const bValue of b.values) {
    const aValue = aValuesById.get(bValue.id);
    if (!aValue) return false;
    if (!nodesAreEqual(aValue, bValue)) return false;
  }

  // Compare links by id
  const aLinksById = new Map(a.links.map((x) => [x.id, x]));
  for (const bLink of b.links) {
    const aLink = aLinksById.get(bLink.id);
    if (!aLink) return false;
    if (JSON.stringify(aLink) !== JSON.stringify(bLink)) return false;
  }

  return true;
}

/**
 * Compare two nodes for equality.
 */
function nodesAreEqual(a: Node, b: Node): boolean {
  // Deep equality check (stringify handles nested objects like contextTags)
  return JSON.stringify(a) === JSON.stringify(b);
}
