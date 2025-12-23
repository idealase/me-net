# Visual Design — M-E Net

> **Version:** MVP  
> **Last updated:** 2025-12-23

This document specifies the **visual semantics** and **interaction rules** for M-E Net's network visualisation. It defines *what* must be communicated visually, not *how* it must be styled (colours/fonts are illustrative, not mandated).

**Implementation Decision (MVP):** Visualisation is implemented using **D3.js** for its flexibility, extensive documentation, and support for custom force-directed and layered layouts.

---

## 1. Design Principles

| Principle | Rationale |
|-----------|-----------|
| **Layered legibility** | Behaviours, Outcomes, and Values must be instantly distinguishable at a glance. |
| **Edge clarity** | Positive vs. negative links must never be confused; strength should be perceivable without interaction. |
| **Progressive disclosure** | The default view shows structure; detail (attributes, metrics) is revealed on interaction. |
| **Minimal overload** | Avoid encoding too many attributes simultaneously; use filters/modes to switch focus. |

---

## 2. Node Encoding

### 2.1 Node Types

Each entity type must have a **distinct visual identity**. Recommended approach: combine **shape** and **colour family**.

| Node Type | Shape (Example) | Colour Family (Example) | Icon (Optional) |
|-----------|-----------------|-------------------------|-----------------|
| **Behaviour** | Rectangle / Rounded rectangle | Blue family | Action icon (e.g., ↻) |
| **Outcome** | Diamond / Hexagon | Orange/Yellow family | Effect icon (e.g., ⚡) |
| **Value** | Circle / Ellipse | Green family | Star or heart icon |

**Requirement:** The shape OR colour must be sufficient alone to distinguish types (for colour-blind accessibility).

### 2.2 Node Size

Default size is uniform. Do **not** encode data in node size for MVP (causes layout instability). Post-MVP may explore size encoding for importance or frequency.

### 2.3 Node Label

- Always visible (not hidden until hover).
- Max displayed characters: ~20; truncate with ellipsis if longer.
- Full label shown on hover/click.

### 2.4 Node State Indicators

| State | Visual Treatment |
|-------|------------------|
| **Selected** | Bold border or glow effect. |
| **Highlighted (search match / leverage)** | Pulsing border or elevated z-index with shadow. |
| **Dimmed (filtered out)** | Reduced opacity (e.g., 30%) or greyscale. |
| **Warning (orphan/unexplained)** | Small warning badge (e.g., ⚠️) on node corner. |

---

## 3. Edge Encoding

### 3.1 Edge Valence

| Valence | Visual Treatment (Example) |
|---------|---------------------------|
| **Positive** | Solid line, neutral or green-tinted colour. |
| **Negative** | Dashed line, red or orange colour, and/or distinct arrowhead (e.g., bar instead of triangle). |

**Requirement:** Positive and negative edges must be distinguishable in both colour and line style (for accessibility).

### 3.2 Edge Strength / Reliability

| Strength/Reliability | Visual Treatment (Example) |
|----------------------|---------------------------|
| **Strong / Always** | Thick line (e.g., 3-4px), full opacity. |
| **Moderate / Usually** | Medium line (e.g., 2px), ~70% opacity. |
| **Weak / Sometimes** | Thin line (e.g., 1px), ~40% opacity. |
| **Rare** | Very thin / dotted, ~30% opacity. |

**Requirement:** At least two levels (strong vs. weak) must be perceptually distinct without interaction.

### 3.3 Edge Direction

- Edges are directed (Behaviour → Outcome → Value).
- Direction shown via **arrowhead** at target end.
- Arrows should be clearly visible but not dominate the edge.

### 3.4 Edge Labels (Optional)

- MVP: No edge labels by default (reduces clutter).
- On hover: Tooltip shows valence, reliability/strength.
- Post-MVP: Option to display labels on edges.

---

## 4. Layout

### 4.1 Layered Layout (Default)

Nodes arranged in three columns/layers:

```
[Behaviours]  ───▶  [Outcomes]  ───▶  [Values]
   (left)           (centre)          (right)
```

**Rationale:** Reinforces the means→ends flow; makes structure legible even for large networks.

### 4.2 Force-Directed Layout (Alternative)

User can toggle to force-directed layout for exploration:
- Nodes cluster by connectivity.
- May reveal unexpected groupings.
- Loses explicit layer structure.

### 4.3 Layout Controls

- **Zoom:** Mouse scroll or pinch.
- **Pan:** Click-drag on background.
- **Fit to view:** Button to auto-zoom to show all nodes.
- **Reset layout:** Button to return to default layered view.

---

## 5. Interaction Rules

### 5.1 Node Click

| Action | Result |
|--------|--------|
| Click node | Select node; open **detail panel** (see §6). |
| Click background | Deselect all nodes; close detail panel. |

### 5.2 Node Hover

| Action | Result |
|--------|--------|
| Hover node | Show tooltip with label + type + summary (e.g., "Behaviour • daily • low cost"). |
| Hover duration > 500ms | Highlight connected nodes and edges. |

### 5.3 Edge Hover

| Action | Result |
|--------|--------|
| Hover edge | Tooltip shows: source → target, valence, reliability/strength. |

### 5.4 Filter Controls

Located in a sidebar or toolbar. Each filter is a toggle or multi-select.

| Filter | Options |
|--------|---------|
| **Node type** | Show/hide: Behaviours, Outcomes, Values. |
| **Edge valence** | Show/hide: Positive, Negative. |
| **Warnings only** | Show only nodes with validation warnings. |
| **Context tags** | Filter Behaviours by tag (multi-select). |

When nodes are hidden, their edges are also hidden. Hidden nodes appear dimmed (not removed) to maintain spatial context.

### 5.5 Search

- **Location:** Prominent search box.
- **Behaviour:** Filters/highlights nodes whose label contains search string (case-insensitive).
- **Result:** Matching nodes highlighted; non-matching nodes dimmed.
- **Clear:** Button or escape key clears search.

### 5.6 Highlight Modes

Toggleable modes that apply a visual overlay:

| Mode | Behaviour |
|------|-----------|
| **High leverage** | Highlight top N leverage behaviours and their downstream paths. |
| **Fragile values** | Highlight values with fragility above threshold. |
| **Conflict behaviours** | Highlight behaviours with conflict index above threshold. |

When a mode is active, unrelated nodes are dimmed. Only one mode active at a time.

---

## 6. Detail Panel

When a node is selected, a **detail panel** appears (sidebar or modal).

### 6.1 Behaviour Detail Panel

| Section | Content |
|---------|---------|
| **Header** | Label, type badge ("Behaviour"). |
| **Attributes** | Frequency, Cost, Context tags. |
| **Metrics** | Leverage score, Coverage, Conflict index. |
| **Connected Outcomes** | List of Outcomes with link attributes (valence, reliability). Clickable. |
| **Downstream Values** | List of Values reachable via Outcomes. Clickable. |
| **Actions** | Edit, Delete, Start Why Ladder from here. |

### 6.2 Outcome Detail Panel

| Section | Content |
|---------|---------|
| **Header** | Label, type badge ("Outcome"). |
| **Attributes** | Notes. |
| **Upstream Behaviours** | List of Behaviours that produce this Outcome. Clickable. |
| **Downstream Values** | List of Values served, with link attributes. Clickable. |
| **Validation** | Warning if no downstream Values. |
| **Actions** | Edit, Delete. |

### 6.3 Value Detail Panel

| Section | Content |
|---------|---------|
| **Header** | Label, type badge ("Value"). |
| **Attributes** | Importance, Neglect. |
| **Metrics** | Fragility score. |
| **Upstream Outcomes** | List of Outcomes that serve this Value. Clickable. |
| **Upstream Behaviours** | List of Behaviours (transitive) that support this Value. Clickable. |
| **Validation** | Warning if orphan (no incoming paths). |
| **Actions** | Edit, Delete. |

---

## 7. Legend

A **legend** must be persistently visible or easily accessible (toggle).

### 7.1 Legend Content

| Category | Items |
|----------|-------|
| **Node types** | Behaviour (shape + colour), Outcome (shape + colour), Value (shape + colour). |
| **Edge valence** | Positive (line style + colour), Negative (line style + colour). |
| **Edge strength** | Strong (thick), Moderate (medium), Weak (thin). |
| **Special indicators** | Warning badge (⚠️), Selected state, Search highlight. |

### 7.2 Legend Placement

- Default: Collapsed icon in corner; expands on click.
- Option: Always visible in a sidebar.

---

## 8. Colour & Accessibility

### 8.1 Colour Contrast

- All text must meet WCAG AA contrast ratio (≥ 4.5:1 for normal text).
- Node colours must be distinguishable from background.

### 8.2 Colour-Blind Safety

- Do **not** rely on colour alone for critical distinctions:
  - Node types: Use shape + colour.
  - Edge valence: Use line style (solid vs. dashed) + colour.
- Recommended: Test with colour-blindness simulators.

### 8.3 Dark Mode (Post-MVP)

- Spec does not mandate dark mode for MVP.
- Design should not preclude future dark mode (avoid hardcoded light colours).

---

## 9. Responsive Behaviour (MVP)

| Viewport | Behaviour |
|----------|-----------|
| **Desktop (≥ 1024px)** | Full layout: network canvas + sidebar for detail panel. |
| **Tablet (768–1023px)** | Network canvas full width; detail panel as overlay/modal. |
| **Mobile (< 768px)** | Simplified view; network may require horizontal scroll. List view as alternative. |

MVP priority: Desktop. Tablet and mobile are stretch goals.

---

## 10. Sample Wireframe (Illustrative)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  M-E Net                          [Search: ________]  [Filter ▾] [☰]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   [Legend]                                                              │
│   ● Behaviour  ◆ Outcome  ○ Value                                       │
│   ── positive  - - negative                                             │
│                                                                         │
│  ┌─────────┐         ◆ Reduced     ○ Peace of                           │
│  │ 30-min  │────────▶  anxiety  ────▶  mind                             │
│  │  walk   │    +         │              │                              │
│  └─────────┘              │     +        │                              │
│       │                   ▼              ▼                              │
│       │            ◆ Better      ○ Health                               │
│       └──────────▶   sleep  ─────▶                                      │
│              +           │    +     ○ Energy                            │
│                          └─────────▶                                    │
│                                                                         │
│  ┌─────────┐         ◆ Project      ○ Achievement                       │
│  │Late-nite│────────▶  progress ────▶                                   │
│  │  work   │    +                                                       │
│  └─────────┘                                                            │
│       │                                                                 │
│       └ - - - - - ▶ ◆ Better sleep   (negative edge)                    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Detail Panel: [30-min walk]                                            │
│  ─────────────────────────────                                          │
│  Type: Behaviour                                                        │
│  Frequency: daily  │  Cost: low                                         │
│  Leverage: 8.5  │  Coverage: 3 values                                   │
│                                                                         │
│  Outcomes: Reduced anxiety (+, usually), Better sleep (+, usually)      │
│  Values reached: Peace of mind, Health, Energy                          │
│                                                                         │
│  [Edit] [Delete] [Why Ladder ▶]                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Glossary Reference

See [glossary.md](glossary.md) for canonical definitions.
