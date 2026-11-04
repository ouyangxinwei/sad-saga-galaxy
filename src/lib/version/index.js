// Public API for the standalone Version Management module.
export { APP_VERSION, RELEASE_DATE, RELEASE_CHANNEL, VERSION_SYSTEM_VERSION } from './metadata.js';
export { CHANGELOG } from './releases.js';
export { VERSION_HISTORY_AUDIT } from './history-audit.js';

import { APP_VERSION, RELEASE_DATE, RELEASE_CHANNEL, VERSION_SYSTEM_VERSION } from './metadata.js';
import { CHANGELOG } from './releases.js';

export const CURRENT_RELEASE = CHANGELOG.find((entry) => entry.version === APP_VERSION) ?? null;

export function getReleaseByVersion(version) {
  return CHANGELOG.find((entry) => entry.version.toLowerCase() === String(version ?? '').toLowerCase()) ?? null;
}

export function getReleaseNotes(version, language = 'zh') {
  const release = getReleaseByVersion(version);
  if (!release) return null;
  return {
    version: release.version,
    date: release.date ?? null,
    title: release.title?.[language] ?? release.title?.zh ?? '',
    items: release.items?.[language] ?? release.items?.zh ?? [],
  };
}

export function getVersionOverview() {
  return {
    version: APP_VERSION,
    releaseDate: RELEASE_DATE,
    channel: RELEASE_CHANNEL,
    versionSystem: VERSION_SYSTEM_VERSION,
    releaseCount: CHANGELOG.length,
    currentRelease: CURRENT_RELEASE,
  };
}
