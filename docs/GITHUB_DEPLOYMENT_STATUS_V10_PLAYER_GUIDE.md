# GitHub Deployment Status V1.0 — Player Guide

Open the in-game Version History. The GitHub Deployment Status card appears above the version list.

- **Current version deployed**: this exact build's commit was built and deployed successfully.
- **In progress**: GitHub Actions is still running.
- **Failed**: this build's workflow or deployment job failed.
- **Not deployed**: no run for this exact commit was found on the target branch.
- **Unknown**: build metadata is missing or GitHub cannot be reached.

The status is checked automatically when Version History opens. Tap **Refresh status** to check again. Results are briefly cached to reduce API requests. If a request fails, the previous result is retained with a warning.

A successful deployment of an older version does not mean the version currently running is deployed. Success requires an exact commit match and successful Build and Deploy Pages jobs.
