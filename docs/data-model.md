# Data Model — M-E Net

> **Version:** MVP  
> **Last updated:** 2025-12-23

This document defines the **conceptual data model** for M-E Net. It describes entities, their attributes, relationships, and invariants.

**Implementation Decision (MVP):** Data is persisted as **JSON in browser localStorage**. The JSON format is human-readable and supports export/import for backup and portability.

---

## 1. Overview

M-E Net models a **directed graph** with three layers:

```
Behaviours ──▶ Outcomes ──▶ Values
  (Means)    (Intermediate)  (Terminal Ends)
```

Edges connect layers and may carry **valence** (positive/negative) and **strength/reliability**. The network supports **many-to-many** relationships at every layer:

- One Behaviour → many Outcomes
- One Outcome ← many Behaviours
- One Outcome → many Values
- One Value ← many Outcomes

---

## 2. Entities

### 2.1 Behaviour

A **Behaviour** is a concrete, repeatable action the user performs.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Unique identifier | Yes | Stable reference across sessions. |
| `label` | Text (≤ 100 chars) | Yes | Human-readable name. Must be unique among Behaviours (case-insensitive). |
| `frequency` | Enum or free text | Yes | How often the behaviour occurs. Suggested enum: `daily`, `weekly`, `monthly`, `occasionally`, `rarely`. Free text allowed. |
| `cost` | Enum | Yes | Perceived effort/friction. Enum: `trivial`, `low`, `medium`, `high`, `very-high`. |
| `contextTags` | List of text | No | Optional tags for filtering (e.g., "morning", "work", "social"). |
| `notes` | Text | No | Free-form notes. |
| `createdAt` | Timestamp | Yes | Auto-set on creation. |
| `updatedAt` | Timestamp | Yes | Auto-set on any edit. |

**Example:**
```
{
  id: "b-001",
  label: "30-min evening walk",
  frequency: "daily",
  cost: "low",
  contextTags: ["evening", "outdoor"],
  notes: "After dinner, around the neighbourhood."
}
```

**Enum storage:** All enums are stored as lowercase tokens; multi-word values use hyphens (e.g., `very-high`, `somewhat-neglected`). UI labels may differ for readability.

---

### 2.2 Outcome

An **Outcome** is a proximal state or effect that results (directly or indirectly) from behaviours.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Unique identifier | Yes | Stable reference. |
| `label` | Text (≤ 100 chars) | Yes | Human-readable name. Must be unique among Outcomes (case-insensitive). |
| `notes` | Text | No | Clarification or context. |
| `createdAt` | Timestamp | Yes | Auto-set on creation. |
| `updatedAt` | Timestamp | Yes | Auto-set on any edit. |

**Example:**
```
{
  id: "o-001",
  label: "Reduced anxiety",
  notes: "Noticeable calmness after physical activity."
}
```

---

### 2.3 Value

A **Value** is a higher-order motivation that feels non-instrumental—a terminal end.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Unique identifier | Yes | Stable reference. |
| `label` | Text (≤ 100 chars) | Yes | Human-readable name. Must be unique among Values (case-insensitive). |
| `importance` | Enum | Yes | How important this value is in practice. Enum: `critical`, `high`, `medium`, `low`. |
| `neglect` | Enum | Yes | How unmet/neglected this value currently feels. Enum: `severely-neglected`, `somewhat-neglected`, `adequately-met`, `well-satisfied`. |
| `notes` | Text | No | Clarification or personal meaning. |
| `createdAt` | Timestamp | Yes | Auto-set on creation. |
| `updatedAt` | Timestamp | Yes | Auto-set on any edit. |

**Example:**
```
{
  id: "v-001",
  label: "Peace of mind",
  importance: "high",
  neglect: "somewhat-neglected",
  notes: "Feeling calm and in control."
}
```

---

### 2.4 Link (Edge)

A **Link** is a directed edge connecting two nodes. Two link types exist:

| Link Type | Source | Target |
|-----------|--------|--------|
| Behaviour → Outcome | Behaviour | Outcome |
| Outcome → Value | Outcome | Value |

#### Common Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Unique identifier | Yes | Stable reference. |
| `sourceId` | Identifier | Yes | ID of source node. |
| `targetId` | Identifier | Yes | ID of target node. |
| `valence` | Enum | Yes | `positive` (helps) or `negative` (hurts). |
| `createdAt` | Timestamp | Yes | Auto-set on creation. |
| `updatedAt` | Timestamp | Yes | Auto-set on any edit. |

#### Behaviour → Outcome Link Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `reliability` | Enum | Yes | How often the behaviour produces the outcome. Suggested enum: `always`, `usually`, `sometimes`, `rarely`. |

#### Outcome → Value Link Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `strength` | Enum | Yes | How strongly the outcome serves (or harms) the value. Suggested enum: `strong`, `moderate`, `weak`. |

#### Derived Weight (Computed)

For metric calculations, a numeric **weight** may be derived from `valence`, `reliability`, and `strength`. The derivation is defined in [metrics-and-insights.md](metrics-and-insights.md). The stored attributes remain qualitative; weights are computed at runtime.

**Example (Behaviour → Outcome):**
```
{
  id: "l-001",
  sourceId: "b-001",  // 30-min evening walk
  targetId: "o-001",  // Reduced anxiety
  valence: "positive",
  reliability: "usually"
}
```

**Example (Outcome → Value):**
```
{
  id: "l-002",
  sourceId: "o-001",  // Reduced anxiety
  targetId: "v-001",  // Peace of mind
  valence: "positive",
  strength: "strong"
}
```

---

## 3. Relationships

### 3.1 Cardinality

| Relationship | Cardinality |
|--------------|-------------|
| Behaviour → Outcome | Many-to-many |
| Outcome → Value | Many-to-many |

Multiple links between the same two nodes are **not allowed**; a single link captures the relationship. If the user wants to express both a positive and negative effect from the same Behaviour to the same Outcome, this is a **conflict** and should be modelled as separate Outcomes or flagged via validation (see §4.4).

### 3.2 Layer Constraints

- Links **only** go forward: Behaviour → Outcome → Value.
- No direct Behaviour → Value links (must pass through an Outcome).
- No backward links (Value → Outcome, Outcome → Behaviour).
- No intra-layer links (Behaviour → Behaviour, etc.).

---

## 4. Invariants & Validation Rules

### 4.1 Orphan Value

**Definition:** A Value with no incoming path from any Behaviour (via Outcomes).

**Detection:** Traverse from all Behaviours forward; any Value not reachable is orphan.

**User impact:** Flagged as "aspirational only" with a warning; not a blocking error.

---

### 4.2 Unexplained Behaviour

**Definition:** A Behaviour with zero outgoing links (no connected Outcomes).

**Detection:** Check outgoing edge count.

**User impact:** Flagged as "unexplained"; prompt user to add Outcomes via Why Ladder.

---

### 4.3 Floating Outcome

**Definition:** An Outcome with no outgoing links to any Value.

**Detection:** Check outgoing edge count.

**User impact:** Flagged as "not connected to values"; the Outcome exists but doesn't yet serve an explicit end.

---

### 4.4 Contradictory Link Pattern

**Definition:** A node has both a strong positive and a strong negative link to the **same** downstream node. (Rare, since we disallow duplicate links—typically arises when two behaviours produce conflicting effects on the same Outcome or Value via different paths.)

Alternative definition: A Behaviour has downstream paths where one path is strongly positive and another is strongly negative to the **same** Value.

**Detection:** For each Behaviour, compute net effect per Value; flag if absolute positive and absolute negative contributions are both above threshold.

**User impact:** Flagged as "conflict behaviour"; user may choose to investigate or accept.

---

### 4.5 Uniqueness

| Scope | Rule |
|-------|------|
| Behaviour labels | Unique (case-insensitive) |
| Outcome labels | Unique (case-insensitive) |
| Value labels | Unique (case-insensitive) |
| Links | Only one link per (sourceId, targetId) pair |

---

### 4.6 Referential Integrity

- A Link's `sourceId` must reference an existing node.
- A Link's `targetId` must reference an existing node.
- Deleting a node cascades to delete all incident links.

---

## 5. Sample Network (Data Representation)

Below is a sample network expressed in a portable text format for illustration.

### Behaviours
| id | label | frequency | cost |
|----|-------|-----------|------|
| b-001 | 30-min evening walk | daily | low |
| b-002 | Late-night work session | weekly | high |

### Outcomes
| id | label |
|----|-------|
| o-001 | Reduced anxiety |
| o-002 | Better sleep |
| o-003 | Project progress |

### Values
| id | label | importance | neglect |
|----|-------|------------|---------|
| v-001 | Peace of mind | high | somewhat-neglected |
| v-002 | Health | critical | adequately-met |
| v-003 | Energy | high | somewhat-neglected |
| v-004 | Achievement | medium | adequately-met |

### Links (Behaviour → Outcome)
| sourceId | targetId | valence | reliability |
|----------|----------|---------|-------------|
| b-001 | o-001 | positive | usually |
| b-001 | o-002 | positive | usually |
| b-002 | o-003 | positive | always |
| b-002 | o-002 | negative | usually |

### Links (Outcome → Value)
| sourceId | targetId | valence | strength |
|----------|----------|---------|----------|
| o-001 | v-001 | positive | strong |
| o-001 | v-002 | positive | moderate |
| o-002 | v-002 | positive | strong |
| o-002 | v-003 | positive | strong |
| o-003 | v-004 | positive | strong |

### Validation Results

- **Orphan Values:** None (all values reachable).
- **Unexplained Behaviours:** None.
- **Floating Outcomes:** None.
- **Conflict Behaviours:** `b-002` (Late-night work session) — positive path to Achievement, negative path to Health and Energy via Better sleep.

---

## 6. Extensibility Notes (Post-MVP)

The model is designed to accommodate future extensions without breaking changes:

| Extension | Approach |
|-----------|----------|
| Time-stamped snapshots | Add `snapshotId` to all entities; queries scoped by snapshot. |
| Context-based filtering | `contextTags` already present; add filtering UI. |
| Additional link types | Introduce new link type enum (e.g., `prerequisite`); existing links remain valid. |
| Multi-user | Add `userId`; current model assumes single implicit user. |

---

## 7. Glossary Reference

See [glossary.md](glossary.md) for canonical definitions.
