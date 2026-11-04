# Homelab Portfolio

An independent, evidence-based English-language portfolio. It presents documented infrastructure work — five case studies, a thematic development map and an interactive Observatory — without exposing operational identifiers.

Repository: `AndersonTavares0/homelab-portfolio` (private). Default branch `main`.

## Status

MVP delivered and integrated. No site deployment, Pages configuration or visibility change exists; publishing requires a fresh review and explicit authorization.

## MVP criteria

| Criterion | Evidence |
|---|---|
| Private repository, no copied history | Repository created empty; `isPrivate: true`; commits authored with the account noreply identity |
| English site and README with identity, skills and five original narratives | Generated README plus five case studies with context, decision, observed result, learning and documented state |
| Home → Observatory → component → case → return | Playwright journey test, deep-link restoration, browser back/forward |
| Phase selection changes scene, topology and related content | Milestone panel exposes challenge, learning, documented state and next step |
| Five cases and summary usable without 3D | Static routes for every case and the printable summary; all internal links return 200 |
| Mobile and WebGL fallback | 390×844 topology with no horizontal overflow; missing and lost WebGL contexts fall back to the DOM topology |
| Keyboard, focus and reduced motion | Skip target, named controls, visible focus, reduced-motion test |
| Build, tests and private CI | 25 unit tests, 9 Chromium E2E tests, static build and private workflow |
| Content, dependencies and history reviewed | `audit:public`, Gitleaks over all refs, `npm audit` with the result recorded below |

## Constraints

Keep the repository private. Do not publish the site, copy private source files or history, expose credentials or internal access identifiers, or operate the homelab. Documented past observations are not claims about live state. Original code is MIT; original text and diagrams are CC BY 4.0. Recheck the exact candidate before any future authorized publication.

## Design

A light editorial Atlas leads to a dark Observatory; one self-hosted sans, one blue accent, shared semantic controls. Equipment is illustrative. Details, tokens and states live in `DESIGN.md`; audience and truth constraints live in `PRODUCT.md`.

## Delivered

Verified on `main` at commit `fb5b46a` (CI run 41831557568).

```sh
npm ci
npm run dev            # local development
npm run build          # static output in dist/
npm run preview        # serve dist on 127.0.0.1:4321
npm test               # model and content unit tests
npm run test:e2e       # Chromium end-to-end tests
npm run content:check
npm run content:build  # regenerate README.md
npm run audit:public
```

Observatory state is deep-linkable: `/?phase=accelerated&component=gpu#observatory`.

## Verification

- Content validation, README generation, 25 unit tests, static build and the heuristic public-content audit pass.
- Nine Chromium end-to-end tests cover the exploration journey, deep links, invalid state, case return, history, mobile, keyboard, reduced motion and absent WebGL.
- Browser review at 1440×900, 1280, 1024, 768, 390 and 375 px: no horizontal overflow; the printable summary renders on one A4 page.
- Every internal route and local asset responds 200; the built site requests no external runtime origin.
- Gitleaks scans all refs, authored files and the built site without findings; commit messages, filenames and author identities were reviewed too.
- Private CI passed on every merged commit, including the merge commit on `main`.

## Known limits

- `npm audit --omit=dev` reports three low-severity findings in the Svelte build-time `deepmerge` dependency; no corrected release was available when checked. CI fails at moderate severity or above.
- The lazy Three.js chunk exceeds 500 kB. It loads only when the Observatory enters the viewport and never blocks editorial content.
- Scanners and automated checks reduce risk; they do not prove the absence of exposure.

## Progress log

- Source repository map and five evidence sources inspected; target directory created outside the private tree.
- Private repository created; content, model and site built on a feature branch.
- Observatory relationships unified across 3D and DOM; case decision and learning surfaced; milestones moved to one Markdown source.
- Author identity, confirmed GitHub profile, lessons section and closing contact section added.
- Identity-free deep links and case return with browser history added.
- Observatory panel summarized and aligned; desktop scene separated from its DOM controls.
- Tablet breakpoint corrected; per-route metadata, favicon and skip target added.
- Design tokens, product context and README build instructions documented.
- Work integrated through pull requests 1, 2 and 3; merged branches removed; no open pull requests.
