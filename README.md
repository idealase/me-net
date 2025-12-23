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
5. **Insights Dashboard** — View leverage scores, fragile values, and conflict behaviours.
6. **Export** — Save the network and generate a summary report.

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

---

## Non-Goals (MVP)

- Multi-user collaboration or sharing.
- Cloud sync or authentication.
- Automatic inference of values from freeform text.
- Recommendation engine beyond simple heuristics.

---

## Getting Started

> *Implementation details to be added once tech stack is chosen.*

---

## License

TBD
