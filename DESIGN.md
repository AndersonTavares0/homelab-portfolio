# Design

## Mode

Experience: the work leads, the interface recedes. A visitor can read everything without interacting with the map; exploration is optional.

## Palette

| Role | Atlas (light) | Homelab Explorer (dark field) | daisyUI token |
|---|---|---|---|
| Ground | `#f3f1ea` | `#0b181d` field | `base-100` (Atlas) / `--ex-bg` |
| Raised surface | `#e4e9e5` | `#122329` panels | `base-200` (Atlas) / `--ex-panel` |
| Hairline | `#c7d0cd` | `#345058` | `base-300` / `--ex-line` |
| Body ink | `#172428` | `#edf5f0` | `base-content` / `--ex-text` |
| Secondary ink | `#3e555b` | `#b6cbc9` | `base-content/70` / `--ex-muted` |
| Accent, selection, connections | `#165bd7` | `#8bd6c7` | `primary` / `--ex-accent` |

The Atlas surface is a cartographic field journal rather than a SaaS dashboard: warm paper, quiet grid lines, ink-blue emphasis and an authored map that explains the reading path. The header is a navigation instrument, not a centered pill; the first viewport pairs the thesis with a map readout and a short “choose → trace → read” instruction.

The Homelab Explorer is a deliberately dark teaching instrument inside both document themes: its field, node plates and detail panel use scoped local variables, so the Atlas page stays light while the map reads as a distinct working surface. The contrast boundary keeps the service map legible without pretending that the figure is a live dashboard. Its job is explanation: each service carries a documented purpose, decision and evidence, and the map never shows health, uptime or deployment state.

Controls use daisyUI semantic names (`primary`, `base-*`) where they sit on the Atlas surface. The map keeps its own scoped variables because its field stays dark in both themes.

Contrast floor: body and secondary text at least 4.5:1, large text at least 3:1. Selection is never signalled by colour alone: `aria-pressed`, a border change and a glow all move together.

## Type

One family, Public Sans Variable, self-hosted through `@fontsource-variable/public-sans`, with the system sans as fallback. Weights 400 for reading copy, 650–700 for headings and labels. Display sizes are fluid clamps and stop at 5.8rem; body text stays under 75 characters per line.

## Layout

Atlas reads as a technical editorial page: a two-column first viewport pairs the thesis with an authored relationship map, scope line and a plain-language reading instruction. The following sections keep one reading path through practice, selected projects and lessons. The Homelab Explorer is a working surface: a short exploration guide, category filters and search, a 2.5D service map stage, and a service panel with its purpose, decision, evidence, technologies and case.

The service map is ordinary HTML and inline SVG: nodes, labels, connections and controls live in the document, so the same information survives without graphics acceleration. Restrained CSS depth — offset shadows and layered plates — carries the 2.5D reading. Positions group services by editorial area; they are not a floor plan, an inventory or live status.

### Workflow diagrams

"How the parts talk" uses one diagram grammar: labelled lanes (request, delivery, management, ownership and signals), square nodes with a role line, and solid arrow connectors whose labels state what crosses them. The home page renders the shared `overview` model; each case study substitutes its own (`alert-relay`, `rss-relay`, `automation`, `observability`, `gpu-lab`). A diagram is a communication model, not a topology or a health view; every figure ends with `Historical documentation · not live traffic`, and no address, port, hostname, guest identifier, schedule or credential appears in it. The same component stacks vertically in narrow containers.

### Reading and naming

Body copy is capped at 36em, roughly 72 characters on desktop and tablet. Headings carry their own meaning: there are no uppercase labels above them on the catalogue, category panel or service panel.

## States

Selected, pressed, hover and focus-visible are explicit. The map needs no WebGL and works at every width; `?service`, `?category` and `?q` restore the same readable state. Motion responds to category and service selection and to URL changes; scroll reveal uses position rather than hiding content, and `prefers-reduced-motion` removes travel and entrance motion while keeping navigation intact.

## Voice

Plain English, active voice, first person only for work actually done. No invented metrics, job titles or dates; each case separates the documented state from the next step.
