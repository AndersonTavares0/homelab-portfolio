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
- Local verification: content generation/check, 8 unit tests, static build, heuristic public-content audit and 5 Chromium end-to-end tests passed. Build warns that the lazy Three.js chunk exceeds 500 kB.
- Desktop 1440×900: observed 3D rendering and selected an alert component by clicking its model. Mobile 390×844: observed topology with no horizontal overflow. Browser recorded no runtime errors in the exercised views.
- Gitleaks 8.30.1, verified against the official release checksum, found no secrets in the initial Git history or the inspected authored files and generated site. Scanning is not proof of absence; repeat on the exact candidate and all refs before any publication.
- Private CI passed for candidate commit `be5f2892c854e22d74cd489ec21ae4fab4e678c7` (run 41758584752), including Linux build and Chromium E2E. Gitleaks scanned all three commits across existing refs without findings; commit names, filenames and noreply identities were also reviewed. The previous CI run passed for `82d1575`.
- No site publication, visibility change or merge is authorized.
