/**
 * Example Network Data for Tutorial Mode
 *
 * Pre-populated "Healthy Living" network to help new users understand
 * how M-E Net works and how to build their own networks.
 *
 * See issue #21 for requirements.
 */

import type { Behaviour, Outcome, Value, BehaviourOutcomeLink, OutcomeValueLink, Network } from '@/types';
import { generateId, now } from '@/utils/id';

// ============================================================================
// Example Node Data
// ============================================================================

function createExampleBehaviours(): Behaviour[] {
  const timestamp = now();
  return [
    {
      id: generateId('b'),
      type: 'behaviour',
      label: 'Exercise regularly',
      notes: 'Any form of physical activity: gym, running, cycling, etc.',
      frequency: 'weekly',
      cost: 'medium',
      contextTags: ['morning', 'health'],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId('b'),
      type: 'behaviour',
      label: 'Meal prep on Sundays',
      notes: 'Prepare healthy meals for the week ahead',
      frequency: 'weekly',
      cost: 'low',
      contextTags: ['weekend', 'health'],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId('b'),
      type: 'behaviour',
      label: 'Meditate daily',
      notes: '10-15 minutes of mindfulness meditation',
      frequency: 'daily',
      cost: 'trivial',
      contextTags: ['morning', 'mental-health'],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId('b'),
      type: 'behaviour',
      label: 'Stay up late gaming',
      notes: 'Playing video games past midnight',
      frequency: 'weekly',
      cost: 'low',
      contextTags: ['evening', 'entertainment'],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createExampleOutcomes(): Outcome[] {
  const timestamp = now();
  return [
    {
      id: generateId('o'),
      type: 'outcome',
      label: 'Better physical fitness',
      notes: 'Improved strength, endurance, and overall physical health',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId('o'),
      type: 'outcome',
      label: 'More energy',
      notes: 'Feeling more energetic and alert throughout the day',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId('o'),
      type: 'outcome',
      label: 'Reduced stress',
      notes: 'Lower anxiety levels and better emotional regulation',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId('o'),
      type: 'outcome',
      label: 'Less sleep',
      notes: 'Reduced quantity or quality of sleep',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

function createExampleValues(): Value[] {
  const timestamp = now();
  return [
    {
      id: generateId('v'),
      type: 'value',
      label: 'Health',
      notes: 'Physical and mental wellbeing, longevity',
      importance: 'critical',
      neglect: 'somewhat-neglected',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId('v'),
      type: 'value',
      label: 'Happiness',
      notes: 'Emotional wellbeing, joy, life satisfaction',
      importance: 'high',
      neglect: 'adequately-met',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: generateId('v'),
      type: 'value',
      label: 'Productivity',
      notes: 'Getting things done, achieving goals, making progress',
      importance: 'high',
      neglect: 'somewhat-neglected',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

// ============================================================================
// Link Factory
// ============================================================================

function createBehaviourOutcomeLink(
  sourceId: string,
  targetId: string,
  valence: 'positive' | 'negative',
  reliability: 'always' | 'usually' | 'sometimes' | 'rarely'
): BehaviourOutcomeLink {
  const timestamp = now();
  return {
    id: generateId('l'),
    type: 'behaviour-outcome',
    sourceId,
    targetId,
    valence,
    reliability,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createOutcomeValueLink(
  sourceId: string,
  targetId: string,
  valence: 'positive' | 'negative',
  strength: 'strong' | 'moderate' | 'weak'
): OutcomeValueLink {
  const timestamp = now();
  return {
    id: generateId('l'),
    type: 'outcome-value',
    sourceId,
    targetId,
    valence,
    strength,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

// ============================================================================
// Example Network Factory
// ============================================================================

/**
 * Create a complete example network for tutorial purposes.
 *
 * Theme: "Healthy Living"
 *
 * Demonstrates:
 * - All three node types (Behaviour, Outcome, Value)
 * - Both positive and negative valence links
 * - Varying reliability and strength levels
 * - Trade-offs (behaviors that help one value but hurt another)
 */
export function createExampleNetwork(): Network {
  const behaviours = createExampleBehaviours();
  const outcomes = createExampleOutcomes();
  const values = createExampleValues();

  // Extract nodes for linking (arrays are always length 4, 4, 3)
  const exercise = behaviours[0]!;
  const mealPrep = behaviours[1]!;
  const meditate = behaviours[2]!;
  const gaming = behaviours[3]!;

  const fitness = outcomes[0]!;
  const energy = outcomes[1]!;
  const stress = outcomes[2]!;
  const lessSleep = outcomes[3]!;

  const health = values[0]!;
  const happiness = values[1]!;
  const productivity = values[2]!;

  // Create Behaviour → Outcome links
  const behaviourOutcomeLinks: BehaviourOutcomeLink[] = [
    // Exercise → Better physical fitness (+, usually)
    createBehaviourOutcomeLink(exercise.id, fitness.id, 'positive', 'usually'),
    // Exercise → More energy (+, usually)
    createBehaviourOutcomeLink(exercise.id, energy.id, 'positive', 'usually'),
    // Meal prep → Better physical fitness (+, sometimes)
    createBehaviourOutcomeLink(mealPrep.id, fitness.id, 'positive', 'sometimes'),
    // Meditate → Reduced stress (+, usually)
    createBehaviourOutcomeLink(meditate.id, stress.id, 'positive', 'usually'),
    // Stay up late gaming → Less sleep (+, always) - note: positive valence means "causes"
    createBehaviourOutcomeLink(gaming.id, lessSleep.id, 'positive', 'always'),
  ];

  // Create Outcome → Value links
  const outcomeValueLinks: OutcomeValueLink[] = [
    // Better physical fitness → Health (+, strong)
    createOutcomeValueLink(fitness.id, health.id, 'positive', 'strong'),
    // More energy → Productivity (+, strong)
    createOutcomeValueLink(energy.id, productivity.id, 'positive', 'strong'),
    // More energy → Happiness (+, moderate)
    createOutcomeValueLink(energy.id, happiness.id, 'positive', 'moderate'),
    // Reduced stress → Happiness (+, strong)
    createOutcomeValueLink(stress.id, happiness.id, 'positive', 'strong'),
    // Reduced stress → Health (+, moderate)
    createOutcomeValueLink(stress.id, health.id, 'positive', 'moderate'),
    // Less sleep → Health (-, strong)
    createOutcomeValueLink(lessSleep.id, health.id, 'negative', 'strong'),
    // Less sleep → Productivity (-, strong)
    createOutcomeValueLink(lessSleep.id, productivity.id, 'negative', 'strong'),
  ];

  return {
    version: '1.0.0',
    behaviours,
    outcomes,
    values,
    links: [...behaviourOutcomeLinks, ...outcomeValueLinks],
  };
}

/**
 * Check if a network appears to be the example network.
 * Used to provide context-appropriate UI messaging.
 *
 * Note: This is a heuristic check based on labels, not a definitive test.
 */
export function isExampleNetwork(network: Network): boolean {
  const exampleBehaviourLabels = [
    'Exercise regularly',
    'Meal prep on Sundays',
    'Meditate daily',
    'Stay up late gaming',
  ];

  const behaviourLabels = network.behaviours.map((b) => b.label);
  const matchCount = exampleBehaviourLabels.filter((label) =>
    behaviourLabels.some((bl) => bl.toLowerCase() === label.toLowerCase())
  ).length;

  // Consider it the example network if at least 3 of 4 example behaviours match
  return matchCount >= 3;
}
