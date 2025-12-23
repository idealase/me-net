# Product Specification — M-E Net

> **Version:** MVP  
> **Last updated:** 2025-12-23

---

## 1. Purpose

M-E Net is a single-user application that allows a person to **model their own behaviours and motivations** as an explicit network of means and ends. The app surfaces insights about *leverage* (which behaviours most efficiently serve their values), *fragility* (which values depend on shaky foundations), and *conflict* (where behaviours help one value while harming another).

The network is **not a tree**:
- A behaviour can serve multiple ends.
- An end can be served by multiple behaviours.

---

## 2. Target User

| Attribute | Description |
|-----------|-------------|
| **Who** | A single individual engaged in self-reflection, goal-setting, or behaviour change. |
| **Motivation** | Wants to understand *why* they do what they do and optimise their actions for what matters. |
| **Context** | Personal use; no collaboration or sharing required for MVP. |

---

## 3. Entities

> Full attribute definitions in [data-model.md](data-model.md).

| Entity | Role | Example |
|--------|------|---------|
| **Behaviour** | Concrete, repeatable action (means). | "30-min evening walk" |
| **Outcome** | Proximal effect or state produced by behaviours. | "Reduced anxiety" |
| **Value** | Higher-order, non-instrumental motivation (terminal end). | "Peace of mind" |
| **Link** | Directed edge connecting Behaviour→Outcome or Outcome→Value. | walk → reduced anxiety (reliability: high, valence: positive) |

---

## 4. Functional Requirements

### 4.1 Capture & Edit (CRUD)

| ID | Requirement |
|----|-------------|
| C-1 | User can **create** a Behaviour with label, frequency, cost, and optional context tags. |
| C-2 | User can **create** an Outcome with label and optional notes. |
| C-3 | User can **create** a Value with label, importance, and neglect rating. |
| C-4 | User can **create** a Link (Behaviour→Outcome or Outcome→Value) with reliability/strength and valence (positive or negative). |
| C-5 | User can **edit** any entity's attributes. |
| C-6 | User can **delete** any entity; deleting a node removes its incident links. |
| C-7 | The app prevents duplicate labels within the same entity type (case-insensitive). |

### 4.2 "Why Ladder" Capture Mode

| ID | Requirement |
|----|-------------|
| W-1 | User can start a "Why Ladder" session by selecting or creating a Behaviour. |
| W-2 | The app prompts: *"What outcomes does this behaviour produce?"* |
| W-3 | For each Outcome entered, the app prompts: *"Why does that outcome matter?"* |
| W-4 | User can respond with an existing Value, a new Value, or another Outcome (intermediate). |
| W-5 | User can stop the ladder at any point; incomplete ladders are saved with nodes flagged as *unexplained*. |
| W-6 | The ladder flow supports adding multiple Outcomes per Behaviour and multiple Values per Outcome. |

### 4.3 Validation & Diagnostics

| ID | Requirement |
|----|-------------|
| V-1 | The app detects **Orphan Values**: Values with no incoming path from any Behaviour (via Outcomes). |
| V-2 | The app detects **Unexplained Behaviours**: Behaviours with no outgoing links. |
| V-3 | The app detects **Floating Outcomes**: Outcomes with no downstream links to Values. |
| V-4 | The app detects **Outcome-level Conflicts**: Behaviours with negative Behaviour→Outcome links (immediate harm). |
| V-5 | The app detects **Value-level Conflicts**: Behaviours with positive paths to some Values and negative paths to other Values (trade-offs). |
| V-6 | Validation results are displayed as warnings/alerts, not blocking errors. |
| V-7 | User can dismiss or snooze a warning for a specific node. |

### 4.4 Visualisation

| ID | Requirement |
|----|-------------|
| VZ-1 | The app renders an **interactive network diagram** showing Behaviours, Outcomes, and Values as nodes and Links as edges. |
| VZ-2 | Node types are **visually distinct** (e.g., different shapes or colour families). |
| VZ-3 | Edge valence is **visually distinct**: positive edges differ from negative/conflict edges. |
| VZ-4 | Edge strength/reliability is encoded (e.g., thickness or opacity). |
| VZ-5 | Clicking a node opens a **detail panel** showing attributes and connected neighbours. |
| VZ-6 | User can **filter** the view by node type (Behaviour / Outcome / Value). |
| VZ-7 | User can **search** nodes by label substring. |
| VZ-8 | User can toggle a **"highlight high-leverage behaviours"** mode. |
| VZ-9 | A **legend** explains node shapes, edge colours, and encoding rules. |

### 4.5 Insights

| ID | Requirement |
|----|-------------|
| I-1 | The app computes a **Leverage Score** for each Behaviour (see [metrics-and-insights.md](metrics-and-insights.md)). |
| I-2 | The app lists **Top Leverage Behaviours** (e.g., top 5) with explanations: *"Supports Values X, Y via Outcomes A, B."* |
| I-3 | The app computes a **Fragility Score** for each Value. |
| I-4 | The app lists **Fragile Values**: Values with fragility above a threshold. |
| I-5 | The app computes a **Conflict Index** for each Behaviour. |
| I-6 | The app lists **Conflict Behaviours** with details on the competing effects. |

### 4.6 Export

| ID | Requirement |
|----|-------------|
| E-1 | User can export the **full network** to a portable data file. The format must preserve all entities and attributes, be human-readable, and support re-import. |
| E-2 | User can export a **summary report** containing: top leverage behaviours, orphan values, conflict behaviours, and suggested next modelling steps. |
| E-3 | Exported files include a timestamp and version identifier. |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NF-1 | The app runs entirely **offline**; no network calls required for core functionality. |
| NF-2 | Data is persisted **locally** between sessions using **JSON in browser localStorage**. |
| NF-3 | The app should load and render a network of up to **200 nodes / 500 edges** without perceptible lag (< 1 second). |
| NF-4 | The UI must be accessible via keyboard navigation. |
| NF-5 | All user-visible text should be externalisable for future localisation. |
| NF-6 | The app is a **web application** running in modern browsers (Chrome, Firefox, Safari, Edge). |

---

## 5.1 Technical Decisions (MVP)

| Aspect | Decision | Rationale |
|--------|----------|----------|
| **Platform** | Web application | Accessible, no installation, works offline via Service Worker. |
| **Data Persistence** | JSON in localStorage | Simple, human-readable, portable, no backend required. |
| **Visualisation** | D3.js | Industry-standard, flexible, well-documented, supports custom layouts. |
| **Thresholds** | Fixed defaults | Reduces complexity; tuning deferred to v1. |

---

## 6. Out of Scope (MVP)

- Multi-user collaboration or sharing.
- Cloud sync, authentication, or accounts.
- Automated inference of values from freeform text.
- Recommendation engine beyond displaying computed metrics.
- Mobile-native app (responsive web acceptable).
- User-configurable thresholds for metrics (fixed defaults only).

---

## 7. Success Criteria

| Criterion | Measure |
|-----------|---------|
| SC-1 | A new user can create a network of ≥ 3 Behaviours, ≥ 5 Outcomes, ≥ 3 Values with links in under 15 minutes using Why Ladder mode. |
| SC-2 | The validation pane correctly identifies all Orphan Values and Unexplained Behaviours in a test network. |
| SC-3 | High-leverage behaviours listed match manual calculation using the defined formula. |
| SC-4 | Exported data file can be re-imported with zero data loss. |
| SC-5 | A user unfamiliar with the app can interpret the network visualisation with only the legend for guidance. |

---

## 8. Sample Network (Illustrative)

```
Behaviours               Outcomes                 Values
──────────               ────────                 ──────
[30-min walk]  ──(+)──▶ [Reduced anxiety] ─(+)─▶ [Peace of mind]
       │                       │
       │                       └────────(+)────▶ [Health]
       │
       └───────(+)──────▶ [Better sleep] ──(+)─▶ [Health]
                                │
                                └──────(+)─────▶ [Energy]

[Late-night work] ─(+)─▶ [Project progress] ─(+)▶ [Achievement]
       │
       └───────(–)──────▶ [Better sleep]   (negative link)
```

In this example:
- **30-min walk** is high-leverage: it supports 3 values via 2 outcomes.
- **Late-night work** is a conflict behaviour: it helps *Achievement* but hurts *Health* and *Energy* by undermining *Better sleep*.
- If *Peace of mind* had no incoming path, it would be flagged as an Orphan Value.

---

## 9. Glossary Reference

See [glossary.md](glossary.md) for canonical definitions of all terms.
