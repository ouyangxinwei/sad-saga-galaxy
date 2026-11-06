# Mobile Interaction and Modal Layout Optimization V10

> Branch: `standalone-migration`  
> Scope: mobile modal layering, viewport sizing, scrolling, and safe-area handling.  
> Save/gameplay scope: no save schema, save key, game rules, rewards, or battle logic changes.

## 1. Changelog (preserved history)

- **V01** — Initial migration audit and identification of the oooo integration surface.
- **V02** — Initial dependency/platform-boundary review and preliminary keep/review/remove-candidate classification.
- **V03** — Expanded static source/import review across 120 tracked `src/` files, UI wrappers, game route graph, save mechanism, and build configuration.
- **V04** — Rechecked the standalone app entry, dormant oooo auth/MFA/OAuth subsystem, User metadata, SDK/API references, and local save path. Classified removal candidates and retained game-critical local functionality.
- **V05** — Retired dormant oooo authentication/MFA/OAuth files and oooo SDK/Vite packages; removed oooo project metadata; renamed package and README to `oooo app`; replaced oooo favicon/title; reviewed seven routes and v20 save contract; added PWA manifest, custom SVG icons, scoped service-worker registration, offline navigation fallback, runtime asset caching, and bundle precaching.
- **V06** — Verified the production Actions build/deployment and reviewed seven route definitions and residual oooo integration references. Browser Console/Network and manual route interaction remained unverified.
- **V07** — Deferred real-browser v20 legacy-save read/write testing by user instruction. Existing local save key/schema and game logic were left unchanged; cloud save is a separate future design item.
- **V08** — Reviewed PWA manifest and service-worker behavior; changed favicon and manifest references to Vite's `%BASE_URL%` token; documented installation/offline test procedures and remaining real-device validation items.
- **V09** — Performed a source-level gameplay regression review of seven routes, main navigation, formation, synthesis, forge, battle simulation/rewards, settings persistence path, and responsive layout classes. Added a repeatable manual test matrix; actual browser interactions remain pending.
- **V10** — Moved shared game modals to a document-level portal to escape the AppShell stacking context and reliably layer above fixed bottom navigation; added dynamic viewport-height constraints, safe-area padding, non-shrinking header, and contained modal-body scrolling. No game logic or save behavior changed.

## 2. Issue and root cause

The shared `GameModal` was rendered inside the page content wrapper in `AppShell`. That wrapper has its own stacking context (`position: relative; z-index: 10`), while the fixed bottom navigation is a sibling with `z-index: 100`. A modal's local `z-index: 150` cannot escape its ancestor stacking context, so the navigation can paint above the modal and cover its lower controls on mobile.

## 3. Implementation

### 3.1 Modal layer

- Render the shared modal through React `createPortal(..., document.body)`.
- Set the modal overlay layer to `z-index: 200`, above the fixed bottom navigation.
- Keep the backdrop and dialog in the same top-level layer so the dialog remains interactive and the background is dimmed.

### 3.2 Mobile viewport and safe areas

- Use `100dvh` for the mobile dialog maximum height so browser chrome/viewport changes are better reflected than a fixed legacy viewport unit.
- Account for top and bottom `env(safe-area-inset-*)` values.
- Add bottom safe-area padding to the scrollable content.
- Preserve the existing desktop centered-dialog behavior and desktop maximum height.

### 3.3 Scroll and controls

- Keep the dialog as a bounded flex column with `min-h-0`.
- Keep the title/header from shrinking.
- Let only the dialog body scroll, with `overscroll-contain`.
- The daily check-in claim action remains in the dialog body and can be reached by scrolling on short screens; the modal layer is now above the fixed navigation so it is not obscured by that navigation.

## 4. Files changed

- `src/components/common/GameModal.jsx`

The shared component covers check-in/daily rewards, milestones, summon, gallery, idle rewards, patches, shop, fortune, tavern, events, and trials dialogs. No individual reward logic was modified.

## 5. Validation checklist

| Check | Expected result | Status |
|---|---|---|
| Source inspection: portal target | Dialog mounts under `document.body` | PASS (source) |
| Layer order | Modal overlay/dialog layer is above bottom navigation | PASS (source) |
| Dynamic viewport sizing | Mobile dialog uses `100dvh` with safe-area offsets | PASS (source) |
| Content scrolling | Header remains visible; body is independently scrollable | PASS (source) |
| Daily reward action | Claim control remains reachable by scrolling | PASS (source) |
| Desktop layout | Centered desktop modal classes retained | PASS (source) |
| Android real-device tap/scroll test | Claim button fully visible and clickable | NOT RUN |
| Short viewport / landscape test | No clipped controls or trapped scrolling | NOT RUN |
| iOS safe-area test | Home-indicator area does not cover content | NOT RUN |

This commit is a source implementation and static review, not a claim that real-device interaction has passed. Verify on Android Chrome at both a standard and short viewport, including opening Daily Rewards, scrolling to the claim action, tapping it, closing the dialog, and using the bottom navigation. Also check one other long dialog (Milestones or Shop) and desktop behavior.

## 6. Compatibility and preservation

- Local save key remains `saga_galaxy_save_v20`.
- Save schema remains version 20.
- No game data, rewards, battle engine, routes, or navigation destinations changed.
- No dependencies were added.
- Cloud save remains out of scope.
