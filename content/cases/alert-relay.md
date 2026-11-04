---
id: alert-relay
title: Safer alert delivery
summary: A local relay keeps alert credentials out of a plugin's error messages.
technologies: [CrowdSec, Telegram, Python, systemd]
---

## Context
A notification plugin could log a complete credential-bearing URL on request errors, even with logging configured off.

## Contribution and decision
A small local relay holds the destination credential separately, forces the configured destination and records only safe status classes. Its systemd service runs with an unprivileged dynamic identity and hardening. CrowdSec remained in detection-only simulation.

## Observed result
The historical operation record describes both a controlled synthetic failure without the credential in logs and successful delivery of a test alert. The relay does not perform remediation or change security decisions.

## Learning and next step
Test the failure path with synthetic credentials; a quiet success path alone cannot prove that errors avoid sensitive data. Keep notification content limited to the fields needed by the recipient.
