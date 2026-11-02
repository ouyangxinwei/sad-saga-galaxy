import { readFileSync } from 'node:fs';
import { APP_VERSION, CHANGELOG } from '../src/lib/version.js';
import { LANGS } from '../src/lib/i18n.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const errors = [];
const expectedPackageVersion = APP_VERSION.replace(/^v/i, '') + '.0';
if (pkg.version !== expectedPackageVersion) errors.push('package.json version does not match APP_VERSION');
if (!CHANGELOG.length || CHANGELOG[0].version !== APP_VERSION) errors.push('Newest changelog entry must match APP_VERSION');
for (const [index, entry] of CHANGELOG.entries()) {
  if (!entry.version || !entry.title || !entry.items) errors.push('Changelog entry #' + (index + 1) + ' is incomplete');
  for (const lang of LANGS.map((item) => item.id)) {
    if (!entry.title?.[lang]?.trim()) errors.push(entry.version + ': missing ' + lang + ' title');
    if (!Array.isArray(entry.items?.[lang]) || entry.items[lang].length === 0 || entry.items[lang].some((line) => !String(line).trim())) errors.push(entry.version + ': missing or empty ' + lang + ' notes');
  }
}
if (errors.length) { console.error('Version validation failed:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log('Version validation passed: ' + APP_VERSION + '; ' + LANGS.length + ' languages; ' + CHANGELOG.length + ' release entries.');
