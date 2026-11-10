# ShortlistIQ: future scope

Where this project could go over the next 3, 6 and 12 months. Everything here builds on how v1.0.0 already works and on the limits it already has.

## Principles that stay fixed

1. **Rules decide who is eligible. AI judges fit. A person decides.** No change below may let the AI reject anyone on its own.
2. **Free first.** Every step should work on free tiers, and paid options should only ever be optional.
3. **Privacy by architecture.** Resumes stay in the browser unless a person opts in to something else.
4. **Degrade, never crash.** Every new dependency needs a defined failure path, like Basic match has today.

## Next 3 months: make v1.0 dependable

The goal is that the people who use it never get surprised.

| Theme | What to build | Why it comes first |
|---|---|---|
| Quota resilience | A list of Gemini models tried in order when one is busy; an explicit "Basic match only" option on the Run step | The biggest real failure so far was the free quota running out (HTTP 429), which turned a whole run into Basic match |
| A safety net | End-to-end tests of the full flow, automatic tests on every push through GitHub Actions, test coverage reports | 115 unit tests cover the logic, but nothing tests the screens working together |
| Abuse and injection tests | Sample resumes that contain hostile instructions, with tests proving the score cannot be changed by them | The architecture promised an injection test resume; the shipped sample data does not have one yet |
| Faster first use | A "Try with sample data" button that loads fake students into the wizard | A new visitor currently needs the sample files from the repo, so most never see the product work |
| Daily-use features | Rule presets per company, adjustable score weights, JSON backup and restore of drives | Placement teams repeat the same drives; losing browser data is the main risk |

**How I would know it worked:** zero crashes in the Vercel logs for a month, a full-flow test that passes in CI in under five minutes, and a first-time visitor reaching a ranked list in under two minutes.

## Next 6 months: make it a team tool

| Theme | What to build | Notes |
|---|---|---|
| Optional accounts and sync | Sign-in with Supabase (free tier), drives synced to the cloud with row-level security | Strictly opt-in. Local-only mode stays the default |
| Working together | A read-only shortlist link that expires, notes on students, a log of who added or removed whom | Overrides are already stored per student, so the log extends the current model |
| More resume formats | DOCX files, and scanned PDFs through in-browser OCR | Today a scanned PDF is reported "unreadable". OCR must stay opt-in and clearly warned |
| Fairness tools | A blind mode that hides names, score distributions by branch, a review of AI explanations | The prompt already forbids mentioning protected traits; this makes that checkable by a person |
| Wider access | An accessibility audit with automated checks, and a Hindi interface as a first extra language | Speculative: confirm with real users which languages matter |

## Next 12 months: make it an institution tool

| Theme | What to build | Notes |
|---|---|---|
| Institution setup | Roles (placement officer, faculty), per-institution settings, data retention controls, a bring-your-own Gemini key | A key per institution spreads the free quota instead of sharing one |
| Connections | Import from Google Sheets, an export shaped for company hiring systems, emailing a shortlist | Start with files before any live integration |
| Model independence | One interface for AI providers so another free or open model can replace Gemini | Removes the single biggest dependency |
| Governance | Bias audits with synthetic resumes, a published statement of limits, a security and privacy review | Needed before any institution relies on it for real decisions |
| Open source health | Issue templates, "good first issue" labels, a short contributor guide, a release routine | `CONTRIBUTING.md` and `CHANGELOG.md` start this |

## What I would deliberately not build

- Any mode where the AI rejects or ranks students without a person reviewing.
- Storing resumes on a server by default.
- Scoring by college prestige, name or any protected trait.
- Ads, tracking or selling data.

## Risks to watch

| Risk | Effect | Response |
|---|---|---|
| Google changes the free tier or retires models | Scoring degrades to Basic match | Model list, provider interface, clear fallback label |
| Real student data ends up in the free tier | Privacy harm, because free-tier content may be used by Google | Prominent notice (already built), bring-your-own-key, retention controls |
| One maintainer | Slow fixes | Tests, CI, documentation and a contributor guide |
| Users trust the ranking too much | Unfair outcomes | Evidence for every score, Basic match labels, "read the resume" reminders |
