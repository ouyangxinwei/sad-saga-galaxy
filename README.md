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

See the `docs/` directory for migration, dependency audit, and deployment history.
