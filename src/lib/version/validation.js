// Read-only catalog validator: checks version/date/semver alignment, newest-first ordering, localized note completeness, known history gaps, and explicit Service Worker cache versioning.
const VERSION_PATTERN = /^v0\.\d+$/;
const PACKAGE_PATTERN = /^\d+\.\d+\.\d+$/;

function versionNumber(value) {
  const match = String(value ?? '').match(/^v0\.(\d+)$/);
  return match ? Number(match[1]) : null;
}

export function validateVersionCatalog({
  appVersion,
  releaseDate,
  packageVersion,
  changelog,
  supportedLanguages,
  cacheName,
  knownDuplicateVersions = [],
  knownMissingVersions = [],
  firstDocumentedVersion = 'v0.01',
}) {
  const errors = [];
  const warnings = [];
  const seen = new Set();
  const duplicates = new Set();
  const missing = [];

  if (!VERSION_PATTERN.test(appVersion ?? '')) errors.push('APP_VERSION must use the v0.NN format');
  if (!PACKAGE_PATTERN.test(packageVersion ?? '')) errors.push('package.json version must be valid semver');
  const expectedPackageVersion = String(appVersion ?? '').replace(/^v/i, '') + '.0';
  if (packageVersion !== expectedPackageVersion) errors.push('package.json version does not match APP_VERSION');
  if (!Array.isArray(changelog) || changelog.length === 0) errors.push('Release catalog must not be empty');

  const current = Array.isArray(changelog) ? changelog[0] : null;
  if (current?.version !== appVersion) errors.push('Newest changelog entry must match APP_VERSION');
  if (current?.date !== releaseDate) errors.push('RELEASE_DATE must match the newest release date');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate ?? '')) errors.push('RELEASE_DATE must use YYYY-MM-DD');

  const allowedDuplicates = new Set(knownDuplicateVersions);
  let previousNumber = Infinity;
  for (const [index, entry] of (Array.isArray(changelog) ? changelog : []).entries()) {
    const label = entry?.version || 'entry #' + (index + 1);
    const numeric = versionNumber(entry?.version);
    if (numeric === null) errors.push(label + ': invalid release version format');
    if (seen.has(entry?.version)) {
      duplicates.add(entry.version);
      if (!allowedDuplicates.has(entry.version)) errors.push(label + ': duplicate release version');
    }
    seen.add(entry?.version);
    if (numeric !== null && numeric > previousNumber) errors.push(label + ': release catalog must be newest-first');
    if (numeric !== null) previousNumber = numeric;

    if (index === 0 && !entry?.date) errors.push(label + ': current release date is required');
    if (entry?.date && !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) errors.push(label + ': date must use YYYY-MM-DD');
    if (!entry?.title || !entry?.items) errors.push(label + ': release title or notes are missing');
    for (const language of supportedLanguages) {
      if (!entry?.title?.[language]?.trim()) errors.push(label + ': missing ' + language + ' title');
      const notes = entry?.items?.[language];
      if (!Array.isArray(notes) || notes.length === 0 || notes.some((line) => !String(line).trim())) {
        errors.push(label + ': missing or empty ' + language + ' notes');
      }
    }
  }

  const numbers = [...new Set((Array.isArray(changelog) ? changelog : []).map((entry) => versionNumber(entry?.version)).filter(Number.isFinite))].sort((a, b) => a - b);
  if (numbers.length > 1) {
    for (let n = numbers[0]; n <= numbers[numbers.length - 1]; n += 1) {
      if (!numbers.includes(n)) missing.push('v0.' + String(n).padStart(2, '0'));
    }
  }
  const knownMissing = new Set(knownMissingVersions);
  for (const version of missing) {
    if (!knownMissing.has(version)) errors.push('Unexpected missing release version: ' + version);
  }
  if (duplicates.size) warnings.push('Known legacy duplicate labels: ' + [...duplicates].join(', '));
  if (missing.length) warnings.push('Known historical gaps: ' + missing.join(', '));
  if (firstDocumentedVersion === 'v0.18') warnings.push('Earlier release records v0.01–v0.17 are not present in the current catalog and require source-history verification.');
  if (!cacheName || !/v\d+$/.test(cacheName)) errors.push('Service Worker cache name must end with an explicit version token');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      appVersion,
      packageVersion,
      releaseCount: Array.isArray(changelog) ? changelog.length : 0,
      supportedLanguages: supportedLanguages.length,
      duplicateVersions: [...duplicates],
      missingVersions: missing,
      cacheName,
    },
  };
}
