import { describe, expect, it } from 'vitest';
import {
  categories,
  explorerState,
  filterServices,
  relations,
  services,
  technologies,
  validateExplorer
} from '../src/explorer.js';

const caseIds = ['gpu-lab', 'rss-relay', 'alert-relay', 'automation', 'observability'];
const categoryIds = new Set(categories.map(category => category.id));
const technologyIds = new Set(technologies.map(technology => technology.id));

const nonempty = value => typeof value === 'string' && value.trim().length > 0;

describe('explorer catalogue data', () => {
  it('names the four editorial categories', () => {
    expect([...categoryIds]).toEqual(['automation', 'delivery', 'observability', 'compute']);
    for (const category of categories) expect(nonempty(category.name), category.id).toBe(true);
  });

  it('contains every documented service with its readable fields', () => {
    expect(services.map(service => service.id).sort()).toEqual([
      'alert-relay', 'ansible', 'collector', 'crowdsec', 'discord', 'gpu-controller',
      'grafana', 'kuma', 'loki', 'miniflux', 'podman', 'proxmox', 'rss-relay', 'semaphore', 'telegram'
    ]);
    for (const service of services) {
      expect(nonempty(service.name), service.id).toBe(true);
      expect(categoryIds.has(service.category), `${service.id}.category`).toBe(true);
      for (const field of ['summary', 'purpose', 'decision', 'evidence']) {
        expect(nonempty(service[field]), `${service.id}.${field}`).toBe(true);
      }
      expect(service.caseIds.length, `${service.id}.caseIds`).toBeGreaterThan(0);
      for (const id of service.caseIds) expect(caseIds, service.id).toContain(id);
      for (const id of service.technologyIds) expect(technologyIds, service.id).toContain(id);
      expect(Number.isFinite(service.x) && Number.isFinite(service.y), `${service.id} map position`).toBe(true);
    }
  });

  it('gives every technology a readable role and category an anchor', () => {
    for (const technology of technologies) {
      expect(nonempty(technology.name), technology.id).toBe(true);
      expect(nonempty(technology.role), technology.id).toBe(true);
    }
    for (const category of categories) {
      expect(nonempty(category.description), category.id).toBe(true);
      expect(Number.isFinite(category.x) && Number.isFinite(category.y), category.id).toBe(true);
    }
  });

  it('never repeats a service, technology, category or relation id', () => {
    for (const list of [services, technologies, categories, relations]) {
      const ids = list.map(item => item.id);
      expect(new Set(ids).size, list.map(item => item.id).join(', ')).toBe(ids.length);
    }
  });

  it('keeps relation endpoints documented by the relation case', () => {
    for (const relation of relations) {
      const endpoints = [relation.from, relation.to].map(id => services.find(service => service.id === id));
      for (const endpoint of endpoints) {
        expect(endpoint, relation.id).toBeDefined();
        expect(endpoint.caseIds, `${relation.id} case ${relation.caseId}`).toContain(relation.caseId);
      }
      expect(nonempty(relation.label) && nonempty(relation.explanation), relation.id).toBe(true);
    }
  });

  it('validates its references against the case catalogue', () => {
    expect(() => validateExplorer(caseIds)).not.toThrow();
    expect(() => validateExplorer(caseIds.filter(id => id !== 'gpu-lab')))
      .toThrow('service/gpu-controller: unknown case gpu-lab');
  });
});

describe('explorer reference validation', () => {
  const rejects = (label, mutate, message) => {
    it(label, () => {
      const restore = mutate();
      try {
        expect(() => validateExplorer(caseIds)).toThrow(message);
      } finally {
        restore();
      }
    });
  };

  rejects('reports a duplicate service id', () => {
    services.push({ ...services[0] });
    return () => services.pop();
  }, 'service/semaphore: duplicate ID');

  rejects('reports a missing readable service field', () => {
    const service = services[0];
    const original = service.decision;
    service.decision = ' ';
    return () => { service.decision = original; };
  }, 'service/semaphore.decision: required');

  rejects('reports an unknown service category', () => {
    const service = services[0];
    const original = service.category;
    service.category = 'missing-category';
    return () => { service.category = original; };
  }, 'service/semaphore: unknown category');

  rejects('reports an unknown case on a service', () => {
    const service = services[0];
    const original = service.caseIds;
    service.caseIds = [...original, 'missing-case'];
    return () => { service.caseIds = original; };
  }, 'service/semaphore: unknown case missing-case');

  rejects('reports an unknown technology on a service', () => {
    const service = services[0];
    const original = service.technologyIds;
    service.technologyIds = ['missing-technology'];
    return () => { service.technologyIds = original; };
  }, 'service/semaphore: unknown technology missing-technology');

  rejects('reports a relation whose endpoint does not exist', () => {
    const relation = relations[0];
    const original = relation.to;
    relation.to = 'missing-service';
    return () => { relation.to = original; };
  }, 'relation/semaphore-ansible: invalid endpoints');

  rejects('reports a relation whose endpoints are the same service', () => {
    const relation = relations[0];
    const original = relation.to;
    relation.to = relation.from;
    return () => { relation.to = original; };
  }, 'relation/semaphore-ansible: invalid endpoints');

  rejects('reports a relation without documented evidence', () => {
    const relation = relations[0];
    const original = [relation.caseId, relation.explanation];
    relation.caseId = 'missing-case';
    return () => { [relation.caseId, relation.explanation] = original; };
  }, 'relation/semaphore-ansible: missing evidence');

  rejects('reports a duplicate relation id', () => {
    relations.push({ ...relations[0] });
    return () => relations.pop();
  }, 'relation/semaphore-ansible: duplicate ID');
});

describe('explorer filtering', () => {
  it('returns the whole catalogue without a category or query', () => {
    expect(filterServices()).toEqual(services);
    expect(filterServices('all', '')).toEqual(services);
  });

  it('returns exactly the services in one category', () => {
    for (const categoryId of categoryIds) {
      const expected = services.filter(service => service.category === categoryId);
      const filtered = filterServices(categoryId);
      expect(filtered.map(service => service.id), categoryId).toEqual(expected.map(service => service.id));
    }
  });

  it('ignores case and surrounding whitespace in the search term', () => {
    expect(filterServices('all', '  GRAFANA  ').map(service => service.id)).toContain('grafana');
    expect(explorerState('?q=%20%20loki%20%20')).toMatchObject({ q: 'loki' });
  });

  it('matches a technology name as well as the service text', () => {
    expect(filterServices('all', 'HMAC').map(service => service.id)).toContain('rss-relay');
    expect(filterServices('all', 'cgroups').map(service => service.id)).toEqual(
      expect.arrayContaining(['gpu-controller', 'podman'])
    );
  });

  it('narrows a category result with the search term', () => {
    const categoryId = 'observability';
    const unfiltered = filterServices(categoryId);
    const filtered = filterServices(categoryId, 'Grafana');
    expect(unfiltered.length).toBeGreaterThan(filtered.length);
    expect(filtered.map(service => service.id)).toEqual(['grafana']);
  });

  it('returns nothing for a term that matches no documented service', () => {
    expect(filterServices('all', 'zzzz-no-match')).toEqual([]);
    expect(filterServices('compute', 'Miniflux')).toEqual([]);
  });

  it('returns nothing for an unknown category', () => {
    expect(filterServices('missing-category', '')).toEqual([]);
  });
});

describe('explorer URL state', () => {
  it('restores category, query and service from the query string', () => {
    expect(explorerState('?service=grafana&category=observability&q=grafana')).toEqual({
      category: 'observability',
      q: 'grafana',
      service: 'grafana'
    });
  });

  it('uses the full catalogue when no usable parameter is present', () => {
    expect(explorerState('')).toEqual({ category: 'all', q: '', service: null });
    expect(explorerState(new URLSearchParams('?category=missing&service=missing'))).toEqual({
      category: 'all',
      q: '',
      service: null
    });
  });

  it('trims the search term and caps it at 120 characters', () => {
    expect(explorerState('?q=%20%20grafana%20%20').q).toBe('grafana');
    expect(explorerState(`?q=${'a'.repeat(200)}`).q).toHaveLength(120);
  });

  it('drops a service that the active category hides', () => {
    expect(explorerState('?category=compute&service=grafana')).toMatchObject({
      category: 'compute',
      service: null
    });
    expect(explorerState('?category=observability&service=grafana').service).toBe('grafana');
  });

  it('drops a service that the active search excludes', () => {
    expect(explorerState('?q=miniflux&service=grafana')).toMatchObject({ q: 'miniflux', service: null });
    expect(explorerState('?q=grafana&service=grafana').service).toBe('grafana');
  });

  it('only accepts services that exist in the catalogue', () => {
    expect(explorerState('?service=not-a-service').service).toBe(null);
    expect(explorerState('?service=loki').service).toBe('loki');
  });

  it('keeps the reported state consistent with the visible services', () => {
    const state = explorerState('?category=delivery&q=relay&service=alert-relay');
    expect(state).toEqual({ category: 'delivery', q: 'relay', service: 'alert-relay' });
    expect(filterServices(state.category, state.q).map(service => service.id)).toContain(state.service);
  });
});
