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
  <div class="delivery-field__head">
    <p class="delivery-field__title" id="delivery-field-title">The credential stops at one boundary.</p>
    <span class="delivery-field__rule" aria-hidden="true"></span>
  </div>

  <div class="delivery-field__stage">
    <svg class="delivery-field__plane" viewBox="0 0 600 480" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1">
        <path d="M74 246h452" opacity=".38" />
        <path d="M300 246 20 480M300 246 118 480M300 246 204 480M300 246 262 480M300 246 338 480M300 246 396 480M300 246 482 480M300 246 580 480" opacity=".46" />
        <path d="M258 276h84M226 316h148M182 368h236M120 432h360" opacity=".46" />
      </g>
    </svg>

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
          <svg class="chain__tip" viewBox="0 0 10 6"><path d="m1 1 4 4 4-4" /></svg>
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
        </span>
        <span class="field-node__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8" /></svg></span>
        <span class="field-visually-hidden">Open in the Homelab Explorer</span>
      </a>

      <div class="chain__edge">
        <span class="chain__rail" aria-hidden="true">
          <span class="chain__flow"></span>
          <svg class="chain__tip" viewBox="0 0 10 6"><path d="m1 1 4 4 4-4" /></svg>
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
  </div>

  <figcaption class="delivery-field__caption">
    <a class="delivery-field__cta" href={serviceHref(boundary.id)}>
      Explore the delivery boundary
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
    </a>
    <p class="delivery-field__note">Illustrative. Documented roles, not live status.</p>
  </figcaption>
</figure>

<style>
  .delivery-field {
    --field-base: color-mix(in srgb, var(--page-surface) 52%, var(--page-bg));
    --field-plate: color-mix(in srgb, var(--page-surface) 80%, var(--page-bg));
    --field-shadow: rgb(8 15 19 / .16);
    position: relative;
    min-width: 0;
    margin: 0;
    padding: clamp(1.05rem, 2.2vw, 1.5rem);
    border: 1px solid var(--page-line-strong);
    border-radius: .2rem;
    background:
      radial-gradient(112% 80% at 78% 0%, color-mix(in srgb, var(--page-accent) 9%, transparent), transparent 62%),
      var(--field-base);
    box-shadow: 0 22px 54px var(--field-shadow), 0 5px 14px rgb(8 15 19 / .09);
    color: var(--page-text);
    isolation: isolate;
  }

  .delivery-field__head {
    display: grid;
    gap: .7rem;
    padding-bottom: .9rem;
    margin-bottom: .35rem;
  }

  .delivery-field__title {
    max-width: 26ch;
    margin: 0;
    font-size: clamp(1.06rem, 1.6vw, 1.2rem);
    font-weight: 650;
    letter-spacing: -.018em;
    line-height: 1.22;
    text-wrap: balance;
  }

  .delivery-field__rule {
    height: 1px;
    background: linear-gradient(90deg, var(--page-line-strong), color-mix(in srgb, var(--page-line) 20%, transparent));
  }

  .delivery-field__stage {
    position: relative;
    padding-block: .55rem .95rem;
  }

  .delivery-field__plane {
    position: absolute;
    z-index: 0;
    inset: 0;
    width: 100%;
    height: 100%;
    color: var(--page-line);
    opacity: .85;
    pointer-events: none;
    mask-image: linear-gradient(to bottom, transparent 32%, #000 62%);
  }

  .chain {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .field-node {
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr) 1.1rem;
    align-items: center;
    justify-self: start;
    gap: .8rem;
    width: max-content;
    max-width: 100%;
    min-height: 3.95rem;
    padding: .7rem .8rem .7rem .85rem;
    border: 1px solid var(--page-line-strong);
    border-radius: .18rem;
    background: var(--field-plate);
    color: var(--page-text);
    text-decoration: none;
    box-shadow: 0 10px 20px rgb(8 15 19 / .1), 0 1px 2px rgb(8 15 19 / .08);
    transition: transform .22s cubic-bezier(.2, .8, .2, 1), border-color .22s ease, box-shadow .22s ease;
  }

  .field-node:hover,
  .field-node:focus-visible {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--page-accent) 58%, var(--page-line-strong));
    box-shadow: 0 16px 30px rgb(8 15 19 / .16), 0 2px 4px rgb(8 15 19 / .08);
  }

  .field-node--boundary {
    width: 100%;
    border-color: color-mix(in srgb, var(--page-accent) 62%, var(--page-line-strong));
    background: color-mix(in srgb, var(--page-accent) 5%, var(--field-plate));
  }

  .field-node__glyph {
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid var(--page-line-strong);
    border-radius: .15rem;
    background: color-mix(in srgb, var(--page-bg) 68%, var(--page-surface));
    color: var(--page-accent);
  }

  .field-node--boundary .field-node__glyph {
    border-color: color-mix(in srgb, var(--page-accent) 55%, var(--page-line-strong));
    background: color-mix(in srgb, var(--page-accent) 14%, var(--page-bg));
  }

  .field-node__glyph svg {
    width: 1.2rem;
    height: 1.2rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.4;
  }

  .field-node__text {
    display: grid;
    gap: .18rem;
    min-width: 0;
  }

  .field-node__name {
    font-size: 1rem;
    font-weight: 650;
    letter-spacing: -.012em;
    line-height: 1.2;
  }

  .field-node__role {
    color: var(--page-muted);
    font-size: .76rem;
    line-height: 1.35;
  }

  .field-node__go {
    display: grid;
    place-items: center;
    color: color-mix(in srgb, var(--page-accent) 62%, var(--page-muted));
    transition: transform .22s ease, color .22s ease;
  }

  .field-node__go svg {
    width: .78rem;
    height: .78rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.5;
  }

  .field-node:hover .field-node__go,
  .field-node:focus-visible .field-node__go {
    color: var(--page-accent);
    transform: translate(2px, -2px);
  }

  .chain__edge {
    display: grid;
    grid-template-columns: 2.5rem minmax(0, 1fr);
    align-items: center;
    gap: .8rem;
    min-height: 2.6rem;
    padding: .15rem .8rem .15rem .85rem;
  }

  .chain__rail {
    position: relative;
    align-self: stretch;
    min-height: 2.3rem;
  }

  .chain__rail::before {
    position: absolute;
    top: -1px;
    bottom: -1px;
    left: 50%;
    width: 1px;
    background: var(--page-line-strong);
    content: '';
  }

  .chain__flow {
    position: absolute;
    top: -1px;
    bottom: -1px;
    left: calc(50% - .5px);
    width: 1px;
    background-image: repeating-linear-gradient(to bottom, var(--page-accent) 0 4px, transparent 4px 14px);
    opacity: .55;
    animation: rail-flow 1.15s linear .55s 3 both;
  }

  .chain__tip {
    position: absolute;
    bottom: -3px;
    left: 50%;
    width: .5rem;
    color: var(--page-accent);
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.2;
    transform: translateX(-50%);
  }

  .chain__verb {
    margin: 0;
    color: var(--page-accent);
    font-size: .73rem;
    font-weight: 600;
    letter-spacing: .015em;
    line-height: 1.3;
    text-shadow: 0 0 10px var(--field-base);
  }

  .delivery-field__caption {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: .5rem 1.25rem;
    padding-top: .95rem;
    border-top: 1px solid var(--page-line);
  }

  .delivery-field__cta {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    min-height: 2rem;
    color: var(--page-text);
    font-size: .84rem;
    font-weight: 650;
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--page-accent) 70%, transparent);
    text-decoration-thickness: 1px;
    text-underline-offset: .26em;
    transition: color .2s ease, gap .2s ease;
  }

  .delivery-field__cta svg {
    width: .8rem;
    height: .8rem;
    fill: none;
    stroke: var(--page-accent);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.5;
    transition: transform .2s ease;
  }

  .delivery-field__cta:hover {
    gap: .55rem;
    color: var(--page-accent);
  }

  .delivery-field__cta:hover svg {
    transform: translate(2px, -2px);
  }

  .delivery-field__note {
    max-width: 23ch;
    margin: 0;
    color: var(--page-muted);
    font-size: .68rem;
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

  @keyframes rail-flow {
    from { background-position: 0 0; }
    to { background-position: 0 14px; }
  }

  @media (prefers-reduced-motion: no-preference) {
    .chain > * {
      animation: field-in .62s cubic-bezier(.16, 1, .3, 1) backwards;
    }

    .chain > :nth-child(1) { animation-delay: .1s; }
    .chain > :nth-child(2) { animation-delay: .19s; }
    .chain > :nth-child(3) { animation-delay: .27s; }
    .chain > :nth-child(4) { animation-delay: .35s; }
    .chain > :nth-child(5) { animation-delay: .43s; }
  }

  @keyframes field-in {
    from {
      opacity: 0;
      transform: translateY(.5rem);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chain > *,
    .chain__flow {
      animation: none;
    }

    .chain__flow {
      opacity: .3;
    }
  }

  @media (max-width: 430px) {
    .field-node {
      grid-template-columns: 2.2rem minmax(0, 1fr) .9rem;
      gap: .7rem;
      min-height: 3.7rem;
      padding-inline: .7rem;
    }

    .field-node__glyph {
      width: 2.2rem;
      height: 2.2rem;
    }

    .field-node__name {
      font-size: .94rem;
    }

    .field-node__role {
      font-size: .73rem;
    }

    .chain__edge {
      grid-template-columns: 2.2rem minmax(0, 1fr);
      gap: .7rem;
      padding-inline: .7rem;
    }
  }

  @media print {
    .delivery-field {
      background: none;
      box-shadow: none;
    }

    .delivery-field__plane {
      display: none;
    }
  }
</style>
