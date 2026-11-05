// Explicit record of known legacy release-catalog gaps and duplicates. This audit documents uncertainty; it must not be used to invent missing release notes.
// Historical catalog audit. These are known legacy data issues, not guessed releases.
export const VERSION_HISTORY_AUDIT = Object.freeze({
  firstDocumentedVersion: 'v0.18',
  undocumentedRange: { from: 'v0.01', to: 'v0.17' },
  missingVersions: ['v0.28'],
  knownDuplicateVersions: ['v0.29'],
  note: 'The current catalog preserves available records. Earlier releases must only be reconstructed from verifiable Git history or original release artifacts.',
});
