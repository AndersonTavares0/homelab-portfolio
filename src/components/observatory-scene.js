import * as THREE from 'three';
import { observatoryLayout } from '../model.js';

const systemCount = Object.keys(observatoryLayout).length;
const colors = { server: 0x708ba4, storage: 0x4f9ea1, switch: 0x698db4, gpu: 0x9c8465 };

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
    shell(0.98, 0.3, 0.66, 0, body);
    for (let i = 0; i < 2; i++) {
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.045, 20), new THREE.MeshStandardMaterial({ color: 0x25333d, metalness: 0.3, roughness: 0.7 }));
      fan.rotation.x = Math.PI / 2;
      fan.position.set(-0.21 + i * 0.42, 0, 0.36);
      group.add(fan);
    }
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
  surface.width = 640;
  surface.height = 144;
  const context = surface.getContext('2d');
  if (!context) return null;
  context.fillStyle = '#17232d';
  context.fillRect(2, 8, 636, 128);
  context.strokeStyle = '#536d7c';
  context.lineWidth = 3;
  context.strokeRect(3.5, 9.5, 633, 125);
  context.fillStyle = '#82b9d2';
  context.fillRect(24, 53, 5, 38);
  context.fillStyle = '#ecf1f2';
  context.font = '600 34px Public Sans, Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 330, 72, 560);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  label.scale.set(2.55, 0.58, 1);
  label.position.y = 1.52;
  return label;
}

export function createObservatory(canvas, onSelect, edges, components) {
  const componentById = new Map(components.map(component => [component.id, component]));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#101922');
  scene.fog = new THREE.Fog('#101922', 16, 30);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  scene.add(new THREE.HemisphereLight(0xb8d0dc, 0x1a242b, 2.0));
  const key = new THREE.DirectionalLight(0xe0e9ee, 2.2);
  key.position.set(-3, 8, 4);
  key.castShadow = true;
  scene.add(key);
  const blue = new THREE.PointLight(0x4e8fbd, 18, 16);
  blue.position.set(4, 3, 1);
  scene.add(blue);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x17222b, roughness: 0.85, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.73;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(14, 14, 0x345268, 0x263946);
  grid.position.y = -0.715;
  for (const material of Array.isArray(grid.material) ? grid.material : [grid.material]) {
    material.transparent = true;
    material.opacity = 0.38;
    material.depthWrite = false;
  }
  scene.add(grid);
  const orbit = new THREE.Mesh(
    new THREE.RingGeometry(5.1, 5.12, 96),
    new THREE.MeshBasicMaterial({ color: 0x54768a, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  orbit.rotation.x = -Math.PI / 2;
  orbit.position.y = -0.704;
  scene.add(orbit);
  for (const [radius, opacity] of [[3.4, .26], [5.1, .5], [6.3, .16]]) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius, radius + .012, 96),
      new THREE.MeshBasicMaterial({ color: 0x6f9caf, transparent: true, opacity, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.702;
    scene.add(ring);
  }

  const nodes = new Map();
  const labels = new Map();
  const halos = new Map();
  const baseScales = new Map();
  const hitTargets = [];
  const baseMaterials = new Map();
  const glowMaterial = new THREE.MeshStandardMaterial({ color: 0x33566e, emissive: 0x244963, emissiveIntensity: 0.65, metalness: 0.25, roughness: 0.45 });
  for (const [id, layout] of Object.entries(observatoryLayout)) {
    const component = componentById.get(id);
    const type = component?.type ?? 'server';
    const model = makeEquipment(type, colors[type] ?? colors.server);
    const scale = id === 'host' ? 1.16 : id === 'gpu' ? 1.08 : 1;
    model.scale.setScalar(scale);
    model.position.set(...layout.scene);
    model.userData.componentId = id;
    const plateRadius = id === 'host' ? 1.15 : 0.82;
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(plateRadius * 0.94, plateRadius, 0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0x263743, metalness: 0.38, roughness: 0.56 })
    );
    plate.position.y = -0.65;
    plate.receiveShadow = true;
    model.add(plate);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(plateRadius * 1.04, 0.014, 6, 48),
      new THREE.MeshBasicMaterial({ color: 0x82b9d2, transparent: true, opacity: 0.28 })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -0.48;
    halo.visible = false;
    model.add(halo);
    const label = makeLabel(component?.name ?? id);
    if (label) {
      model.add(label);
      labels.set(id, label);
    }
    scene.add(model);
    nodes.set(id, model);
    halos.set(id, halo);
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
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x54768a, transparent: true, opacity: 0.62 }));
    line.userData.componentIds = [id, other];
    scene.add(line);
    links.push(line);
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
  let distance = 12.6;
  const defaultTarget = new THREE.Vector3(0, 0.1, 0);
  const target = defaultTarget.clone();
  let focusFrame = 0;
  function minimumDistance() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return 12.6;
    const fit = 5.5 / (Math.tan(camera.fov * Math.PI / 360) * width / height);
    return Math.max(9.5, Math.min(20, fit));
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
        if (material) child.material = selected || hovered ? glowMaterial : material;
      }
      const label = labels.get(id);
      if (label) {
        label.visible = active;
        label.material.opacity = selected || hovered ? 1 : selectedId && !relatedIds.has(id) ? 0.55 : 0.82;
      }
      const halo = halos.get(id);
      halo.visible = active && (selected || hovered);
      halo.material.opacity = selected ? 0.9 : hovered ? 0.6 : 0.28;
    }
    for (const line of links) {
      const [from, to] = line.userData.componentIds;
      const active = phaseIds.has(from) && phaseIds.has(to);
      const connected = selectedId && line.userData.componentIds.includes(selectedId);
      line.visible = active;
      line.material.color.set(connected ? 0x82b9d2 : 0x54768a);
      line.material.opacity = selectedId ? (connected ? 0.95 : 0.16) : 0.62;
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
    canvas.style.cursor = 'grab';
    applySelection();
  }
  function onWheel(event) {
    event.preventDefault();
    distance = Math.max(minimumDistance(), Math.min(20, distance + Math.sign(event.deltaY) * 0.5));
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

  return {
    setPhase(ids) { phaseIds = new Set(ids); applySelection(); },
    setSelected(id) {
      selectedId = id;
      if (!id) {
        hoveredId = null;
        yaw = 0;
        pitch = 0;
        distance = Math.max(12.6, minimumDistance());
      }
      applySelection();
      if (!id || phaseIds.size < systemCount) focus(id);
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(focusFrame);
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
      glowMaterial.dispose();
      renderer.dispose();
    }
  };
}
