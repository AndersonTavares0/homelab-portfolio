# Infrastructure

This page describes the broad platform reported in the project notes. It is not a hardware inventory and does not claim that every component is currently deployed in the same arrangement.

## Virtualization and operating systems

Proxmox VE is the virtualization platform named in the project records. The documented work spans Linux systems running as virtual machines and containers. Host models, guest counts, identifiers, names, and network configuration are omitted from this public overview.

## Containers and compute

Podman is used in the GPU Lab project to contain an interactive workload. The owner also reports using Docker; the available project records do not establish which services use Docker or how it is placed relative to the virtualization layer.

The GPU Lab notes identify a GTX 1050 Ti as the shared accelerator for inference and experiments. The notes explain a lifecycle and isolation design, but do not prove its present assignment or availability.

Linux study and sandbox experimentation are also part of the owner's description of the lab. The retained project notes do not yet provide a separate, evidence-backed Linux experiment to document, so no standalone Linux Lab page is presented as completed work.

## What is not documented yet

The available sources do not provide enough safe, verified detail for storage, backup, physical networking, or a complete service-to-host map. These topics are left out until there is evidence that can be published without exposing operational details.
