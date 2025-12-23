# M-E Net — Means–Ends Network

A personal tool for mapping behaviours to motivations, revealing high-leverage actions, and detecting conflicts in your self-regulation system.

---

## What is M-E Net?

**M-E Net** helps you answer: *"Why do I do what I do—and is it working?"*

Most habit trackers record *what* you do. M-E Net captures *why*—linking concrete **Behaviours** (means) through **Outcomes** (intermediate effects) to the **Values** (terminal ends) that matter most to you. The result is a network (not a tree) that exposes:

- **High-leverage behaviours** — actions that efficiently serve many values.
- **Fragile values** — important ends supported by few or unreliable behaviours.
- **Conflict behaviours** — actions that help one value while undermining another.

By making motivation explicit, you can decide what to keep, drop, or redesign.

---

## Core Concepts

| Layer | Description | Example |
|-------|-------------|---------|
| **Behaviour** | A concrete, repeatable action you perform. | "30-min evening walk" |
| **Outcome** | A proximal state or effect that results from behaviours. | "Reduced anxiety" |
| **Value** | A higher-order motivation that feels non-instrumental. | "Peace of mind" |

Behaviours produce Outcomes; Outcomes serve Values. Links can be **positive** (helps) or **negative** (hurts), and each link carries a strength/reliability rating.

---

## Key Features (MVP)

1. **Capture & Edit** — Create, update, and delete Behaviours, Outcomes, Values, and their links.
2. **"Why Ladder" mode** — Guided prompts to walk from a Behaviour → Outcomes → Values.
3. **Network Validation** — Surface warnings for orphan values, unexplained behaviours, or contradictory links.
4. **Interactive Visualisation** — Explore the network graph with filters, search, and node details.
5. **Insights Dashboard** — View leverage scores, fragile values (including orphans), and conflict behaviours with explanations.
6. **Filter & Highlight** — Search, toggle node/edge types, and highlight high leverage, fragile values, or conflicts.
7. **Export/Import** — Save the network (JSON) or summary report; import replaces the in-memory network.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [Product Spec](docs/spec.md) | Full behavioural requirements and acceptance criteria. |
| [Data Model](docs/data-model.md) | Entity definitions, attributes, relationships, and invariants. |
| [User Flows](docs/user-flows.md) | Step-by-step scenarios for key tasks. |
| [Visual Design](docs/visual-design.md) | Node/edge encoding, interaction rules, legend. |
| [Metrics & Insights](docs/metrics-and-insights.md) | Algorithms for leverage, fragility, conflict. |
| [Backlog](docs/backlog.md) | Phased roadmap: MVP → v1 → v2. |
| [Glossary](docs/glossary.md) | Canonical definitions for all terms. |
| [Quick Start](docs/quick-start.md) | Install, run, and model your first network. |

---

## Non-Goals (MVP)

- Multi-user collaboration or sharing.
- Cloud sync or authentication.
- Automatic inference of values from freeform text.
- Recommendation engine beyond simple heuristics.

---

## Technical Decisions (MVP)

| Aspect | Decision |
|--------|----------|
| **Platform** | Web application (browser-based, offline-capable) |
| **Data Persistence** | JSON files stored in browser localStorage |
| **Visualisation** | D3.js for interactive network rendering |
| **Thresholds** | Fixed defaults (not user-configurable in MVP) |

---

## Getting Started

1. Install dependencies:
	```bash
	npm install
	```
2. Run locally (Vite dev server):
	```bash
	npm run dev
	```
	Open the printed URL (default http://localhost:5173).
3. In the app: add your first Behaviour (or use **Why Ladder** for guidance), link Outcomes and Values, and explore the graph.
4. Open **Insights** for leverage/fragility/conflicts; open **Validation** to resolve warnings.
5. Export JSON or a summary report; import restores a saved network.

See [docs/quick-start.md](docs/quick-start.md) for a fuller walkthrough and commands for tests/lint/typecheck.

---

## License

TBD
