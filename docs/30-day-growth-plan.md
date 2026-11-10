# 30-day growth plan: from MVP to a much more complete ShortlistIQ

One achievable milestone per day. Each day builds on the one before. Every tool is free. Use `daily-build-prompt.md` each day, changing only the day number.

**Rules of the plan**

- One milestone per day. If a day runs long, finish the "Done when" line and stop.
- Never skip the tests. The suite stays green or the day is not done.
- Never paste a key into a chat, a screenshot or GitHub.
- Work on a branch named `growth-day-N`, then merge into `main` when the day is done.

## Week 1: reliability and a safety net

| Day | Milestone | What you do | Done when |
|---|---|---|---|
| 1 | Baseline and backlog | Record today's numbers (tests, Lighthouse scores, build size) in `docs/project-log.md`. Turn the known limits in the README into GitHub issues | The log file exists and 8 labelled issues are on GitHub |
| 2 | Automatic checks | Add a GitHub Actions workflow that runs `npm test` and `npm run build` on every push | A green check appears on `main` |
| 3 | Model fallback | Replace `GEMINI_MODEL` with an optional list `GEMINI_MODELS`; try the next model on a busy or failed call; keep the old variable working | Unit tests with a fake SDK pass, and `/api/health` names the model that answered |
| 4 | Basic-only option | Add a "Skip the AI, use Basic match" choice on the Run step | A run finishes with no AI calls and says so in the results |
| 5 | First end-to-end test | Add Playwright and test the full flow with sample data, with the AI calls faked | The test passes on your computer |
| 6 | End-to-end in CI | Run that test in GitHub Actions and keep screenshots when it fails | CI runs it in under five minutes |
| 7 | Hostile-input tests | Add sample resumes that try to change their own score, plus tests that prove the scoring and repair steps ignore such claims | New tests pass and a sample "injection" student is in the sample data |

## Week 2: product depth

| Day | Milestone | What you do | Done when |
|---|---|---|---|
| 8 | Rule presets | Save and load named rule sets in the browser | A preset applies in one click on the Rules step |
| 9 | Adjustable weights | Sliders for required, preferred and relevance weights with a live preview; stored per drive | Tests prove the weights always total 100 and the score follows them |
| 10 | Skill synonyms | Let people add their own aliases (for example "ML" for "Machine Learning") used by Basic match | A custom alias changes a Basic match result in a test |
| 11 | Notes and tags | Add a note and tags per student in the detail panel, saved with the drive and included in the Excel export | Notes survive a reload and appear in the export |
| 12 | Bulk actions | Tick several students and add or remove them together | Ten students can be changed in two clicks |
| 13 | Compare two | Pick two students and see their skills and evidence side by side | The compare view opens from the results table |
| 14 | One-click demo | A "Try with sample data" button that loads fake students into the wizard | A new visitor reaches the Run step without downloading anything |

## Week 3: trust and portability

| Day | Milestone | What you do | Done when |
|---|---|---|---|
| 15 | Backup and restore | Export all drives to one JSON file and import it back | Deleting every drive and restoring gives the same results |
| 16 | Drive templates | Duplicate a drive's skills and rules into a new drive | A cloned drive starts the wizard with those values filled |
| 17 | Print view | A clean print layout for the shortlist | The browser print preview shows only the shortlist |
| 18 | CSV export | Add a CSV export and a choice of columns | The CSV opens correctly in Excel |
| 19 | Data controls | A "Delete all my data" button and an optional "delete drives older than N days" setting | Both work and are explained on the privacy page |
| 20 | Accessibility checks | Add automatic accessibility checks to the end-to-end tests and fix what they find | The checks pass on every page |
| 21 | Phone polish | Test with real phone sizes and turn the results table into cards on small screens | Every screen is usable at 360 pixels wide |

## Week 4: reach and release

| Day | Milestone | What you do | Done when |
|---|---|---|---|
| 22 | Problem reports | A "Report a problem" link that opens a GitHub issue with safe details (no student data) | The pre-filled issue contains the app version and error code only |
| 23 | Speed pass | Measure the bundle, remove what is unused and set a Lighthouse score goal in CI | Scores meet the goal and CI checks them |
| 24 | DOCX resumes | Read Word resumes in the browser with a free library | A sample DOCX resume is scored |
| 25 | Scanned PDFs | Opt-in OCR for PDFs with no text, with a clear warning about speed | A scanned sample PDF gives readable text |
| 26 | Accounts design | Write the threat model, the data model and a decision record for optional accounts. No code today | A reviewed document is in `docs/design/` |
| 27 | Cloud database | Create a free Supabase project with a drives table and row-level security, behind a feature flag | A test user can read only their own rows |
| 28 | Sign-in and sync | Optional sign-in that syncs one drive; local-only mode stays the default | A drive saved on one device opens on another |
| 29 | Show it | Record a 90-second demo, refresh screenshots, add an architecture diagram to the README | The README shows the new features with real screenshots |
| 30 | Release v1.1.0 | Full regression pass, changelog, tag, release notes and a short write-up of the month | The tag exists, the live site matches, and next month's plan is drafted |

## If you fall behind

Drop Days 24, 25 and 26 to 28 first. They are the biggest and the least needed. Never drop Days 2, 3, 5 and 20: they are what keep the product trustworthy.
