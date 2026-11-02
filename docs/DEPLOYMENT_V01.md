# Standalone Deployment V01

## Target

- Branch: `standalone-migration`
- Hosting: GitHub Pages (GitHub Actions deployment)
- Expected URL: https://ouyangxinwei.github.io/sad-saga-galaxy/

## Changes

- Vite production base set to `/sad-saga-galaxy/`.
- Restored the `@/` source alias explicitly in Vite config; the Base44 Vite plugin previously supplied platform conveniences, and `jsconfig.json` alone does not configure Vite's runtime resolver.
- Switched React Router to `HashRouter` so direct navigation and refreshes on game subroutes work on static GitHub Pages hosting.
- Added a GitHub Actions workflow that builds the standalone branch and deploys the `dist/` artifact to Pages.
- Workflow runs on pushes to `standalone-migration` and can also be started manually.

## Validation status

- Configuration and workflow files committed to the standalone branch.
- Production build and published URL must be verified from the GitHub Actions run after the workflow executes.
- No dependency cleanup was performed. The original game logic and local save key/schema were not intentionally changed.

## Changelog

- V01: Initial GitHub Pages deployment configuration for the standalone migration branch.
