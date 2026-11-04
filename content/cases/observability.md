---
id: observability
title: Making telemetry failures visible
summary: Freshness and delivery status matter as much as collected metrics.
technologies: [Python, systemd, Uptime Kuma, Grafana, Loki]
---

## Context
A network measurement could update local telemetry while its monitoring heartbeat failed. The failure was hidden because the sending command suppressed errors.

## Contribution and decision
The documented correction made heartbeat delivery failures visible and fixed the destination. Related telemetry code tracks source freshness separately from the values it collects, so an old sample is distinguishable from a fresh one.

## Observed result
A historical manual collection updated telemetry and delivered a successful heartbeat. A successful oneshot service then returned to its normal inactive state; inactive alone was not treated as failure.

## Learning and next step
A metric, its age and the success of its delivery are different observations. Preserve those distinctions when extending dashboards or alerting.
