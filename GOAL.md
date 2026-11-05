# Homelab Portfolio — operating goal

Persistent execution document for the portfolio's planned baseline and the user's ongoing mandate to evolve it beyond the initial plan. The MVP is complete; continue with evidence-backed improvements that materially strengthen design, accessibility, responsiveness, performance, content or reliability. Stop when remaining work is marginal or blocked by missing user input.

## Mission

Build a professional, evidence-based English portfolio with the Atlas editorial identity, interactive Observatory, five case studies, documented timeline, 3D topology with complete mobile/WebGL fallback, and printable professional summary. Continue beyond the initial plan where verified opportunities add real value. Keep the source repository private. GitHub Pages deployment through Actions is authorized only if the account permits publishing from a private repository; never change repository visibility. Record the public URL and set the repository Website field only after public browser validation.

## Completion workflow

1. Compare the implementation with the plan's concrete MVP criteria.
2. Run the plan's content, unit, dependency, build, public-content, E2E and secret-history checks.
3. Inspect the built site in a real browser at desktop and mobile sizes; verify the exercised journey and runtime.
4. Continue with scoped, evidence-backed improvements authorized by the current user request; stop when remaining work is marginal or would expand scope.
5. Record evidence and real limitations here. Merge completed work to `main` through a pull request after private CI passes. Deploy from `main` through GitHub Actions only if Pages eligibility for this private source is confirmed. Never change repository visibility; validate anonymous public access before recording the URL or setting Website.

## Constraints

- Source repository stays **private**; merges to `main` are authorized through pull requests after private CI passes. GitHub Pages deployment from `main` is authorized only if the current account permits Pages from a private source. Never change visibility.
- Earlier PRs #5 and #6 were merged under prior authorization. The current instruction authorizes ongoing merges; preserve history and do not rewrite or revert existing work.
- No credentials, addresses, internal usernames, inventory or operational detail from the homelab.
- Documented past observations are not live-state claims. No invented metrics, roles or history.
- Original code MIT; original text and diagrams CC BY 4.0.

## Current state

- Repository: `AndersonTavares0/homelab-portfolio` remains private; PR #11 merged as `5228c59` on 2026-11-04. GitHub Pages is deployed from the private source.
- Stack: Astro static, Svelte island, Three.js, Tailwind 4, daisyUI 5, self-hosted Public Sans.
- Routes: `/`, `/cases/<id>/` (5), `/profile/`; Observatory deep links use `?phase=&component=#observatory`.
- All 58 logged evolution cycles are present on `main`; original MVP and requested follow-up work are integrated.
- Post-merge CI run `41908120943` on `5228c59` passed content validation, 29 unit tests, the moderate-threshold runtime audit, a 9-route build, the public-content audit, 49 Chromium E2E tests and the Pages deployment. Three inherited low-severity `deepmerge` advisories remain; no breaking forced downgrade was applied.
- Public browser verification: the home and GPU case load anonymously; the GPU return link preserves `phase=accelerated&component=gpu`. Desktop renders 3D; 390 px mobile uses the six-node topology with no overflow or application errors. Canonical URL and social image resolve under the project base path.

## Backlog

All six original MVP items shipped (accessibility automation, `/cases/` index, Observatory keyboard model, measured performance budget, cross-linking and robustness). The current user mandate explicitly authorizes evidence-backed evolution beyond the original plan. Public GitHub Pages deployment is authorized only while source visibility remains private and account eligibility is confirmed; changing visibility is prohibited.

## Cycle log

### Cycle 1 — accessibility automation (done)

Added `tests/e2e/a11y.spec.js` backed by `axe-core`, auditing `/`, `/cases/`, a case page and `/profile/` at desktop and mobile, plus the Observatory with a component selected. The harness was validated by injecting a known contrast violation and confirming axe reports it. All routes are clean at WCAG 2 A/AA and 2.1 A/AA. 15 E2E tests now pass, three of them accessibility.

### Cycle 2 — case index (done)

New `/cases/` route lists the five studies with summary, technologies and phase, in editorial numbering, and returns to the catalogue from each study. Primary navigation is now `Case studies · Observatory · Professional summary`, which fits one line at 390 px. Added `tests/e2e/navigation.spec.js` (index contents, navigation from home, mobile order and overflow) and included the route in the axe audit. Verified on desktop and mobile screenshots with no overflow and no console errors.

### Cycle 3 — Observatory keyboard model (done)

Arrow keys, Home and End move focus and selection across the visible components in both the strip and the topology; the wrap-around is explicit and the phase restricts the set. Covered by `tests/e2e/keyboard.spec.js` (two tests) and by the full suite: 17 E2E tests, three accessibility audits included.

### Cycle 4 — performance budget (measured, no change needed)

Cold load of `/`: HTML 21 kB, CSS 27 kB, initial JS 1.3 kB, atlas 1.2 kB, font 26 kB. DOMContentLoaded 48 ms and load 62 ms locally; first contentful paint 144 ms. The Three.js island stays lazy. No optimisation justified at this size; keep the budget in mind when adding features.

### Cycle 5 — related studies (done)

Each case now derives "Related studies" from the shared model: neighbouring components' cases plus cases sharing a phase. GPU Lab links to Automation, for example, and the block sits between Documented state and the Observatory return. Covered by `tests/e2e/related.spec.js`; full suite is 19 E2E tests.

### Cycle 6 — robustness (done)

Added `/404` with the editorial layout, `tests/e2e/robustness.spec.js` covering the not-found response, a crawl that requests every internal link collected from four routes, and Observatory URL edge cases (unknown phase, unknown component, component outside the selected phase). 22 E2E tests pass.

### Cycle 7 — case reading navigation (done)

Each study now opens with "In this study": anchor links to Context, Contribution and decision, Observed result, Learning and next step and Documented state. Heading ids are derived from the Markdown, and the links scroll with an offset that keeps the target readable. Covered by the third test in `tests/e2e/related.spec.js`; suite now 23 E2E tests.

### Cycle 8 — phase keyboard model (done)

The phase group now supports the same Arrow/Home/End model as the components: focus and selection move together, wrap at the ends and stay inside the current set. `tests/e2e/keyboard.spec.js` covers both groups; suite is 24 E2E tests.

### Cycle 9 — content and voice review (done)

Read all five studies and the profile against no-ai-slop: no banned filler, no binary-contrast or puffery patterns, em dashes limited to technical enumerations, and every claim still tied to a documented source. One inaccuracy fixed: the atlas alternative text described layers while the illustration is an isometric server linking services, observation and compute.

### Cycle 10 — copy the current view (done)

Added a "Copy link" control in the Observatory header that writes the canonical URL with phase, component and fragment, with a polite live status for success and failure. Covered in `tests/e2e/robustness.spec.js`; suite is 25 E2E tests. Buttons were verified at 390 px without overflow.

### Cycle 11 — share metadata (done)

Added a 1200×630 share card generated from the design tokens by `scripts/share-card.mjs`, Open Graph and Twitter metadata on every route, `og:type=article` on case pages, and a test that resolves the image on four routes. Also fixed a real focus bug found by a flaky keyboard test: when the scene switched between topology and 3D, the focused component control was replaced and focus fell to the body; the component now restores focus to the same component after the swap. Six consecutive full-suite runs passed afterwards (26 E2E tests).

### Cycle 12 — reading measure (done)

Measured the case pages at 1440, 1024, 768 and 390 px: the prose column was 685 px, about 86 characters per line, above the 65–75 target. Capped it at 36em, which yields 72 characters at desktop and tablet and 44 on mobile, with no horizontal overflow and the section index still aligned. The Observatory at 900 px was inspected too (stage 547 px, detail 272 px) and kept as is: the scene stays usable and the strip wraps cleanly.

### Cycle 13 — home narrative (done)

The lessons section repeated the full learning paragraph already shown in the Observatory panel. It now uses a dedicated excerpt of the first sentence (83–162 characters), so the row scans as a rule rather than a paragraph. Also removed the double bottom padding that left a 170 px void between the project index and the lessons heading; the gap is now a deliberate 32 px. Verified at 1440 and 390 px; suite still 26 E2E tests.

### Cycle 14 — Observatory headings (done)

Removed the three uppercase eyebrows ("Infrastructure, in context", "Themes from documented work", "Capabilities and evidence"); the design floor treats that pattern as a default and the headings carry the meaning on their own. The capability panel heading now reads "Capabilities and cases" instead of repeating the active phase name for the third time on screen. Headings in the section are now: The Observatory, the selected component or phase, Explore by phase, Capabilities and cases. Verified at 1440 and 390 px; axe and the 26 E2E tests pass.

### Cycle 15 — consistency sweep (done)

Documented the reading measure (36em, ~72 characters) and the "no labels above headings" rule in `DESIGN.md`, regenerated the README from the shared content, and rebuilt the share card from the current wording. Full local battery: content check, 25 unit tests, static build, 26 E2E tests including three axe audits, and the public-content audit all pass.

### Cycle 16 — content integrity (done)

`content:check` now fails when a study loses any of its five sections, naming the file and the missing heading; two unit tests cover the accepting and rejecting paths. This closes a silent-regression gap: before, only decision and learning were required. Unit tests: 27.

### Cycle 17 — printable studies (done)

Printing a study produced a page with the section index flattened into the lead, related links and the Observatory button. Print CSS now hides the index, related studies and the return control, removes the reading max-width and keeps the documented state from splitting across pages. Verified by exporting a two-page A4 PDF with only content, learning and documented state.

### Cycle 18 — mobile reveal (done)

On stacked layouts a tap selected a component but left its detail panel below the fold. Selection now scrolls the panel into view, honouring reduced motion; the mobile test asserts the panel is in the viewport after a selection.

### Cycle 19 — ARIA and relation typography (done)

Found the cause of the intermittent axe failure: `.observatory__map` carried `aria-label` on a generic `div`, which is prohibited. In 3D mode the map is now `aria-hidden`, and in topology mode it is a named group. Also aligned the "outside this phase" relation text with the relation links (same size, muted colour) instead of rendering at body size. Evidence: four consecutive full-suite runs pass with Playwright managing its own preview server; previously the axe audit failed roughly one run in three.

### Cycle 20 — announcement and study-depth review (done)

The detail panel was `aria-live="polite" aria-atomic="true"`, so every selection re-read the entire panel. It is now a complementary region labelled by its heading, and a short status line announces only what changed ("Observability selected. 2 connected systems."). Axe still passes and the journey test asserts both the announcement and the region name.

Study-depth review: read all five studies looking for a decision stated without the constraint that forced it. Each already pairs the decision with its constraint and tradeoff (plugin error path, mixed operations, hidden delivery failure, exclusive GPU lease), so no text was changed — inventing a stronger constraint would have broken the evidence rule.

### Cycle 21 — catalogue orientation (done)

The index listed studies in file order, which read as arbitrary. It now sorts by the same phase order as the Observatory (foundation → services → operations → accelerated), states that order in the lead, and shows an estimated reading time per study. A navigation test asserts the exact order and the presence of the reading-time label. Verified at 1440 and 390 px with no overflow.

### Cycle 22 — test server isolation (done)

`astro preview` enforces one instance per project, so the manual preview and Playwright's web server kept colliding; runs failed with "port already used" and manual inspection was killed mid-check. Playwright now serves `dist` through `scripts/serve-dist.mjs`, a tiny static server on port 4327 with correct MIME types and the real 404 page. Two consecutive full-suite runs pass while a manual preview stays on 4321.

### Cycle 23 — short viewports (done)

On a landscape phone (844×390) the stage kept a 400 px minimum height, so the scene and strip pushed everything else off-screen. A height-based rule now drops the stage to 256 px and the strip to a compact title row, verified in a fresh tab at 844×390 with the 3D scene and five component controls visible without overflow. Portrait at 600 px height keeps the taller stage, which is correct for that space.

### Cycle 24 — content freshness (done)

Regenerated the README from shared content: no drift in the studies, phases or licensing text. One stale line corrected — the E2E comment still said "against preview" after the static test server replaced it. The share card wording ("five documented case studies…") and the catalogue lead still match the current content.

### Cycle 25 — current-section navigation (done)

The header now marks the active section with `aria-current="page"` on Case studies and Professional summary, plus a blue underline for sighted readers. A navigation test checks the attribute on a case page, the summary and the home page (where no nav item is current). Suite is 27 E2E tests.

### Cycle 26 — phase filter evaluation (declined on evidence)

Measured the catalogue on a 390×844 viewport: five rows occupy 1,079 px of a 1,864 px page, and every row already names its phase in the metadata. A filter would add a control row and hide content that is scannable in seconds, so it was not built. Recorded here so the decision is not reopened without new content.

### Cycle 27 — sequential study navigation (done)

Catalogue order is now computed once in `scripts/content.mjs` and shared by the index and by previous/next links at the end of each study, which keep `rel="prev"`/`rel="next"` and are hidden in print. Verified at 1440 and 390 px; a navigation test asserts the order, the edges (no previous on the first, no next on the last) and that the link works. Suite is 28 E2E tests.

### Cycle 28 — no-JavaScript behaviour (done)

With JavaScript disabled, all four routes keep their text and the hero still renders; the Observatory shows the Foundation phase with its host node, the phase briefing and the legends, but its phase and component controls are inert. A `<noscript>` notice now says exactly that and links to the catalogue. A Playwright context with `javaScriptEnabled: false` asserts the case text, the notice and its link. Suite is 29 E2E tests. Also removed the last uppercase label in the detail panel ("Selected system" now reads in sentence case).

### Cycle 29 — Observatory loading state (done)

On a cold load the section showed a floating "Preparing the interactive view…" box over the empty stage. The message now lives in the stage title row as a polite status, replacing the hint until the scene arrives, and the box is gone. Captured with the scene chunk delayed by 2.5 s: the topology, phase briefing and strip are readable immediately and the status reads "Preparing the interactive view…" inline. Suite stays at 29 E2E tests.

### Cycle 30 — first-load perception (done)

Cold load at 1440×900 with cache disabled: CLS 0.0011, LCP 80 ms, fonts loaded before the measurement. The page was already coherent, so the only change was preloading the primary woff2 from the layout; the font request now starts at 27 ms as a single fetch, CLS drops to 0, and no duplicate request appears. Verified again after the change with resource timing and a clean console.

### Cycle 31 — focus walkthrough (done)

Tabbed through a case page: sixteen stops in reading order (skip link, wordmark, three nav links, back link, five section links, related study, previous study, return button, footer links), each with a visible 3 px ring. Also checked the Observatory strip: first and last component buttons focus with the light ring and are not clipped by the stage's overflow.

The walkthrough exposed a design-floor violation in the same screen: the active phase used a 3 px coloured left bar. It now reads through border colour, background tint and a brighter title, with no side bar. Suite remains 29 E2E tests.

### Cycle 32 — professional summary review (done)

Read as a hiring reader: the page states scope, technical areas and one-line evidence per study, then points to printing. The per-study lines are an index, not duplicated prose, so they stayed. Two real inconsistencies were fixed: the list followed file order instead of the catalogue order (now shared `orderedCases`, with the phase shown per study), and the GitHub link sat flush against the paragraph above it (now spaced). A navigation test locks the order and the phase label. Suite is 30 E2E tests.

### Cycle 33 — narrowest viewport (done)

At 320 px nothing overflowed or overlapped, but the header consumed 151 px because the nav wrapped with default spacing. A ≤380 px rule tightens header/footer padding, nav gap and type, bringing the header to 119 px with the same three links. Footer keeps its two rows. A robustness test asserts no horizontal scrolling and a header below 140 px on four routes at 320 px. Suite is 31 E2E tests.

### Cycle 34 — 200% zoom (verified, test added)

At a 720 px viewport (200% zoom on a 1440 window) a case page keeps a 576 px reading column, the section index wraps to two rows and the pager stays in two columns, with no horizontal scrolling. At 360 px the prose drops to 331 px and still holds. No layout change was needed; a robustness test now locks the zoom case (no overflow, reading column ≤600 px, index and pager visible). Suite is 32 E2E tests.

### Cycle 35 — final audit and hand-off (done)

Full local battery at the head commit: content check, 27 unit tests, 32 E2E tests, build, `audit:public`, and Gitleaks across all refs (48 commits, no findings). Repository confirmed private, default branch `main` at `5be5393`, only `feat/evolution` alongside it, no open pull requests, no deployment or Pages configuration. The status block above now carries the cycle count, the test numbers and the browser matrix so the project can be handed over without reading this log.

### Cycle 36 — share metadata resolution (done)

Case pages already carried `og:type=article`, a per-study description and the shared card, but `og:image` and the page URL were relative, which no preview crawler resolves. The layout now emits `og:url` and can make both values absolute from an optional `PUBLIC_SITE_URL` set at build time, falling back to relative paths locally. Verified by building with and without the variable (`/cases/gpu-lab/` and `/og.png` versus `https://example.invalid/...`), and the metadata test now checks `og:url` on four routes. README documents the variable.

### Cycle 37 — catalogue at 320 px (done)

At 320 px each catalogue row carried a decorative index column inside a 2.2 rem gutter, squeezing the title into two lines and the metadata into three. Below 380 px the numbering is now hidden and the row becomes a single column, so rows shrink from about 261 px to 226 px, the title gains width and the reading-time line stays intact. The 320 px test still passes with no horizontal scrolling.

### Cycle 38 — pager at 320 px (verified, test extended)

Two equal columns hold 139 px each at 320 px; labels stay aligned to their edges and the longest title wraps to three lines without touching the other side. No layout change was needed, so the 320 px test now also asserts both pager links exist and stay under 200 px, guarding the pattern against future title growth.

### Cycle 39 — repository hygiene (done)

Audited every tracked path: twelve root files, five scripts, six E2E specs, two unit specs, five studies and four public assets, all of them used by a route, a test or the build. Nothing was stale enough to delete. Two gaps closed instead: `package.json` now declares the Node range the README already stated (`>=22.23.4`) and the MIT licence, with the lockfile kept in sync; `.gitignore` covers `coverage/`, logs and `.DS_Store`.

### Cycle 40 — dependency review (done)

All twelve direct dependencies are used by the build, a route or a test. One real problem surfaced: `scripts/share-card.mjs` imported `playwright-core`, which is not a declared dependency — it worked only because the Playwright package hoists it. It now imports `chromium` from `@playwright/test`, and regenerating the card produced a byte-identical `og.png`, so the asset stays deterministic. Lockfile still matches `package.json`.

### Cycle 41 — README accuracy (done)

Read as a newcomer and found two real gaps: the command list implied `npm run test:e2e` works on a fresh clone, although it serves `dist`, and there was no route map. The README now states that a build must precede the browser tests, lists the four public routes, and describes the not-found page as the handling for unknown paths (rather than a `/404` URL that the static server does not serve). Regenerated from the shared content; licences and phase summary were already accurate.

### Cycle 42 — consolidation (done)

Full battery at the head commit: content check, 27 unit tests, 32 E2E tests, build, `audit:public`, and Gitleaks across 55 commits without findings. Repository remains private, `main` untouched at `5be5393`, one working branch, no pull requests. The status block now carries the final cycle count, test numbers and scan scope, so the branch is ready for review as it stands.

### Cycle 43 — printable home (done)

Printing `/` exposed a real defect: the interactive Observatory printed as a dark block with controls and the primary button kept its blue fill and white label, because daisyUI's layered `!important` rules outrank unlayered overrides. The print sheet now hides the Observatory and the action buttons, prints a line explaining where the interactive view lives, prints the summary and GitHub URLs as text, and stacks the project and lesson lists. Verified by exporting an A4 PDF with no colour blocks, no clipped controls and contact information intact.

### Cycle 44 — forced-colors mode (done)

Emulated Windows high-contrast (`forced-colors: active`) on the Observatory. Structure survived: borders, headings, button outlines and the phase briefing all use system colours, but the map caption became black text over the painted scene. It now renders as a compact centred pill using `Canvas`/`CanvasText`, readable in both captures. The 3D scene itself stays in full colour, which is acceptable for a decorative illustration.

### Cycle 45 — print coverage (done)

The print fixes from cycle 43 had no automated guard. Added `tests/e2e/print.spec.js`: the home page must hide the Observatory, both action rows, the header and footer while showing its two print notes; a case must hide its index, related studies, pager and return control but keep the documented state; the summary must hide page chrome and keep five entries. Suite is now 35 E2E tests.

### Cycle 46 — payload and structure audit (done)

Measured transfer per route with cache disabled: home 45 kB (HTML, CSS, 1.3 kB Svelte client and the atlas SVG), case, catalogue and summary 39 kB with **zero JavaScript**. Structural checks across the four routes found no duplicate ids, no heading-level jumps, no nested interactive elements, no image without alt and exactly one `h1` on each. No fix was needed, so `tests/e2e/structure.spec.js` now locks those invariants. Suite is 39 E2E tests.

### Cycle 47 — axe coverage for stacked and 404 (done)

The automated audit covered editorial routes and the desktop Observatory but never the stacked Observatory or the not-found page. Both were added: the mobile Observatory with a selected component and `/missing-page/` are clean at WCAG 2 A/AA and 2.1 A/AA. Suite is 41 E2E tests with five accessibility audits.

### Cycle 48 — consistent reading estimate (done)

The catalogue promised "About N min read" but a study opened from it did not repeat the estimate. `readingMinutes` moved into the shared content module, the catalogue uses it, and each study header now shows the same value next to its technologies. A navigation test asserts the header figure equals the catalogue figure for the same study. Suite is 42 E2E tests.

### Cycle 49 — touch interaction (done)

Added a Chromium context with `hasTouch` and a 390×844 viewport: tapping a phase and a component selects both, scrolls the detail panel into view, announces the selection and clears with Overview; a second test asserts every primary control keeps at least a 24 px touch target on the stacked layout. Both selectors were scoped to the phase group after a strict-mode collision. Suite is 44 E2E tests.

### Cycle 50 — structured data (done)

Every page now ships JSON-LD: `Person` with the confirmed GitHub profile on editorial routes, and `Article` with headline, description, author and `articleSection` (the study's phase) on case pages. A structure test parses the payload and asserts both variants. Suite is 45 E2E tests.

### MVP completion status

The MVP acceptance criteria are met. The repository remains private, the GitHub Pages site is live at `https://andersontavares0.github.io/homelab-portfolio/`, and the GitHub Website field points to that URL. As of Cycle 60, `npm audit --audit-level=low` passes with zero vulnerabilities: Kit 3 and adapter-static 4 are current, build-only packages remain in devDependencies, and the upstream-unpatched `deepmerge` advisory is isolated behind a local key-filtering override with regression coverage.


### Delivered baseline (before this document)

MVP integrated: five evidence-based cases, printable summary, Observatory with 3D scene, DOM topology, deep links, mobile and WebGL fallback, metadata, favicon, responsive breakpoints and documented design tokens. Verified with 25 unit tests, 9 E2E tests, build, public audit, Gitleaks and browser inspection at 1440/1280/1024/768/390/375 px.

### Cycle 51 — mobile navigation tap targets (done)

At 390 px the three main-navigation links had 22 px-high targets, below the intended 24 px hit height; a new Playwright assertion reproduced the gap before the fix. Added 8 px of vertical padding via Tailwind `py-1`; browser measurements are now 30 px at 390 and 1440, and 28 px at 320, with no horizontal overflow. The case-studies link works at desktop and the browser reported no application errors. Local verification: 27 unit tests, 46 E2E tests, a 9-route build, public-content audit and clean diff check. Gitleaks 8.30.1 found no leaks in the history and authored/generated paths. Private CI passed for commit `ddd8b96` in run `41870276812`.

### Cycle 52 — case section-index hit targets (done)

On the 390 px case page, the five “In this study” links measured 16 px high inside a flex-wrapped index. A new mobile E2E assertion reproduced the short hit area; each link now receives Tailwind `py-1`, measuring 24 px. The selected section remains visible after following its link. Local verification: 27 unit tests, 47 E2E tests, a 9-route build, public-content audit, clean diff check, and Gitleaks 8.30.1 with no findings in 69 commits or the scanned current source, tests, GOAL and `dist`. Private CI passed for commit `545081c` in run `41871555684`.
### Cycle 53 — professional-summary link hit area (done)

The standalone “Read the professional summary” link in the home skills panel measured 19 px high at 390 px. A new E2E assertion reproduced the short target; `inline-block py-1` now gives it a 32 px target. Browser navigation reaches `/profile/` without overflow or application errors. Local verification: 27 unit tests, 48 E2E tests, a 9-route build, `audit:public` and `git diff --check`; Gitleaks 8.30.1 found no leaks in the scanned source, tests, GOAL and generated site, and no leaks across 70 history commits. Private CI passed for commit `681a3fd` in run `41872479723`.
### Cycle 54 — merge verification and website metadata (done; URL pending)

PR #7, `fix(mobile): enlarge navigation hit areas`, merged to `main` at `2f85b4c` on 2026-11-04 after private CI passed (run `41874635643`). Verified the merged commit locally: build produced 9 routes; 27 unit and 48 Chromium E2E tests passed; `audit:public` and `git diff --check` passed. Repository metadata confirms it remains private and its existing description is accurate. The GitHub homepage field is unset and Pages is disabled; no confirmed site URL was available in repository or account metadata. Vercel CLI is not installed. No placeholder URL or deployment was created; adding the website field remains pending a confirmed existing URL, with public deployment still disallowed.
### Cycle 55 — Observatory bundle warning (investigated; no code change)

The production build warns about a minified chunk above 500 kB. The warned asset is the Observatory's Three.js scene (`observatory-scene`): 544,218 bytes uncompressed and 134,007 bytes in a local gzip measurement. The component already imports it dynamically only at desktop widths and waits for an `IntersectionObserver` with a 160 px root margin; below 800 px it keeps the accessible DOM topology and does not initialize the 3D scene. This is a deferred interaction chunk, not evidence that the initial page payload exceeds the warning threshold. No additional split is justified without a measured user-facing regression; the gzip measurement is not a production transfer metric.

### Cycle 56 — README redesign and generated-output guard

Rebuilt the generated README around the portfolio’s intended order: professional identity and skills, five source-linked studies, development themes with their challenges and lessons, the interactive Observatory, printable summary and contact. Added site routes, architecture, local setup, verification steps, privacy and licensing; all claims come from the existing content model and implementation. Updated `scripts/build-readme.mjs` to use catalogue order and added a CI check that fails if generated `README.md` differs from the committed file. Local verification passed: content validation/generation, 27 unit tests, moderate-threshold runtime audit, a 9-route build, public-content audit, 48 Chromium E2E tests, 8 local file links and 6 section anchors. The public-content scan is heuristic, not a security guarantee.

### Cycle 57 — Observatory framing and Pages pipeline (local verification complete)

The desktop “All systems” view previously moved its camera to the selected node, pushing other systems out of frame. It now keeps the complete six-system topology centered while preserving focus in narrower views; the mobile and WebGL-fallback DOM topology remains the same accessible interface. One shared layout model now supplies both 2D and 3D coordinates, and content validation rejects missing, invalid or orphaned component layouts. GitHub Pages project-base support covers navigation, assets, canonical/social metadata and case-return links. The generated README documents the main-branch deployment flow without claiming a live URL.

At the time of the local verification, deployment and anonymous access had not yet been tested. The follow-up deployment and public validation are recorded in Cycle 58.

Local verification: 29 unit tests, 49 Chromium E2E tests, content validation for five cases, moderate-threshold runtime audit (three inherited low-severity `deepmerge` advisories), a nine-route build, public-content heuristic and clean `git diff --check`. A built `/homelab-portfolio` preview returned 200 for home, catalogue and GPU case; the case-return path preserved `phase=overview&component=gpu`. Chromium screenshots confirmed the centered desktop 3D topology and the 390 px DOM topology without overflow or application errors.

### Cycle 58 — private-source Pages publication (done)

PR #11 merged to `main` as `5228c59` after private CI passed. Workflow run `41908120943` completed both verification and GitHub Pages deployment. The private repository remained private throughout. The published site, `https://andersontavares0.github.io/homelab-portfolio/`, was opened without authentication in a real browser: the home rendered the 3D Observatory at desktop width, the GPU case loaded directly, and its return link restored the accelerated-computing view with GPU selected. At 390 px, the six-node DOM topology remained usable with no horizontal overflow or browser errors. Canonical and Open Graph image URLs resolve under `/homelab-portfolio/`. After that validation, the GitHub Website field was set to the same URL. The generated README now links to the published site and marks it with a live badge.
### Cycle 59 — SvelteKit stack and interface refinement (done)

Replaced the partial Astro/React direction with a clean SvelteKit static delivery: SvelteKit 3, Svelte 5 runes, TypeScript, Tailwind CSS 4, Bits UI primitives for Observatory actions, GSAP for desktop entrance motion and Three.js for the optional 3D scene. Removed the obsolete Astro config, Astro routes/layout, React Observatory island, and site-path shim. The static adapter now emits trailing-slash directories and a production-safe custom 404 fallback for GitHub Pages.

The Atlas now surfaces evidence-backed technology context in the home project index, case studies and Observatory detail panel. The theme toggle follows system preference, persists an explicit light/dark choice and initializes before hydration. Shared layout metadata now includes canonical/Open Graph/Twitter cards and JSON-LD for Person and Article routes. The Observatory keeps its authored technical-map framing, preserves the DOM topology fallback, disables entrance motion on narrow screens, and meets the mobile contrast audit.

README generation now advertises the current stack, keeps the Observatory Mermaid relationship diagram, and omits the removed Architecture, Contact and GitHub profile sections. No private infrastructure addresses or credentials were added.

Verification: `npm run content:check` passed for five cases; `npm test` passed 29 tests; `npm run build` completed and wrote `dist`; `npm run audit:public` found no configured secret/internal patterns; `git diff --check` reported only Git's normal line-ending warnings; and the final Playwright run passed all 52 E2E tests, including accessibility, keyboard, reduced motion, touch, print, metadata, structured data and mobile overflow. Browser inspection of the built site at 1440×1000 and 390×844 found no console errors; the mobile document width stayed at 390 px and the selected GPU topology remained usable. The build still reports the known deferred Three.js chunk-size warning. Repository privacy and the published Pages URL remain unchanged.
### Cycle 60 — dependency hardening and Observatory 3D refinement (done)

Replaced the vulnerable transitive `deepmerge` package with a local compatible implementation that ignores `__proto__`, `constructor` and `prototype` keys; the upstream advisory has no patched release. Build-only packages remain in `devDependencies`, redundant Bits UI controls were replaced with native accessible buttons, and CI now runs the full low-severity audit. Added a regression test for prototype-pollution keys.

The Observatory now has a closer, higher-contrast camera, stronger directional and coloured fill lighting, clearer callout labels with edge-aware offsets, a modeled deck and ambient field, curved connection tubes, finite signal pulses on selection, beacon/halo focus states, a HUD/readout, reset-view action and a one-shot reduced-motion-aware station reveal. The DOM topology and WebGL fallback remain the accessible source of truth. A click-driven browser smoke test caught and fixed an unstable Catmull-Rom pulse path by switching to a quadratic Bézier curve.

Final verification: `npm ci` passed; `npm run content:check` validated five cases; `npm test` passed 30 tests; `npm audit --audit-level=low` found zero vulnerabilities; `npm run audit:public` found no configured secret or internal-access patterns; `npm run build` wrote `dist`; the full Playwright suite passed 53 E2E tests; and `git diff --check` reported only Git's normal line-ending warning. The no-JavaScript link regression passed after normalizing SvelteKit 3 root paths. Browser inspection at 1237×900 rendered the Observatory 3D stage without console/page errors; GPU selection focused the scene, showed the signal pulse, and Reset 3D view preserved selection. The known deferred Three.js chunk-size warning remains.
### Cycle 61 — public deployment validation (done)

The merged commit `2152aeb` passed private main CI and the GitHub Pages deploy in workflow run `41929374835`; the repository remains private. The live URL `https://andersontavares0.github.io/homelab-portfolio/` was opened without authentication at 1237×900 and 390×844. Desktop loaded the refined 3D Observatory, selecting GPU lab focused the scene and produced no browser errors; mobile kept the 2D DOM topology fallback at exactly 390 px with no horizontal overflow or console/page errors.

### Cycle 62 — Atlas interface and conceptual Observatory revision (done)

The first visual review exposed five concrete defects: the mobile viewport meta was missing, GitHub Pages emitted root-relative assets, the hero Atlas image returned 404 publicly, wheel input over the 3D canvas trapped page scrolling, and the visible Observatory deck implied physical placement instead of documented relationships. The interface now has a responsive viewport, UTF-8 metadata, base-aware SvelteKit paths, a no-CLS theme control, icon-led navigation/footer, a stronger Atlas hero with pointer parallax, section reveals, route view transitions and deeper anchor offsets.

The Observatory now frames the scene as a conceptual relationship field: orbital relationship rings replace the physical deck/grid, the caption states that it is not live state or physical placement, GPU lab has a recognizable dual-fan module, and explicit zoom controls are available alongside recentering. Unmodified wheel scrolling returns to the page; Ctrl/Cmd+wheel remains camera zoom. The DOM topology and 2D fallback remain the source of truth.

The first private CI run caught a real theme-independent accessibility regression: offscreen section reveals used opacity 0, and Tailwind preflight removed the underline from an inline case-catalogue link. Reveal now preserves text contrast while animating only position, and inline editorial links explicitly underline. Local `npm run content:check` validated five cases; `npm run content:build` kept the generated README deterministic; `npm test` passed 30 tests; the full Playwright suite passed 53 tests; `npm audit --audit-level=low` reports zero vulnerabilities; `audit:public` found no configured secret/internal patterns; both normal and `SITE_BASE_PATH=/homelab-portfolio` builds passed; and `git diff --check` reported only Git's normal line-ending warning. The known deferred Three.js chunk-size warning remains. PR #16 merged privately to `main` as `0415b23`; main CI and Pages deployment passed in workflow `41938243384` (deploy job `126952714568`). The published URL was rechecked in a real browser at desktop and mobile: desktop initializes the conceptual 3D scene when it enters view; mobile remains the 390 px topology fallback with no horizontal overflow or page/console errors. Repository privacy and the GitHub Website URL remain unchanged.
### Cycle 63 — theme continuity, 2.5D topology and GPU model refinement (working branch)

The visual review found that the light document theme still made the Observatory feel like an unrelated dark dashboard, the detail view did not surface the active stack, the desktop DOM fallback was flat, the GPU model read as an anonymous block, and an unscoped section-heading arrow rendered as a large black triangle on mobile. The Observatory now uses a pale light-mode shell around the intentional night-field viewport, keeps dark mode coherent, exposes the active view's documented technologies, gives the desktop topology overlay restrained CSS depth, and models the GPU as a wider three-fan card with heatsink fins. The section-heading icon now has an explicit size and stroke.

Atlas motion now includes the compacting header/progress rail, hero entrance choreography, scroll-position reveals and an IntersectionObserver-triggered Observatory lower-panel reveal. The map still communicates relationships rather than physical placement; signal pulses, focus travel and reset controls remain in the Three.js layer, while DOM selection, URLs and mobile fallback remain authoritative.

Validation on `feat/observatory-atlas-refinement`: `npm run content:check`, `npm test` (30), `npm run audit:public`, `npm audit --audit-level=low` (0 vulnerabilities), `npm run build`, and `npm run test:e2e` (53) passed. The production preview at `http://127.0.0.1:4341/` rendered the light Observatory at 1440×900 with `data-theme=light`, `data-scene-mode=3d`, 13 documented technology chips and no failed requests or browser errors; dark GPU selection preserved `?phase=overview&component=gpu`; mobile at 390 px kept `scrollWidth=390`, exposed six keyboard-selectable topology nodes and no errors. Screenshots: `local://cycle3-final-preview-light-observatory.png`, `local://cycle3-gpu-refined.png`, `local://cycle3-mobile-triangle-fixed.png`. The E2E suite also covers reduced motion and unavailable WebGL. The known deferred Three.js chunk-size warning remains. No push, merge or deploy was performed.

### Cycle 64 — compact map and communication diagrams (working branch)

The review found the page too large and the Explorer unconvincing as a first explanation: an oversized hero, 82 px map nodes with a 920 px stage, summaries repeated inside every node and a detail panel that expanded three paragraphs before the reader could compare services. The Explorer now uses 190 × 60 plates grouped in four editorial columns inside a 640 px field, the map height follows the filtered result set, `Evidence and limits` and each relation explanation are collapsed behind native disclosure, and the mobile view becomes a two-column service list with category headings. The hero lost its minimum-height rule and oversized display clamp.

A new `WorkflowDiagram` component adds the requested "how it works" figures: the home page renders a five-lane `overview` model (request, delivery, management, ownership/lease, observability) and each case study substitutes its own workflow (`alert-relay`, `rss-relay`, `automation`, `observability`, `gpu-lab`). Connectors carry relation labels, ownership lanes state exclusive grants, and every figure ends with `Historical documentation · not live traffic`. The models were rewritten from the reference diagrams; no address, port, hostname, guest identifier, schedule, credential or hardware serial is rendered, and `audit:public` confirms no configured pattern matched.

The Explorer also re-reads navigation state on client navigation, so returning from a case restores the selection instead of keeping stale filters.

Verification: `npm run content:check` validated five cases; `npm run content:build` regenerated a deterministic README; `npm test` passed 37 tests; `npm run build` wrote `dist`; `npm run audit:public` found no configured secret or internal-access patterns; and the full Playwright suite passed 57 tests, including the two new workflow assertions. Browser inspection at 1440×1000 and 390×844 showed the compact map, the two-column mobile list, a horizontal case workflow (≈350 px stage) and the five-lane overview (≈370 px stage) with no horizontal overflow; the case page previously failed with a wrong import path and now renders its own diagram.
