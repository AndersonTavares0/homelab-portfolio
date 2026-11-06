# Automation

The automation project treats inspection, simulation, and mutation as different operations. That distinction makes it easier to review what a run can do before it is allowed to change a system.

## Documented workflow

The retained record describes Semaphore launching versioned Ansible playbooks. Read-only fact collection, update simulation, and manually guarded changes are separate paths. A validation collected facts and simulated updates without reporting package changes or reboots.

This is evidence about one historical revision. It does not prove that changes were later applied successfully, that rollback works, or that the same configuration is active now.

## Decisions and lessons

- Keep discovery separate from writes so an inspection run cannot silently become a change.
- Treat simulation output as a prediction, not proof of a successful apply.
- Record what was and was not exercised; avoid presenting an untested path as operational.
- Keep inventories, credentials, host details, and privilege rules out of this public documentation.

See [Automation with a review boundary](projects/automation.md) for the project record.
