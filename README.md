# Homelab project archive

This repository preserves authored homelab project records and the evidence behind them.

Infrastructure projects documented through hands-on work with Linux, virtualization, container operations, observability and shared GPU computing. Each case records a problem, a technical decision and the evidence available.

**Engineer:** Anderson Tavares · [GitHub profile](https://github.com/AndersonTavares0)

## Skills

Linux, Proxmox, Podman, systemd, Ansible, Semaphore, Grafana, Loki, Python

## Case studies

Each study records its context, decision, observed result, learning and documented state. Results remain tied to the evidence and date of their source.

| Study | Focus | Technologies |
|---|---|---|
| [Automation with a review boundary](content/cases/automation.md) | Ansible and Semaphore separate read-only discovery, simulation and guarded changes. | Ansible, Semaphore, Proxmox, Linux |
| [Decoupling an RSS relay from inference](content/cases/rss-relay.md) | Removing an unnecessary GPU dependency while retaining reliable feed delivery. | Python, Miniflux, Discord, HMAC |
| [Making telemetry failures visible](content/cases/observability.md) | Freshness and delivery status matter as much as collected metrics. | Python, systemd, Uptime Kuma, Grafana, Loki |
| [Safer alert delivery](content/cases/alert-relay.md) | A local relay keeps alert credentials out of a plugin's error messages. | CrowdSec, Telegram, Python, systemd |
| [Sharing a GPU safely](content/cases/gpu-lab.md) | A single lifecycle controller coordinates an interactive lab and production inference. | Linux, systemd, Podman, GPU, Python |

## Areas of development

These phases are an editorial grouping, not a measured chronology.

| Theme | Challenge and learning | Related studies |
|---|---|---|
| Foundation | Keep management and workload boundaries clear.<br>Treat documented configuration and live state as distinct. | Automation with a review boundary |
| Services | Keep service delivery independent of scarce compute.<br>Remove unnecessary dependencies from a critical path. | Decoupling an RSS relay from inference |
| Automation & observability | Distinguish missing, old and failed observations.<br>Keep safe inspection separate from changes. | Automation with a review boundary, Safer alert delivery, Making telemetry failures visible |
| Accelerated computing | Prevent stale sessions from claiming a shared resource.<br>Prove ownership and cleanup together. | Sharing a GPU safely |

## Validate the archive

Requires Node.js 20 or newer.

```sh
npm ci
npm run content:check
npm run content:build
npm test
npm audit --audit-level=low
```

These case studies are historical project records, not live telemetry or a current inventory. Their results and limitations apply to the dates and evidence stated in each study.

## License

Original writing is [CC BY 4.0](CONTENT-LICENSE.md). Repository tooling is [MIT licensed](LICENSE).
