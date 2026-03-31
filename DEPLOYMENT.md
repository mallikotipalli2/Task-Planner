# Deployment & Repository Process — Daily Task Planner

This document describes how the repository is organized, how to run the project locally, and how the project is deployed to Vercel. It also documents the small auto-start script used for local convenience.

## Repository

- Repo: https://github.com/mallikotipalli2/Task-Planner
- Branch: `master` (production deploys are tied to pushes to `master` via the Vercel project)

Root files of interest:
- `package.json` — scripts: `dev`, `build`, `preview`.
- `vite.config.ts` — Vite dev server configuration (`server.open: true` configured for convenience).
- `start-planner.bat` — local startup script for dev server + browser open.
- `src/` — application source (React + TypeScript + Vite).
- `index.html` — main HTML template.
- `public/` — static assets (favicon).
- `DEPLOYMENT.md` — this document.

## Local development

Prereqs:
- Node.js (recommended LTS)
- npm (bundled with Node)
- Git (for repo operations)

Install dependencies:

```powershell
cd "c:\Users\z004m0ef\source\repos\Task Planner"
npm install
```

Start the dev server (opens browser automatically due to `open: true`):

```powershell
npm run dev
# or
npx vite --port 3000 --open
```

Quick dev notes:
- The app uses TypeScript and Vite; the source is in `src/`.
- The project stores per-day tasks in `localStorage` (see `src/storage.ts`).
- Theme preference is persisted to `localStorage`.

Local helper script:
- `start-planner.bat` — starts the Vite dev server in a minimized window and opens `http://localhost:3000` in the default browser. It also checks for an existing server on port 3000 and will only open the browser if a server is running.

To test the script now:
- Double-click `start-planner.bat` in the project folder, or run it from PowerShell:

```powershell
cd "c:\Users\z004m0ef\source\repos\Task Planner"
start-planner.bat
```

To auto-launch on login, the Windows Startup shortcut was created pointing to this batch script. Remove the `DailyPlanner.lnk` file from the Startup folder to disable auto-start.

## Build (production bundle)

```powershell
npm run build
# or
npx vite build
```

The production output directory is `dist/` (Vite default). Serve locally for verification:

```powershell
npx serve dist
# or
npm run preview
```

## GitHub workflow (manual push)

1. Initialize and commit locally (already done in this repo):

```powershell
git add -A
git commit -m "Initial commit: Daily Task Planner app"
```

2. Add remote and push (example already done):

```powershell
git remote add origin https://github.com/mallikotipalli2/Task-Planner.git
git branch -M master
git push -u origin master
```

Note: This repo uses credential manager on Windows to handle authentication for pushes.

## Vercel deployment

We deployed this repository to Vercel using the following flow (also reproducible via the Vercel web UI):

1. Ensure code is pushed to GitHub at `mallikotipalli2/Task-Planner`.
2. Go to https://vercel.com/new and import the repository.
3. Vercel will auto-detect Vite and prefill build settings. Confirm these values:
   - Framework Preset: Vite
   - Root Directory: `/` (repo root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click **Deploy**. Vercel builds and publishes the app. The site URL is shown after deployment.

We also used the Vercel CLI on the local machine:

```powershell
npx vercel login
npx vercel --prod
```

If Vercel prompts about project naming or repository linking, set a project name using a lowercase hyphenated name (no spaces) (e.g. `task-planner`). Example CLI flow used earlier:

```powershell
npx vercel --yes --prod --name task-planner
```

Vercel created a project and linked it to the GitHub repository; future pushes to `master` will trigger automatic deploys.

### Custom domain / alias

Vercel supports adding custom domains in the project Settings → Domains. After adding a domain, follow DNS instructions provided by Vercel.

## CI / Auto-deploy

- Connect the GitHub repo to Vercel via Vercel’s Git integration — this enables automatic deploys on every push.
- Pull requests and preview deploys are supported automatically by Vercel.

## Environment variables

This app currently has no server-side environment variables. If you add secrets (for analytics, third-party APIs, etc.), add them in the Vercel dashboard under Project Settings → Environment Variables.

## Troubleshooting

- If `npm install` fails, delete `node_modules` and `package-lock.json` and re-run `npm install`.
- If `npx vercel` reports auth issues, run `npx vercel login` and follow the device flow.
- If browser doesn’t open on `npm run dev`, confirm `vite.config.ts` contains `server.open: true`.

## Rollback

- To roll back a Vercel deployment, use the Vercel dashboard to re-deploy a previous build or push a new commit to `master`.

## Security & Data

- User data (tasks) is stored locally in the browser (`localStorage`) per-day — there is no backend storage.
- The repository is public to enable easy Vercel linking. If you need to keep it private, set repository visibility to private and ensure Vercel access is configured accordingly.

## Files changed/added during setup
- `DEPLOYMENT.md` — this tech doc (added)
- `start-planner.bat` — local dev auto-start script (added)
- `workspace` was pushed to GitHub and linked to Vercel

---

If you'd like, I can:
- Add a short `README.md` based on this doc,
- Add a GitHub Action to run type-checks on PRs,
- Or configure a custom domain in your Vercel project.

