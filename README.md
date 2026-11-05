<div align="center">

<h1>Homelab portfolio</h1>

<p><a href="https://andersontavares0.github.io/homelab-portfolio/"><img alt="Live portfolio website" src="https://img.shields.io/badge/site-live-2A9D8F?logo=githubpages&logoColor=white"></a> <img alt="Next.js" src="https://img.shields.io/badge/Next.js-static_export-000000?logo=nextdotjs&logoColor=white"> <img alt="React" src="https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white"> <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white"> <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white"> <img alt="React Flow service map" src="https://img.shields.io/badge/service_map-React_Flow-2459b7"></p>

<p><strong>Infrastructure, understood by building.</strong></p>

<p>Infrastructure projects documented through hands-on work with Linux, virtualization, container operations, observability and shared GPU computing. Each case records a problem, a technical decision and the evidence available.</p>

<p><a href="https://andersontavares0.github.io/homelab-portfolio/">Live site</a> · <a href="#case-studies">Case studies</a> · <a href="#development-themes">Development themes</a> · <a href="#homelab-explorer">Homelab Explorer</a> · <a href="#professional-summary">Professional summary</a> · <a href="#run-locally">Run locally</a></p>

</div>

## Skills

Linux · Proxmox · Podman · systemd · Ansible · Semaphore · Grafana · Loki · Python

## Case studies

Each study records its context, decision, observed result, learning and documented state. Results remain tied to the evidence and date of their source.

| Study | Focus | Technologies |
|---|---|---|
| [Automation with a review boundary](content/cases/automation.md) | Ansible and Semaphore separate read-only discovery, simulation and guarded changes. | Ansible, Semaphore, Proxmox, Linux |
| [Decoupling an RSS relay from inference](content/cases/rss-relay.md) | Removing an unnecessary GPU dependency while retaining reliable feed delivery. | Python, Miniflux, Discord, HMAC |
| [Making telemetry failures visible](content/cases/observability.md) | Freshness and delivery status matter as much as collected metrics. | Python, systemd, Uptime Kuma, Grafana, Loki |
| [Safer alert delivery](content/cases/alert-relay.md) | A local relay keeps alert credentials out of a plugin's error messages. | CrowdSec, Telegram, Python, systemd |
| [Sharing a GPU safely](content/cases/gpu-lab.md) | A single lifecycle controller coordinates an interactive lab and production inference. | Linux, systemd, Podman, GPU, Python |

## Development themes

Each phase pairs a challenge with a lesson. They group related work as editorial themes, not a measured chronology.

| Theme | Challenge and learning | Related studies |
|---|---|---|
| Foundation | Keep management and workload boundaries clear.<br>Treat documented configuration and live state as distinct. | Automation with a review boundary |
| Services | Keep service delivery independent of scarce compute.<br>Remove unnecessary dependencies from a critical path. | Decoupling an RSS relay from inference |
| Automation & observability | Distinguish missing, old and failed observations.<br>Keep safe inspection separate from changes. | Automation with a review boundary, Safer alert delivery, Making telemetry failures visible |
| Accelerated computing | Prevent stale sessions from claiming a shared resource.<br>Prove ownership and cleanup together. | Sharing a GPU safely |

## Homelab Explorer

The explorer is a teaching map of the documented work, not a dashboard. Each line below is a relationship described by one of the case studies:

```mermaid
flowchart TB
  CrowdSec["CrowdSec<br/>detection payload"] --> AlertRelay["Local alert relay<br/>credential boundary"]
  AlertRelay --> Telegram["Telegram<br/>alert destination"]
  Miniflux["Miniflux<br/>feed webhooks"] --> RSSRelay["RSS relay<br/>deduplication and queue"]
  RSSRelay --> Discord["Discord<br/>feed destination"]
  Semaphore["Semaphore<br/>execution console"] --> Ansible["Ansible<br/>versioned playbooks"]
  Ansible --> Proxmox["Proxmox<br/>read-only facts"]
```

The service map presents the same work as an interactive React Flow diagram with a readable service list on small screens. Its 15 services sit in 4 editorial areas (automation, delivery, observability, compute), positioned for reading rather than mapped to physical machines. Selecting a service shows its purpose, the decision behind it, the evidence available and documented relationships. Proxmox is shown at its documented role in the automation study; it does not expose a guest inventory here.

The map explains documented relationships and decisions. It never reports health, uptime, current deployment state or an inventory of the real environment, and it makes no requests to the homelab. Its documented links come from the case studies; selecting services and filtering by area are local interactions.

## Professional summary

The `/profile/` route presents a concise, project-based summary that readers can print.

## Site routes

| Route | Purpose |
|---|---|
| `/` | Atlas home, skills, project index, lessons and the Homelab Explorer |
| `/cases/` | Catalogue of all five studies |
| `/cases/<id>/` | Full study with context, decisions and documented state |
| `/profile/` | Printable, project-based professional summary |
| Unknown path | Editorial 404 page |


## Run locally

Requires Node.js 22.23.4 or newer.

```sh
npm ci
npm run dev
```

Open the local address printed by Next.js, normally `http://localhost:3000`.

To inspect the static build, run these commands after stopping the development server:

```sh
npm run build
node scripts/serve-dist.mjs 4321 out
```

## Verify changes

Run the content, unit, dependency, build, public-content and browser checks:

```sh
npm run content:check
npm run content:build
npm test
npm audit --audit-level=low
npm run build
npm run audit:public
npm run test:e2e
```

Install Chromium once before the browser suite with `npx playwright install chromium`. Build before `npm run test:e2e`; Playwright serves the generated `out/` export on `127.0.0.1:4327`.
The published site is a static Next.js export. The service map never connects to the homelab or reports live health. `npm audit --audit-level=low` must remain clean.

Private GitHub Actions verifies pushes and pull requests. A push to `main` deploys only after verification; Pages and OIDC write permissions are isolated to that job. The Pages build uses `SITE_BASE_PATH=/homelab-portfolio` and sets `PUBLIC_SITE_URL` at deployment time.

`npm run audit:public` checks configured patterns in authored and generated files. It is a heuristic, not proof that every possible exposure has been removed.

## Privacy and publication

The source repository remains private. The live site is available at [homelab portfolio](https://andersontavares0.github.io/homelab-portfolio/); GitHub Actions deploys the static site from `main` after verification. Case studies distinguish historical records from current live state, and the service map is illustrative rather than a physical inventory or a status monitor.


## License

Original code is [MIT licensed](LICENSE). Original writing and diagrams are [CC BY 4.0](CONTENT-LICENSE.md). Third-party dependencies and fonts retain their own licenses.
