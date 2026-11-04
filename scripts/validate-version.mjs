import { readFileSync } from 'node:fs';
import { APP_VERSION, RELEASE_DATE, CHANGELOG, VERSION_HISTORY_AUDIT } from '../src/lib/version/index.js';
import { validateVersionCatalog } from '../src/lib/version/validation.js';
import { LANGS } from '../src/lib/i18n.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const cacheName = serviceWorker.match(/const CACHE_NAME = `([^\`]+)`;/)?.[1] ?? '';
const result = validateVersionCatalog({
  appVersion: APP_VERSION,
  releaseDate: RELEASE_DATE,
  packageVersion: pkg.version,
  changelog: CHANGELOG,
  supportedLanguages: LANGS.map((language) => language.id),
  cacheName,
  knownDuplicateVersions: VERSION_HISTORY_AUDIT.knownDuplicateVersions,
  knownMissingVersions: VERSION_HISTORY_AUDIT.missingVersions,
  firstDocumentedVersion: VERSION_HISTORY_AUDIT.firstDocumentedVersion,
});

if (!result.valid) {
  console.error('Version Management V2.0 validation failed:\n- ' + result.errors.join('\n- '));
  process.exit(1);
}
console.log('Version Management V2.0 validation passed: ' + APP_VERSION + '; ' + result.stats.releaseCount + ' records; ' + result.stats.supportedLanguages + ' languages; cache ' + cacheName + '.');
for (const warning of result.warnings) console.warn('Historical audit: ' + warning);
