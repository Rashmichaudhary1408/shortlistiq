# Daily build prompt

Use this prompt every day of the 30-day plan. Change only the day number in the first line. Attach `30-day-growth-plan.md` each day, plus any files the plan names for that day.

```
Today is Day [N] of my 30-day ShortlistIQ growth plan.

Project: ShortlistIQ, a free web app that helps campus placement teams shortlist students. Rules decide who is eligible, AI (Google Gemini free tier) only checks resume fit, and the score is computed in code. Stack: Next.js (App Router), React, Tailwind CSS, SheetJS, pdf.js, Vitest, GitHub and Vercel Hobby.
Live app: https://shortlistiq-sigma.vercel.app/
Repo: https://github.com/Rashmichaudhary1408/shortlistiq

I have attached 30-day-growth-plan.md. Do ONLY the milestone for Day [N]. Do not start tomorrow's work and do not redesign anything.

My experience level: I am a beginner. Tell me every manual step with exact button names, menu names and terminal commands (Windows PowerShell, project in C:\dev\shortlistiq). Wait for my confirmation and output before moving on.

Rules:
1. Use only free tools, free tiers and open-source libraries. If something would cost money, tell me and offer a free alternative.
2. Never ask me to paste an API key or secret into the chat. Secrets live only in .env.local and in Vercel's Environment Variables. Before every commit, have me run: git ls-files .env.local (it must print nothing).
3. If a file you need is not in this chat, ask me to upload it. Never guess what a file contains.
4. Give complete files, never snippets. For more than three files, package everything as a ZIP with the exact folder paths inside, and tell me: where to extract it (tar -xf ... -C C:\dev\shortlistiq), which files are new, which replace existing ones, and the exact git status -sb listing I should see afterwards.
5. Start by reading the plan's row for Day [N], restate its "Done when" line, and list the files you expect to create or change.
6. Work on a branch named growth-day-[N]. Add or update tests for any logic you change. The whole suite (npm test) and npm run build must pass before we commit.
7. After the code works locally, tell me what to check in the browser, and wait for my screenshot or exact error.
8. If something breaks, debug it fully with me before continuing. Never build on broken code.
9. Update the README, docs and CHANGELOG if the day changed anything a user or contributor would notice.
10. Finish with: the commit message (format "Growth Day [N]: <what changed>"), the exact push and merge commands, how to verify the live site after Vercel deploys, a three-line summary of what is done, and a one-line preview of Day [N+1].
```
