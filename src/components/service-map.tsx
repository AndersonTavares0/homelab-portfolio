'use client';

import { useMemo, useState } from 'react';
import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react';
import { services, relations, categories } from '../../src/explorer.js';

const positions = [
  [70, 40], [350, 40], [630, 40], [70, 190], [350, 190], [630, 190],
  [70, 350], [350, 350], [630, 350], [70, 510], [350, 510], [630, 510],
  [70, 670], [350, 670], [630, 670]
];

export function ServiceMap() {
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const visible = useMemo(() => services.filter((service) => category === 'all' || service.category === category), [category]);
  const visibleIds = new Set(visible.map((service) => service.id));
  const nodes: Node[] = visible.map((service) => {
    const index = services.findIndex((item) => item.id === service.id);
    return {
      id: service.id,
      position: { x: positions[index]?.[0] ?? 0, y: positions[index]?.[1] ?? 0 },
      data: { label: <div className="map-node"><small>{categories.find((item) => item.id === service.category)?.name}</small><strong>{service.name}</strong><span>{service.summary}</span></div> },
      className: selected === service.id ? 'map-node-shell is-selected' : 'map-node-shell',
      ariaLabel: `Select ${service.name}: ${service.summary}`
    };
  });
  const edges: Edge[] = relations.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to)).map((edge) => ({
    id: edge.id, source: edge.from, target: edge.to, label: edge.label, type: 'smoothstep',
    ariaLabel: `${services.find((item) => item.id === edge.from)?.name} ${edge.label} ${services.find((item) => item.id === edge.to)?.name}`,
    className: 'map-edge'
  }));
  const selectedService = services.find((service) => service.id === selected);

  return <div className="map-shell">
    <div className="map-toolbar" role="group" aria-label="Filter service map">
      <button type="button" onClick={() => setCategory('all')} aria-pressed={category === 'all'}>All services</button>
      {categories.map((item) => <button type="button" key={item.id} onClick={() => setCategory(item.id)} aria-pressed={category === item.id}>{item.name}</button>)}
    </div>
    <p className="map-instruction" id="map-instructions">Select a service. Lines are documented relationships, not a live topology.</p>
    <div className="flow-frame" role="region" aria-label="Interactive service relationship map" aria-describedby="map-instructions">
      <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.18 }} minZoom={0.25} maxZoom={1.5} nodesConnectable={false} nodesDraggable={false} onNodeClick={(_, node) => setSelected(node.id)} proOptions={{ hideAttribution: true }}>
        <Background color="var(--map-grid)" gap={28} size={1} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
    <div className="map-mobile-list" aria-label="Service list">
      {visible.map((service) => <button type="button" key={service.id} onClick={() => setSelected(service.id)} aria-pressed={selected === service.id}>
        <span>{service.name}</span>
        {relations.filter((edge) => edge.from === service.id && visibleIds.has(edge.to)).map((edge) => <small className="map-mobile-edge" key={edge.id}>{edge.label} → {services.find((item) => item.id === edge.to)?.name}</small>)}
      </button>)}
    </div>
    <aside className="map-detail" aria-live="polite">
      {selectedService ? <><p className="map-detail__category">{categories.find((item) => item.id === selectedService.category)?.name}</p><h3>{selectedService.name}</h3><p>{selectedService.purpose}</p><p>{selectedService.decision}</p><details><summary>Evidence and limits</summary><p>{selectedService.evidence}</p></details>
        <ul>{relations.filter((edge) => edge.from === selectedService.id || edge.to === selectedService.id).map((edge) => <li key={edge.id}>{edge.label}: {edge.explanation}</li>)}</ul>
      </> : <><p className="map-detail__category">Field index</p><h3>Choose a service</h3><p>Explore documented roles and boundaries. This is an authored record, not live infrastructure status.</p></>}
    </aside>
  </div>;
}
