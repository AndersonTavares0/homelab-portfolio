import * as THREE from 'three';
import { observatoryLayout } from '../model.js';

const systemCount = Object.keys(observatoryLayout).length;
const colors = { server: 0x708ba4, storage: 0x4f9ea1, switch: 0x698db4, gpu: 0xb08d4c };

function makeEquipment(type, material) {
  const group = new THREE.Group();
  const shell = (w, h, d, y, color = material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), color);
    mesh.position.y = y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  const body = new THREE.MeshStandardMaterial({ color: material, metalness: 0.48, roughness: 0.42 });
  if (type === 'switch') {
    shell(1.03, 0.22, 0.68, 0, body);
    for (let i = 0; i < 6; i++) {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x7ac0c4 : 0x9cb8d0 }));
      led.position.set(-0.37 + i * 0.14, 0.125, 0.12);
      group.add(led);
    }
  } else if (type === 'storage') {
    shell(0.82, 0.82, 0.72, 0, body);
    for (let i = 0; i < 3; i++) shell(0.58, 0.16, 0.03, -0.22 + i * 0.21, new THREE.MeshStandardMaterial({ color: 0x243441, metalness: 0.2, roughness: 0.7 })).position.z = 0.37;
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0x78bfc0 }));
    led.position.set(0.29, 0.28, 0.39);
    group.add(led);
  } else if (type === 'gpu') {
    shell(1.62, 0.48, 0.86, 0, body);
    const face = new THREE.Mesh(
      new THREE.BoxGeometry(1.52, .34, .025),
      new THREE.MeshStandardMaterial({ color: 0x2b3940, emissive: 0x6c4d20, emissiveIntensity: .34, metalness: .42, roughness: .42 })
    );
    face.position.set(0, 0, .45);
    group.add(face);
    for (let i = 0; i < 3; i++) {
      const x = -.46 + i * .46;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.155, .026, 8, 20), new THREE.MeshBasicMaterial({ color: 0xf0c875, transparent: true, opacity: .95 }));
      ring.position.set(x, 0, .475);
      const hub = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 6), new THREE.MeshBasicMaterial({ color: 0xffdfa1 }));
      hub.position.set(x, 0, .49);
      const bladeMaterial = new THREE.MeshBasicMaterial({ color: 0xc5a45f, transparent: true, opacity: .88 });
      for (const angle of [0, Math.PI / 2]) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(.22, .028, .018), bladeMaterial);
        blade.position.set(x, 0, .494);
        blade.rotation.z = angle;
        group.add(blade);
      }
      group.add(ring, hub);
    }
    for (let i = 0; i < 7; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(.045, .28, .06), new THREE.MeshStandardMaterial({ color: 0x8f7445, metalness: .5, roughness: .42 }));
      fin.position.set(-.56 + i * .19, .22, .18);
      group.add(fin);
    }
    const edge = new THREE.Mesh(new THREE.BoxGeometry(1.28, .025, .02), new THREE.MeshBasicMaterial({ color: 0xd1b16e }));
    edge.position.set(0, .22, .48);
    group.add(edge);
  } else {
    shell(0.82, 1.18, 0.78, 0, body);
    for (let i = 0; i < 3; i++) {
      shell(0.56, 0.25, 0.045, 0.3 - i * 0.34, new THREE.MeshStandardMaterial({ color: 0x263643, metalness: 0.25, roughness: 0.6 })).position.z = 0.4;
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: i === 0 ? 0x8fc4b0 : 0x8aa2b2 }));
      led.position.set(0.24, 0.3 - i * 0.34, 0.43);
      group.add(led);
    }
  }
  return group;
}

function makeLabel(text) {
  const surface = document.createElement('canvas');
  surface.width = 800;
  surface.height = 176;
  const context = surface.getContext('2d');
  if (!context) return null;
  context.fillStyle = '#1c3440';
  context.fillRect(2, 8, 796, 160);
  context.strokeStyle = '#8ab6c8';
  context.lineWidth = 3;
  context.strokeRect(3.5, 9.5, 793, 157);
  context.fillStyle = '#a7d7e7';
  context.fillRect(27, 64, 6, 48);
  context.fillStyle = '#f2f8fa';
  context.font = '650 39px Public Sans, Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 410, 88, 700);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  label.scale.set(2.55, 0.58, 1);
  label.position.y = 1.58;
  return label;
}

function makeRelationshipField() {
  const field = new THREE.Group();
  for (const [radius, opacity, tilt] of [[3.4, .22, .18], [5.1, .34, -.12], [6.3, .14, .4]]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, .012, 6, 96),
      new THREE.MeshBasicMaterial({ color: 0x78a9bb, transparent: true, opacity })
    );
    ring.rotation.x = Math.PI / 2 + tilt;
    ring.rotation.z = tilt * .7;
    field.add(ring);
  }
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(.1, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xb1e0f0, transparent: true, opacity: .75 })
  );
  core.position.y = -.08;
  field.add(core);
  return field;
}

function makeField() {
  const positions = [];
  let seed = 19;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let index = 0; index < 64; index += 1) {
    positions.push((random() - 0.5) * 17, 1.2 + random() * 5, (random() - 0.5) * 12);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({
    color: 0x82b9d2,
    size: 0.035,
    transparent: true,
    opacity: 0.42,
    sizeAttenuation: true
  }));
}

export function createObservatory(canvas, onSelect, onHover, edges, components) {
  const componentById = new Map(components.map(component => [component.id, component]));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#101922');
  scene.fog = new THREE.Fog('#101922', 16, 30);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  scene.add(new THREE.HemisphereLight(0xd2e8ef, 0x15232c, 2.5));
  const key = new THREE.DirectionalLight(0xeaf5f8, 2.8);
  key.position.set(-3, 8, 4);
  key.castShadow = true;
  scene.add(key);
  const blue = new THREE.PointLight(0x4e8fbd, 22, 18);
  blue.position.set(4, 3, 1);
  scene.add(blue);
  const teal = new THREE.PointLight(0x2cb7ad, 12, 14);
  teal.position.set(-4, 2, -2);
  scene.add(teal);

  scene.add(makeField(), makeRelationshipField());
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(5.1, .018, 6, 96),
    new THREE.MeshBasicMaterial({ color: 0x8bb9c8, transparent: true, opacity: 0.42 })
  );
  orbit.rotation.x = Math.PI / 2;
  orbit.rotation.z = .16;
  orbit.position.y = -0.2;
  scene.add(orbit);

  const nodes = new Map();
  const labels = new Map();
  const halos = new Map();
  const baseScales = new Map();
  const basePositions = new Map();
  const beacons = new Map();
  const hitTargets = [];
  const baseMaterials = new Map();
  for (const [id, layout] of Object.entries(observatoryLayout)) {
    const component = componentById.get(id);
    const type = component?.type ?? 'server';
    const model = makeEquipment(type, colors[type] ?? colors.server);
    const scale = id === 'host' ? 1.16 : id === 'gpu' ? 1.08 : 1;
    model.scale.setScalar(scale);
    model.position.set(...layout.scene);
    basePositions.set(id, model.position.clone());
    model.userData.componentId = id;
    const haloRadius = id === 'host' ? 1.15 : id === 'gpu' ? 1.08 : 0.82;
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(haloRadius * 1.04, 0.014, 6, 48),
      new THREE.MeshBasicMaterial({ color: 0x82b9d2, transparent: true, opacity: 0.28 })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -0.48;
    halo.visible = false;
    model.add(halo);
    const beacon = new THREE.Group();
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.68, 6),
      new THREE.MeshBasicMaterial({ color: 0x82b9d2, transparent: true, opacity: 0.64 })
    );
    beam.position.y = 0.34;
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 6),
      new THREE.MeshBasicMaterial({ color: 0xb1e0f0, transparent: true, opacity: 0.9 })
    );
    tip.position.y = 0.7;
    beacon.add(beam, tip);
    beacon.visible = false;
    model.add(beacon);
    const label = makeLabel(component?.name ?? id);
    if (label) {
      if (id === 'gpu' || id === 'automation') label.position.x = 0.34;
      if (id === 'services' || id === 'alerts' || id === 'telemetry') label.position.x = -0.34;
      model.add(label);
      labels.set(id, label);
    }
    scene.add(model);
    nodes.set(id, model);
    halos.set(id, halo);
    beacons.set(id, beacon);
    baseScales.set(id, scale);
    for (const child of model.children) {
      if (child.isMesh && child.material instanceof THREE.MeshStandardMaterial) {
        baseMaterials.set(child, child.material);
        if (child.geometry.type === 'BoxGeometry') hitTargets.push(child);
      }
    }
    if (!hitTargets.some(mesh => mesh.parent === model)) {
      const hit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.25, 0.9), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.y = 0.1;
      hit.userData.componentId = id;
      model.add(hit);
      hitTargets.push(hit);
    } else {
      for (const mesh of hitTargets.filter(item => item.parent === model)) mesh.userData.componentId = id;
    }
  }

  const links = [];
  for (const [id, other] of edges) {
    const start = nodes.get(id).position.clone();
    const end = nodes.get(other).position.clone();
    start.y = end.y = -0.5;
    const midpoint = start.clone().lerp(end, 0.5);
    midpoint.y += 0.34;
    const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
    const line = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 16, 0.018, 5, false),
      new THREE.MeshBasicMaterial({ color: 0x54768a, transparent: true, opacity: 0.72 })
    );
    const glow = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 16, 0.05, 5, false),
      new THREE.MeshBasicMaterial({ color: 0x82b9d2, transparent: true, opacity: 0.08, depthWrite: false })
    );
    const signal = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 6),
      new THREE.MeshBasicMaterial({ color: 0xb1e0f0, transparent: true, opacity: 0.95 })
    );
    signal.visible = false;
    line.userData.componentIds = [id, other];
    glow.userData.componentIds = [id, other];
    scene.add(glow, line, signal);
    links.push({ line, glow, signal, curve, componentIds: [id, other] });
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedId = null;
  let hoveredId = null;
  let phaseIds = new Set(Object.keys(observatoryLayout));
  let destroyed = false;
  let dragging = false;
  let pointerStart = null;
  let pointerOrigin = null;
  let pointerMoved = false;
  let yaw = 0;
  let pitch = 0;
  let distance = 10.8;
  const defaultTarget = new THREE.Vector3(0, 0.1, 0);
  const target = defaultTarget.clone();
  let focusFrame = 0;
  let pulseFrame = 0;
  let introFrame = 0;
  function minimumDistance() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return 10.8;
    const fit = 5.3 / (Math.tan(camera.fov * Math.PI / 360) * width / height);
    return Math.max(8.4, Math.min(18, fit));
  }

  function focus(id) {
    cancelAnimationFrame(focusFrame);
    const end = id && observatoryLayout[id] ? new THREE.Vector3(...observatoryLayout[id].scene) : defaultTarget;
    const start = target.clone();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.copy(end);
      updateCamera();
      return;
    }
    const begun = performance.now();
    function move(now) {
      const progress = Math.min((now - begun) / 380, 1);
      target.lerpVectors(start, end, 1 - (1 - progress) ** 3);
      updateCamera();
      if (progress < 1 && !destroyed) focusFrame = requestAnimationFrame(move);
    }
    focusFrame = requestAnimationFrame(move);
  }

  function resetCamera() {
    cancelAnimationFrame(focusFrame);
    target.copy(defaultTarget);
    yaw = 0;
    pitch = 0;
    distance = Math.max(10.8, minimumDistance());
    updateCamera();
  }
  function zoom(direction) {
    distance = Math.max(minimumDistance(), Math.min(18, distance + direction * -0.75));
    updateCamera();
  }

  function pulseSelection() {
    cancelAnimationFrame(pulseFrame);
    for (const link of links) link.signal.visible = false;
    if (!selectedId || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const connected = links.filter(link => link.componentIds.includes(selectedId));
    if (!connected.length) return;
    const begun = performance.now();
    function pulse(now) {
      const progress = Math.min((now - begun) / 1100, 1);
      for (const [index, link] of connected.entries()) {
        const point = link.curve.getPoint((progress + index * 0.18) % 1);
        link.signal.position.copy(point);
        link.signal.visible = true;
      }
      draw();
      if (progress < 1 && !destroyed) pulseFrame = requestAnimationFrame(pulse);
      else for (const link of connected) link.signal.visible = false;
    }
    pulseFrame = requestAnimationFrame(pulse);
  }
  function playIntro() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const begun = performance.now();
    function reveal(now) {
      const progress = Math.min((now - begun) / 850, 1);
      const eased = 1 - (1 - progress) ** 3;
      for (const [id, model] of nodes) {
        const base = basePositions.get(id);
        model.position.y = base.y - (1 - eased) * 0.32;
        model.scale.setScalar(baseScales.get(id) * (0.82 + eased * 0.18));
      }
      orbit.scale.setScalar(0.86 + eased * 0.14);
      orbit.material.opacity = 0.18 + eased * 0.32;
      draw();
      if (progress < 1 && !destroyed) introFrame = requestAnimationFrame(reveal);
    }
    introFrame = requestAnimationFrame(reveal);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    distance = Math.max(distance, minimumDistance());
    renderer.setSize(width, height, false);
    draw();
  }
  function draw() {
    if (!destroyed) renderer.render(scene, camera);
  }
  function updateCamera() {
    const maxPitch = Math.PI / 2.7;
    const minPitch = -Math.PI / 3.6;
    const phi = Math.PI / 3.0 - Math.max(minPitch, Math.min(maxPitch, pitch));
    camera.position.set(target.x + distance * Math.sin(phi) * Math.sin(yaw + 0.58), target.y + distance * Math.cos(phi), target.z + distance * Math.sin(phi) * Math.cos(yaw + 0.58));
    camera.lookAt(target);
    draw();
  }
  function applySelection() {
    const relatedIds = new Set(selectedId ? edges.filter(edge => edge.includes(selectedId)).flat() : []);
    for (const [id, model] of nodes) {
      const active = phaseIds.has(id);
      const selected = id === selectedId;
      const hovered = id === hoveredId;
      model.visible = active;
      model.scale.setScalar(baseScales.get(id) * (selected ? 1.1 : hovered ? 1.045 : 1));
      for (const child of model.children) {
        const material = baseMaterials.get(child);
        if (material) child.material = material;
      }
      const label = labels.get(id);
      if (label) {
        label.visible = active;
        label.material.opacity = selected || hovered ? 1 : selectedId && !relatedIds.has(id) ? 0.55 : 0.82;
      }
      const halo = halos.get(id);
      halo.visible = active && (selected || hovered);
      halo.material.opacity = selected ? 0.9 : hovered ? 0.6 : 0.28;
      const beacon = beacons.get(id);
      beacon.visible = active && (selected || hovered);
      beacon.scale.setScalar(selected ? 1.12 : 1);
    }
    for (const link of links) {
      const [from, to] = link.componentIds;
      const active = phaseIds.has(from) && phaseIds.has(to);
      const connected = selectedId && link.componentIds.includes(selectedId);
      link.line.visible = active;
      link.glow.visible = active;
      link.signal.visible = false;
      link.line.material.color.set(connected ? 0x82b9d2 : 0x54768a);
      link.line.material.opacity = selectedId ? (connected ? 0.98 : 0.16) : 0.72;
      link.glow.material.opacity = selectedId ? (connected ? 0.2 : 0.025) : 0.08;
    }
    draw();
  }
  function hitAt(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(hitTargets.filter(mesh => mesh.visible && mesh.parent.visible), false)[0];
  }
  function updateHover(event) {
    const hit = hitAt(event);
    const next = hit?.object.userData.componentId ?? hit?.object.parent.userData.componentId ?? null;
    if (next === hoveredId) return;
    hoveredId = next;
    onHover?.(hoveredId);
    canvas.style.cursor = hoveredId ? 'pointer' : 'grab';
    applySelection();
  }
  function onPointerDown(event) {
    if (event.button !== 0) return;
    dragging = true;
    pointerStart = { x: event.clientX, y: event.clientY };
    pointerOrigin = { x: event.clientX, y: event.clientY };
    pointerMoved = false;
    canvas.style.cursor = 'grabbing';
    canvas.setPointerCapture?.(event.pointerId);
  }
  function onPointerMove(event) {
    if (!dragging || !pointerStart) {
      updateHover(event);
      return;
    }
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerMoved ||= Math.abs(event.clientX - pointerOrigin.x) + Math.abs(event.clientY - pointerOrigin.y) > 4;
    yaw += dx * 0.006;
    pitch += dy * 0.004;
    pointerStart = { x: event.clientX, y: event.clientY };
    updateCamera();
  }
  function onPointerUp(event) {
    if (!dragging) return;
    dragging = false;
    pointerStart = null;
    canvas.style.cursor = 'grab';
    if (pointerMoved) return;
    const hit = hitAt(event);
    if (hit) onSelect?.(hit.object.userData.componentId ?? hit.object.parent.userData.componentId);
  }
  function onPointerCancel() {
    dragging = false;
    pointerStart = null;
    canvas.style.cursor = 'grab';
  }
  function onPointerLeave() {
    if (dragging || hoveredId === null) return;
    hoveredId = null;
    onHover?.(null);
    canvas.style.cursor = 'grab';
    applySelection();
  }
  function onWheel(event) {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    distance = Math.max(minimumDistance(), Math.min(18, distance + Math.sign(event.deltaY) * 0.5));
    updateCamera();
  }
  function onContextMenu(event) { event.preventDefault(); }
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', onContextMenu);
  updateCamera();
  applySelection();
  playIntro();
  return {
    setPhase(ids) { phaseIds = new Set(ids); applySelection(); },
    setSelected(id) {
      selectedId = id;
      hoveredId = null;
      onHover?.(null);
      if (!id) resetCamera();
      applySelection();
      pulseSelection();
      if (id) focus(id);
    },
    resetCamera,
    zoom,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(focusFrame);
      cancelAnimationFrame(pulseFrame);
      cancelAnimationFrame(introFrame);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            material.map?.dispose();
            material.dispose();
          }
        }
      });
      renderer.dispose();
    }
  };
}
