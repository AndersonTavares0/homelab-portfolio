---
id: rss-relay
title: Decoupling an RSS relay from inference
summary: Removing an unnecessary GPU dependency while retaining reliable feed delivery.
technologies: [Python, Miniflux, Discord, HMAC]
---

## Context
An RSS-to-Discord relay used inference to translate and score feed entries. Each webhook could wake the model and compete with an exclusive GPU lab lease.

## Contribution and decision
The documented change removed inference and scoring from the delivery path. URL and title deduplication, freshness filtering, signed webhooks, a durable digest queue and immediate delivery for selected feeds remained.

## Observed result
The operation record reports a successful signed empty webhook and a running service after the change. Feed titles and summaries were forwarded in their original language; translation was deliberately removed rather than represented as still available.

## Learning and next step
Removing a dependency can resolve resource contention without changing the core delivery contract. Translation without GPU inference was recorded as a separate possible future change.
