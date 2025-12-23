/**
 * Tests for Theme and Configuration
 */

import { defaultTheme, defaultLayeredLayout, defaultGraphOptions, edgeWidthScale, edgeOpacityScale } from './theme';

describe('defaultTheme', () => {
  describe('node configuration', () => {
    it('defines behaviour node style', () => {
      expect(defaultTheme.nodes.behaviour).toBeDefined();
      expect(defaultTheme.nodes.behaviour.shape).toBe('rect');
      expect(defaultTheme.nodes.behaviour.fill).toBeTruthy();
      expect(defaultTheme.nodes.behaviour.stroke).toBeTruthy();
    });

    it('defines outcome node style', () => {
      expect(defaultTheme.nodes.outcome).toBeDefined();
      expect(defaultTheme.nodes.outcome.shape).toBe('diamond');
      expect(defaultTheme.nodes.outcome.fill).toBeTruthy();
      expect(defaultTheme.nodes.outcome.stroke).toBeTruthy();
    });

    it('defines value node style', () => {
      expect(defaultTheme.nodes.value).toBeDefined();
      expect(defaultTheme.nodes.value.shape).toBe('circle');
      expect(defaultTheme.nodes.value.fill).toBeTruthy();
      expect(defaultTheme.nodes.value.stroke).toBeTruthy();
    });

    it('uses distinct shapes for each node type', () => {
      const shapes = [
        defaultTheme.nodes.behaviour.shape,
        defaultTheme.nodes.outcome.shape,
        defaultTheme.nodes.value.shape,
      ];
      const uniqueShapes = new Set(shapes);
      expect(uniqueShapes.size).toBe(3);
    });

    it('uses distinct colours for each node type', () => {
      const fills = [
        defaultTheme.nodes.behaviour.fill,
        defaultTheme.nodes.outcome.fill,
        defaultTheme.nodes.value.fill,
      ];
      const uniqueFills = new Set(fills);
      expect(uniqueFills.size).toBe(3);
    });
  });

  describe('edge configuration', () => {
    it('defines positive edge style', () => {
      expect(defaultTheme.edges.positive).toBeDefined();
      expect(defaultTheme.edges.positive.stroke).toBeTruthy();
      expect(defaultTheme.edges.positive.strokeDasharray).toBe(''); // Solid
    });

    it('defines negative edge style', () => {
      expect(defaultTheme.edges.negative).toBeDefined();
      expect(defaultTheme.edges.negative.stroke).toBeTruthy();
      expect(defaultTheme.edges.negative.strokeDasharray).toBeTruthy(); // Dashed
    });

    it('uses distinct visual treatment for positive vs negative', () => {
      // Different stroke dash patterns
      expect(defaultTheme.edges.positive.strokeDasharray).not.toBe(
        defaultTheme.edges.negative.strokeDasharray
      );
    });

    it('defines arrow markers', () => {
      expect(defaultTheme.edges.positive.markerEnd).toContain('arrow');
      expect(defaultTheme.edges.negative.markerEnd).toContain('arrow');
    });
  });

  describe('text configuration', () => {
    it('defines text styling', () => {
      expect(defaultTheme.text.fill).toBeTruthy();
      expect(defaultTheme.text.fontSize).toBeGreaterThan(0);
      expect(defaultTheme.text.fontFamily).toBeTruthy();
    });
  });
});

describe('defaultLayeredLayout', () => {
  it('has type layered', () => {
    expect(defaultLayeredLayout.type).toBe('layered');
  });

  it('defines column gap', () => {
    expect(defaultLayeredLayout.columnGap).toBeGreaterThan(0);
  });

  it('defines row gap', () => {
    expect(defaultLayeredLayout.rowGap).toBeGreaterThan(0);
  });

  it('defines padding', () => {
    expect(defaultLayeredLayout.padding).toBeGreaterThan(0);
  });
});

describe('defaultGraphOptions', () => {
  it('defines canvas dimensions', () => {
    expect(defaultGraphOptions.width).toBeGreaterThan(0);
    expect(defaultGraphOptions.height).toBeGreaterThan(0);
  });

  it('defines zoom extent', () => {
    expect(defaultGraphOptions.zoomExtent).toHaveLength(2);
    expect(defaultGraphOptions.zoomExtent[0]).toBeLessThan(1); // Min zoom
    expect(defaultGraphOptions.zoomExtent[1]).toBeGreaterThan(1); // Max zoom
  });

  it('includes default theme', () => {
    expect(defaultGraphOptions.theme).toBe(defaultTheme);
  });

  it('includes default layout', () => {
    expect(defaultGraphOptions.layout).toBe(defaultLayeredLayout);
  });
});

describe('edgeWidthScale', () => {
  it('defines min and max widths', () => {
    expect(edgeWidthScale.min).toBeGreaterThan(0);
    expect(edgeWidthScale.max).toBeGreaterThan(edgeWidthScale.min);
  });
});

describe('edgeOpacityScale', () => {
  it('defines min and max opacity', () => {
    expect(edgeOpacityScale.min).toBeGreaterThanOrEqual(0);
    expect(edgeOpacityScale.min).toBeLessThanOrEqual(1);
    expect(edgeOpacityScale.max).toBeGreaterThan(edgeOpacityScale.min);
    expect(edgeOpacityScale.max).toBeLessThanOrEqual(1);
  });
});
