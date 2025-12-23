# User Flows — M-E Net

> **Version:** MVP  
> **Last updated:** 2025-12-23

This document describes the key user flows for M-E Net. Each flow includes:
- **Goal:** What the user wants to accomplish.
- **Preconditions:** Required state before starting.
- **Steps:** Detailed walkthrough.
- **Postconditions:** Expected state after completion.
- **Acceptance Criteria:** How to verify the flow works correctly.

---

## Flow 1: Start from Scratch in 15 Minutes

### Goal
A new user creates a meaningful initial network (≥ 3 Behaviours, ≥ 5 Outcomes, ≥ 3 Values with links) in under 15 minutes.

### Preconditions
- App is installed/opened.
- No existing data (empty network).

### Steps

1. **Welcome screen**
   - User sees a brief intro: *"M-E Net helps you map what you do to why it matters."*
   - Two options: "Start with a Behaviour" or "Learn More".
   - User clicks **"Start with a Behaviour"**.

2. **First Why Ladder**
   - App prompts: *"Name a behaviour you do regularly."*
   - User types: `Morning meditation` → clicks **Add**.
   - App prompts: *"What outcome(s) does 'Morning meditation' produce?"*
   - User types: `Mental clarity` → clicks **Add Outcome**.
   - App prompts: *"Why does 'Mental clarity' matter to you?"*
   - User types: `Productivity` → clicks **Add as Value**.
   - App prompts: *"Does 'Mental clarity' serve any other values?"*
   - User types: `Peace of mind` → clicks **Add as Value**.
   - App prompts: *"Does 'Morning meditation' produce any other outcomes?"*
   - User clicks **No, I'm done with this behaviour**.

3. **Second Why Ladder**
   - User clicks **Add Another Behaviour**.
   - User types: `30-min evening walk`.
   - Outcomes added: `Reduced anxiety`, `Better sleep`.
   - `Reduced anxiety` → Values: `Peace of mind`, `Health`.
   - `Better sleep` → Values: `Health`, `Energy`.

4. **Third Why Ladder**
   - User adds: `Weekly meal prep`.
   - Outcomes: `Healthy eating`, `Time saved`.
   - `Healthy eating` → Values: `Health`.
   - `Time saved` → Values: `Productivity`.

5. **Review network**
   - User clicks **View Network**.
   - Network diagram shows 3 Behaviours, 5 Outcomes, 4 Values, connected.

6. **Check validation**
   - Validation pane shows: *"No warnings. Your network is fully connected."*

### Postconditions
- Network contains ≥ 3 Behaviours, ≥ 5 Outcomes, ≥ 3 Values, all linked.
- No orphan values or unexplained behaviours.

### Acceptance Criteria
- [ ] New user completes flow in ≤ 15 minutes (measured via usability test).
- [ ] All created nodes visible in network view.
- [ ] All links correctly connect Behaviours → Outcomes → Values.
- [ ] Validation shows no warnings.

---

## Flow 2: Add a New Behaviour and Connect It to Values

### Goal
User adds a single new behaviour to an existing network, linking it to outcomes and values.

### Preconditions
- User has an existing network with at least some Outcomes and Values.

### Steps

1. **Initiate addition**
   - From network view or sidebar, user clicks **+ Add Behaviour**.

2. **Enter behaviour details**
   - Form appears with fields:
     - Label (required): User types `Daily journaling`.
     - Frequency: User selects `daily`.
     - Cost: User selects `low`.
     - Context tags (optional): User types `morning`, `alone`.
   - User clicks **Save & Connect**.

3. **Link to Outcomes**
   - App prompts: *"What outcome(s) does 'Daily journaling' produce?"*
   - Autocomplete suggests existing Outcomes; user can also create new.
   - User selects existing: `Mental clarity`.
   - User creates new: `Self-awareness`.
   - For each link, user sets:
     - Valence: `positive`
     - Reliability: `usually`
   - User clicks **Next**.

4. **Link Outcomes to Values (if new Outcomes created)**
   - App prompts: *"What value(s) does 'Self-awareness' serve?"*
   - User creates new Value: `Personal growth` (importance: high, neglect: somewhat neglected).
   - User also links to existing: `Peace of mind`.
   - User sets strength (`strong`) and valence (`positive`) for each.
   - User clicks **Done**.

5. **Confirmation**
   - App shows summary: *"'Daily journaling' added with 2 outcomes and links to 2 values."*
   - Network view updates to include new nodes and edges.

### Postconditions
- `Daily journaling` exists with correct attributes.
- Links exist: journaling → Mental clarity, journaling → Self-awareness.
- Links exist: Self-awareness → Personal growth, Self-awareness → Peace of mind.
- New Value `Personal growth` created.

### Acceptance Criteria
- [ ] Behaviour appears in network with correct attributes.
- [ ] Autocomplete suggests existing Outcomes/Values during linking.
- [ ] New Outcomes and Values can be created inline.
- [ ] Link attributes (valence, reliability, strength) are saved correctly.
- [ ] Network diagram updates immediately.

---

## Flow 3: Review Leverage Behaviours Weekly

### Goal
User reviews which behaviours provide the most value for effort (high leverage) as part of a weekly reflection.

### Preconditions
- Network has ≥ 5 Behaviours with links.
- App has computed leverage scores.

### Steps

1. **Access insights**
   - User clicks **Insights** tab/panel.

2. **View leverage ranking**
   - App displays **Top Leverage Behaviours** list (default: top 5).
   - Each entry shows:
     - Behaviour label
     - Leverage score (numeric or relative ranking)
     - Explanation: *"Supports Values: Health, Energy, Peace of mind via Outcomes: Better sleep, Reduced anxiety."*
     - Cost label (for context)

3. **Drill into a behaviour**
   - User clicks on `30-min evening walk`.
   - Detail panel shows:
     - All linked Outcomes with reliability.
     - All downstream Values with strength.
     - Visual highlight on network (optional).

4. **Compare behaviours**
   - User scrolls to see lower-ranked behaviours.
   - User notices `Social media scrolling` has low leverage (high cost, few positive links, some negative).

5. **Take action (out of scope for MVP, but flow ends naturally)**
   - User mentally notes to reduce social media scrolling.
   - User closes insights panel.

### Postconditions
- User has reviewed leverage rankings and explanations.
- No data changes required.

### Acceptance Criteria
- [ ] Leverage scores are displayed in ranked order.
- [ ] Each behaviour's explanation correctly lists connected Values and Outcomes.
- [ ] Clicking a behaviour shows detail panel with full link information.
- [ ] Low-leverage behaviours are visible for comparison.

---

## Flow 4: Investigate a Conflicted Behaviour

### Goal
User investigates a behaviour flagged as having conflicting effects (helps one value, hurts another).

### Preconditions
- Network contains a Conflict Behaviour (e.g., `Late-night work session`).
- Validation has flagged the conflict.

### Steps

1. **Notice conflict warning**
   - In validation panel or insights, user sees warning: *"Conflict: 'Late-night work session' has both positive and negative downstream effects."*

2. **Click to investigate**
   - User clicks on the warning or the behaviour label.

3. **View conflict details**
   - Detail panel shows:
     - **Positive path:** Late-night work → Project progress → Achievement (strong).
     - **Negative path:** Late-night work → Better sleep (negative link, reliability: usually) → Health (hurt), Energy (hurt).
   - Conflict summary: *"This behaviour supports Achievement but undermines Health and Energy."*

4. **Explore in network view**
   - User toggles **Highlight this behaviour's paths**.
   - Network dims unrelated nodes; shows positive edges in one colour, negative in another.

5. **User reflection**
   - User considers:
     - Is the trade-off worth it?
     - Can I modify the behaviour (e.g., limit to once a week)?
     - Can I mitigate the negative outcome (e.g., compensate with morning sleep-in)?
   - User may edit the behaviour's notes to capture decision.

6. **Optional: Edit behaviour**
   - User changes frequency from `weekly` to `monthly`.
   - User adds note: *"Trying to reduce; only for urgent deadlines."*
   - Clicks **Save**.

### Postconditions
- User understands the conflict's structure.
- If edited, behaviour reflects new frequency/notes.

### Acceptance Criteria
- [ ] Conflict warning clearly identifies the behaviour and competing effects.
- [ ] Detail panel lists both positive and negative paths with specific nodes.
- [ ] Network highlights conflicting paths distinctly.
- [ ] User can edit the behaviour from the detail panel.

---

## Flow 5: Export and Share with Future Self

### Goal
User exports their network and a summary report to save for future reference or backup.

### Preconditions
- Network has meaningful content.

### Steps

1. **Access export**
   - User clicks **Export** button (in menu or toolbar).

2. **Choose export type**
   - Options:
     - **Full Network Data** — all entities and links in portable format.
     - **Summary Report** — human-readable insights document.
     - **Both** (recommended).
   - User selects **Both**.

3. **Configure options (optional)**
   - User can add a note/label for the export: *"End of year reflection 2024"*.

4. **Generate export**
   - App generates:
     - `me-net-export-2024-12-23.json` (or similar) — full data.
     - `me-net-report-2024-12-23.md` (or similar) — summary report.

5. **Review report preview**
   - App shows preview of summary report:
     - **Top Leverage Behaviours:** 1. 30-min evening walk, 2. Morning meditation, ...
     - **Orphan Values:** None.
     - **Conflict Behaviours:** Late-night work session (details).
     - **Suggested Next Steps:** *"Consider adding outcomes for 'Read fiction nightly'."*

6. **Download files**
   - User clicks **Download** (or files are auto-saved to chosen location).
   - Success message: *"Export complete. 2 files saved."*

7. **Future: Re-import (verification)**
   - At a later date, user can import the data file to restore or compare networks.

### Postconditions
- Two files exist: data file and report file.
- Data file contains all entities with timestamps.
- Report file contains insights and recommendations.

### Acceptance Criteria
- [ ] Data export contains all Behaviours, Outcomes, Values, and Links with correct attributes.
- [ ] Re-importing data file recreates the exact network (verified in test).
- [ ] Summary report includes: top leverage behaviours, orphan values, conflict behaviours, suggested steps.
- [ ] Export files include timestamp and version identifier.
- [ ] User can provide custom label for export.

---

## Flow 6: Dismiss or Snooze a Validation Warning

### Goal
User dismisses or snoozes a validation warning they've acknowledged but don't want to address immediately.

### Preconditions
- Validation panel shows a warning (e.g., "Unexplained Behaviour: 'Social media scrolling'").

### Steps

1. **View warning**
   - User sees warning in validation panel.

2. **Choose action**
   - Options per warning:
     - **Fix now** — navigate to add missing links.
     - **Snooze** — hide for N days (configurable: 1, 7, 30 days).
     - **Dismiss** — hide permanently (until network changes re-trigger).

3. **Snooze example**
   - User clicks **Snooze for 7 days**.
   - Warning disappears from active list.
   - User sees toast: *"Warning snoozed until [date]."*

4. **Dismiss example**
   - User clicks **Dismiss**.
   - Warning removed from list.
   - If user later adds a link to the behaviour, the warning wouldn't have appeared anyway.
   - If user deletes the link again, warning reappears (dismiss is per-instance, not per-node).

### Postconditions
- Warning is hidden according to user's choice.
- Snoozed warnings reappear after snooze period.
- Dismissed warnings reappear if the underlying condition recurs after a change.

### Acceptance Criteria
- [ ] Snooze and Dismiss options available for each warning.
- [ ] Snoozed warnings hidden until snooze period expires.
- [ ] Dismissed warnings do not reappear unless network changes re-trigger the condition.
- [ ] User can view list of snoozed/dismissed warnings if desired.

---

## Summary: Flow Coverage

| Flow | CRUD | Why Ladder | Validation | Visualisation | Insights | Export |
|------|------|------------|------------|---------------|----------|--------|
| 1. Start from scratch | ✓ | ✓ | ✓ | ✓ | | |
| 2. Add new behaviour | ✓ | (partial) | | ✓ | | |
| 3. Review leverage | | | | ✓ | ✓ | |
| 4. Investigate conflict | ✓ | | ✓ | ✓ | ✓ | |
| 5. Export | | | | | ✓ | ✓ |
| 6. Dismiss warning | | | ✓ | | | |

---

## Glossary Reference

See [glossary.md](glossary.md) for canonical definitions.
