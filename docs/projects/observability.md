# Making telemetry failures visible

**Problem:** a local collector could succeed while a separate heartbeat was not received. A successful scheduled process did not prove successful delivery.

**Decision:** track freshness and failure state alongside the last known value, and make delivery errors visible instead of suppressing them.

## What changed

The collector keeps the last successful value but marks it with freshness and an error class, so a stale sample is not silently presented as current. Sources are assessed independently, allowing one failing source to remain visible without discarding unrelated observations. Heartbeat receipt is tracked separately from collection success: one confirms that a local job ran, while the other confirms delivery to its monitor.

This makes the dashboard a record of both a value and the confidence that it is current. It also means an error must stay visible through the scheduling and delivery layers instead of being converted into a successful process exit.

**Evidence:** historical notes record a corrected heartbeat path, a successful manual collection, and a dashboard query correction. These are dated observations, not current monitoring status.

**Source dates:** 2026-09-14 and 2026-10-06.

**Limit:** no long-term delivery rate or current dashboard/monitor health is established. The records do not support drawing direct data-flow edges between every named observability component.

**Lesson:** value, age, and delivery are separate signals. Keep them separate so stale data cannot look current and a passing timer cannot stand in for receipt.
