import { expect, test } from '@playwright/test';

const studies = [
  {
    id: 'automation',
    title: 'Automation with a review boundary',
    technologies: 'Ansible / Semaphore / Proxmox / Linux',
    context: 'Semaphore launches versioned Ansible playbooks: facts, update simulations and individually confirmed applies stay separate.'
  },
  {
    id: 'rss-relay',
    title: 'Decoupling an RSS relay from inference',
    technologies: 'Python / Miniflux / Discord / HMAC',
    context: 'Python receives Miniflux webhooks, deduplicates and queues entries, then signs Discord delivery with HMAC; the delivery path no longer depends on GPU inference.'
  },
  {
    id: 'observability',
    title: 'Making telemetry failures visible',
    technologies: 'Python / systemd / Uptime Kuma / Grafana / Loki',
    context: "Python tracks each source's freshness and failure class; Grafana and Loki surface the evidence, while Uptime Kuma monitors heartbeat delivery."
  },
  {
    id: 'alert-relay',
    title: 'Safer alert delivery',
    technologies: 'CrowdSec / Telegram / Python / systemd',
    context: 'CrowdSec sends to a loopback-only Python relay; systemd hardens the process, which alone reads the Telegram destination and credential.'
  },
  {
    id: 'gpu-lab',
    title: 'Sharing a GPU safely',
    technologies: 'Linux / systemd / Podman / GPU / Python',
    context: 'A root-owned controller and transient systemd service bind the rootless Podman container inside the verified cgroup before sharing the GPU.'
  }
];

test('project index explains how the technologies work in each documented case', async ({ page }) => {
  for (const study of studies) {
    await page.goto('/');
    const row = page.locator('.project-list a').filter({ hasText: study.title });
    await expect(row).toContainText(study.technologies);
    await expect(row).toContainText(study.context);
    await expect(row).toHaveAttribute('href', `/cases/${study.id}/`);

    await page.goto(`/cases/${study.id}/`);
    await expect(page.locator('.case-technology-context')).toContainText(study.context);
  }
});

test('the Observatory relates a selected system to its technology decision', async ({ page }) => {
  await page.goto('/?phase=accelerated&component=gpu#observatory');
  await expect(page.locator('.observatory__detail')).toContainText('A root-owned controller and transient systemd service bind the rootless Podman container inside the verified cgroup before sharing the GPU.');
});
