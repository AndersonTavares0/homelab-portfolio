# Services and roles

This is a guide to components named in the project records, not a live catalogue. A mention does not mean a service is currently running or that its placement and integrations have been verified.

| Area | Components | Documented role |
|---|---|---|
| Virtualization | Proxmox VE | Platform referenced by the automation and infrastructure records. |
| Automation | Semaphore, Ansible | Launching versioned playbooks and separating inspection from changes. |
| Alert delivery | CrowdSec, a Python relay, Telegram | A historical notification path designed to keep sensitive destination data out of plugin errors. |
| Feed delivery | Miniflux, a Python relay, Discord | A historical project to forward feed entries; the inference dependency changed across revisions. |
| Observability | Grafana, Loki, Uptime Kuma, telemetry collector | Dashboards, logs, and heartbeat/freshness observations described in separate records. Direct ingestion paths are not inferred. |
| Shared compute | Linux, systemd, Podman, GPU | Lifecycle and containment components described by the GPU Lab project. |

The owner has also described an LGTM stack. The retained project evidence discusses Grafana and Loki, but does not establish current use or data paths for every LGTM component. Docker is owner-reported; the available records do not map it to a specific service.

For the reasoning and evidence behind each integration, see [Architecture](architecture.md) and [Project records](projects/).
