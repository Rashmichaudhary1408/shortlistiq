# Contributing to ShortlistIQ

Thanks for helping. This project is small on purpose, so please keep changes focused.

## Ground rules

1. **Free only.** No paid services, and nothing that needs a paid API key.
2. **Rules decide, AI judges, a person decides.** No change may let the AI reject or rank students without a person reviewing.
3. **Keep student data in the browser** unless a person opts in to something else.
4. **Never commit secrets.** `.env.local` must stay untracked. Run `git ls-files .env.local` before you commit. It must print nothing.

## Run it locally

Follow [docs/SETUP.md](docs/SETUP.md). In short: `npm install`, copy `.env.example` to `.env.local` and fill it in, then `npm run dev`.

## Before you open a pull request

1. Create a branch from `main`.
2. Add or update tests for any logic you change. Logic lives in `src/lib/`.
3. Run `npm test` and `npm run build`. Both must pass.
4. Update the README, docs and `CHANGELOG.md` if a user or contributor would notice the change.
5. Describe what changed and how you checked it.

## Reporting a problem

Open a GitHub issue with what you did, what you expected, what happened, and any error code shown. **Do not include real student data or API keys.**
