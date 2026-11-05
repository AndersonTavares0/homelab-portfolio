# Design

## Mode

Experience: the work leads and the interface recedes. A visitor can read every case without interacting with the Homelab Explorer; exploration adds context rather than gating the story.

## Direction

Atlas is a mineral-green survey atlas: an editorial field record of infrastructure decisions, not a live operations console. Pale mineral pages carry the case studies; the dark instrument surface marks the boundary between narrative and the documented service map. The visual language should make evidence, responsibility and limits easier to scan.

The first viewport pairs the thesis with a credential-boundary example. It uses the actual documented CrowdSec → alert relay → Telegram roles and explicitly says the illustration is not live status. The work then moves through a shared workflow overview, selected case studies, lessons, the Explorer and a concise professional summary.

## Palette and type

| Role | Light Atlas | Dark Atlas | Explorer plate |
|---|---|---|---|
| Ground | `#eceee7` | `#0b1513` | `#0b181d` |
| Raised surface | `#e2e6dc` | `#12211e` | `#102025` / `#162c32` |
| Rule | `#c5cdc3` | `#2a423b` | `#3b5f5a` |
| Main text | `#14211f` | `#edf1e8` | `#eef1e8` |
| Secondary text | `#3f5450` | `#b8c7bf` | `#bdd0c9` |
| Accent | `#1f5d45` | `#8fd6b8` | `#8fd6b8` |
| Signal | `#b24c2a` | `#e6a278` | `#e6a278` |

Fraunces Variable carries display headings and selected editorial statements. Public Sans Variable carries body copy and controls. JetBrains Mono Variable is reserved for actual data and measurements. All fonts are self-hosted. The light/dark theme applies to the document; the Explorer and boundary figure retain their instrument-surface palette in either theme.

Text contrast must meet WCAG AA (4.5:1 for normal text, 3:1 for large text). Focus is visible and distinct from selected state; selection is conveyed by `aria-pressed` and a border/inset accent, not color alone. Links in prose remain underlined.

## Layout and diagrams

The home page uses an asymmetric hero, editorial two-column section introductions, a project register and a field-rule list. Reading pages keep a restrained measure; narrow viewports and 200% zoom must not create horizontal page overflow. Navigation and content order remain understandable without motion or JavaScript.

The service field uses ordinary HTML and inline SVG. Five functional lanes organize documented services: automation, two delivery paths, observability and compute. The layout is not a physical floor plan, exhaustive inventory, or live health view. Relationship lines appear only when supported by a case study; shared membership or technology never implies a connection. The side panel explains each selected service’s purpose, decision, evidence limits, technologies and source case. A separate study-trace state follows documented service/relationship sequences and is serialized as `?trace=<case-id>`; category, query and selected service use `category`, `q` and `service` URL parameters.

On narrow screens, the map becomes a readable single-column lane list with relationship labels in the service rows. Desktop zoom and pan controls are hidden where they would not help. Selection, filters, trace chips and search use native HTML controls; keyboard navigation follows visible service order. Search and selection are enhancements, not prerequisites for reading the page.

The “How the parts talk” diagrams use shared, labelled lanes and solid arrows whose labels state what crosses them. The home page renders the overview model; case studies render their relevant workflow. Diagrams communicate documented roles, not topology or operational state. They avoid hostnames, addresses, ports, guest identifiers, schedules and credentials, and state that they are historical documentation rather than live traffic.

## Interaction and motion

Theme choice follows system preference until the visitor explicitly chooses a theme; that choice is stored locally. URL state makes Explorer views shareable and browser history navigable. The map works without WebGL and supports keyboard, touch, visible focus, empty states, reduced-motion preference and forced-colors mode.

Motion is brief and informational: a page arrival and a restrained flow cue on the boundary figure. It must never hide content, signal operational health, or be required to understand a connection. `prefers-reduced-motion` removes travel and entrance motion while preserving navigation and state changes.

## Voice and evidence

Use plain English and active voice. First person is reserved for work actually performed. Do not invent services, relationships, metrics, job titles or dates. Distinguish observed historical state from proposed next steps, and do not imply that a documented service is currently running. The portfolio is static and makes no requests to the homelab.
