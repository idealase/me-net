import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/test/**',
        'src/main.ts', // Entry point, tested via E2E
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/**',
        // D3/DOM rendering components - tested via integration/E2E
        'src/components/graph/NetworkGraph.ts',
        'src/components/graph/nodes.ts',
        'src/components/graph/edges.ts',
        'src/components/graph/legend.ts',
        'src/components/graph/index.ts',
        // UI form components - render HTML and bind events, tested via integration/E2E
        'src/components/forms/BehaviourForm.ts',
        'src/components/forms/OutcomeForm.ts',
        'src/components/forms/ValueForm.ts',
        'src/components/forms/LinkForm.ts',
        'src/components/forms/NodeDetailPanel.ts',
        'src/components/forms/index.ts',
        // Onboarding/empty state overlays - rely on integration verification
        'src/components/empty/**',
        'src/components/welcome/**',
        // Why Ladder UI component - tested via integration/E2E
        'src/components/ladder/WhyLadder.ts',
        'src/components/ladder/index.ts',
        // Validation UI component - tested via integration/E2E
        'src/components/validation/ValidationPanel.ts',
        'src/components/validation/index.ts',
        // Insights UI component - tested via integration/E2E
        'src/components/insights/InsightsPanel.ts',
        'src/components/insights/index.ts',
        // Filter UI component - tested via integration/E2E
        'src/components/filters/FilterPanel.ts',
        'src/components/filters/index.ts',
        // Metrics index (just re-exports) - tested via unit tests on actual modules
        'src/metrics/index.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/data': resolve(__dirname, './src/data'),
      '@/components': resolve(__dirname, './src/components'),
    },
  },
});
