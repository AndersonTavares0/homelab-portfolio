# Automation with a review boundary

**Problem:** inspection, update prediction, and package changes have different risk. Combining them makes it difficult to tell what a run is permitted to do.

**Decision:** use Semaphore to launch versioned Ansible playbooks with distinct paths for read-only facts, update simulation, and manually guarded changes.

## How the pieces fit

Semaphore is the execution interface; Ansible contains the versioned tasks and target definitions. The separation is intentional: collecting facts should not have the same effect or authority as applying updates. A preview remains a review aid, and a separate human action is needed before a change path runs.

**Evidence:** a historical validation collected facts and simulated updates without reporting package changes or reboots.

**Source date:** 2026-10-09.

**Limit:** the record does not establish successful application, rollback behavior, or current configuration. A simulation is not evidence that a later change succeeded.

**Lesson:** define and review the write boundary before automation can mutate a system. Keep host inventories, access methods, credential scopes, and exact policy out of the public record.
