---
{
  "title": "Areas of development",
  "phases": [
    { "id": "foundation", "name": "Foundation", "description": "Virtualization and Linux establish the environment.", "skills": ["Linux", "Proxmox"], "cases": ["automation"], "challenge": "Keep management and workload boundaries clear.", "learning": "Treat documented configuration and live state as distinct.", "status": "Virtualization is documented.", "next": "Continue checking assumptions against evidence." },
    { "id": "services", "name": "Services", "description": "Feed delivery is independent of GPU inference.", "skills": ["Python", "Miniflux", "Discord", "HMAC"], "cases": ["rss-relay"], "challenge": "Keep service delivery independent of scarce compute.", "learning": "Remove unnecessary dependencies from a critical path.", "status": "The relay change is documented as a historical operation.", "next": "Translation was left as a separate possible change." },
    { "id": "operations", "name": "Automation & observability", "description": "Inspection, simulations and telemetry support operations.", "skills": ["Ansible", "Semaphore", "Grafana", "Loki"], "cases": ["automation", "alert-relay", "observability"], "challenge": "Distinguish missing, old and failed observations.", "learning": "Keep safe inspection separate from changes.", "status": "Historical tests and simulations are documented.", "next": "Validate a change before applying it." },
    { "id": "accelerated", "name": "Accelerated computing", "description": "A shared GPU has an explicit lifecycle and isolation boundary.", "skills": ["Linux", "systemd", "Podman", "GPU"], "cases": ["gpu-lab"], "challenge": "Prevent stale sessions from claiming a shared resource.", "learning": "Prove ownership and cleanup together.", "status": "A historical cutover and recovery checks are documented.", "next": "Retest the ordinary user journey after lifecycle changes." }
  ]
}
---
These phases are an editorial grouping, not a measured chronology.
