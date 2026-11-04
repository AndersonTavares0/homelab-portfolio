---
id: automation
title: Automation with a review boundary
summary: Ansible and Semaphore separate read-only discovery, simulation and guarded changes.
technologies: [Ansible, Semaphore, Proxmox, Linux]
---

## Context
Managing a mixed set of Linux guests requires visibility and a safe distinction between inspecting a system and changing it.

## Contribution and decision
The documented control plane uses Ansible playbooks through Semaphore. Read-only facts and package simulations are separate from manually confirmed update playbooks. Updates are serialized and do not automatically reboot; credentials are kept out of the repository.

## Observed result
A historical validation reports successful fact collection and update simulations without package changes. The same record explicitly says the manual apply playbooks had not yet been used to install packages.

## Learning and next step
A successful simulation is evidence about a proposed change, not proof that a later apply succeeded. Keep execution and recovery boundaries explicit before applying changes.
