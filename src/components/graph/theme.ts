/**
 * Default Graph Theme
 *
 * Visual encoding defaults per visual-design.md specification.
 */

import type {
  ForceLayoutConfig,
  GraphOptions,
  GraphTheme,
  LayeredLayoutConfig,
} from './types';

/**
 * Default theme following visual-design.md colour families.
 * - Behaviours: Blue family, rectangle
 * - Outcomes: Orange/Yellow family, diamond
 * - Values: Green family, circle
 */
export const defaultTheme: GraphTheme = {
  nodes: {
    behaviour: {
      shape: 'rect',
      fill: '#3b82f6', // Blue-500
      stroke: '#1d4ed8', // Blue-700
      width: 140,
      height: 50,
    },
    outcome: {
      shape: 'diamond',
      fill: '#f59e0b', // Amber-500
      stroke: '#d97706', // Amber-600
      width: 120,
      height: 60,
    },
    value: {
      shape: 'circle',
      fill: '#10b981', // Emerald-500
      stroke: '#059669', // Emerald-600
      width: 100,
      height: 100,
    },
  },
  edges: {
    positive: {
      stroke: '#6b7280', // Gray-500
      strokeDasharray: '', // Solid
      markerEnd: 'url(#arrow-positive)',
    },
    negative: {
      stroke: '#ef4444', // Red-500
      strokeDasharray: '8,4', // Dashed
      markerEnd: 'url(#arrow-negative)',
    },
  },
  background: '#f9fafb', // Gray-50
  text: {
    fill: '#ffffff',
    fontSize: 12,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
};

/**
 * Default layered layout configuration.
 */
export const defaultLayeredLayout: LayeredLayoutConfig = {
  type: 'layered',
  columnGap: 250,
  rowGap: 80,
  padding: 60,
};

/**
 * Default force-directed layout configuration.
 */
export const defaultForceLayout: ForceLayoutConfig = {
  type: 'force',
  linkDistance: 240,
  chargeStrength: -420,
  collisionRadius: 24,
};

/**
 * Default graph options.
 */
export const defaultGraphOptions: GraphOptions = {
  width: 1200,
  height: 800,
  layout: defaultForceLayout,
  theme: defaultTheme,
  zoomExtent: [0.25, 4],
  transitionDuration: 300,
};

/**
 * Edge stroke widths based on strength/reliability.
 * Maps normalized 0-1 strength to pixel width.
 */
export const edgeWidthScale = {
  min: 1,
  max: 4,
};

/**
 * Edge opacity based on strength/reliability.
 * Maps normalized 0-1 strength to opacity.
 */
export const edgeOpacityScale = {
  min: 0.3,
  max: 1.0,
};
