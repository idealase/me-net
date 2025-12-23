# Quick Start — M-E Net

> Build, run, and model your own Means–Ends network in minutes.

## Prerequisites
- Node.js 18+
- npm 9+

## Install
```bash
npm install
```

## Run the app (local dev)
```bash
npm run dev
```
Vite prints a local URL (default http://localhost:5173). Open it in your browser.

## Create your first network
1. Open the app. On the welcome/empty state, choose **Add First Behaviour** or **Start Why Ladder**.
2. Enter a Behaviour (label, frequency, cost, optional tags/notes).
3. Add Outcomes that the behaviour produces (positive or negative valence; reliability).
4. For each Outcome, add the Values it serves (strength; valence). The Why Ladder guides you step-by-step.
5. Save — data is stored locally in your browser (localStorage).

## Explore the graph
- Use the left filter panel to search labels, toggle node types, toggle positive/negative edges, and highlight **High Leverage**, **Fragile Values**, or **Conflicts**.
- Click any node to open its detail panel; edit attributes or add/remove links inline.
- Zoom/pan the D3 graph; use the legend to interpret shapes/colours.

## View insights
- Open the **Insights** panel to see Top Leverage behaviours, Fragile Values (including orphans), and Conflict Behaviours. Each item shows scores and explanatory breakdowns.
- Open the **Validation** panel to review Orphan Values, Unexplained Behaviours, Floating Outcomes, and conflict warnings; snooze or dismiss as needed.

## Save and restore
- **Export Network** downloads the full JSON (includes version and timestamps).
- **Export Summary Report** saves a text/Markdown report with top leverage, fragile values, conflicts, and suggested next steps.
- **Import Network** restores a previously exported JSON. Importing replaces the current in-memory network.

## Run checks
```bash
npm test       # Vitest with coverage
npm run lint   # ESLint (no warnings allowed)
npm run typecheck
```

## Tips
- Duplicate labels per entity type are prevented (case-insensitive).
- Deleting a node cascades to its links.
- Costs are treated as effort (lower is better); link valence/sign flips influence.
