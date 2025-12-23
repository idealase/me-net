# Backlog — M-E Net

> **Version:** MVP  
> **Last updated:** 2024-12-23

This document defines the **phased product backlog** for M-E Net. Each phase represents a coherent release milestone with clear scope boundaries.

---

## Phase Overview

| Phase | Goal | Timeframe (Illustrative) |
|-------|------|--------------------------|
| **MVP** | Core capture, visualisation, and insights for a single user. | 8–12 weeks |
| **v1** | Enhanced usability, context filtering, and temporal comparison. | +4–6 weeks |
| **v2** | Advanced analytics, semi-automation, and journaling integration. | +6–8 weeks |

---

## MVP Scope

> **Goal:** Deliver a functional single-user tool that captures behaviours and motivations as a network, validates structure, computes core insights, and supports export.

### Data Model

| Item | Description | Acceptance Criteria |
|------|-------------|---------------------|
| M-1 | Implement Behaviour entity with all MVP attributes (label, frequency, cost, contextTags, notes). | Behaviour can be created, edited, deleted; attributes persisted. |
| M-2 | Implement Outcome entity with MVP attributes (label, notes). | Outcome can be created, edited, deleted. |
| M-3 | Implement Value entity with MVP attributes (label, importance, neglect). | Value can be created, edited, deleted. |
| M-4 | Implement Link entity (Behaviour→Outcome, Outcome→Value) with valence and reliability/strength. | Links can be created, edited, deleted; link attributes persisted. |
| M-5 | Enforce uniqueness constraints (label within entity type). | Duplicate labels prevented with user feedback. |
| M-6 | Enforce referential integrity (delete node cascades to links). | Deleting a node removes all incident links. |

### Capture & Edit

| Item | Description | Acceptance Criteria |
|------|-------------|---------------------|
| C-1 | CRUD UI for Behaviours. | User can create, view, edit, delete Behaviours. |
| C-2 | CRUD UI for Outcomes. | User can create, view, edit, delete Outcomes. |
| C-3 | CRUD UI for Values. | User can create, view, edit, delete Values. |
| C-4 | CRUD UI for Links (inline during node edit or separate). | User can add/remove links and set attributes. |
| C-5 | "Why Ladder" capture mode. | User can start with a Behaviour and walk through prompts to add Outcomes and Values, creating links along the way. |
| C-6 | Autocomplete for existing nodes when creating links. | When linking, existing Outcomes/Values appear as suggestions. |

### Validation

| Item | Description | Acceptance Criteria |
|------|-------------|---------------------|
| V-1 | Detect and display Orphan Values. | Orphan values flagged in validation panel. |
| V-2 | Detect and display Unexplained Behaviours. | Unexplained behaviours flagged. |
| V-3 | Detect and display Floating Outcomes. | Floating outcomes flagged. |
| V-4 | Detect Contradictory Links / Conflict Behaviours. | Conflict behaviours flagged with explanation. |
| V-5 | Snooze / Dismiss warnings. | User can snooze (time-limited) or dismiss (permanent until re-trigger) warnings. |

### Visualisation

| Item | Description | Acceptance Criteria |
|------|-------------|---------------------|
| VZ-1 | Render network diagram with Behaviours, Outcomes, Values as nodes. | All nodes visible in layered layout. |
| VZ-2 | Visually distinguish node types (shape/colour). | User can identify type at a glance. |
| VZ-3 | Render links with valence distinction (positive vs. negative). | Positive and negative edges visually distinct. |
| VZ-4 | Encode link strength/reliability visually (thickness/opacity). | Strong vs. weak links distinguishable. |
| VZ-5 | Node click opens detail panel. | Clicking a node shows attributes and connected neighbours. |
| VZ-6 | Filter by node type. | User can show/hide Behaviours, Outcomes, Values. |
| VZ-7 | Search by label. | Search input filters/highlights matching nodes. |
| VZ-8 | Highlight high-leverage behaviours mode. | Toggle dims low-leverage, highlights high-leverage. |
| VZ-9 | Legend. | Legend explains shapes, colours, line styles. |
| VZ-10 | Zoom and pan. | User can zoom and pan the canvas. |

### Insights

| Item | Description | Acceptance Criteria |
|------|-------------|---------------------|
| I-1 | Compute Leverage Score for each Behaviour. | Score matches formula in metrics doc; displayed in UI. |
| I-2 | Display Top Leverage Behaviours with explanations. | List shows top 5; each has values/outcomes explanation. |
| I-3 | Compute Fragility Score for each Value. | Score computed; displayed in Value detail panel. |
| I-4 | Display Fragile Values list. | List shows values with fragility > threshold. |
| I-5 | Compute Conflict Index for each Behaviour. | Score computed; displayed in detail panel. |
| I-6 | Display Conflict Behaviours list. | List shows behaviours with conflict index > 0. |

### Export

| Item | Description | Acceptance Criteria |
|------|-------------|---------------------|
| E-1 | Export full network data to portable file. | File contains all entities and links; can be re-imported without data loss. |
| E-2 | Export summary report. | Report contains top leverage, orphan values, conflict behaviours, suggestions. |
| E-3 | Timestamp and version in exports. | Exported files include date and version identifier. |

### Non-Functional

| Item | Description | Acceptance Criteria |
|------|-------------|---------------------|
| NF-1 | Offline operation. | App functions without network calls. |
| NF-2 | Local persistence. | Data persists between sessions. |
| NF-3 | Performance: 200 nodes / 500 edges. | Network renders in < 1 second. |
| NF-4 | Keyboard navigation. | All core actions accessible via keyboard. |

---

## v1 Scope

> **Goal:** Improve usability, add context/time filtering, and enable network comparison over time.

### Context & Time

| Item | Description | Rationale |
|------|-------------|-----------|
| v1-1 | Filter Behaviours by context tags. | Users often want to focus on "work" or "health" subsets. |
| v1-2 | Time-stamp snapshots of the network. | Allow user to save a "snapshot" of current state with date and label. |
| v1-3 | Compare two snapshots side-by-side. | Show what changed: added/removed nodes, changed links, metric deltas. |
| v1-4 | Time-based filtering (show network as of date X). | Navigate through historical states. |

### Guided Prompts

| Item | Description | Rationale |
|------|-------------|-----------|
| v1-5 | "You have N unexplained behaviours—want to ladder them?" prompt. | Reduce friction; guide users to complete their network. |
| v1-6 | "Value X is fragile—add supporting behaviours?" prompt. | Proactive suggestions based on insights. |
| v1-7 | Weekly review reminder (notification or in-app). | Encourage regular reflection. |

### Usability

| Item | Description | Rationale |
|------|-------------|-----------|
| v1-8 | Undo / Redo for edits. | Reduce fear of mistakes; improve flow. |
| v1-9 | Keyboard shortcuts for common actions. | Power-user efficiency. |
| v1-10 | Improved mobile/tablet layout. | Broader device support. |
| v1-11 | Dark mode. | User preference. |

### Data

| Item | Description | Rationale |
|------|-------------|-----------|
| v1-12 | Import network from file (merge or replace). | Restore backups; migrate between devices. |
| v1-13 | Duplicate a Behaviour (clone with links). | Speed up entry of similar behaviours. |

---

## v2 Scope

> **Goal:** Advanced analytics, semi-automated clustering, and journaling integration.

### Advanced Analytics

| Item | Description | Rationale |
|------|-------------|-----------|
| v2-1 | Centrality measures (degree, betweenness) for nodes. | Identify "hub" outcomes or behaviours that connect many parts of the network. |
| v2-2 | "What-if" removal simulation. | "If I removed this behaviour, how would my values be affected?" |
| v2-3 | Trend analysis (leverage over time). | Show how a behaviour's contribution has changed across snapshots. |
| v2-4 | Goal-based planning ("I want to support Value X more; suggest behaviours"). | Reverse query: start from value, find candidates. |

### Semi-Automation

| Item | Description | Rationale |
|------|-------------|-----------|
| v2-5 | Suggest merging similar Behaviours/Outcomes (clustering). | Reduce redundancy; user validates before merge. |
| v2-6 | Suggest links based on label similarity (user confirms). | Accelerate capture; maintain user control. |
| v2-7 | Natural language input for Why Ladder ("I walk because it reduces anxiety and helps me sleep"). | Parse and propose nodes/links for user validation. |

### Journaling Integration

| Item | Description | Rationale |
|------|-------------|-----------|
| v2-8 | Import journal entries (text). | Users often capture reflections elsewhere. |
| v2-9 | Highlight potential behaviours/outcomes/values in journal text. | Surface candidates; user confirms. |
| v2-10 | Link journal entries to nodes (annotations). | Contextual evidence for why links exist. |

### Collaboration (Exploratory)

| Item | Description | Rationale |
|------|-------------|-----------|
| v2-11 | Share read-only view of network via link. | Share with coach/therapist without full collaboration. |
| v2-12 | Export to common formats (CSV, GraphML). | Interoperability with other tools. |

---

## Parking Lot (Future Consideration)

| Item | Description | Notes |
|------|-------------|-------|
| P-1 | Multi-user collaboration (shared networks). | Significant complexity; defer beyond v2. |
| P-2 | Cloud sync and accounts. | Requires auth, security, infrastructure. |
| P-3 | Mobile-native apps (iOS, Android). | Evaluate after web/desktop MVP. |
| P-4 | AI-generated value suggestions. | Privacy concerns; maintain manual-first philosophy. |
| P-5 | Integration with habit trackers (import frequency data). | API dependencies; user demand TBD. |

---

## Backlog Prioritisation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **User value** | High | Does this directly help the user model or understand their motivation? |
| **Complexity** | Medium | How much effort to implement? |
| **Dependencies** | Medium | Does this block other features? |
| **Risk** | Low | Is there technical or UX uncertainty? |

MVP items are non-negotiable for initial release. v1/v2 items are prioritised within their phase based on the above criteria.

---

## Glossary Reference

See [glossary.md](glossary.md) for canonical definitions.
