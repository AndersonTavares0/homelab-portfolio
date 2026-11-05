<script lang="ts">
  import { resolve } from '$app/paths';
  import { services, relations } from '../explorer.js';

  const homePath = resolve('/');
  const serviceHref = (id: string) => `${homePath}?service=${id}#homelab-explorer`;

  const service = (id: string) => services.find(item => item.id === id)!;
  const relation = (id: string) => relations.find(item => item.id === id)!;

  const source = service('crowdsec');
  const boundary = service('alert-relay');
  const destination = service('telegram');
  const inbound = relation('crowdsec-relay');
  const outbound = relation('relay-telegram');
</script>

<figure class="delivery-field" aria-labelledby="delivery-field-title">
  <header class="delivery-field__head">
    <div class="delivery-field__meta">
      <span class="delivery-field__index">Figure 01</span>
      <span class="delivery-field__status">Documented roles</span>
    </div>
    <p class="delivery-field__title" id="delivery-field-title">The credential stops at one boundary.</p>
    <p class="delivery-field__intro">CrowdSec posts to a loopback-only relay. The relay alone owns the Telegram destination and credential.</p>
  </header>

  <div class="delivery-field__stage">
    <div class="chain">
      <a class="field-node" href={serviceHref(source.id)}>
        <span class="field-node__glyph" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3.1 5.2 5.8v5.1c0 4.2 2.9 7.8 6.8 9.4 3.9-1.6 6.8-5.2 6.8-9.4V5.8L12 3.1Z" /><path d="M12 8.8v4.5" /><circle cx="12" cy="16.3" r=".6" fill="currentColor" stroke="none" /></svg>
        </span>
        <span class="field-node__text">
          <span class="field-node__name">{source.name}</span>
          <span class="field-node__role">{source.summary}</span>
        </span>
        <span class="field-node__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg></span>
        <span class="field-visually-hidden">Open in the Homelab Explorer</span>
      </a>

      <div class="chain__edge">
        <span class="chain__rail" aria-hidden="true">
          <span class="chain__flow"></span>
          <svg class="chain__tip" viewBox="0 0 12 8"><path d="m1.5 1.5 4.5 4.5 4.5-4.5" /></svg>
        </span>
        <p class="chain__verb">{inbound.label}</p>
      </div>

      <a class="field-node field-node--boundary" href={serviceHref(boundary.id)}>
        <span class="field-node__glyph" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M5.5 4.6v14.8M18.5 4.6v14.8" /><path d="M8.6 12h6.4" /><path d="m12.4 8.9 3.1 3.1-3.1 3.1" /></svg>
        </span>
        <span class="field-node__text">
          <span class="field-node__name">{boundary.name}</span>
          <span class="field-node__role">{boundary.summary}</span>
          <span class="field-node__tag">Credential boundary</span>
        </span>
        <span class="field-node__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg></span>
        <span class="field-visually-hidden">Open in the Homelab Explorer</span>
      </a>

      <div class="chain__edge">
        <span class="chain__rail" aria-hidden="true">
          <span class="chain__flow"></span>
          <svg class="chain__tip" viewBox="0 0 12 8"><path d="m1.5 1.5 4.5 4.5 4.5-4.5" /></svg>
        </span>
        <p class="chain__verb">{outbound.label}</p>
      </div>

      <a class="field-node" href={serviceHref(destination.id)}>
        <span class="field-node__glyph" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M20.6 3.9 3.8 10.3l5.6 2.1 2.1 5.6 9.1-14.1Z" /><path d="m9.4 12.4 5.5-4" /></svg>
        </span>
        <span class="field-node__text">
          <span class="field-node__name">{destination.name}</span>
          <span class="field-node__role">{destination.summary}</span>
        </span>
        <span class="field-node__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg></span>
        <span class="field-visually-hidden">Open in the Homelab Explorer</span>
      </a>
    </div>

    <aside class="delivery-field__notes" aria-label="What the boundary changes">
      <p>The source holds no destination credential.</p>
      <p>Only the relay process reads the Telegram token.</p>
      <p>The map records the design, not live traffic.</p>
    </aside>
  </div>

  <figcaption class="delivery-field__caption">
    <a class="delivery-field__cta" href={serviceHref(boundary.id)}>Explore the delivery boundary</a>
    <p class="delivery-field__note">Illustrative. Documented roles, not live status.</p>
  </figcaption>
</figure>

<style>
  .delivery-field {
    position: relative;
    min-width: 0;
    margin: 0;
    padding: clamp(1.15rem, 2.2vw, 1.6rem);
    border: 1px solid var(--page-plate-line);
    border-radius: 4px;
    background-color: var(--page-plate);
    background-image:
      linear-gradient(to right, color-mix(in srgb, var(--page-plate-line) 22%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in srgb, var(--page-plate-line) 22%, transparent) 1px, transparent 1px);
    background-size: 2.4rem 2.4rem;
    color: var(--page-plate-text);
    isolation: isolate;
  }

  .delivery-field__head {
    display: grid;
    gap: 0.55rem;
    padding-bottom: 1.1rem;
    border-bottom: 1px solid var(--page-plate-line);
  }

  .delivery-field__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: var(--page-plate-muted);
    font-family: 'JetBrains Mono Variable', ui-monospace, monospace;
    font-size: 0.64rem;
    letter-spacing: 0.01em;
  }

  .delivery-field__status {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .delivery-field__status::before {
    width: 0.38rem;
    height: 0.38rem;
    border: 1px solid var(--page-plate-accent);
    content: '';
  }

  .delivery-field__title {
    max-width: 22ch;
    margin: 0;
    font-family: var(--display);
    font-size: clamp(1.55rem, 2.6vw, 2.15rem);
    font-weight: 560;
    letter-spacing: -0.03em;
    line-height: 1.05;
    text-wrap: balance;
  }

  .delivery-field__intro {
    max-width: 48ch;
    margin: 0;
    color: var(--page-plate-muted);
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .delivery-field__stage {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(8.5rem, 0.7fr);
    gap: 1.2rem;
    padding-block: 1.2rem;
  }

  .chain {
    display: grid;
    align-content: start;
    min-width: 0;
  }

  .field-node {
    display: grid;
    grid-template-columns: 2.3rem minmax(0, 1fr) 1rem;
    align-items: center;
    gap: 0.7rem;
    min-height: 3.7rem;
    padding: 0.65rem 0.7rem;
    border: 1px solid var(--page-plate-line);
    border-radius: 3px;
    background: var(--page-plate-surface);
    color: var(--page-plate-text);
    text-decoration: none;
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  .field-node:hover,
  .field-node:focus-visible {
    border-color: var(--page-plate-accent);
    background: color-mix(in srgb, var(--page-plate-accent) 7%, var(--page-plate-surface));
  }

  .field-node--boundary {
    border-color: color-mix(in srgb, var(--page-plate-accent) 72%, var(--page-plate-line));
    background: color-mix(in srgb, var(--page-plate-accent) 6%, var(--page-plate-surface));
  }

  .field-node__glyph {
    display: grid;
    width: 2.3rem;
    height: 2.3rem;
    place-items: center;
    border: 1px solid var(--page-plate-line);
    border-radius: 2px;
    color: var(--page-plate-accent);
  }

  .field-node__glyph svg {
    width: 1.1rem;
    height: 1.1rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.4;
  }

  .field-node__text {
    display: grid;
    gap: 0.12rem;
    min-width: 0;
  }

  .field-node__name {
    font-family: var(--display);
    font-size: 1.05rem;
    font-weight: 580;
    letter-spacing: -0.015em;
    line-height: 1.15;
  }

  .field-node__role {
    overflow: hidden;
    color: var(--page-plate-muted);
    font-size: 0.72rem;
    line-height: 1.35;
    text-overflow: ellipsis;
  }

  .field-node__tag {
    width: fit-content;
    margin-top: 0.2rem;
    padding: 0.08rem 0.32rem;
    border: 1px solid color-mix(in srgb, var(--page-plate-accent) 55%, var(--page-plate-line));
    color: var(--page-plate-accent);
    font-family: 'JetBrains Mono Variable', ui-monospace, monospace;
    font-size: 0.58rem;
    line-height: 1.4;
  }

  .field-node__go {
    color: var(--page-plate-muted);
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .field-node__go svg {
    display: block;
    width: 0.72rem;
    height: 0.72rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.5;
  }

  .field-node:hover .field-node__go,
  .field-node:focus-visible .field-node__go {
    color: var(--page-plate-accent);
    transform: translate(2px, -2px);
  }

  .chain__edge {
    display: grid;
    grid-template-columns: 2.3rem minmax(0, 1fr);
    align-items: center;
    gap: 0.7rem;
    min-height: 2.5rem;
    padding-inline: 0.7rem;
  }

  .chain__rail {
    position: relative;
    align-self: stretch;
    min-height: 2.3rem;
  }

  .chain__rail::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background-image: repeating-linear-gradient(to bottom, var(--page-plate-accent) 0 3px, transparent 3px 9px);
    opacity: 0.65;
    content: '';
  }

  .chain__flow {
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(50% - 0.5px);
    width: 1px;
    background-image: repeating-linear-gradient(to bottom, var(--page-plate-text) 0 2px, transparent 2px 12px);
    opacity: 0;
  }

  .chain__tip {
    position: absolute;
    bottom: -1px;
    left: 50%;
    width: 0.5rem;
    fill: none;
    stroke: var(--page-plate-accent);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.3;
    transform: translateX(-50%);
  }

  .chain__verb {
    margin: 0;
    color: var(--page-plate-accent);
    font-size: 0.7rem;
    line-height: 1.35;
  }

  .delivery-field__notes {
    display: grid;
    align-content: start;
    gap: 0;
    border-top: 1px solid var(--page-plate-line);
  }

  .delivery-field__notes p {
    margin: 0;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--page-plate-line);
    color: var(--page-plate-muted);
    font-size: 0.7rem;
    line-height: 1.45;
  }

  .delivery-field__caption {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 1.2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--page-plate-line);
  }

  .delivery-field__cta {
    display: inline-flex;
    min-height: 2rem;
    align-items: center;
    color: var(--page-plate-text);
    font-size: 0.82rem;
    text-decoration: underline;
    text-decoration-color: var(--page-plate-accent);
    text-underline-offset: 0.26em;
    transition: color 0.2s ease;
  }

  .delivery-field__cta:hover {
    color: var(--page-plate-accent);
  }

  .delivery-field__note {
    max-width: 25ch;
    margin: 0;
    color: var(--page-plate-muted);
    font-size: 0.66rem;
    line-height: 1.45;
  }

  .field-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .chain > * {
      animation: field-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) backwards;
    }

    .chain > :nth-child(1) { animation-delay: 0.12s; }
    .chain > :nth-child(2) { animation-delay: 0.2s; }
    .chain > :nth-child(3) { animation-delay: 0.28s; }
    .chain > :nth-child(4) { animation-delay: 0.36s; }
    .chain > :nth-child(5) { animation-delay: 0.44s; }

    .chain__flow {
      animation: field-flow 1.1s linear 0.6s 2 both;
    }
  }

  @keyframes field-in {
    from {
      opacity: 0;
      transform: translateY(0.4rem);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes field-flow {
    from { opacity: 0; background-position: 0 0; }
    20% { opacity: 1; }
    to { opacity: 0; background-position: 0 24px; }
  }

  @media (max-width: 560px) {
    .delivery-field__stage {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .delivery-field__notes {
      grid-template-columns: 1fr;
    }

    .delivery-field__notes p {
      padding-block: 0.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chain > *,
    .chain__flow {
      animation: none;
    }
  }

  @media print {
    .delivery-field {
      background: none;
      color: var(--page-text);
      border-color: var(--page-line-strong);
    }
  }
</style>
