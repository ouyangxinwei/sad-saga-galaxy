import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_VERSION, RELEASE_DATE, CHANGELOG, VERSION_HISTORY_AUDIT, getReleaseByVersion, getReleaseNotes, getVersionOverview } from '../src/lib/version/index.js';
import { validateVersionCatalog } from '../src/lib/version/validation.js';

const languages = ['zh', 'ja', 'en'];
const validEntry = (version = 'v0.2') => ({
  version, date: '2026-01-01',
  title: { zh: '标题', ja: 'タイトル', en: 'Title' },
  items: { zh: ['内容'], ja: ['内容'], en: ['Notes'] },
});

test('current release metadata and public lookup API are consistent', () => {
  assert.equal(APP_VERSION, 'v0.56');
  assert.equal(RELEASE_DATE, '2026-11-04');
  assert.equal(getReleaseByVersion('v0.56')?.version, 'v0.56');
  assert.equal(getReleaseByVersion(APP_VERSION)?.version, APP_VERSION);
  assert.equal(getReleaseNotes(APP_VERSION, 'en')?.items.length > 0, true);
  assert.equal(getVersionOverview().version, APP_VERSION);
  assert.equal(getVersionOverview().versionSystem, '2.0.0');
  assert.equal(VERSION_HISTORY_AUDIT.knownDuplicateVersions.includes('v0.29'), true);
});

test('validator accepts a valid catalog', () => {
  const result = validateVersionCatalog({
    appVersion: 'v0.2', releaseDate: '2026-01-01', packageVersion: '0.2.0',
    changelog: [validEntry('v0.2'), validEntry('v0.1')], supportedLanguages: languages,
    cacheName: 'oooo-app-shell-v35',
  });
  assert.equal(result.valid, true);
});

test('validator rejects package mismatch, missing translation, and unexpected duplicates', () => {
  const bad = validEntry('v0.2');
  bad.title.en = '';
  const result = validateVersionCatalog({
    appVersion: 'v0.2', releaseDate: '2026-01-01', packageVersion: '0.1.0',
    changelog: [bad, validEntry('v0.2')], supportedLanguages: languages,
    cacheName: 'oooo-app-shell-v35',
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /package.json version/);
  assert.match(result.errors.join('\n'), /duplicate release version/);
  assert.match(result.errors.join('\n'), /missing en title/);
});

test('validator rejects incorrect order and unknown historical gaps', () => {
  const result = validateVersionCatalog({
    appVersion: 'v0.3', releaseDate: '2026-01-01', packageVersion: '0.3.0',
    changelog: [validEntry('v0.3'), validEntry('v0.1')], supportedLanguages: languages,
    cacheName: 'oooo-app-shell-v35',
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /Unexpected missing release version/);
});

test('legacy v0.29 duplicate and v0.28 gap remain explicit audit warnings', () => {
  const result = validateVersionCatalog({
    appVersion: APP_VERSION, releaseDate: RELEASE_DATE, packageVersion: '0.56.0',
    changelog: CHANGELOG, supportedLanguages: languages, cacheName: 'oooo-app-shell-v36',
    knownDuplicateVersions: VERSION_HISTORY_AUDIT.knownDuplicateVersions,
    knownMissingVersions: VERSION_HISTORY_AUDIT.missingVersions,
    firstDocumentedVersion: VERSION_HISTORY_AUDIT.firstDocumentedVersion,
  });
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.equal(result.warnings.some((warning) => warning.includes('v0.28')), true);
  assert.equal(result.warnings.some((warning) => warning.includes('v0.01–v0.17')), true);
});
