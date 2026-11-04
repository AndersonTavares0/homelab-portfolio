# Homelab Portfolio

Build an independent, evidence-based English-language professional portfolio. Present skills and five documented projects, with an editorial Atlas and an interactive Observatory that explains the homelab without exposing operational identifiers.

## MVP

Deliver a complete, accessible English-language portfolio that demonstrates documented infrastructure work without requiring the visitor to use 3D:

- An editorial home, five evidence-based case studies and a printable professional summary.
- An interactive Observatory whose phases, components, relationships and case links stay synchronized, with usable keyboard controls and equivalent mobile and WebGL fallback navigation.
- A generated README from shared portfolio content, local assets, content validation, behavior tests and a static build.
- A private GitHub branch with successful CI, browser checks and a documented security review. No publication, merge or visibility change is included.

The MVP is ready for private review when these paths work end to end and the checks below have passed for the candidate commit. Future public release requires a fresh review and separate authorization.

## Constraints

Keep the GitHub repository private. Do not publish the site, merge, copy private source files or history, expose credentials or internal access identifiers, or operate the homelab. Documented past observations are not claims about live state. Use original material, MIT for original code and CC BY 4.0 for original text and diagrams. Recheck the exact candidate before any future authorized publication.

## Design

A light editorial Atlas leads to a dark Observatory. A local open-license sans, blue selection accent and shared semantic controls connect both. Equipment is illustrative, not a physical inventory. Respect keyboard access and reduced motion.

## Progress

- Source repository map and five case evidence sources inspected. Target directory did not exist.
- Ponytail 5.3.3 full: smallest complete implementation without cutting requested behavior, security, tests or accessibility.
- Private GitHub repository created and privacy confirmed. Initial independent commit on main; work continues on feat/portfolio-mvp.
- Five evidence-based case narratives and thematic phases written; content generation and relationship validation passed locally.
- Dependency audit found three low-severity findings in the Svelte integration's build-time deepmerge dependency; no fixed release was available at the time checked.
- Local verification after MVP review: content generation/check, 23 unit tests, static build, heuristic public-content audit and five Chromium end-to-end tests passed. The lazy Three.js chunk exceeds 500 kB.
- Desktop 1440×900: selected the GPU by clicking its 3D model and checked its relationships and decision/learning. Mobile 390×844: selected a topology node with no horizontal overflow. Browser interaction after actual WebGL context loss returned to the usable 2D view.
- Gitleaks 8.30.1, verified against the official release checksum, found no secrets in the initial Git history or the inspected authored files and generated site. Scanning is not proof of absence; repeat on the exact candidate and all refs before any publication.
- Private CI passed for the reviewed implementation commit `de9f8538f623490ce69959457578acc758cd7eb7` (run 41760326094), including content checks, build, dependency audit and Chromium E2E. Gitleaks scanned the five-commit history across existing refs without findings; commit names, filenames and noreply identities were also reviewed.
- No site publication, visibility change or merge is authorized.
- MVP review synchronized documented relationships in the 2D and 3D views, added the selected case's decision and learning, derived thematic milestones from one Markdown source, and improved the Atlas illustration.
- Second review added the confirmed author identity and public GitHub profile, a lessons section and a closing summary/contact section, expanded each case with mechanism, limits and an explicit documented-state section, and made Observatory phase/component state deep-linkable so returning from a case restores the selection (browser back/forward included).
- Local checks after the second review: content validation, 25 unit tests, static build, heuristic public-content audit and nine Chromium end-to-end tests passed.
- Final plan audit fixed the Observatory panel: it summarized the whole case, which stretched the desktop column past 1,600 px. Panel text now keeps whole sentences within a 220-character budget and the case page keeps the full reasoning; panel height dropped to ~500 px. A white WebGL layer in one capture was traced to the capture tool, not the page: element inspection and a Playwright screenshot both show the dark surface.
- Final audit evidence: every internal link and local asset returned 200, the built site references no external runtime origin, and desktop 1440×900 plus mobile 390×844 were re-inspected after the fix.
- Integration policy: no direct merge or push to `main`; the feature branch is the only target, and any integration goes through a pull request.
