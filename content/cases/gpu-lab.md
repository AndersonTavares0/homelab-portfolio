---
id: gpu-lab
title: Sharing a GPU safely
summary: A single lifecycle controller coordinates an interactive lab and production inference.
technologies: [Linux, systemd, Podman, GPU, Python]
technologyContext: "A root-owned controller and transient systemd service bind the rootless Podman container inside the verified cgroup before sharing the GPU."
---

## Context
One consumer GPU serves both production inference and interactive lab sessions, so two workloads with different lifetimes compete for an exclusive resource. The difficult part is ownership rather than throughput: an interrupted acquisition, a dropped client connection or a late cleanup can leave a container, a driver context or the production server in an unknown state. When several components each believe they can free the GPU, a stale release can tear down an attempt that has already been replaced.

## Contribution and decision
I made a root-owned controller the only authority over physical lifecycle. Every mutation carries an attempt, session and monotonically increasing generation; a generation is never reused, and a stale operation is ignored instead of releasing a newer attempt. Transitions run from production through acquiring, lab, cleanup and restoring back to production, with a quarantine state for unprovable ownership that keeps the system closed rather than guessing.

Each attempt gets a transient systemd service and a rootless Podman container with delegated CPU, memory and PID limits. Rootless Podman would otherwise place the payload in a sibling cgroup, so the container is explicitly parented into the service's cgroup, and the attempt only becomes visible as bound after proving that the service, container, runtime and payload all sit inside that subtree. Cleanup is a single idempotent primitive — graceful stop, cgroup kill, container removal, proof of absence, restore and validate production — shared by the reaper, release and administrative paths.

## Observed result
Cutover records show canary sessions reaching bound with a proven boundary. Disconnect, forced termination during acquisition, stale release and death mid-acquire each converged to production without quarantine or residue, and a new session acquired afterwards. Timeouts used the boot identifier and a monotonic clock rather than wall time, so clock changes could not extend a lease, while a 30-second reaper and 45/60-second liveness windows bounded how long an abandoned session could hold the GPU. The documented end-to-end ceiling was 150 seconds, with a failed acquisition observed at 1.6 s and a disconnect at 16.7 s. A late terminal test also isolated a stdin loss in the transient service: pass-through gave the caller a terminal while the container read an empty device, and the final pty option preserved stdin, interrupt, resize and exit status. A 12-hour hard deadline applied to every mode, including healthy long jobs, and 135 local tests covered the controller. These are historical validation results, not a claim about current live state, and the HTTP job path was not exercised at the time.

## Learning and next step
Ownership needs proof at both acquisition and cleanup, not only a successful start. Bound the failure path with independent timers and a monotonic clock, and treat unprovable state as closed rather than recovered automatically. Continue validating the normal user path and the surrounding runtime together when the design changes.

## Documented state
The evidence is a lifecycle document marked closed after a cutover on 7 October 2026, together with a read-only state check on 9 October 2026. It establishes the tested transitions, boundary proofs, recovery timings and the retirement of older validators; the live read confirmed the running services and a production lease without starting a session. It does not establish current state, and the HTTP job path was not validated when audited. An epoch field retained in the state schema is documented as present but not used as an active fence, so the generation triple remains the enforced guard.
