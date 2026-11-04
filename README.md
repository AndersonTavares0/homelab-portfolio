# Infrastructure in practice

A portfolio of infrastructure projects built and documented in a homelab: from virtualized services and container operations to observability, automation and shared GPU computing. The cases focus on decisions, evidence and lessons rather than job titles or unverified outcomes.

## Skills

Linux · Proxmox · Podman · systemd · Ansible · Semaphore · Grafana · Loki · Python

## Projects

- **Safer alert delivery** — A local relay keeps alert credentials out of a plugin's error messages.
- **Automation with a review boundary** — Ansible and Semaphore separate read-only discovery, simulation and guarded changes.
- **Sharing a GPU safely** — A single lifecycle controller coordinates an interactive lab and production inference.
- **Making telemetry failures visible** — Freshness and delivery status matter as much as collected metrics.
- **Decoupling an RSS relay from inference** — Removing an unnecessary GPU dependency while retaining reliable feed delivery.

## Development

The timeline groups work thematically, not chronologically.

Run npm ci, npm run dev, or npm run build. Generate this README with npm run content:build.

Original code is MIT licensed; original text and diagrams are CC BY 4.0.
