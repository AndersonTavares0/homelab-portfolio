---
id: automation
title: Automation with a review boundary
summary: Ansible and Semaphore separate read-only discovery, simulation and guarded changes.
technologies: [Ansible, Semaphore, Proxmox, Linux]
---

## Context
A mixed set of Linux guests and a Proxmox host need routine inspection and updates, but "run automation against production" hides three different operations: reading facts, predicting an update, and changing packages. Treating them as one path makes it easy to apply an unreviewed change or to lose track of which host was touched. The lab also has to work without granting a single automation identity broad write access.

## Contribution and decision
I used Semaphore as the execution console with versioned Ansible playbooks and inventories, and kept credentials in its key store instead of the repository. Inventory is split by purpose and privilege: production guests grouped by operational tier, a separate read-only Proxmox inventory whose playbook runs without privilege escalation, a sandbox inventory that is deliberately not executed, and a localhost inventory restricted to provisioning in a sandbox pool.

Templates mirror the review boundary. Read-only fact collection is separate from package simulation, and applying updates exists only as a manual template that requires an exact confirmation token per tier. Applies run one host at a time with the safe upgrade policy and never remove packages or reboot automatically. The Proxmox API token is privilege-separated, audit-only globally, with write access confined to the sandbox pool and an explicit denial on one guest; the SSH key used by production playbooks is accepted from a single control host. Updates to the Proxmox host itself follow a separate fail-closed agent that blocks kernel, driver, firmware, bootloader, network and storage packages and never reboots.

## Observed result
A documented validation collected facts from eight guests and the Proxmox host with no reported changes, and simulated pending updates on the complete production set without installing anything. No reboot occurred. The same record states clearly that the manual apply templates had not yet been used to install packages. It also records the limits: no Ansible schedules exist for the control-plane project, guest updates are scheduled through a separate version-audit runner, sandbox provisioning still injects a sandbox key into a root account during container creation, and the playbooks do not manage networking, storage, passthrough or application data. A second scheduler was intentionally avoided so two timers cannot update the same targets.

## Learning and next step
A successful simulation is evidence about a proposed change, not proof that a later apply succeeded, and the two should be reported separately. Keep execution and recovery boundaries explicit, including who may write where, before applying changes. Close the remaining bootstrap gap in sandbox provisioning and validate an apply end to end before treating it as proven.

## Documented state
The evidence is a validation dated 9 October 2026 against a specific revision of the control repository. It establishes successful read-only facts on eight guests and the Proxmox host, simulations across the production set, and the absence of package changes and reboots. It also records what had not happened: the manual apply templates had never installed packages, no Ansible schedules existed for that project, and the sandbox provisioning template still left a key in a root account. Apply success, rollback behavior and long-term drift remain unproven, and the record describes that revision rather than current configuration.
