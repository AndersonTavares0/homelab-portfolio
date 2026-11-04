---
id: alert-relay
title: Safer alert delivery
summary: A local relay keeps alert credentials out of a plugin's error messages.
technologies: [CrowdSec, Telegram, Python, systemd]
---

## Context
CrowdSec's notification plugin sent the complete Telegram request URL, including the bot credential, whenever an HTTP request failed. Setting the plugin's log level to off did not help: a controlled test with a synthetic URL showed that the error path still recorded the full destination, so a transient upstream failure could write a working credential into the journal. The relevant documentation also placed variables in the message format rather than in the URL field, which the existing configuration did not follow.

## Contribution and decision
I added a small local relay so the detector never holds the credential-bearing destination. CrowdSec posts its existing payload to a loopback-only endpoint; the relay reads the token and destination from a root-owned environment file, overwrites any incoming destination with the configured one, and forwards the message. It logs only success or a safe HTTP or transport status class, never request bodies, token-bearing URLs, response bodies or exception strings, and its systemd unit runs under a dynamic unprivileged identity with filesystem and network hardening. The notification template was also reduced to an allowlist of confirmed alert fields — scenario, source scope and value, conditional machine identifier, event count, simulated flag, remediation and an explicit UTC timestamp — excluding raw payloads, URIs, query strings, headers, cookies, authorization values, user agents and usernames.

The costs are deliberate: an extra local hop to maintain, a single enforced destination, and alert messages that carry less context than the raw event. Detection-only mode was preserved; the relay transports notifications and changes no profile, decision or remediation behavior.

## Observed result
A controlled failure using a synthetic credential returned a local error while the relay recorded only the upstream status class, and the client output showed just the loopback endpoint — no token and no real destination in the logs. A subsequent test notification was accepted and delivered, the relay was enabled at boot, and a later credential rotation produced no authentication failures in the relay journal. These are historical checks from the operation record, not a statement about current configuration.

## Learning and next step
Exercise the failure path with synthetic credentials, because a quiet success path cannot prove that errors avoid sensitive data. Keep notification content limited to the fields the recipient actually needs, and test that reduction separately from delivery.

## Documented state
The evidence is a partial operation report dated 6 October 2026 and a follow-up audit on 9 October 2026. The report establishes the controlled synthetic failure, the accepted test delivery, boot enablement and the reduced notification template. The later audit confirmed the running service, the loopback listener and the endpoint configuration but intentionally sent no message, so delivery on that date is not re-established. Neither record proves absence of exposure along paths outside the inspected logs, and the same report records that some intermediate outputs were treated as potentially compromised and the affected credential was rotated.
