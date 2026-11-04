# Design

## Mode

Experience: the work leads, the interface recedes. A visitor can read everything without interacting with 3D; exploration is optional.

## Palette

| Role | Atlas (light) | Observatory (dark) | daisyUI token |
|---|---|---|---|
| Ground | `#f4f6f5` | `#101922` | `base-100` (Atlas) / local `--obs-bg` |
| Raised surface | `#e5edef` | `#17232d` | `base-200` (Atlas) / local `--obs-surface` |
| Hairline | `#cbd5d9` | `#344754` | `base-300` / local `--obs-line` |
| Body ink | `#152129` | `#ecf1f2` | `base-content` / local `--obs-text` |
| Secondary ink | `#344850` | `#a8b7bf` | `base-content/70` / local `--obs-muted` |
| Accent, selection, connections | `#2459b7` | `#82b9d2` | `primary` / local `--obs-blue` |

Controls use daisyUI semantic names (`primary`, `base-*`) so a theme change moves the whole surface. The Observatory keeps scoped `--obs-*` variables because it is a dark surface inside a light document; it reuses the same accent hue, lightened for contrast on dark.

Contrast floor: body and secondary text at least 4.5:1, large text at least 3:1. Selection is never signalled by colour alone: `aria-pressed`, a border change and a glow all move together.

## Type

One family, Public Sans Variable, self-hosted through `@fontsource-variable/public-sans`, with the system sans as fallback. Weights 400 for reading copy, 650–700 for headings and labels. Display sizes are fluid clamps and stop at 5.8rem; body text stays under 75 characters per line.

## Layout

Atlas reads as a technical editorial page: a two-column first viewport pairing a statement with the authored atlas illustration, then a single reading column, a ruled project index and a lessons list. The Observatory is a working surface: milestone controls, a stage with the 3D scene, the DOM topology underneath it, a detail panel, then phase capabilities and related cases.

The DOM topology is the accessible source of truth; the canvas is a stylized view of the same nodes and edges. Equipment models show roles, not the real installation.

## States

Selected, pressed, hover, focus-visible and unavailable-WebGL are explicit. The 3D view loads lazily on desktop, falls back to the topology on mobile, when WebGL is unavailable and when the context is lost. Motion responds to phase and component selection; `prefers-reduced-motion` removes camera travel while keeping navigation intact.

## Voice

Plain English, active voice, first person only for work actually done. No invented metrics, job titles or dates; each case separates the documented state from the next step.
