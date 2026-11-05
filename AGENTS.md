# AGENTS.md

## Project Context

This repository contains the standalone Sad Saga Galaxy browser game. The production site is deployed to GitHub Pages from the `standalone-migration` branch.

Keep changes focused on the user's request and preserve existing project conventions. Do not modify the `main` branch unless the user explicitly asks.

## Local Development

- Read `README.md` for the current setup and commands.
- Install dependencies with `npm install`.
- Start the frontend with `npm run dev`.
- Create a production build with `npm run build`.
- Run the relevant tests and checks defined in `package.json` before finishing.

## Project Structure

- `src/`: frontend application source.
- `src/pages/`: game pages and route-level screens.
- `src/components/`: reusable UI and game components.
- `src/lib/` and `src/hooks/`: shared utilities, persistence, and hooks.
- `public/`: static assets and PWA resources.
- `docs/`: architecture notes, validation reports, and historical project records.
- `.github/workflows/deploy-pages.yml`: GitHub Pages build and deployment workflow.

## Runtime and Data

- The game runs as a standalone frontend; do not add hosted-backend, account, or cloud-save dependencies unless explicitly requested.
- Player progress is stored locally in the browser. Preserve the existing save key and save-data structure unless the user explicitly approves a migration.
- Preserve the existing game rules, balance values, probability calculations, and localization behavior unless the task explicitly requests changes.
- Keep Chinese, Japanese, and English localization synchronized when changing user-facing text.

## Change and Delivery Rules

- Avoid broad refactors or engine rewrites. Prefer small, reviewable changes.
- Do not remove generic image handling, UI utilities, or browser compatibility behavior merely because they originated in an earlier project setup.
- For releases, verify that the GitHub Actions build and GitHub Pages deployment both succeed before describing the version as deployed.
- Report the version, commit, workflow result, and the actual GitHub Pages URL after successful deployment.
