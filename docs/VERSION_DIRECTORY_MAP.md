# Version Management — Repository Directory Map

```text
sad-saga-galaxy/
├─ src/
│  ├─ lib/
│  │  ├─ version.js                 # Legacy compatibility re-export only
│  │  └─ version/
│  │     ├─ metadata.js             # Current app/module version metadata
│  │     ├─ releases.js              # Localized release catalog (current + history)
│  │     ├─ history-audit.js         # Verified gaps/known legacy duplicates
│  │     ├─ validation.js            # Pure catalog validation rules
│  │     └─ index.js                 # Public query API
│  └─ pages/
│     └─ Settings.jsx                # Displays APP_VERSION; not a source of truth
├─ scripts/
│  ├─ validate-version.mjs           # Pre-build validation entry point
│  └─ version-management.test.mjs    # Version module automated tests
├─ public/
│  └─ sw.js                          # Independent PWA cache namespace
├─ docs/
│  ├─ VERSION_MANAGEMENT_V2.md       # System architecture and release procedure
│  ├─ VERSION_DIRECTORY_MAP.md       # This directory map
│  ├─ RELEASE_INDEX.md               # Human-readable release inventory
│  └─ releases/
│     ├─ README.md                  # Per-release record template
│     └─ V053_VERSION_MANAGEMENT_V2.md
└─ package.json                      # npm version and build/test scripts
```

## Ownership table

| Item | Authoritative location | Notes |
|---|---|---|
| Current game version | `src/lib/version/metadata.js` | Do not hard-code in UI |
| Release date | `src/lib/version/metadata.js` | Must match newest catalog entry |
| Localized release history | `src/lib/version/releases.js` | zh/ja/en required |
| Historical anomalies | `src/lib/version/history-audit.js` | Only evidence-backed exceptions |
| Lookup API | `src/lib/version/index.js` | Read-only functions |
| Build validation | `scripts/validate-version.mjs` | Runs before Vite build |
| Validation rules | `src/lib/version/validation.js` | Shared with automated tests |
| npm version | `package.json` | Must match app version |
| PWA cache | `public/sw.js` | Independent cache generation |
| Save schema | Save subsystem | Currently V20; not an app version |
| Deployment evidence | GitHub Actions | Run + build/deploy jobs + SHA |
