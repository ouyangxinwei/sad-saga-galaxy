# Gameplay Functional Regression Review V09

> Branch: `standalone-migration`  
> Review basis: source inspection of the current branch. No game state was changed and no live browser/device interaction was performed.  
> Save/cloud scope: unchanged v20 local save only; cloud save is explicitly out of scope.

## 1. Changelog (preserved history)

- **V01** — Initial migration audit and identification of the Base44 integration surface.
- **V02** — Initial dependency/platform-boundary review and preliminary keep/review/remove-candidate classification.
- **V03** — Expanded static source/import review across 120 tracked `src/` files, UI wrappers, game route graph, save mechanism, and build configuration.
- **V04** — Rechecked the standalone app entry, dormant Base44 auth/MFA/OAuth subsystem, User metadata, SDK/API references, and local save path. Classified removal candidates and retained game-critical local functionality.
- **V05** — Retired dormant Base44 authentication/MFA/OAuth files and Base44 SDK/Vite packages; removed Base44 project metadata; renamed package and README to `oooo app`; replaced Base44 favicon/title; reviewed seven routes and v20 save contract; added PWA manifest, custom SVG icons, scoped service-worker registration, offline navigation fallback, runtime asset caching, and bundle precaching.
- **V06** — Verified the production Actions build/deployment and reviewed seven route definitions and residual Base44 integration references. Browser Console/Network and manual route interaction remained unverified.
- **V07** — Deferred real-browser v20 legacy-save read/write testing by user instruction. Existing local save key/schema and game logic were left unchanged; cloud save is a separate future design item.
- **V08** — Reviewed PWA manifest and service-worker behavior; changed favicon and manifest references to Vite's `%BASE_URL%` token; documented installation/offline test procedures and remaining real-device validation items.
- **V09** — Performed a source-level gameplay regression review of seven routes, main navigation, formation, synthesis, forge, battle simulation/rewards, settings persistence path, and responsive layout classes. Added a repeatable manual test matrix; actual browser interactions remain pending.

## 2. Seven-page route and navigation review

The application uses `HashRouter` and declares all seven page routes directly in `src/App.jsx`:

| Page | Route | Entry/navigation evidence | Source review |
|---|---|---|---|
| Home | `/` | Home root; bottom navigation | PASS |
| Stages | `/stages` | Home main menu; settings shortcut | PASS |
| Battle | `/battle?mode=...&stage=...` | Stage challenge / unlocked stage buttons | PASS |
| Formation | `/formation` | Bottom navigation and home quick-formation link | PASS |
| Synthesis | `/synthesis` | Bottom navigation and settings shortcut | PASS |
| Forge | `/forge` | Bottom navigation and settings shortcut | PASS |
| Settings | `/settings` | Bottom navigation | PASS |

The bottom navigation contains Home, Formation, Synthesis, Forge, and Settings. Stages is reached from the Home main menu and Settings shortcut. Battle is entered from Stages and intentionally hides the bottom navigation. Home menu entries for Arena and Extra are marked locked/TODO in the source; these are not missing routes in the seven-page route table.

**Runtime status:** route declarations and navigation handlers were inspected in source. Clicking every link, browser back/forward, refresh on every hash route, and mobile tap behavior have NOT been tested in a real browser.

## 3. Core game-system source review

### 3.1 Character and party formation

Source paths: `src/pages/Formation.jsx`, `src/components/home/QuickFormation.jsx`, `src/lib/GameContext.jsx`, `src/lib/cards.js`.

Reviewed behavior:

- Five party slots are rendered.
- Owned characters can be filtered by class and selected into a slot.
- Selecting a character already assigned to another slot swaps the prior slot value rather than duplicating the same ID.
- A slot can be cleared.
- Auto-best party selection and three party presets are wired to GameContext actions.
- Home quick formation exposes auto-best, three preset actions, and a link to Formation.

**Source review:** PASS.  
**Runtime cases still required:** select, swap, remove, fill all five slots, save/load each preset, refresh and confirm party persistence.

### 3.2 Synthesis

Source paths: `src/pages/Synthesis.jsx`, `src/lib/GameContext.jsx`.

Reviewed tabs and action rules:

- Cards: synthesize an unowned hero when at least 5 matching hero shards are available.
- Fuse: 3 copies of a card are consumed to create one card of the next rarity; remaining copies are retained.
- Convert: 5 enemy shards are required to convert an enemy into a custom character.
- Rebirth: action is disabled below the current level cap; the GameContext action also checks the cap before resetting level/EXP and incrementing rebirth.

**Source review:** PASS for the displayed conditions and action wiring.  
**Runtime cases still required:** below/at threshold, resource consumption, resulting card/rarity, duplicate conversion prevention, and refresh persistence.

### 3.3 Forge and equipment

Source paths: `src/pages/Forge.jsx`, `src/lib/GameContext.jsx`.

Reviewed behavior:

- Relic crafting is disabled in the UI when gems are below the relic cost; the action independently rejects insufficient gems.
- Successful crafting deducts gems and increments the owned relic count.
- Relics can be equipped to a selected party character or unequipped.
- Furnace/melting is exposed when a hero has at least 5 shards; the action consumes 5 shards and grants 150 gems.

**Source review:** PASS for action wiring and resource guards.  
**Runtime cases still required:** insufficient/sufficient gems, repeated crafting, equip/unequip, shard threshold, exact resource delta, and refresh persistence.

### 3.4 Battle, skill execution, and settlement

Source paths: `src/pages/Battle.jsx`, `src/components/battle/BattleArena.jsx`, `src/lib/battle.js`, `src/components/battle/BattleLog.jsx`, `src/lib/GameContext.jsx`.

Reviewed behavior:

- Standard battles request 6 stamina; event battles do not use that standard stamina charge.
- Locked stage entry redirects to Stages.
- Battle simulation is automatic. The engine selects a skill based on available MP, target state, and action scores; it falls back to a basic attack when no skill is selected.
- Skill/action events, damage, healing, shields, revives, deaths, and round events are rendered in the battle log.
- Battle speed can cycle through ×1, ×2, and ×3; Skip advances to the final simulation event.
- On victory, the settlement action grants stage gold/EXP/gems, updates progression (or tower/event counters), and records enemy codex/shards.
- On defeat, no victory rewards/progression are granted.
- The result screen exposes retry, next stage (where applicable), and return navigation.

**Important product behavior:** the current battle design is auto-battle. The source contains no manual player skill button in the battle screen. “技能释放” in this regression pass therefore means verifying that the automatic skill-selection engine emits skill/action events and that those events appear correctly in the battle log, not testing manual skill input.

**Source review:** PASS for the above flow wiring.  
**Runtime cases still required:** win and loss outcomes, skill variety/MP usage, skip, speed changes, retry, next stage, stamina deduction, and no duplicate settlement when the result screen re-renders.

## 4. Settings and state persistence review

Source paths: `src/pages/Settings.jsx`, `src/lib/GameContext.jsx`, `src/lib/save.js`.

Reviewed behavior:

- Language controls call `setLang`; the state update flows through the shared GameContext.
- GameContext persists every state update through `persist(state)`.
- `persist` writes to the existing `saga_galaxy_save_v20` key.
- Settings displays player level, rebirth count, and stage progress.
- Reset requires a second confirmation action and calls `resetSave`.

**Source review:** PASS for the persistence call path and confirmation UI.  
**Not tested:** actual refresh/reopen restoration, language retention, reset behavior, browser storage errors, or compatibility with a real existing v20 user save. Do not click Reset during regression testing against the user's real save.

## 5. PC and mobile layout source review

Reviewed responsive/layout patterns:

- Page containers use bounded widths and horizontal padding.
- Home changes from a single-column flow to a two-column layout at the large breakpoint.
- Formation card grid changes from four columns on small screens to six at the small breakpoint.
- Battle layout changes to a two-column arena/log arrangement at the large breakpoint; party and enemy units use constrained grids.
- Synthesis and Forge use compact two/four-column card layouts with wrapping/flex behavior.
- Bottom navigation is fixed to the viewport bottom with five equal navigation items.
- Main content reserves bottom padding for the fixed navigation on pages that show it.

**Source review:** PASS for the presence of responsive layout rules.  
**Not tested:** real viewport overflow, keyboard/focus behavior, text clipping, touch target usability, iOS safe-area behavior, landscape orientation, and actual PC/mobile rendering.

## 6. Manual regression execution matrix

Use a test copy or a fresh browser profile. Do not use Settings > Reset on the user's real profile. Record PASS/FAIL and browser/device for each case.

| ID | Test | Expected result | Execution status |
|---|---|---|---|
| NAV-01 | Open each of the seven hash routes directly | Correct page loads; no blank screen | NOT RUN |
| NAV-02 | Navigate Home → Stages → Battle → result → Stages | Correct route transitions | NOT RUN |
| NAV-03 | Use bottom navigation and browser back/forward | Correct active item and page | NOT RUN |
| FORM-01 | Assign, swap, and remove party members | Five slots update without duplicate assignment | NOT RUN |
| FORM-02 | Save and load three presets | Party composition restores | NOT RUN |
| SYN-01 | Synthesize at 4 and 5 shards | 4 blocked; 5 consumes shards and grants character | NOT RUN |
| SYN-02 | Fuse at 2 and 3 copies | 2 blocked; 3 creates next rarity and consumes copies | NOT RUN |
| SYN-03 | Convert at 4 and 5 enemy shards | 4 blocked; 5 creates converted character | NOT RUN |
| SYN-04 | Rebirth below and at level cap | Below blocked; at cap performs rebirth | NOT RUN |
| FORGE-01 | Craft with insufficient and sufficient gems | Insufficient blocked; sufficient deducts exact cost | NOT RUN |
| FORGE-02 | Equip and unequip a relic | Equipment state and displayed stats update | NOT RUN |
| FORGE-03 | Melt with 4 and 5 shards | 4 blocked; 5 converts to 150 gems | NOT RUN |
| BTL-01 | Start an unlocked standard stage | 6 stamina consumed once | NOT RUN |
| BTL-02 | Start a locked stage directly | Redirect to Stages; no battle begins | NOT RUN |
| BTL-03 | Observe battle skill/action log | Automatic skill events and effects appear | NOT RUN |
| BTL-04 | Test ×1/×2/×3 and Skip | Playback speed/skip behaves as expected | NOT RUN |
| BTL-05 | Complete a win | Correct result, rewards, progression and return/next actions | NOT RUN |
| BTL-06 | Complete a loss | Loss result; no victory reward/progression | NOT RUN |
| BTL-07 | Retry and continue to next stage | New battle starts; progression gates remain correct | NOT RUN |
| SET-01 | Change language and refresh | Selected language remains after reload | NOT RUN |
| SET-02 | Change party/resources and refresh | State is restored from v20 local save | NOT RUN |
| SET-03 | Inspect reset confirmation without confirming | Save remains unchanged | NOT RUN |
| UI-01 | Desktop at 1366×768 and 1920×1080 | No horizontal overflow or clipped core controls | NOT RUN |
| UI-02 | Mobile at 390×844 and 360×800 | No horizontal overflow; bottom nav usable | NOT RUN |
| UI-03 | Mobile landscape and tablet width | Content remains reachable and readable | NOT RUN |

## 7. Test execution boundary and next action

This pass was performed through source retrieval and code-path review only. It did not execute the game in a browser, manipulate a save, run a battle, or inspect runtime Console/Network. The repository currently has no dedicated `test` script in `package.json`; the existing scripts are build, lint, typecheck, dev, and preview.

To finish the matrix, run the deployed app in a real Chrome/Edge browser and an Android browser/device. Use a fresh profile or exported test copy for destructive/resource-changing scenarios. Keep the user's original browser profile and local v20 save untouched.

## 8. V09 result

- **Seven route definitions and source navigation paths:** PASS (static review).
- **Character/party action wiring:** PASS (static review).
- **Synthesis/fusion/conversion/rebirth guards:** PASS (static review).
- **Forge/equipment/resource guards:** PASS (static review).
- **Battle automatic skill selection and settlement code paths:** PASS (static review only).
- **Settings-to-v20 persistence path:** PASS (static review only).
- **Responsive layout rules:** PASS (static review only).
- **Actual click-through, win/loss gameplay, refresh persistence, and PC/mobile visual tests:** NOT RUN.
- **Cloud save:** OUT OF SCOPE.

No application/gameplay source code or save data was changed in V09. This is a source-level regression review and execution checklist, not a claim that runtime regression testing has passed.
