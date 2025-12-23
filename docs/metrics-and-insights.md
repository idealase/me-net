# Metrics & Insights — M-E Net

> **Version:** MVP  
> **Last updated:** 2025-12-23

This document defines the **analytics and insight computations** that M-E Net performs. Definitions are conceptual (not code); implementers choose algorithms that satisfy the semantics below.

---

## 1. Overview

M-E Net computes three primary insights:

| Insight | Question Answered |
|---------|-------------------|
| **Leverage** | Which behaviours most efficiently serve my values? |
| **Fragility** | Which values are at risk due to weak or sparse support? |
| **Conflict** | Which behaviours help one value while hurting another? |

These are derived from the network structure, link attributes, and node attributes.

---

## 2. Numeric Mappings

To compute scores, qualitative attributes must be mapped to numeric values. The mappings below are **fixed defaults for MVP**. User-configurable thresholds are deferred to v1.

### 2.1 Link Reliability (Behaviour → Outcome)

| Reliability | Numeric Value |
|-------------|---------------|
| Always | 1.0 |
| Usually | 0.75 |
| Sometimes | 0.5 |
| Rarely | 0.25 |

### 2.2 Link Strength (Outcome → Value)

| Strength | Numeric Value |
|----------|---------------|
| Strong | 1.0 |
| Moderate | 0.6 |
| Weak | 0.3 |

### 2.3 Link Valence

| Valence | Multiplier |
|---------|------------|
| Positive | +1 |
| Negative | −1 |

### 2.4 Behaviour Cost

| Cost | Numeric Value |
|------|---------------|
| Trivial | 1 |
| Low | 2 |
| Medium | 4 |
| High | 8 |
| Very High | 16 |

(Lower cost = more efficient; cost is used as a divisor or penalty.)

### 2.5 Value Importance

| Importance | Numeric Value |
|------------|---------------|
| Critical | 4 |
| High | 3 |
| Medium | 2 |
| Low | 1 |

### 2.6 Value Neglect

| Neglect | Numeric Value |
|---------|---------------|
| Severely neglected | 4 |
| Somewhat neglected | 3 |
| Adequately met | 2 |
| Well satisfied | 1 |

---

## 3. Leverage Score

### 3.1 Purpose

Identify behaviours that deliver the most positive value per unit cost.

### 3.2 Conceptual Formula

For each **Behaviour B**, compute:

$$
\text{Leverage}(B) = \frac{\text{TotalInfluence}(B)}{\text{Cost}(B)}
$$

Where:

$$
\text{TotalInfluence}(B) = \sum_{V \in \text{Values}} \text{Influence}(B, V) \times \text{Importance}(V)
$$

And **Influence(B, V)** is the sum of path contributions from B to V:

$$
\text{Influence}(B, V) = \sum_{\text{paths } B \to O \to V} \text{Valence}_{B \to O} \times \text{Reliability}_{B \to O} \times \text{Valence}_{O \to V} \times \text{Strength}_{O \to V}
$$

### 3.3 Interpretation

- **High leverage:** Behaviour efficiently supports important values.
- **Low leverage:** Behaviour is costly relative to value delivered, or supports unimportant values.
- **Negative leverage:** Behaviour causes net harm (negative influence outweighs positive).

### 3.4 Example Calculation

**Network:**
- Behaviour: `30-min walk` (cost: low = 2)
- Outcomes: `Reduced anxiety`, `Better sleep`
- Values: `Peace of mind` (importance: high = 3), `Health` (importance: critical = 4), `Energy` (importance: high = 3)
- Links:
  - walk → Reduced anxiety: positive, usually (0.75)
  - walk → Better sleep: positive, usually (0.75)
  - Reduced anxiety → Peace of mind: positive, strong (1.0)
  - Reduced anxiety → Health: positive, moderate (0.6)
  - Better sleep → Health: positive, strong (1.0)
  - Better sleep → Energy: positive, strong (1.0)

**Path contributions:**

| Path | Calculation | Value |
|------|-------------|-------|
| walk → anxiety → Peace of mind | 1 × 0.75 × 1 × 1.0 × 3 | 2.25 |
| walk → anxiety → Health | 1 × 0.75 × 1 × 0.6 × 4 | 1.8 |
| walk → sleep → Health | 1 × 0.75 × 1 × 1.0 × 4 | 3.0 |
| walk → sleep → Energy | 1 × 0.75 × 1 × 1.0 × 3 | 2.25 |

**Total Influence:** 2.25 + 1.8 + 3.0 + 2.25 = **9.3**

**Leverage:** 9.3 / 2 = **4.65**

### 3.5 Display

- Show ranked list of behaviours by leverage score.
- For each behaviour, show:
  - Leverage score (absolute or normalised).
  - **Explanation:** "Supports Values: Peace of mind, Health, Energy via Outcomes: Reduced anxiety, Better sleep."
  - Cost (for context).

---

## 4. Coverage

### 4.1 Purpose

Count how many distinct values a behaviour reaches (breadth of impact).

### 4.2 Definition

$$
\text{Coverage}(B) = |\{ V : V \text{ is reachable from } B \text{ via positive paths} \}|
$$

Negative-only paths are excluded (or counted separately as "harm coverage").

### 4.3 Use Cases

- High coverage + high leverage = broadly beneficial behaviour.
- High coverage + low leverage = scattered effort with little impact.
- High coverage + mixed valence = complex trade-off behaviour.

---

## 5. Fragility Score

### 5.1 Purpose

Identify values that are at risk because they have weak, sparse, or unreliable support.

### 5.2 Conceptual Formula

For each **Value V**, compute:

$$
\text{Fragility}(V) = \frac{\text{Importance}(V) \times \text{Neglect}(V)}{\text{SupportStrength}(V)}
$$

Where **SupportStrength(V)** is the sum of positive influence from all behaviours:

$$
\text{SupportStrength}(V) = \sum_{B \in \text{Behaviours}} \max(0, \text{Influence}(B, V))
$$

If SupportStrength = 0 (orphan value), fragility is defined as **infinite** (or a sentinel value indicating critical fragility).

### 5.3 Interpretation

- **High fragility:** Important value with weak or narrow support; at risk if supporting behaviours fail.
- **Low fragility:** Value is well-supported by multiple strong, reliable paths.
- **Infinite fragility:** Orphan value with no support at all.

### 5.4 Example Calculation

**Value:** `Peace of mind` (importance: 3, neglect: 3)

**Support:**
- Only one path: walk → anxiety → Peace of mind (influence: 2.25)

**SupportStrength:** 2.25

**Fragility:** (3 × 3) / 2.25 = **4.0**

Compare to `Health` (importance: 4, neglect: 2) with SupportStrength from multiple paths (4.8):

**Fragility:** (4 × 2) / 4.8 = **1.67** (less fragile)

### 5.5 Display

- Show list of values sorted by fragility (highest first).
- Flag values with fragility above threshold (e.g., > 3.0) as "fragile."
- Show explanation: "This value is supported by only N behaviours / M paths."

---

## 6. Conflict Index

### 6.1 Purpose

Identify behaviours that have both significant positive and negative downstream effects.

### 6.2 Conceptual Formula

For each **Behaviour B**:

1. Compute **PositiveInfluence(B):** sum of positive path contributions.
2. Compute **NegativeInfluence(B):** sum of negative path contributions (absolute value).

$$
\text{ConflictIndex}(B) = \min(\text{PositiveInfluence}(B), \text{NegativeInfluence}(B))
$$

Alternative (geometric mean):

$$
\text{ConflictIndex}(B) = \sqrt{\text{PositiveInfluence}(B) \times \text{NegativeInfluence}(B)}
$$

### 6.3 Interpretation

- **High conflict index:** Behaviour has substantial effects in both directions; user faces a trade-off.
- **Zero conflict index:** Behaviour is purely positive or purely negative (or has no links).

### 6.4 Example Calculation

**Behaviour:** `Late-night work` (cost: high = 8)

**Positive paths:**
- work → progress → Achievement: 1 × 1.0 × 1 × 1.0 × 2 = 2.0

**Negative paths:**
- work → sleep (negative, usually): −1 × 0.75 × 1 × 1.0 × 4 = −3.0 (to Health)
- work → sleep (negative, usually): −1 × 0.75 × 1 × 1.0 × 3 = −2.25 (to Energy)

**NegativeInfluence (abs):** 3.0 + 2.25 = **5.25**

**ConflictIndex (min):** min(2.0, 5.25) = **2.0**

### 6.5 Display

- Show list of behaviours with conflict index > 0, sorted descending.
- For each:
  - Conflict index value.
  - **Explanation:** "This behaviour supports Achievement but undermines Health, Energy."
  - Breakdown of positive vs. negative contributions.

---

## 7. Derived Metrics (Summary)

| Metric | Computed For | Formula Summary | Displayed As |
|--------|--------------|-----------------|--------------|
| **Leverage** | Behaviour | TotalInfluence / Cost | Ranked list, score, explanation |
| **Coverage** | Behaviour | Count of values reached | Integer, shown in detail panel |
| **Fragility** | Value | (Importance × Neglect) / SupportStrength | Ranked list, flag if > threshold |
| **Conflict Index** | Behaviour | min(Positive, Negative) | Ranked list if > 0, explanation |

---

## 8. Thresholds & Defaults

MVP uses **fixed thresholds** (not user-configurable). User tuning deferred to v1.

| Metric | Threshold | Use |
|--------|-----------|-----|
| **High leverage** | Top 5 or top 25% (whichever is smaller) | Highlight in insights panel |
| **Fragile value** | Fragility > 3.0 | Flag with warning |
| **Conflict behaviour (Value-level)** | ConflictIndex > 0.5 | Flag with warning |
| **Conflict behaviour (Outcome-level)** | Any negative Behaviour→Outcome link | Flag with warning |

---

## 9. Edge Cases

| Case | Handling |
|------|----------|
| **Orphan value** (no incoming paths) | Fragility = ∞; flagged as orphan in validation. |
| **Unexplained behaviour** (no outgoing links) | Leverage = 0; flagged in validation. |
| **All negative links** | Leverage is negative; behaviour is net-harmful. |
| **Disconnected subgraph** | Compute metrics per connected component; display as separate clusters. |

---

## 10. Insight Report (Export)

The exported summary report includes:

### 10.1 Top Leverage Behaviours

```
Top Leverage Behaviours
========================
1. 30-min evening walk (Leverage: 4.65)
   Supports: Peace of mind, Health, Energy
   Via: Reduced anxiety, Better sleep
   Cost: low

2. Morning meditation (Leverage: 3.80)
   ...
```

### 10.2 Fragile Values

```
Fragile Values
===============
1. Peace of mind (Fragility: 4.0, Importance: high, Neglect: somewhat)
   Supported by: 1 behaviour (30-min evening walk)
   Suggestion: Consider adding more behaviours that support this value.
```

### 10.3 Conflict Behaviours

```
Conflict Behaviours
====================
1. Late-night work session (Conflict Index: 2.0)
   Positive: Achievement (+2.0)
   Negative: Health (−3.0), Energy (−2.25)
   Suggestion: Consider reducing frequency or mitigating negative effects.
```

### 10.4 Suggested Next Steps

```
Suggestions
============
- Add outcomes for behaviour "Social media scrolling" (currently unexplained).
- Link outcome "Time saved" to more values (currently only Productivity).
- Review fragile value "Peace of mind" — can you add more supporting behaviours?
```

---

## 11. Glossary Reference

See [glossary.md](glossary.md) for canonical definitions.
