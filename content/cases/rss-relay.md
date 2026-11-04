---
id: rss-relay
title: Decoupling an RSS relay from inference
summary: Removing an unnecessary GPU dependency while retaining reliable feed delivery.
technologies: [Python, Miniflux, Discord, HMAC]
technologyContext: "Python receives Miniflux webhooks, deduplicates and queues entries, then signs Discord delivery with HMAC; the delivery path no longer depends on GPU inference."
---

## Context
An RSS-to-Discord relay translated and scored each non-critical feed entry through a local inference endpoint. Every Miniflux webhook could wake and load a model on the GPU, which competed with the exclusive lab lease and with production recycling. Delivery did not actually need a model: the relay's job was to deduplicate, filter and forward entries on a schedule, and an unavailable inference server became an availability risk for notifications.

## Contribution and decision
I removed inference, translation and importance scoring from the delivery path in both the repository and the running service, including the retry loop that kept unclassified entries alive and the importance filter applied to digests. What remained was the part that made delivery trustworthy: URL and title deduplication, a maximum-age freshness window, a noise prefilter, immediate embedding for selected critical feeds, a durable digest queue, category sends twice a day, an HMAC-signed webhook, a request body limit and a concurrency semaphore. Titles and summaries are now forwarded exactly as received.

The tradeoff was explicit. The relay lost automatic translation and ranking, so feeds published in English reach the channel in their original language and digest entries are selected by recency and source rules rather than a model score. In exchange, feed delivery no longer depends on GPU availability or on the lab lease, and the processing path became deterministic.

## Observed result
The cutover record reports compiling the script, finding no remaining references to the old inference functions, restarting the service and confirming it was running. A signed webhook with an empty entry list returned HTTP 200, which exercised signature verification and the handler without posting to Discord. The repository copy was rewritten to match, with only a secret placeholder differing from the live file. These are historical deployment checks, not a statement about the service today.

## Learning and next step
Removing a dependency can resolve resource contention without changing the core delivery contract, provided the contract itself is identified before cutting code. Translation without GPU inference was recorded as a separate possible future change, deliberately not claimed as working.

## Documented state
The source is an operation note dated 7 October 2026 covering both the running host and the repository copy. It establishes the removal of the inference code, the successful compile, the service restart, the signed empty-webhook response and parity between repository and host apart from a secret placeholder, with a pre-change backup recorded. It contains no throughput, latency, delivery-volume or translation-quality measurement, and it does not describe the service after that date. The absence of translation is stated as a deliberate tradeoff, not as a temporary regression.
