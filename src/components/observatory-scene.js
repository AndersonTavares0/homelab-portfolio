import * as THREE from 'three';

const positions = {
  host: [-2.8, 0.1, 0],
  services: [-0.95, 0.05, 0.1],
  alerts: [1.05, 0.15, -1.1],
  telemetry: [1.05, 0.15, 1.2],
  automation: [-0.95, 0.05, 1.8],
  gpu: [-2.8, 0.1, 1.8]
};
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

export function createObservatory(canvas, onSelect) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#101922');
  scene.fog = new THREE.Fog('#101922', 12, 23);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(5.7, 5.3, 8.8);
  camera.lookAt(-0.8, 0.2, 0.6);
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
  const blue = new THREE.PointLight(0x4e8fbd, 18, 12);
  blue.position.set(3, 2, -1);
  scene.add(blue);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 18), new THREE.MeshStandardMaterial({ color: 0x17222b, roughness: 0.85, metalness: 0.1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.73;
  floor.receiveShadow = true;
  scene.add(floor);
  const grid = new THREE.GridHelper(16, 32, 0x345268, 0x263946);
  grid.position.y = -0.715;
  scene.add(grid);

  const nodes = new Map();
  const hitTargets = [];
  const baseMaterials = new Map();
  const glowMaterial = new THREE.MeshStandardMaterial({ color: 0x33566e, emissive: 0x244963, emissiveIntensity: 0.65, metalness: 0.25, roughness: 0.45 });
  for (const [id, point] of Object.entries(positions)) {
    const type = id === 'services' ? 'storage' : id === 'alerts' || id === 'telemetry' ? 'switch' : id === 'gpu' ? 'gpu' : 'server';
    const model = makeEquipment(type, colors[type]);
    model.position.set(...point);
    model.userData.componentId = id;
    scene.add(model);
    nodes.set(id, model);
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
    } else for (const mesh of hitTargets.filter(item => item.parent === model)) mesh.userData.componentId = id;
  }

  const links = [];
  const linked = new Set();
  for (const [id, model] of nodes) {
    const related = {
      host: ['services', 'automation', 'gpu'], services: ['alerts'], alerts: ['telemetry'], telemetry: [], automation: [], gpu: []
    }[id] ?? [];
    for (const other of related) {
      const keyId = [id, other].sort().join(':');
      if (linked.has(keyId)) continue;
      linked.add(keyId);
      const a = model.position.clone();
      const b = nodes.get(other).position.clone();
      a.y = b.y = -0.5;
      const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x54768a, transparent: true, opacity: 0.72 }));
      line.userData.componentIds = [id, other];
      scene.add(line);
      links.push(line);
    }
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedId = null;
  let phaseIds = new Set(Object.keys(positions));
  let destroyed = false;
  let dragging = false;
  let pointerStart = null;
  let pointerOrigin = null;
  let pointerMoved = false;
  let yaw = 0;
  let pitch = 0;
  let distance = 10.7;
  const target = new THREE.Vector3(-0.8, 0.1, 0.5);
  let focusFrame = 0;
  function focus(id) {
    cancelAnimationFrame(focusFrame);
    const end = id && positions[id] ? new THREE.Vector3(...positions[id]) : new THREE.Vector3(-0.8, 0.1, 0.5);
    const start = target.clone();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.copy(end);
      updateCamera();
      return;
    }
    const begun = performance.now();
    function move(now) {
      const progress = Math.min((now - begun) / 350, 1);
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
    for (const [id, model] of nodes) {
      const active = phaseIds.has(id);
      const selected = id === selectedId;
      model.visible = active;
      for (const child of model.children) {
        const mat = baseMaterials.get(child);
        if (mat) child.material = selected ? glowMaterial : mat;
      }
    }
    for (const line of links) {
      line.visible = line.userData.componentIds.every(id => phaseIds.has(id)) && (!selectedId || line.userData.componentIds.includes(selectedId));
      line.material.color.set(selectedId ? 0x77b8d2 : 0x54768a);
      line.material.opacity = selectedId ? 0.9 : 0.65;
    }
    draw();
  }
  function onPointerDown(event) {
    if (event.button !== 0) return;
    dragging = true;
    pointerStart = { x: event.clientX, y: event.clientY };
    pointerOrigin = { x: event.clientX, y: event.clientY };
    pointerMoved = false;
    canvas.setPointerCapture?.(event.pointerId);
  }
  function onPointerMove(event) {
    if (!dragging || !pointerStart) return;
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
    if (pointerMoved) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const targetHit = raycaster.intersectObjects(hitTargets.filter(mesh => mesh.visible && mesh.parent.visible), false)[0];
    if (targetHit) onSelect?.(targetHit.object.userData.componentId ?? targetHit.object.parent.userData.componentId);
  }
  function onWheel(event) {
    event.preventDefault();
    distance = Math.max(7, Math.min(14, distance + Math.sign(event.deltaY) * 0.5));
    updateCamera();
  }
  function onContextMenu(event) { event.preventDefault(); }
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', onContextMenu);
  updateCamera();
  applySelection();

  return {
    setPhase(ids) { phaseIds = new Set(ids); applySelection(); },
    setSelected(id) { selectedId = id; applySelection(); focus(id); },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(focusFrame);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
      });
      renderer.dispose();
    }
  };
}
