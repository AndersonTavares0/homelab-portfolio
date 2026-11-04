# Anderson Tavares

Infrastructure projects documented through hands-on work with Linux, virtualization, container operations, observability and shared GPU computing. Each case records a problem, a technical decision and the evidence available.

[GitHub profile](https://github.com/AndersonTavares0)

![Illustrative infrastructure topology showing virtualization, services, alerting, automation, observation and GPU computing](public/topology.svg)

## Skills

Linux · Proxmox · Podman · systemd · Ansible · Semaphore · Grafana · Loki · Python

## Projects

- **[Safer alert delivery](content/cases/alert-relay.md)** — A local relay keeps alert credentials out of a plugin's error messages.
- **[Automation with a review boundary](content/cases/automation.md)** — Ansible and Semaphore separate read-only discovery, simulation and guarded changes.
- **[Sharing a GPU safely](content/cases/gpu-lab.md)** — A single lifecycle controller coordinates an interactive lab and production inference.
- **[Making telemetry failures visible](content/cases/observability.md)** — Freshness and delivery status matter as much as collected metrics.
- **[Decoupling an RSS relay from inference](content/cases/rss-relay.md)** — Removing an unnecessary GPU dependency while retaining reliable feed delivery.

## Areas of development

These phases are an editorial grouping, not a measured chronology.

### Foundation

Virtualization and Linux establish the environment.

Documented state: Virtualization is documented.

Next: Continue checking assumptions against evidence.

### Services

Container services and a feed relay extend the environment.

Documented state: The relay change is documented as a historical operation.

Next: Translation was left as a separate possible change.

### Automation & observability

Inspection, simulations and telemetry support operations.

Documented state: Historical tests and simulations are documented.

Next: Validate a change before applying it.

### Accelerated computing

A shared GPU has an explicit lifecycle and isolation boundary.

Documented state: A historical cutover and recovery checks are documented.

Next: Retest the ordinary user journey after lifecycle changes.

Each case separates the documented state from the next step; see the studies above for sources and limits.

## Development

Requires Node.js 22.23.4 or newer.

```sh
npm ci
npm run dev        # local development
npm run build      # static build into dist/
npm run preview    # serve the built site on 127.0.0.1:4321
npm test           # model and content unit tests
npm run test:e2e   # Chromium end-to-end tests against the built site
npm run content:check
npm run content:build  # regenerate this README
npm run audit:public   # heuristic scan of authored and built files
```

Run `npm run build` before `npm run test:e2e`: the browser tests serve `dist` through `scripts/serve-dist.mjs`, which avoids the single-instance lock of `astro preview`.

## Routes

- `/` — editorial home, project index, lessons and the Observatory
- `/cases/` — catalogue in thematic order
- `/cases/<id>/` — the five studies, each with its documented state
- `/profile/` — printable professional summary
- unknown paths — the not-found page built from `src/pages/404.astro`

The Observatory state is deep-linkable, for example `/?phase=accelerated&component=gpu#observatory`.

Share metadata uses relative URLs by default. Set `PUBLIC_SITE_URL` to an absolute origin at build time when the site has one, so Open Graph and Twitter previews resolve.

## Licensing

Original code is [MIT licensed](LICENSE). Original text and diagrams are [CC BY 4.0](CONTENT-LICENSE.md). Third-party dependencies and fonts keep their own licenses.
