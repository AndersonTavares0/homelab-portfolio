# Decoupling feed delivery from inference

**Problem:** a feed relay depended on local inference even though forwarding entries did not require a model. That dependency coupled a routine notification path to a shared compute resource.

**Decision:** one recorded revision removed inference and ranking from delivery, keeping the relay focused on filtering, deduplication, and forwarding.

## Trade-off

The relay retained URL/title deduplication and a digest queue while dropping translation and model-based ranking from the delivery path. Entries were forwarded in their original language and selection relied on source and recency rules. This made that revision less dependent on GPU availability, at the cost of less enriched messages. A later owner-provided note records that model-backed processing returned, so this is a record of one design iteration rather than a current architecture claim.

**Evidence:** the operation record describes a successful compile, a service restart, and a signed request that exercised an empty-entry path without posting a message.

**Source date:** 2026-10-07. A subsequent owner-provided note records a later revision that reintroduced model-backed processing.

**Limit:** the check did not measure throughput or prove current delivery. A later note records model-backed processing being reintroduced, so this change is not presented as the current architecture.

**Lesson:** remove a dependency only after defining the core delivery contract and trade-offs. Historical project records should preserve revision boundaries rather than flattening changes into one supposedly current design.
