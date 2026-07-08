# Claims Register — AI Stock Assist (WO-ASA-002.17)

Single source of truth for value-proposition copy. Everything user-facing —
landing page, cards, exports, emails, Substack, directory/Product Hunt
listings, LLM prompt preambles — must conform. When in doubt, quote this file
verbatim rather than paraphrasing.

## Canonical claim

> AI Stock Assist does the hours of verification and arithmetic — currency
> normalization, single-period reconciliation, cross-consistency checks,
> threshold scoring — in seconds, so you can spend your minutes on judgment.

## Approved short forms

- "We do the checking a careful analyst would do, every time, on every ticker at once."
- "The card does the arithmetic; you make the decision."
- "Verified before scored."

## Scope boundary sentence (approved)

> The framework compresses the mechanical layer of analysis. The judgment
> layer — competitive position, strategy, whether a flagged question
> matters — stays with you.

## Explicitly prohibited framings

- "AI picks stocks" / "beats the market" / "predicts" (as a product claim)
- "guaranteed" / guarantees of any outcome (a marketing guarantee also
  requires a real fulfillment flow — see WO-ASA-002.14; the unbacked
  "100% Money-Back Guarantee" was removed Jul 9 2026)
- Superlatives about the product: "best", "most accurate", "#1"
- Urgency: "act now", "don't miss", countdowns
- Speed claims WITHOUT the verification clause. "Faster than any human"
  alone is prohibited — speed without the gates is being wrong faster.
  Speed may only be claimed alongside the gating (see canonical claim).

Allowed and NOT in scope of the prohibition: computed, data-grounded
superlatives about stocks in a specific report ("highest FCF yield of the
rated set"), which come from the deterministic ranking facts — never from
free-form copywriting. At N=1 no comparative language is allowed at all
(WO-ASA-002.19); at N=2 use "of the two" phrasing.

## Enforcement

1. LLM prompts (Bottom Line, comparative, single-stock summary) carry these
   rules as hard constraints — see `_CLAIMS_GUARDRAILS` in
   `ai-stock-render/api/lib/ai_service.py`. A register document alone does
   not constrain a model; bind in prompt.
2. `npm run check:claims` greps the marketing surfaces for prohibited terms
   (scripts/check-claims.mjs). Run before shipping copy changes.
3. The report QA gate blocks single-stock reports containing comparative
   language, and blocks recommendation/avoid self-contradictions.

## MVQ / framework-comparison additions (from Metrics-Guide-MVQ-Addendum)

- PROHIBITED: "superior", "beats Graham", "outperforms", "better results",
  any predictive framing for MVQ or any framework.
- APPROVED: "modernized", "evidence-tested", "principles retained,
  measurements updated", "we publish the test, win or lose".
- Compare-mode positioning: sell time and transparency, never outcome
  superiority. Approved framing: "what takes an analyst hours per ticker,
  the card does in seconds — and shows its arithmetic."
- Framework display names: "Growth & Quality" and "Graham Classic" (the wire
  value 'Graham Value Investing' is an API contract and never changes).

## Sweep log

- 2026-07-09: `src/components/Payments.tsx:152` — removed "100% Money-Back
  Guarantee" (no fulfillment flow; WO-ASA-002.14). Remaining surfaces clean:
  MarketingLanding FAQ and Footer use "not predictions" / "does not
  guarantee" as *disclaimers*, which are compliant.
