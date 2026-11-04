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
- Checks: 25 unit tests, 9 Chromium E2E tests, content validation, static build, `audit:public`, Gitleaks, private CI on every pushed commit.

## Backlog (impact order)

1. **Accessibility automation** — no automated WCAG pass exists; axe is missing from CI. Add it, fix real findings.
2. **Case index** — visitors reach studies only through the home list, lessons list or Observatory; a dedicated `/cases/` route gives a stable, linkable catalogue.
3. **Observatory keyboard model** — arrows within the component strip, predictable focus after phase change.
4. **Performance budget** — measure initial JS/CSS, font loading and LCP; remove avoidable cost without touching the stack.
5. **Cross-linking** — related studies inside each case, and phase links back to the Observatory.
6. **Robustness** — URL-state edge cases and a friendly not-found route.

## Cycle log

### Cycle 1 — accessibility automation (done)

Added `tests/e2e/a11y.spec.js` backed by `axe-core`, auditing `/`, `/cases/`, a case page and `/profile/` at desktop and mobile, plus the Observatory with a component selected. The harness was validated by injecting a known contrast violation and confirming axe reports it. All routes are clean at WCAG 2 A/AA and 2.1 A/AA. 15 E2E tests now pass, three of them accessibility.

### Cycle 2 — case index (done)

New `/cases/` route lists the five studies with summary, technologies and phase, in editorial numbering, and returns to the catalogue from each study. Primary navigation is now `Case studies · Observatory · Professional summary`, which fits one line at 390 px. Added `tests/e2e/navigation.spec.js` (index contents, navigation from home, mobile order and overflow) and included the route in the axe audit. Verified on desktop and mobile screenshots with no overflow and no console errors.

### Next cycle — Observatory keyboard model

Arrow/Home/End navigation across the component controls in both the strip and the topology, with focus following selection.


### Delivered baseline (before this document)

MVP integrated: five evidence-based cases, printable summary, Observatory with 3D scene, DOM topology, deep links, mobile and WebGL fallback, metadata, favicon, responsive breakpoints and documented design tokens. Verified with 25 unit tests, 9 E2E tests, build, public audit, Gitleaks and browser inspection at 1440/1280/1024/768/390/375 px.
