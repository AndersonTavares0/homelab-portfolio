# Sharing a GPU safely

**Problem:** production inference and interactive experiments share one GPU, but interrupted acquisition or late cleanup can leave ownership uncertain.

**Decision:** a single lifecycle controller coordinates exclusive use. Stale operations cannot release a newer session, and uncertain ownership is treated as unavailable until resolved.

## Lifecycle and isolation

The documented state transition is inference → acquisition → interactive lab → cleanup → restored inference. Each attempt has a unique generation so that delayed cleanup from an earlier session cannot release a newer one. The lab workload runs inside a transient systemd/Podman containment boundary; acquisition is complete only after the workload's placement in that boundary is verified.

Cleanup is designed as one repeatable operation: stop the lab workload, prove it is gone, then restore and validate the inference workload. If the controller cannot prove ownership or cleanup, it quarantines the resource instead of assuming it is safe to reuse. This fail-closed behavior trades availability for avoiding overlapping or stale owners.

**Evidence:** historical checks exercised interrupted acquisition, disconnect, stale release, cleanup, and later reacquisition. The project notes also describe a containment boundary around the interactive workload.

**Source dates:** 2026-10-07 and 2026-10-09.

**Limit:** the normal remote job path was not validated in the recorded work. Historical recovery checks do not establish current assignment, performance, or service health.

**Lesson:** prove ownership both when a workload acquires a resource and when it releases it. Cleanup is part of the safety boundary, not housekeeping.

See the [GPU Lab overview](../experiments/gpu-lab.md) for the lifecycle diagram.
