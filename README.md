# Anderson Tavares

Infrastructure projects documented through hands-on work with Linux, virtualization, container operations, observability and shared GPU computing. Each case records a problem, a technical decision and the evidence available.

[GitHub profile](https://github.com/AndersonTavares0)

![Illustrative infrastructure topology showing virtualization, services, alerting, automation, observation and GPU computing](public/topology.svg)

## Skills

Linux · Proxmox · Podman · systemd · Ansible · Semaphore · Grafana · Loki · Python

## Projects

- **Safer alert delivery** — A local relay keeps alert credentials out of a plugin's error messages.
- **Automation with a review boundary** — Ansible and Semaphore separate read-only discovery, simulation and guarded changes.
- **Sharing a GPU safely** — A single lifecycle controller coordinates an interactive lab and production inference.
- **Making telemetry failures visible** — Freshness and delivery status matter as much as collected metrics.
- **Decoupling an RSS relay from inference** — Removing an unnecessary GPU dependency while retaining reliable feed delivery.

## Areas of development

These phases are an editorial grouping, not a measured chronology.

- **Foundation**: Virtualization and Linux establish the environment. Virtualization is documented. Treat documented configuration and live state as distinct. Next: Continue checking assumptions against evidence.
- **Services**: Container services and a feed relay extend the environment. The relay change is documented as a historical operation. Remove unnecessary dependencies from a critical path. Next: Translation was left as a separate possible change.
- **Automation & observability**: Inspection, simulations and telemetry support operations. Historical tests and simulations are documented. Keep safe inspection separate from changes. Next: Validate a change before applying it.
- **Accelerated computing**: A shared GPU has an explicit lifecycle and isolation boundary. A historical cutover and recovery checks are documented. Prove ownership and cleanup together. Next: Retest the ordinary user journey after lifecycle changes.

## Development

Run npm ci, npm run dev, or npm run build. Generate this README with npm run content:build.

Original code is MIT licensed; original text and diagrams are CC BY 4.0.
