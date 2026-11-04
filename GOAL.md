# Homelab Portfolio — operating goal

Persistent execution document. It records the mission, the operating loop, the current verified state, the prioritised backlog and the evidence of each cycle. Update it at the end of every cycle; never treat an intermediate delivery as the end of the objective.

## Mission

Deliver the approved plan in full and keep improving the portfolio autonomously to a professional standard: English content backed by evidence, an editorial Atlas and an interactive Observatory, accessible and responsive, with a private repository and passing CI.

## Operating loop

1. Pick the highest-impact justified improvement from the backlog.
2. Implement the smallest complete change (Ponytail full); consult Impeccable, frontend-design, daisyUI and no-ai-slop where relevant.
3. Run the focused checks, then inspect the real result in a browser at 1440×900 and 390×844.
4. Fix what the inspection shows; re-check the affected paths.
5. Record the cycle outcome, evidence and next action here, then start the next cycle.

## Constraints

- Repository stays **private**; no merge, deployment, Pages, visibility change or publication.
- Work happens on a branch and is pushed to the private remote; `main` already holds the delivered MVP and is not modified by these cycles.
- No credentials, addresses, internal usernames, inventory or operational detail from the homelab.
- Documented past observations are not live-state claims. No invented metrics, roles or history.
- Original code MIT; original text and diagrams CC BY 4.0.

## Current state

- Repository: `AndersonTavares0/homelab-portfolio` (private), `main` at `5be5393`.
- Evolution branch: `feat/evolution`.
- Stack: Astro static, Svelte island, Three.js, Tailwind 4, daisyUI 5, self-hosted Public Sans.
- Routes: `/`, `/cases/<id>/` (5), `/profile/`. Observatory deep links use `?phase=&component=#observatory`.
- Evolution HEAD: `feat/evolution`, 34 improvement cycles logged below.
- Checks: 27 unit tests, 32 Chromium E2E tests (including three axe audits, no-JavaScript, 320 px and 200% zoom), content validation, static build, `audit:public`, Gitleaks, private CI on every pushed commit.
- Browser matrix exercised: 1440×900, 1280, 1024, 900, 844×390, 768, 720 (200% zoom), 390×844, 375 and 320 px.

## Backlog

All six original items shipped (accessibility automation, `/cases/` index, Observatory keyboard model, performance budget, cross-linking, robustness), plus the later cycles below. Remaining ideas, none urgent:

- Split the Three.js chunk if a future scene grows; today it is lazy and does not block reading.
- Revisit phase filtering only if the catalogue grows past roughly eight studies (declined on evidence in cycle 26).
- Any future publication requires the fresh review described in Constraints.

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

### Next cycle — case page pager at 320 px

The previous/next pager holds two equal columns; check whether long study titles collide at 320 px and adjust the pattern if the capture shows it.


### Delivered baseline (before this document)

MVP integrated: five evidence-based cases, printable summary, Observatory with 3D scene, DOM topology, deep links, mobile and WebGL fallback, metadata, favicon, responsive breakpoints and documented design tokens. Verified with 25 unit tests, 9 E2E tests, build, public audit, Gitleaks and browser inspection at 1440/1280/1024/768/390/375 px.
