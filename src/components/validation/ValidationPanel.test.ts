import { createEmptyNetwork } from '@/data/network';
import { addValue } from '@/data/values';
import type { Network } from '@/types';

import { ValidationPanel } from './ValidationPanel';

function networkWithOrphanValue(label: string): Network {
  const result = addValue(createEmptyNetwork(), {
    label,
    importance: 'high',
    neglect: 'adequately-met',
  });
  if (!result.success || result.data === undefined) {
    throw new Error(result.error);
  }
  return result.data.network;
}

const noopCallbacks = {
  onSnooze: (): void => {},
  onDismiss: (): void => {},
  onUndismiss: (): void => {},
  onNavigateToNode: (): void => {},
};

describe('ValidationPanel', () => {
  it('renders hostile labels in warning messages as text, not HTML', () => {
    const hostile = '<img src=x onerror="window.__pwned = true">';
    const container = document.createElement('div');
    new ValidationPanel(container, {
      network: networkWithOrphanValue(hostile),
      callbacks: noopCallbacks,
    });

    // Expand every warning group so the messages are rendered
    container.querySelectorAll<HTMLElement>('.group-header').forEach((header) => header.click());

    const messages = Array.from(container.querySelectorAll('.warning-message'));
    expect(messages.length).toBeGreaterThan(0);
    expect(container.querySelector('img')).toBeNull();
    expect(messages.some((m) => m.textContent?.includes(hostile) === true)).toBe(true);
  });
});
