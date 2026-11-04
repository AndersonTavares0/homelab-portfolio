---
id: gpu-lab
title: Sharing a GPU safely
summary: A single lifecycle controller coordinates an interactive lab and production inference.
technologies: [Linux, systemd, Podman, GPU, Python]
---

## Context
A GPU used by production inference also needed to support isolated interactive lab sessions. Concurrent ownership and incomplete cleanup could leave the resource in an unknown state.

## Contribution and decision
The documented design gives one controller ownership of transitions. Each attempt carries a generation and session identity; stale operations cannot release a newer attempt. A transient systemd service and a rootless Podman container establish a boundary per generation.

## Observed result
The cutover record describes successful boundary checks and recovery after disconnects, forced termination and stale release. It also records a PTY correction to preserve interactive input and terminal resizing. These are historical validation results, not a claim about current live state.

## Learning and next step
Resource ownership needs proof at both acquisition and cleanup. Continue validating the normal user path and the surrounding runtime together when the design changes.
