# oooo app

A standalone, local-first single-player game.

## Run locally

1. Install Node.js 22 or later.
2. Clone this repository and enter the project directory.
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Game data and saves

The game runs without user registration or login. Progress is stored in the browser's local storage using the existing key `saga_galaxy_save_v20` and version 20 save structure. Clearing browser site data will remove the local save, so export/backup support should be used if available before clearing it.

## Deployment

The `standalone-migration` branch is deployed to GitHub Pages by the workflow in `.github/workflows/deploy-pages.yml`.

## Project documentation

See the `docs/` directory for migration, dependency audit, deployment history, the Idle System V1.1 documentation, and the Character Detail V1.0 specification, player guide, and developer guide, plus the Gallery Character Detail V1.0 specification, player guide, and developer guide, the GitHub Deployment Status V1.0 specification, player guide, and developer guide, and the Equipment System V0.32 specification, player guide, and developer guide.


## v0.31 — Saga Execution Logger

- Added a unified execution logger and Debug Console for important game functions.
- Retains up to 2,000 local log records; supports Console output, Trace IDs, timing, exception details, filtering, and JSON/TXT export.
- Added execution tracing across save, game-state, battle, and battle-settlement paths. Existing game saves and combat rules are unchanged.
