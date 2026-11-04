---
id: observability
title: Making telemetry failures visible
summary: Freshness and delivery status matter as much as collected metrics.
technologies: [Python, systemd, Uptime Kuma, Grafana, Loki]
technologyContext: "Python tracks each source's freshness and failure class; Grafana and Loki surface the evidence, while Uptime Kuma monitors heartbeat delivery."
---

## Context
A scheduled speedtest kept updating its local telemetry file while the corresponding uptime monitor reported that no heartbeat had arrived. The monitor was right, but the cause was hidden twice: the heartbeat URL pointed at the wrong host, and the sending script ended the request with a guard that discarded the error, so the systemd unit still exited successfully. A collection could look healthy while its delivery had been failing for days.

## Contribution and decision
I corrected the heartbeat destination, kept the existing push token out of the repository, and changed the script to record the speedtest error and to fail explicitly when the push fails. The broader correction was in how the telemetry collector describes its own data: each source now carries a freshness record with a status of OK, STALE or UNKNOWN, the last successful timestamp, and an error class. Fast-changing sources such as node status, GPU and status pages go stale after three minutes, while slower host, disk and sensor sources use fifteen minutes, matching how often each is actually collected. A source that fails keeps its last good value but is labelled stale rather than silently presented as current.

Several tradeoffs were accepted. Keeping the last known sample keeps dashboards readable during a brief outage, but only because the stale label travels with the value. Status-page queries run in parallel to bound latency, and each source is scored independently so one failure does not erase the rest. A secondary read-only monitor adapter was kept in a separate field so that its failure cannot affect the dashboard, and the storage figure is labelled with its origin when it falls back from physical usage to an API aggregate. Separately, a Grafana overview panel that did not report source coverage as intended was rewritten to use a time-window count and validated against the saved dashboard.

## Observed result
The historical record shows a syntax check, a manual collection that exited successfully and updated the telemetry file with valid data, and the speedtest monitor receiving a successful heartbeat with an OK message. No active monitor was left failing, and the service returned to its normal inactive state — expected for a successful one-shot, not a failure signal. The corrected Grafana query returned data for eleven host and service combinations and was confirmed saved in the original dashboard. These results are documented observations, not a claim about current dashboards or monitors.

## Learning and next step
A metric, its age and the success of its delivery are three different observations, and collapsing them hides outages. Preserve those distinctions when extending dashboards or alerting: a stale value with a timestamp is more useful than a blank panel, and a passing timer is not evidence that a remote system received anything.

## Documented state
The speedtest incident and its correction are recorded in an operation report dated 14 September 2026, including the backup, syntax check, manual collection, monitor heartbeat and rollback path. The Grafana panel correction appears in a later operation report dated 6 October 2026, with the query response and saved dashboard confirmed. The per-source freshness model is present in the versioned collector source rather than in a dated live observation, so it describes implemented behavior, not measured uptime. None of these records establishes the current monitors, dashboards or telemetry output, and no long-term delivery rate is claimed.
