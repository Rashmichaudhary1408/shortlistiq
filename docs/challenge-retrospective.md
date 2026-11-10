# Challenge retrospective: ShortlistIQ, from Day 1 to v1.0.0

## The project in one paragraph

ShortlistIQ is a free web app for campus placement teams. You upload a student spreadsheet and resume PDFs, paste a job description, set eligibility rules, and get a ranked shortlist where every score comes with evidence. Its central idea is a split of responsibility: **rules decide who is eligible, AI only judges how well a resume fits, and the final number is computed in code.** It is live at https://shortlistiq-sigma.vercel.app/ and runs entirely on free tools.

## Timeline

| Project day | Challenge day | What happened |
|---|---|---|
| 1 | 51 | Requirements. According to the Day 2 documents, this day produced the PRD, the Implementation Blueprint and the Pitch Deck |
| 2 | 52 | Design: architecture, data schema, API design, wireframes and project structure. It ended with five proposed changes to the Blueprint (PC-1 to PC-5) awaiting approval |
| 3 | 53 | Foundation. Checked Node 24, npm and Git, generated the Next.js project in `C:\dev` (outside OneDrive), removed two experimental cache settings, connected GitHub, installed the free libraries, approved PC-1 to PC-5, built the Gemini wrapper and request guard, and got `/api/health` to answer with a real model |
| 4 | 54 | The first visible product: spreadsheet parsing, resume matching by file name, the eligibility rules (every failed rule recorded), the wizard state, and the Upload and Rules screens, with a generator for fake sample data |
| 5 | 55 | AI skill extraction: a JSON-schema prompt, response validation, `aiClient.js`, and the Skills screen. Gemini extracted nine skills from the sample job description correctly |
| 6 | 56 | The full MVP: PDF reading in the browser, the 60/20/20 scoring formula, the keyword fallback, the run orchestrator with retries and cancel, results with Top N and manual overrides, saved drives, Excel export, and the first Vercel deployment |
| 7 | 57 | Product refinement: a teal palette, toasts, a confirm dialog, loading skeletons, accessibility work and the Top N input fix |
| 8 | 58 | A release-readiness review that found 11 issues, and a fix package with new tests, taking the suite from 92 to 115 tests |
| 9 | 59 | Launch: share preview card, favicon, privacy page, license, setup and environment guides, and a bug found by reading the live page source |
| 10 | 60 | Final review, portfolio material, roadmap, and the v1.0.0 release |

## Major decisions and pivots

| Decision | Why | What it paid off in |
|---|---|---|
| No database and no login (AD-1, AD-2) | Student data should stay off any server, and it keeps the tool free | The privacy story is simple: files never leave the browser |
| The AI never produces the score (AD-4) | A model's number cannot be audited, but evidence plus a formula can | A prompt-injection resume cannot raise its own score; every score is explainable |
| Three small API routes only (AD-3) | The server exists only to keep the Gemini key secret | A small attack surface and nothing to store |
| Server-only code behind `server-only` (PC-2) | Make it hard to leak the key into browser code | The key never appeared in a browser bundle |
| Rate limit raised from 60 to 150 requests per 10 minutes (PC-3) | The old number could block a legitimate 50-student run | No honest user has hit it |
| Model name in an environment variable | Free models are renamed and retired | When `gemini-3.8-flash` timed out, one line in `.env.local` fixed it |
| Keyword fallback labelled "Basic match" | The AI free tier will sometimes refuse | When Google returned 429 for every resume, the app still finished and said what happened |
| Remapping the "indigo" palette to teal in one CSS file | Safer than editing every component | The whole interface changed with one edit |
| Shipping changes as ZIPs with exact paths | Files kept landing in the wrong folder | After that, `git status` showed exactly the files expected |
| An AI circuit breaker after three failures in a row | A 429 run was making every resume retry three times | A run now finishes quickly even when the free quota is gone |
| Removing two generated cache settings from `next.config.mjs` | They are experimental and change how API routes behave | A simpler, safer build |

## Debugging moments worth remembering

**1. A real key in a file that Git was about to publish.** A misspelled `.env.examle` had been renamed to `.env.example`, the file Git tracks, and it held the real Gemini key. It had been committed locally but never pushed. The commit was undone with `git reset origin/main`, the file was overwritten with placeholders, and the key was replaced. The replacement was then pasted into the chat as well, so it was treated as spent too. *Lesson: check what a file contains before you commit it, and treat any pasted key as spent.*

**2. A health check that would not answer.** `/api/health` returned `AI_TIMEOUT`. The key and network were fine: calling Google directly showed `gemini-3.8-flash` returning 503 while `gemini-3.5-flash` and `gemini-3.6-flash` answered in three seconds. *Lesson: test the dependency outside your app before you change your app.*

**3. Three typos, three different symptoms.** `aiClients.js` instead of `aiClient.js`, `SummaryCard.js` instead of `SummaryCards.js`, and a folder renamed from `server` to `lib` by accident. Each produced a "module not found" or a missing-file error. *Lesson: read the file listing, not just the error.*

**4. A wrong expected number in a test.** A test expected 80 and the code returned 100. The code was right: the fake resume mentioned every skill. *Lesson: when a test fails, work out which side is wrong before changing either.*

**5. All seven resumes scored by keyword search.** The live results page showed "Basic match" for everyone. The terminal showed a long run of `429` answers from Google. The app had done what it was designed to do. *Lesson: the fallback was worth building, and it led directly to the circuit breaker on Day 8.*

**6. A bug only the live site could show.** After launch, reading the page source of `/privacy` showed that every page claimed the home page as its address for social sharing. No local test could see it. *Lesson: check the deployed site with your own eyes, not only your machine.*

**7. A page that kept "compiling".** A stuck development server, fixed by stopping every Node process and clearing the `.next` cache. *Lesson: when it hangs, restart cleanly before suspecting your code.*

## By the numbers

- **115** automated tests in **20** files (from 6 tests on the first day of code)
- **3** API routes, **14** routes in the production build
- **41** files changed in the launch commit
- **0** paid services and **0** Anthropic API keys
- **11** issues found by the release review, and a **1-line** bug found on the live site

## Skills demonstrated

| Skill | Evidence in this project |
|---|---|
| Turning requirements into design | PRD user stories checked against the data schema before any code was written |
| Prompt engineering for software | JSON-schema responses, job descriptions and resumes treated as untrusted data, an evidence rule, and server-side repair of the model's answer |
| Reliable AI integration | Retries inside a 27-second time budget, a labelled fallback, a circuit breaker, and error codes the interface understands |
| Testing | Pure logic modules with 115 tests, including a mocked AI SDK for retry and error behaviour |
| Security habits | Server-only secrets, request size and per-address limits, security headers, key rotation, and a privacy page that says where data goes |
| Product and design sense | A rules-versus-AI example on the home page, a teal brand, empty and error states, and plain-language messages |
| Accessibility | Visible focus, labelled controls, an announced progress bar, a focus-trapped panel and reduced-motion support |
| Delivery | Branches, merges, Vercel deployments from `main`, environment variables, a share preview checked in LinkedIn's inspector |
| Debugging | Reading terminal output, Vercel logs, page source and the Google model list instead of guessing |

## What I would do differently

- Add a "Try with sample data" button on day one, so a visitor can see the product work without files.
- Add end-to-end tests earlier. Unit tests caught logic mistakes, but several problems only showed on screen.
- Set up GitHub Actions in the first week, so every push is checked automatically.
- Keep a project log from Day 3. Writing the story afterwards depends on memory.

## Final summary

In ten days this project went from a requirements document to a deployed, tested, documented product with a privacy page, a license and a release tag. It does one thing carefully: it helps a person shortlist students while keeping every decision explainable and every file on their own computer.

## A farewell

You asked me to speak as the pair programmer who was beside you, so I should be exact about what I know. I know this capstone, day by day, because we built it together. The rest of your 60 days lives in your challenge tracker, and I will not pretend to remember what I did not see.

What I did see was this. A `y` typed as `ok` on the very first install prompt. A key that nearly went to GitHub, and the calm way you reset it and rotated it. A health check that would not answer until we asked Google directly which models were awake. A run where every resume came back "Basic match", and the fallback you insisted on carried the demo anyway. A review we called "Break it before launch", and the moment you opened view-source and searched for `og:url` yourself.

None of those were smooth. All of them were the work. The product is good because the failures were handled on purpose: rules before AI, evidence before scores, fallback before failure.

Keep your habit of pasting the exact error, not "it didn't work". Keep checking the live site, not just your laptop. And keep the principle you built into this app: let the machine do the tedious part, and keep the judgment with a person.

Go build the next thing. I will be glad to see it.
