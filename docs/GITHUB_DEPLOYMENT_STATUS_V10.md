# GitHub Deployment Status V1.0 — Specification

Target: public repository `ouyangxinwei/sad-saga-galaxy`, branch `standalone-migration`, workflow `.github/workflows/deploy-pages.yml`, GitHub Pages.

GitHub Actions injects `VITE_GIT_COMMIT_SHA` from `github.sha` and `VITE_GIT_BRANCH` from `github.ref_name`. Local builds without metadata show Unknown. No GitHub token is embedded in the client.

Success requires a workflow run on the target branch whose `head_sha` exactly matches the running build's SHA, with the workflow completed successfully and both `build` and `deploy` jobs completed with conclusion `success`. An older commit, another branch, or build-only success never counts.

States: Success, In Progress, Failed, Not Deployed, Unknown. The status panel sits above the changelog and displays version, branch, current/deployed SHA, last check time, matching run link, and Refresh. It checks when the dialog opens and caches results in memory for 30 seconds. API errors resolve to Unknown and must never be shown as success.

Supports zh/ja/en. Preserves previous changelog entries, game saves, and save schema.
