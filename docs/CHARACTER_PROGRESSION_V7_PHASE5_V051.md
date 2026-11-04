# V7 Phase 5 — Save Export & Safe Restore (V0.51)

## Scope
- Export the complete local game state as a versioned JSON file.
- Restore from the exported envelope or a supported legacy raw save JSON.
- Preview app version, save schema, owned character count/copies, resources, and progression before restore.
- Require an explicit second confirmation.
- Validate and migrate fully before writing the current local save. Invalid files, unsupported future schemas, and storage write failures leave the current save untouched.

## Format
The export envelope contains \`format\`, \`formatVersion\`, \`appVersion\`, \`saveSchemaVersion\`, \`exportedAt\`, and the complete \`save\` object. The internal save schema remains version 20; the application release is V0.51.

## Compatibility
Supported raw legacy saves must contain a numeric save \`version\` from 1 through 20, a \`cards\` object, a \`progress\` object, and numeric \`level\` and \`gold\`. Existing equipment and character progression normalization runs before preview and restore. Future save schema versions are rejected.

## Safety
Validation and normalization happen before the single localStorage key is replaced. localStorage writes are atomic for that key. The current save is not mutated for parse, validation, migration, unsupported-version, or write errors.

## Verification
Run \`npm run test:equipment\` and \`npm run build\`. Automated tests cover export metadata, legacy v20 compatibility, character progression preservation, malformed JSON, malformed structures, unsupported future versions, successful restore, and storage write failure.
