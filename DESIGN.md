# Design

## Mode

Experience: the work leads, the interface recedes. A visitor can read everything without interacting with 3D; exploration is optional.

## Palette

| Role | Atlas (light) | Observatory (dark / light) | daisyUI token |
|---|---|---|---|
| Ground | `#f4f6f5` | `#101922` / `#e8f0f1` shell | `base-100` (Atlas) / local `--obs-bg` |
| Raised surface | `#e5edef` | `#17232d` / `#f7faf9` panels | `base-200` (Atlas) / local `--obs-surface` |
| Hairline | `#cbd5d9` | `#344754` / `#c5d3d7` | `base-300` / local `--obs-line` |
| Body ink | `#152129` | `#ecf1f2` / `#152129` | `base-content` / local `--obs-text` |
| Secondary ink | `#344850` | `#a8b7bf` / `#31505b` | `base-content/70` / local `--obs-muted` |
| Accent, selection, connections | `#2459b7` | `#82b9d2` / `#126e69` | `primary` / local `--obs-blue` |

The Observatory is a theme-aware instrument, not a second page theme: light mode uses a pale shell and readable panels around the same night-field viewport, while dark mode keeps the shell and viewport dark. The contrast boundary makes the 3D field legible without pretending that the conceptual map is a live dashboard.

Controls use daisyUI semantic names (`primary`, `base-*`) so a theme change moves the whole surface. The Observatory keeps scoped `--obs-*` variables because it has a deliberately dark viewport inside both document themes; light-mode shell overrides map the detail, phase and capability panels to the Atlas surface.

Contrast floor: body and secondary text at least 4.5:1, large text at least 3:1. Selection is never signalled by colour alone: `aria-pressed`, a border change and a glow all move together.

## Type

One family, Public Sans Variable, self-hosted through `@fontsource-variable/public-sans`, with the system sans as fallback. Weights 400 for reading copy, 650–700 for headings and labels. Display sizes are fluid clamps and stop at 5.8rem; body text stays under 75 characters per line.

## Layout

Atlas reads as a technical editorial page: a two-column first viewport pairing a statement with the authored atlas illustration, then a single reading column, a ruled project index and a lessons list. The Observatory is a working surface: milestone controls, a stage with the 3D scene, the DOM topology underneath it, a detail panel, then phase capabilities and related cases. The selected view exposes its documented technologies beside the decision notes, so the visitor can move from “what is this?” to “why this stack?” without leaving the map.

The DOM topology is the accessible source of truth; the canvas is a stylized view of the same nodes and edges. Equipment models show roles, not the real installation. The desktop topology overlay adds restrained CSS depth to the fallback—larger compute nodes sit slightly forward, while the connection lines remain the relationship layer—so the non-WebGL experience is a useful 2.5D map rather than a flat list.

### Reading and naming

Body copy is capped at 36em, roughly 72 characters on desktop and tablet. Headings carry their own meaning: there are no uppercase labels above them on the catalogue, phase panel or capability panel.

## States

Selected, pressed, hover, focus-visible and unavailable-WebGL are explicit. The 3D view loads lazily on desktop, falls back to the topology on mobile, when WebGL is unavailable and when the context is lost. Motion responds to phase and component selection; scroll reveal uses position rather than hiding content, and `prefers-reduced-motion` removes camera travel and entrance motion while keeping navigation intact.

## Voice

Plain English, active voice, first person only for work actually done. No invented metrics, job titles or dates; each case separates the documented state from the next step.
