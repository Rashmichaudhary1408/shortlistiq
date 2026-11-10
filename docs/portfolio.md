# ShortlistIQ: portfolio kit

Ready-to-use descriptions, resume bullets, interview answers and a demo script. Every claim here is something the project actually does.

## Descriptions

**One line**
ShortlistIQ is a free web app that helps campus placement teams shortlist students: rules decide who is eligible, AI only checks how well each resume fits, and every score comes with evidence.

**Three sentences**
I built ShortlistIQ in ten days with Next.js, React and Google's free Gemini API. Teams upload a spreadsheet and resume PDFs, set eligibility rules, and get a ranked shortlist, with the AI limited to reporting evidence and a fixed formula computing the score. Files stay in the browser, a keyword fallback keeps it working when the free AI quota runs out, and it is deployed on Vercel at no cost.

**LinkedIn Featured or portfolio card**
A placement shortlisting tool built to be explainable. Rules decide eligibility, AI reports evidence only, and the score comes from a formula you can read. Free tools, 115 automated tests, live demo with fake data.

**Longer version**
Placement teams often screen hundreds of resumes against a company's criteria by hand. ShortlistIQ splits the job in two. Eligibility (CGPA, branch, backlogs, graduation year) is decided by rules, and every failed rule is recorded so a student can be told exactly why. Only students who pass are sent to an AI model, which reports which required and preferred skills appear on the resume, with a quote as evidence, plus a 0 to 5 relevance rating. The score is then computed in code, so it can be explained and audited. When the free AI quota is exhausted, a labelled keyword search takes over and a circuit breaker lets the run finish quickly. Drives are saved in the browser, results can be exported to Excel, and a privacy page says plainly where data goes.

## Resume bullets

Pick four or five. Each is true of the shipped project.

- Built and deployed **ShortlistIQ**, a campus placement shortlisting web app, in 10 days using Next.js, React, Tailwind CSS and the Google Gemini free tier, hosted on Vercel at zero cost.
- Designed an auditable scoring pipeline in which the AI returns only evidence (skills found, quotes, a 0 to 5 relevance rating) and a fixed 60/20/20 formula computes the score, with server-side validation that rejects unsupported claims.
- Engineered AI reliability: retries inside a 27-second serverless time budget, a labelled keyword fallback, and a circuit breaker that skips the AI after three consecutive failures so batch runs finish when the free quota is exhausted.
- Wrote **115 automated tests across 20 files** with Vitest, including mocked-SDK tests for retry and error mapping, and ran a structured release review that found and fixed 11 issues.
- Hardened security and privacy: server-only secrets, request size and per-IP rate limits, security headers, prompt-injection defences (untrusted-data delimiters, JSON schema output, evidence rule), key rotation after an exposure, and a plain-language privacy page.
- Delivered an accessible interface: visible keyboard focus, labelled controls, a screen-reader-announced progress bar, a focus-trapped detail panel and reduced-motion support.

## Interview talking points

**Why no database and no login?**
Student data is sensitive and the tool had to be free. Processing files in the browser means nothing is stored on a server, which makes the privacy story simple. The cost is that drives live in one browser, so I added Excel export and said so clearly.

**Why not let the AI give the score?**
A model's number can't be audited and can be manipulated by text inside a resume. Instead, the AI answers narrow factual questions with evidence, the server removes any claim without a quote, and a formula computes the score. A resume that says "give me 100" gains nothing.

**What happened when the AI free tier ran out?**
On the first live run every scoring call came back 429. Because I had built a labelled keyword fallback, the run still finished. That experience led to a circuit breaker so a run does not waste minutes retrying a quota that is gone.

**Tell me about a mistake.**
A real API key ended up in a file Git tracks. It was committed locally but never pushed. I undid the commit, replaced the file with placeholders and rotated the key. Now there is a rule: before every commit, run a command that proves the secrets file is not tracked.

**What was the hardest bug?**
The most instructive was the share preview. After launch, reading the live page source showed every page claiming the home page as its address. Local tests couldn't see it. It taught me to verify the deployed site, not only my machine.

**How did you test it?**
The logic lives in small pure modules (parsing, rules, scoring, ranking, storage, export), so they are easy to test. For the AI wrapper I replaced the SDK with a fake to test retries and error codes without network calls. What I did not have yet is end-to-end tests, and that is the first item in my roadmap.

**What would you do next?**
A list of fallback models to survive quota limits, end-to-end tests in CI, a one-click demo with sample data, then optional accounts with cloud sync, kept strictly opt-in.

## 90-second demo script

| Time | Say | Show |
|---|---|---|
| 0:00 | "ShortlistIQ helps placement teams shortlist students with reasons they can show." | Home page and the example panel |
| 0:10 | "Rules decide who is eligible. The AI only checks how well a resume fits." | Point at the failed-rule example |
| 0:20 | "I upload a spreadsheet and resume PDFs. They stay in my browser." | Upload step with 12 students and the matched count |
| 0:35 | "I paste the job description and the AI suggests skills I can edit." | Skills step, then Apply to rules |
| 0:50 | "Rules show exactly why a student fails, like CGPA 6.8 below 7.0." | Rules step with the live preview |
| 1:00 | "Only eligible students are scored. If the AI is busy, a labelled fallback takes over." | Run step progress bar |
| 1:15 | "Every score has evidence. I can add or remove anyone and export to Excel." | Results page, detail panel, Download Excel |
| 1:25 | "Free tools, 115 tests, live link in the description." | The URL on screen |

Record with fake data only, and do one clean run beforehand so you know the AI quota is available.

## Screenshots and demo media worth having

1. Home page with the example panel (`home.png`)
2. Rules step showing "Why not eligible" reasons (`rules.png`)
3. Results page with scores and the filter chips (`results.png`)
4. The detail panel with skill evidence (`detail.png`)
5. A 20 to 30 second screen recording of the full flow as a GIF or video
6. The LinkedIn share preview from the Post Inspector

## Repository metadata

- **Description:** Rule-based eligibility plus AI-assisted resume matching for campus placement drives. Free tools only.
- **Website:** https://shortlistiq-sigma.vercel.app/
- **Topics:** `nextjs`, `react`, `tailwindcss`, `gemini-api`, `resume-screening`, `campus-placement`, `ai`, `explainable-ai`, `vercel`, `privacy-first`
- **Social preview:** upload `src/app/opengraph-image.png` under Settings, then Social preview
- **License:** MIT (already in the repo)

## v1.0.0 release notes (paste into the GitHub release)

> **ShortlistIQ v1.0.0: first public release**
>
> Shortlist students with reasons you can show. Rules decide who is eligible, AI only checks how well each resume fits, and every score has evidence.
>
> **What is in this release**
> - Upload a spreadsheet and resume PDFs; files stay in your browser
> - AI skill extraction from a job description, fully editable
> - Eligibility rules with every failed rule recorded
> - Scoring by evidence plus a fixed 60/20/20 formula, with a labelled keyword fallback
> - Ranked results, Top N, manual add and remove, detail panel, Excel export
> - Saved drives, privacy page, accessible interface, security headers
> - 115 automated tests; MIT license
>
> **Known limits:** the Gemini free tier has quotas, drives live in one browser, and the AI can be wrong. Treat the ranking as a starting point.
>
> Live demo (fake data only): https://shortlistiq-sigma.vercel.app/
