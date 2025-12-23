# Glossary — M-E Net

> **Version:** MVP  
> **Last updated:** 2025-12-23

This document provides **canonical definitions** for all terms used throughout the M-E Net specification. When a term is used in any other document, it carries the meaning defined here.

---

## Core Entities

### Behaviour (Means)

A **concrete, repeatable action** that the user performs. Behaviours are the "means" in the means–ends network—the things you *do*.

**Attributes:** label, frequency, cost, contextTags, notes.

**Examples:**
- "30-min evening walk"
- "Morning meditation"
- "Weekly meal prep"
- "Late-night work session"

**See also:** [data-model.md](data-model.md#21-behaviour)

---

### Outcome (Intermediate End)

A **proximal state or effect** that results from one or more Behaviours. Outcomes are intermediate ends—they are valuable because they lead to deeper motivations (Values), not necessarily for their own sake.

**Attributes:** label, notes.

**Examples:**
- "Reduced anxiety"
- "Better sleep"
- "Mental clarity"
- "Project progress"

**See also:** [data-model.md](data-model.md#22-outcome)

---

### Value (Terminal End)

A **higher-order motivation** that feels non-instrumental—something the user cares about for its own sake. Values are the terminal ends of the network; they answer the question "Why does it ultimately matter?"

**Attributes:** label, importance, neglect.

**Examples:**
- "Peace of mind"
- "Health"
- "Achievement"
- "Belonging"
- "Autonomy"

**See also:** [data-model.md](data-model.md#23-value)

---

### Link (Edge)

A **directed connection** between two nodes in the network. Links only flow forward: Behaviour → Outcome → Value. Each link carries valence (positive/negative) and strength/reliability.

**Types:**
- Behaviour → Outcome Link
- Outcome → Value Link

**See also:** [data-model.md](data-model.md#24-link-edge)

---

## Link Attributes

### Valence

Whether a link represents a **positive** (helps/supports) or **negative** (hurts/undermines) relationship.

| Value | Meaning |
|-------|---------|
| **Positive** | The source helps produce or support the target. |
| **Negative** | The source hurts, undermines, or conflicts with the target. |

---

### Reliability

How often a Behaviour produces a given Outcome.

| Value | Meaning |
|-------|---------|
| **Always** | The outcome occurs every time the behaviour is performed. |
| **Usually** | The outcome occurs most of the time (~75%). |
| **Sometimes** | The outcome occurs roughly half the time (~50%). |
| **Rarely** | The outcome occurs infrequently (~25%). |

---

### Strength

How strongly an Outcome serves (or harms) a Value.

| Value | Meaning |
|-------|---------|
| **Strong** | The outcome is a major contributor to the value. |
| **Moderate** | The outcome contributes noticeably to the value. |
| **Weak** | The outcome contributes only slightly to the value. |

---

## Node Attributes

### Frequency (Behaviour)

How often the user performs a Behaviour.

| Value | Meaning |
|-------|---------|
| **Daily** | Once a day or more. |
| **Weekly** | A few times per week. |
| **Monthly** | A few times per month. |
| **Occasionally** | Every few months. |
| **Rarely** | Less than a few times per year. |

Custom free-text values are also permitted.

---

### Cost (Behaviour)

The perceived effort, time, or friction required to perform a Behaviour.

| Value | Meaning |
|-------|---------|
| **Trivial** | Almost no effort; automatic. |
| **Low** | Minimal effort; easy to do. |
| **Medium** | Noticeable effort; requires some planning. |
| **High** | Significant effort; requires substantial commitment. |
| **Very High** | Major effort; difficult to sustain. |

---

### Importance (Value)

How important a Value is to the user in practice.

| Value | Meaning |
|-------|---------|
| **Critical** | A core priority; life feels incomplete without it. |
| **High** | Very important; regularly top-of-mind. |
| **Medium** | Matters, but not a daily concern. |
| **Low** | Nice to have; not a primary focus. |

---

### Neglect (Value)

How unmet or neglected a Value currently feels.

| Value | Meaning |
|-------|---------|
| **Severely neglected** | This value is almost entirely unmet; causing distress. |
| **Somewhat neglected** | This value is not getting enough attention. |
| **Adequately met** | This value is reasonably satisfied. |
| **Well satisfied** | This value is abundantly met. |

---

## Network Concepts

### M-E Net (Means–Ends Network)

The overall **directed graph** consisting of Behaviours, Outcomes, Values, and the Links between them. The network represents the user's explicit model of *what they do* and *why it matters*.

---

### Layer

The network has three conceptual layers arranged in a directed flow:

1. **Behaviour layer** (leftmost in visualisation)
2. **Outcome layer** (middle)
3. **Value layer** (rightmost)

Links only connect adjacent layers, always flowing forward.

---

### Path

A sequence of connected links from a Behaviour to a Value, passing through one or more Outcomes.

**Example path:** `30-min walk` → `Better sleep` → `Health`

---

### Many-to-Many Relationship

A relationship where:
- One Behaviour can link to multiple Outcomes.
- One Outcome can be linked from multiple Behaviours.
- One Outcome can link to multiple Values.
- One Value can be linked from multiple Outcomes.

This is fundamental to M-E Net: it is a **network**, not a tree.

---

## Validation Terms

### Orphan Value

A Value with **no incoming path** from any Behaviour (via Outcomes). Orphan values are "aspirational only"—the user cares about them but has no modelled behaviours supporting them.

---

### Unexplained Behaviour

A Behaviour with **no outgoing links** to any Outcome. The user performs this behaviour but hasn't articulated what it produces.

---

### Floating Outcome

An Outcome with **no outgoing links** to any Value. The outcome exists but isn't connected to why it matters.

---

### Outcome-level Conflict

A Behaviour with at least one **negative Behaviour→Outcome link**. The behaviour directly harms an outcome (e.g., "Late-night work" negatively affects "Better sleep").

---

### Value-level Conflict

A Behaviour with downstream paths where some paths are **positive** and others are **negative** to different Values. The behaviour creates a trade-off (e.g., helps "Achievement" but hurts "Health").

---

### Conflict (General)

Either an Outcome-level Conflict or a Value-level Conflict. The app flags both types in the validation panel.

---

## Insight Terms

### Leverage Score

A computed metric indicating how efficiently a Behaviour supports the user's Values relative to its cost.

**High leverage:** The behaviour delivers significant value for low effort.

**Formula:** TotalInfluence / Cost

**See also:** [metrics-and-insights.md](metrics-and-insights.md#3-leverage-score)

---

### Coverage

The **number of distinct Values** reachable from a Behaviour via positive paths.

---

### Fragility Score

A computed metric indicating how at-risk a Value is due to weak, sparse, or unreliable support.

**High fragility:** The value depends on few behaviours or unreliable links.

**Formula:** (Importance × Neglect) / SupportStrength

**See also:** [metrics-and-insights.md](metrics-and-insights.md#5-fragility-score)

---

### Conflict Index

A computed metric indicating the degree to which a Behaviour has both significant positive and negative downstream effects.

**High conflict index:** The behaviour helps some values while hurting others; the user faces a trade-off.

**See also:** [metrics-and-insights.md](metrics-and-insights.md#6-conflict-index)

---

### Influence

The contribution of a Behaviour to a Value, computed by multiplying link weights along paths.

**Formula:** Valence × Reliability × Valence × Strength (per path)

---

### Support Strength

The total positive influence flowing into a Value from all Behaviours.

---

## Interaction Terms

### Why Ladder

A guided capture mode where the user starts with a Behaviour and iteratively answers "why?" to build out Outcomes and Values.

**Flow:** Behaviour → "What does it produce?" → Outcome(s) → "Why does that matter?" → Value(s)

---

### Detail Panel

A UI component that appears when a node is selected, showing the node's attributes, connected neighbours, and relevant metrics.

---

### Highlight Mode

A visualisation mode that emphasises certain nodes (e.g., high-leverage behaviours) while dimming others.

---

### Filter

A control that shows/hides nodes based on criteria (e.g., node type, context tags).

---

## Export Terms

### Network Export

A portable data file containing all entities (Behaviours, Outcomes, Values) and Links with their attributes. Must support re-import without data loss.

---

### Summary Report

A human-readable document containing:
- Top leverage behaviours
- Orphan values
- Conflict behaviours
- Suggested next modelling steps

---

### Snapshot

(v1 feature) A timestamped copy of the entire network state, allowing historical comparison.

---

## Technical Terms (MVP)

### JSON (JavaScript Object Notation)

A lightweight, human-readable data format used for persisting the network in browser localStorage.

---

### localStorage

Browser-provided storage that persists data locally between sessions. M-E Net uses localStorage to save the network as JSON.

---

### D3.js

A JavaScript library for creating interactive data visualisations. M-E Net uses D3.js to render the network diagram.

---

## Abbreviations

| Abbreviation | Meaning |
|--------------|---------|
| **MVP** | Minimum Viable Product |
| **M-E Net** | Means–Ends Network |
| **CRUD** | Create, Read, Update, Delete |
| **UI** | User Interface |
| **UX** | User Experience |
| **JSON** | JavaScript Object Notation |
| **D3** | Data-Driven Documents (D3.js) |

---

## Document References

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Project overview |
| [spec.md](spec.md) | Full product specification |
| [data-model.md](data-model.md) | Entity definitions and invariants |
| [user-flows.md](user-flows.md) | Key user scenarios |
| [visual-design.md](visual-design.md) | Visual semantics and interaction rules |
| [metrics-and-insights.md](metrics-and-insights.md) | Analytics computations |
| [backlog.md](backlog.md) | Phased roadmap |
