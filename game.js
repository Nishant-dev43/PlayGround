import * as THREE from 'three';

const canvas = document.querySelector('#game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#f6b3a5');
scene.fog = new THREE.FogExp2('#f6b3a5', 0.00155);
const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 1200);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.16;

const hemi = new THREE.HemisphereLight('#fff0dc', '#766487', 2.15); scene.add(hemi);
const sunLight = new THREE.DirectionalLight('#ffe3c3', 2.5); sunLight.position.set(-80, 110, -140); scene.add(sunLight);
const fillLight = new THREE.DirectionalLight('#f6a7bd', 0.75); fillLight.position.set(65, 24, 70); scene.add(fillLight);
const mat = (color, roughness = .82, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const mats = {
  asphalt: mat('#555365'), shoulder: mat('#d7b6aa'), sidewalk: mat('#e9c9b8'), grass: mat('#7caa91'), sea: mat('#74bdc4'),
  lane: mat('#f9d99b', .6, { emissive: '#513c1e', emissiveIntensity: .12 }), white: mat('#fff5df'), dark: mat('#333140'), glass: mat('#b8e4e6', .32, { metalness: .12 }),
  pink: mat('#f1889b', .38), cream: mat('#fff0d6', .4), red: mat('#e96672', .4), teal: mat('#63bdba', .4), blue: mat('#718bc6', .4), yellow: mat('#f8c46b', .4),
  tree: mat('#8d566e'), leaf1: mat('#ef9cab'), leaf2: mat('#f4b7a9'), leaf3: mat('#cf8eb5'), lamp: mat('#ffe9ad', .32, { emissive: '#ffc26c', emissiveIntensity: 1.2 }), window: mat('#f8d7a4', .4, { emissive: '#f5b881', emissiveIntensity: .28 }),
  wheel: mat('#292b39', .9), rim: mat('#d6d4d0', .45, { metalness: .5 }), sign: mat('#fbf0df', .5), cloud: mat('#ffe3d4', .95)
};
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const sphereGeo = new THREE.SphereGeometry(1, 12, 9);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
function addMesh(parent, geometry, material, pos, scale, rot) {
  const mesh = new THREE.Mesh(geometry, material);
  if (pos) mesh.position.set(...pos); if (scale) mesh.scale.set(...scale); if (rot) mesh.rotation.set(...rot);
  parent.add(mesh); return mesh;
}
function block(parent, material, pos, scale, rot) { return addMesh(parent, boxGeo, material, pos, scale, rot); }

// A broad pastel coastal boulevard with four lanes and a warm horizon.
block(scene, mats.grass, [0, -.45, -900], [150, .5, 2100]);
block(scene, mats.sea, [-58, -.32, -900], [44, .28, 2100]);
block(scene, mats.shoulder, [0, -.18, -900], [17.6, .32, 2100]);
block(scene, mats.asphalt, [0, 0, -900], [14.4, .26, 2100]);
block(scene, mats.sidewalk, [-8.05, .02, -900], [1.25, .16, 2100]);
block(scene, mats.sidewalk, [8.05, .02, -900], [1.25, .16, 2100]);
for (const x of [-7.3, 7.3]) block(scene, mats.white, [x, .15, -900], [.12, .025, 2100]);
for (const x of [-3, 0, 3]) {
  for (let z = 45; z > -2050; z -= 12) block(scene, x === 0 ? mats.lane : mats.white, [x, .15, z], [x === 0 ? .13 : .09, .025, x === 0 ? 5 : 4]);
}
// Soft sun disc and layered islands make the low-poly horizon read as an illustration.
const sun = new THREE.Mesh(new THREE.CircleGeometry(22, 48), new THREE.MeshBasicMaterial({ color: '#ffe6bd' }));
sun.position.set(-55, 37, -290); sun.lookAt(0, 12, 0); scene.add(sun);
for (let i = 0; i < 9; i++) {
  const hill = addMesh(scene, sphereGeo, mat(i % 2 ? '#b884a0' : '#9d83a4'), [-110 + i * 27, -2, -290 - Math.random() * 20], [35 + Math.random() * 25, 16 + Math.random() * 15, 20], null);
}

// Hand-built compact anime cars: graphic paint, big glass, bright lamps and visible wheels.
function makeCar(color = mats.pink, player = false) {
  const root = new THREE.Group();
  const bodyMat = typeof color === 'string' ? mat(color, .32, { metalness: .13 }) : color;
  block(root, bodyMat, [0, .66, 0], [1.82, .58, 3.5]);
  block(root, bodyMat, [0, 1.03, .14], [1.48, .55, 1.72]);
  block(root, mats.glass, [0, 1.1, -.08], [1.39, .38, 1.25]);
  block(root, mats.dark, [0, 1.39, .17], [1.48, .1, 1.72]);
  block(root, mats.dark, [0, .43, -1.72], [1.36, .12, .12]);
  const lampMat = player ? mat('#fff4c4', .25, { emissive: '#ffe0a2', emissiveIntensity: 1.1 }) : mats.lamp;
  for (const x of [-.61, .61]) {
    block(root, lampMat, [x, .74, -1.78], [.38, .2, .08]);
    block(root, mats.red, [x, .7, 1.77], [.28, .14, .08]);
  }
  const wheels = [];
  for (const x of [-.96, .96]) for (const z of [-1.12, 1.12]) {
    const tire = addMesh(root, cylinderGeo, mats.wheel, [x, .42, z], [.46, .22, .46], [0, 0, Math.PI / 2]);
    addMesh(root, cylinderGeo, mats.rim, [x * 1.005, .42, z], [.24, .225, .24], [0, 0, Math.PI / 2]); wheels.push(tire);
  }
  if (player) {
    block(root, mats.cream, [0, .46, -.58], [.07, .035, 1.6]);
    const spoiler = block(root, mats.pink, [0, 1.48, 1.1], [1.4, .09, .2]);
    spoiler.rotation.x = -.06;
  }
  root.userData.wheels = wheels;
  return root;
}
const player = makeCar('#f47f91', true); player.position.set(-4.5, .04, 0); scene.add(player);
const lanes = [-4.5, -1.5, 1.5, 4.5];
const trafficColors = [mats.cream, mats.teal, mats.blue, mats.yellow, mats.pink, mats.red];
const traffic = [];
function makeTraffic(direction, lane, z, speed) {
  const mesh = makeCar(trafficColors[Math.floor(Math.random() * trafficColors.length)]);
  if (direction > 0) mesh.rotation.y = Math.PI;
  mesh.position.set(lanes[lane], .04, z); scene.add(mesh);
  const c = { mesh, direction, lane, speed, cruise: speed, phase: Math.random() * 10, stuck: 0 };
  traffic.push(c); return c;
}
// Deliberate clusters seed a visible, believable commuter queue instead of random empty traffic.
for (let i = 0; i < 26; i++) {
  const lane = i % 2;
  const z = -18 - i * 8.6 - Math.random() * 5;
  makeTraffic(-1, lane, z, i % 7 < 4 ? 8 + Math.random() * 5 : 16 + Math.random() * 9);
}
for (let i = 0; i < 16; i++) makeTraffic(1, 2 + i % 2, -22 - i * 13 - Math.random() * 6, 14 + Math.random() * 13);

// Sakura trees, seaside lamps, route signs and little blocks of pastel city architecture.
const decorations = [];
function addDecoration(object, z, x) { object.position.x = x; object.position.z = z; scene.add(object); decorations.push(object); return object; }
function makeTree(x, z, variant = 0) {
  const g = new THREE.Group();
  addMesh(g, cylinderGeo, mats.tree, [0, 2.1, 0], [.36, 4.2, .36]);
  const leaves = [mats.leaf1, mats.leaf2, mats.leaf3];
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4 + variant;
    addMesh(g, sphereGeo, leaves[(i + variant) % 3], [Math.cos(a) * (i % 2 ? 1.25 : .72), 3.0 + (i % 3) * .63, Math.sin(a) * (i % 2 ? .78 : .4)], [1.05, .92, .92]);
  }
  addDecoration(g, z, x);
}
function makeLamp(x, z) {
  const g = new THREE.Group();
  addMesh(g, cylinderGeo, mats.dark, [0, 2.7, 0], [.11, 5.4, .11]);
  block(g, mats.dark, [0, 5.25, -.45], [.12, .12, 1]);
  addMesh(g, sphereGeo, mats.lamp, [0, 5.16, -.9], [.33, .24, .35]);
  addDecoration(g, z, x);
}
function makeBuilding(x, z, seed) {
  const g = new THREE.Group();
  const palette = ['#f5c2ad', '#b8d5d0', '#d2bfdc', '#f3d9aa', '#b3c8df', '#e7a9ad'];
  const facade = mat(palette[seed % palette.length]);
  const w = 7 + (seed % 4) * 1.5, h = 9 + (seed * 7 % 14), d = 8 + (seed % 3) * 3;
  block(g, facade, [0, h / 2, 0], [w, h, d]);
  block(g, mat('#fff0da'), [0, h + .14, 0], [w + .4, .3, d + .4]);
  for (let y = 2; y < h - 1; y += 2.2) for (let wx = -w / 2 + 1.1; wx < w / 2 - .3; wx += 1.8) {
    block(g, seed % 3 ? mats.window : mats.glass, [wx, y, d / 2 + .03], [.92, 1.05, .07]);
    if (seed % 2) block(g, mats.white, [wx, y - .58, d / 2 + .09], [1.08, .08, .12]);
  }
  block(g, mat(seed % 2 ? '#f08c9b' : '#68aaa9'), [0, 1.25, d / 2 + .08], [w * .57, .8, .12]);
  addDecoration(g, z, x);
}
for (let i = 0; i < 48; i++) {
  const z = 25 - i * 8.2;
  makeTree(i % 2 ? -11.2 : 11.2, z, i % 3);
  if (i % 2 === 0) makeLamp(i % 4 ? -9.1 : 9.1, z - 3.8);
  if (i % 4 === 1) makeBuilding(i % 2 ? -23 - (i % 3) * 2 : 23 + (i % 3) * 2, z - 18, i);
}
// Small fluffy cloud clusters stay high and distant, like painted scenery.
for (let i = 0; i < 18; i++) {
  const cloud = new THREE.Group();
  for (let j = 0; j < 4; j++) addMesh(cloud, sphereGeo, mats.cloud, [(j - 1.5) * 2.8, (j % 2) * 1.2, 0], [3.8, 1.5 + (j % 2) * .4, 1.1]);
  cloud.position.set(-85 + Math.random() * 170, 47 + Math.random() * 24, -120 - Math.random() * 400); scene.add(cloud);
}

// Collectible little star charms reward weaving through a gap in the flow.
const pickups = [];
for (let i = 0; i < 7; i++) {
  const group = new THREE.Group();
  const orb = addMesh(group, sphereGeo, mat('#ffe7a0', .25, { emissive: '#ffb84e', emissiveIntensity: 1.1 }), [0, 1.35, 0], [.38, .38, .38]);
  const ring = addMesh(group, new THREE.TorusGeometry(.62, .055, 8, 24), mat('#fff0c1', .25, { emissive: '#ffcf74', emissiveIntensity: .8 }), [0, 1.35, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
  group.position.set(lanes[(i + 1) % 2], .1, -65 - i * 70); scene.add(group);
  pickups.push({ group, active: true, phase: i });
}

const $ = (selector) => document.querySelector(selector);
const speedValue = $('#speed-value'), speedFill = $('#speed-fill'), distanceValue = $('#distance-value');
const scoreValue = $('#score-value'), trafficFill = $('#traffic-fill'), flowStatus = $('#flow-status');
const toast = $('#toast');
const state = { speed: 20, distance: 0, score: 0, ai: false, paused: false, steering: 0, cameraMode: 0, time: 0, impactCooldown: 0, toastTimer: 0, touch: { left: false, right: false, gas: false, brake: false } };
let toastTimeout;
function announce(text) {
  toast.textContent = text; toast.classList.add('show'); clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 1650);
}
function nearestCar(x, z, direction = -1, laneOnly = false) {
  let nearest = null, nearestGap = Infinity;
  for (const car of traffic) {
    if (car.direction !== direction || (laneOnly && Math.abs(car.mesh.position.x - x) > .75)) continue;
    const gap = direction < 0 ? z - car.mesh.position.z : car.mesh.position.z - z;
    if (gap > 0 && gap < nearestGap) { nearest = car; nearestGap = gap; }
  }
  return nearest ? { car: nearest, gap: nearestGap } : null;
}
function toggleAI(force) {
  state.ai = force ?? !state.ai;
  $('#autopilot-button').classList.toggle('active', state.ai);
  $('#autopilot-label').textContent = state.ai ? 'ON · CRUISE ASSIST' : 'OFF · MANUAL';
  announce(state.ai ? 'AI CRUISE ENGAGED · SIT BACK & ENJOY' : 'MANUAL DRIVE · YOU’RE IN CONTROL');
}
$('#autopilot-button').addEventListener('click', () => toggleAI());
$('#camera-button').addEventListener('click', () => { state.cameraMode = (state.cameraMode + 1) % 2; announce(state.cameraMode ? 'CINEMATIC CAMERA' : 'CHASE CAMERA'); });
$('#pause-button').addEventListener('click', () => setPaused(!state.paused));
$('#resume-button').addEventListener('click', () => setPaused(false));
function setPaused(paused) {
  state.paused = paused; $('#pause-overlay').classList.toggle('hidden', !paused);
  $('#pause-button').textContent = paused ? '▶' : 'Ⅱ'; $('#pause-button').setAttribute('aria-label', paused ? 'Resume game' : 'Pause game');
}

const keys = new Set();
window.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault();
  keys.add(event.key.toLowerCase());
  if (event.key.toLowerCase() === 'p' || event.key === 'Escape') setPaused(!state.paused);
  if (event.key.toLowerCase() === 'i') toggleAI();
}, { passive: false });
window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => { keys.clear(); state.touch.left = state.touch.right = state.touch.gas = state.touch.brake = false; });
document.querySelectorAll('[data-control]').forEach((button) => {
  const control = button.dataset.control;
  const down = (event) => { event.preventDefault(); state.touch[control] = true; button.classList.add('pressed'); button.setPointerCapture?.(event.pointerId); };
  const up = (event) => { event.preventDefault(); state.touch[control] = false; button.classList.remove('pressed'); };
  button.addEventListener('pointerdown', down); button.addEventListener('pointerup', up); button.addEventListener('pointercancel', up); button.addEventListener('lostpointercapture', up);
});
$('#sound-button').addEventListener('click', () => {
  const button = $('#sound-button'); const enabled = button.dataset.enabled !== 'true'; button.dataset.enabled = String(enabled);
  button.style.background = enabled ? 'rgba(255,255,255,.4)' : '';
  announce(enabled ? 'SOUND ON · ENJOY THE EVENING BREEZE' : 'SOUND OFF');
});

let lastFrame = performance.now(), uiTimer = 0;
const clock = new THREE.Clock();
function updateTraffic(dt) {
  // Every car follows the one ahead. Their ordinary braking naturally creates rippling stop-and-go queues.
  for (const car of traffic) {
    let target = car.cruise;
    const ahead = nearestCar(car.mesh.position.x, car.mesh.position.z, car.direction, true);
    if (ahead) {
      const safeGap = Math.max(0, ahead.gap - 5);
      target = Math.min(target, Math.sqrt(safeGap) * 3.2);
      if (safeGap < 7) target = 0;
    }
    car.speed += (target - car.speed) * Math.min(1, dt * (target < car.speed ? 1.5 : .42));
    car.phase += dt;
    car.mesh.position.z += car.direction * car.speed * dt;
    for (const wheel of car.mesh.userData.wheels) wheel.rotation.x += car.direction * car.speed * dt * .12;
    const relative = car.mesh.position.z - player.position.z;
    if (relative < -315 || relative > 275) {
      if (car.direction < 0) car.mesh.position.z = player.position.z + 28 + Math.random() * 205;
      else car.mesh.position.z = player.position.z - 95 - Math.random() * 205;
      car.lane = car.direction < 0 ? Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2);
      car.mesh.position.x = lanes[car.lane]; car.cruise = 9 + Math.random() * 17; car.speed = car.cruise;
    }
  }
}
function updateDrive(dt) {
  const manualSteer = (keys.has('a') || keys.has('arrowleft') || state.touch.left ? -1 : 0) + (keys.has('d') || keys.has('arrowright') || state.touch.right ? 1 : 0);
  const throttle = keys.has('w') || keys.has('arrowup') || state.touch.gas;
  const brake = keys.has('s') || keys.has('arrowdown') || state.touch.brake;
  let steering = manualSteer;
  let targetSpeed = state.speed;
  if (state.ai) {
    const front = nearestCar(player.position.x, player.position.z, -1, true);
    const leftLane = player.position.x < -3 ? -4.5 : -1.5;
    const candidateLane = player.position.x < -3 ? -1.5 : -4.5;
    const nextGap = nearestCar(candidateLane, player.position.z, -1, true);
    if (front && front.gap < 28 && (!nextGap || nextGap.gap > front.gap + 9)) player.userData.targetLane = candidateLane;
    if (!player.userData.targetLane) player.userData.targetLane = leftLane;
    if (!front || front.gap > 38) player.userData.targetLane = leftLane;
    const targetX = player.userData.targetLane;
    steering = THREE.MathUtils.clamp((targetX - player.position.x) * .9, -1, 1);
    const gap = nearestCar(player.position.x, player.position.z, -1, false)?.gap ?? 100;
    targetSpeed = gap < 12 ? Math.min(24, Math.max(8, gap * 1.3)) : 25;
  } else {
    if (throttle) targetSpeed = Math.min(36, state.speed + 14 * dt);
    else targetSpeed = Math.max(10, state.speed - 1.2 * dt);
    if (brake) targetSpeed = Math.max(0, state.speed - 25 * dt);
  }
  state.speed += (targetSpeed - state.speed) * Math.min(1, dt * (targetSpeed < state.speed ? 2.2 : 1.15));
  state.steering += (steering - state.steering) * Math.min(1, dt * 5.2);
  player.position.x += state.steering * (4.4 + state.speed * .13) * dt;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -5.7, 5.7);
  player.position.z -= state.speed * dt;
  player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -state.steering * .095, Math.min(1, dt * 5));
  player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, state.steering * .045, Math.min(1, dt * 3));
  for (const wheel of player.userData.wheels) wheel.rotation.x += state.speed * dt * .12;
  state.distance += state.speed * dt / 1000;
  state.score += state.speed * dt * (state.ai ? .12 : .18);
  state.impactCooldown = Math.max(0, state.impactCooldown - dt);
  for (const car of traffic) {
    const dx = Math.abs(car.mesh.position.x - player.position.x), dz = Math.abs(car.mesh.position.z - player.position.z);
    if (dx < 1.72 && dz < 2.55 && state.impactCooldown <= 0) {
      state.impactCooldown = 1.25; state.speed = Math.max(3, state.speed * .48); state.score = Math.max(0, state.score - 80);
      player.position.x += player.position.x < car.mesh.position.x ? -.75 : .75;
      announce('EASY THERE! WATCH THE TRAFFIC');
    } else if (dx > 1.75 && dx < 3.3 && dz < .8 && !car.mesh.userData.passed) {
      car.mesh.userData.passed = true; state.score += 45; announce('NICE PASS  +45');
    }
    if (dz > 7) car.mesh.userData.passed = false;
  }
  for (const pickup of pickups) {
    pickup.group.rotation.y += dt * 1.25; pickup.group.position.y = .1 + Math.sin(state.time * 2.4 + pickup.phase) * .18;
    const dz = Math.abs(pickup.group.position.z - player.position.z);
    if (pickup.active && dz < 2.3 && Math.abs(pickup.group.position.x - player.position.x) < 1.8) {
      pickup.active = false; pickup.group.visible = false; state.score += 250; announce('SUNSET CHARM  +250 ✦');
      pickup.group.position.z = player.position.z - 330 - Math.random() * 130; pickup.group.position.x = lanes[Math.floor(Math.random() * 2)];
      pickup.active = true; pickup.group.visible = true;
    }
  }
}
function updateWorld(dt) {
  for (const object of decorations) {
    if (object.position.z > player.position.z + 66) object.position.z -= 430;
    else if (object.position.z < player.position.z - 390) object.position.z += 430;
  }
  updateTraffic(dt);
  const roadTarget = new THREE.Vector3(player.position.x * .58, state.cameraMode ? 11.1 : 9.3, player.position.z + (state.cameraMode ? 21 : 13.8));
  camera.position.lerp(roadTarget, Math.min(1, dt * (state.cameraMode ? 1.7 : 2.7)));
  const look = new THREE.Vector3(player.position.x * .3, 1.2, player.position.z - (state.cameraMode ? 17 : 20));
  camera.lookAt(look);
  camera.fov = THREE.MathUtils.lerp(camera.fov, state.cameraMode ? 48 : 54, dt * 2); camera.updateProjectionMatrix();
}
function updateHUD(dt) {
  uiTimer += dt; if (uiTimer < .12) return; uiTimer = 0;
  const kmh = Math.round(state.speed * 3.6);
  speedValue.textContent = String(kmh).padStart(2, '0'); speedFill.style.width = `${Math.min(100, kmh / 1.45)}%`;
  $('#gear-value').textContent = `D · ${Math.max(1, Math.min(5, Math.ceil(kmh / 25)))}`;
  distanceValue.textContent = state.distance.toFixed(1); scoreValue.textContent = String(Math.floor(state.score)).padStart(4, '0');
  const near = traffic.filter((car) => car.direction < 0 && car.mesh.position.z < player.position.z && player.position.z - car.mesh.position.z < 65);
  const mean = near.length ? near.reduce((sum, car) => sum + car.speed, 0) / near.length : 24;
  const congestion = THREE.MathUtils.clamp((1 - mean / 25) * .8 + Math.max(0, near.length - 4) * .045, .08, .96);
  trafficFill.style.width = `${Math.round(congestion * 100)}%`;
  const jam = congestion > .62; flowStatus.textContent = jam ? 'JAM AHEAD' : congestion > .38 ? 'BUSY' : 'MOVING'; flowStatus.classList.toggle('jam', jam);
  $('#map-traffic').textContent = `${traffic.length} CARS`;
}
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(.045, (now - lastFrame) / 1000); lastFrame = now;
  if (!state.paused) { state.time += dt; updateDrive(dt); updateWorld(dt); updateHUD(dt); }
  renderer.render(scene, camera);
}
function resize() {
  const width = innerWidth, height = innerHeight;
  camera.aspect = width / height; camera.fov = width < 600 ? 59 : 54; camera.updateProjectionMatrix();
  renderer.setSize(width, height); renderer.setPixelRatio(Math.min(devicePixelRatio, width < 600 ? 1.4 : 1.7));
}
window.addEventListener('resize', resize);
resize(); camera.position.set(-2.5, 9.3, 13.8); camera.lookAt(-1.3, 1, -20);
announce('SCENIC ROUTE OPEN · COLLECT THE GLOWING CHARMS');
requestAnimationFrame(animate);
