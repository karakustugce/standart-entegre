// Procedural product models: wooden cable reel, EUR pallet, export crate.
// Units: metres. Shared by the live hero and the offline render script.
import * as THREE from "three";

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Canvas wood texture: grain runs along the canvas Y axis (v direction).
export function woodTexture(seed = 1, base = [196, 150, 98]) {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const r = rng(seed);
  g.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  g.fillRect(0, 0, size, size);
  // broad tonal bands
  for (let i = 0; i < 14; i++) {
    const x = r() * size, w = 20 + r() * 80;
    const d = r() < 0.5 ? -1 : 1;
    g.fillStyle = `rgba(${d > 0 ? "255,235,200" : "70,40,15"},${0.04 + r() * 0.07})`;
    g.fillRect(x, 0, w, size);
  }
  // fine grain lines
  for (let i = 0; i < 220; i++) {
    let x = r() * size;
    const a = 0.05 + r() * 0.16;
    const wob = 1 + r() * 5, freq = 0.004 + r() * 0.012, ph = r() * 6.28;
    g.strokeStyle = `rgba(62,38,18,${a * 0.8})`;
    g.lineWidth = 0.6 + r() * 1.6;
    g.beginPath();
    for (let y = -4; y <= size + 4; y += 8) {
      const xx = x + Math.sin(y * freq + ph) * wob;
      y === -4 ? g.moveTo(xx, y) : g.lineTo(xx, y);
    }
    g.stroke();
  }
  // a couple of knots
  const knots = Math.floor(r() * 3);
  for (let k = 0; k < knots; k++) {
    const kx = r() * size, ky = r() * size, kr = 5 + r() * 10;
    const grd = g.createRadialGradient(kx, ky, 0, kx, ky, kr * 2.4);
    grd.addColorStop(0, "rgba(55,28,8,0.75)");
    grd.addColorStop(0.35, "rgba(90,52,20,0.45)");
    grd.addColorStop(1, "rgba(90,52,20,0)");
    g.fillStyle = grd;
    g.beginPath(); g.ellipse(kx, ky, kr * 2.4, kr * 3.4, 0, 0, 6.29); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function woodMaterials(count = 7, seed = 11) {
  const r = rng(seed);
  const tones = [[184, 142, 98], [168, 128, 88], [196, 158, 114], [158, 118, 80], [178, 138, 94], [204, 168, 124], [150, 110, 74]];
  const mats = [];
  for (let i = 0; i < count; i++) {
    const map = woodTexture(seed * 31 + i * 7, tones[i % tones.length]);
    map.repeat.set(1.6, 1.6);
    map.offset.set(r(), r());
    mats.push(new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: 1.2, roughness: 0.88, metalness: 0, color: 0xffffff }));
  }
  return mats;
}

const steel = () => new THREE.MeshStandardMaterial({ color: 0x5b5f63, metalness: 0.75, roughness: 0.42 });
const steelDark = () => new THREE.MeshStandardMaterial({ color: 0x2e3134, metalness: 0.7, roughness: 0.5 });


// Box with metric UVs; wood grain (texture v) follows the board's longest axis.
function woodBox(w, h, d) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const pos = geo.attributes.position, uv = geo.attributes.uv, n = geo.attributes.normal;
  const dims = { x: w, y: h, z: d };
  const long = Object.keys(dims).reduce((a, b) => (dims[a] >= dims[b] ? a : b));
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
    const axes = nx > 0.5 ? ["z", "y"] : ny > 0.5 ? ["x", "z"] : ["x", "y"];
    let [ua, va] = axes;
    if (ua === long) [ua, va] = [va, ua];
    const get = (a) => (a === "x" ? pos.getX(i) : a === "y" ? pos.getY(i) : pos.getZ(i));
    uv.setXY(i, get(ua), get(va));
  }
  uv.needsUpdate = true;
  return geo;
}

function pick(mats, r) { return mats[Math.floor(r() * mats.length)]; }

// One flange layer made of parallel boards clipped to a circle (boards run along Y).
function flangeLayer(R, t, boardW, gap, mats, r) {
  const grp = new THREE.Group();
  const f = (x) => Math.sqrt(Math.max(R * R - x * x, 0));
  const n = Math.ceil((2 * R) / boardW);
  const start = -n * boardW / 2;
  for (let i = 0; i < n; i++) {
    let x0 = start + i * boardW + gap / 2, x1 = start + (i + 1) * boardW - gap / 2;
    x0 = Math.max(x0, -R + 0.002); x1 = Math.min(x1, R - 0.002);
    if (x1 - x0 < 0.01) continue;
    const s = new THREE.Shape();
    const steps = 10;
    s.moveTo(x0, -f(x0));
    s.lineTo(x0, f(x0));
    for (let k = 1; k <= steps; k++) { const x = x0 + (x1 - x0) * k / steps; s.lineTo(x, f(x)); }
    for (let k = 0; k <= steps; k++) { const x = x1 - (x1 - x0) * k / steps; s.lineTo(x, -f(x)); }
    const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.0025, bevelSegments: 1, curveSegments: 1 });
    const m = new THREE.Mesh(geo, pick(mats, r));
    m.castShadow = m.receiveShadow = true;
    grp.add(m);
  }
  return grp;
}

// Wooden cable reel. Axis along local Z; flange outer faces at z = ±(traverse/2 + 2t).
export function buildReel(opts = {}) {
  const {
    D = 1.6, drum = 0.8, traverse = 0.9, t = 0.026, boardW = 0.12, holeD = 0.1, bolts = 6, seed = 3,
  } = opts;
  const R = D / 2, rd = drum / 2;
  const r = rng(seed);
  const mats = woodMaterials(7, seed + 20);
  const root = new THREE.Group();
  root.name = "reel";

  // flanges: inner layer horizontal boards, outer layer vertical boards
  function makeFlange(side) {
    const g = new THREE.Group();
    const inner = flangeLayer(R, t, boardW, 0.004, mats, r);
    inner.rotation.z = Math.PI / 2;
    const outer = flangeLayer(R, t, boardW, 0.004, mats, r);
    // extrude goes +z; stack inner at [0,t], outer at [t,2t] for side=+1 (mirrored for -1)
    inner.position.z = 0; outer.position.z = t;
    g.add(inner, outer);
    // steel centre plate with dark arbor hole on the outer face
    const ps = 0.3, ph = holeD / 2;
    const sh = new THREE.Shape();
    sh.moveTo(-ps / 2, -ps / 2); sh.lineTo(ps / 2, -ps / 2); sh.lineTo(ps / 2, ps / 2); sh.lineTo(-ps / 2, ps / 2); sh.lineTo(-ps / 2, -ps / 2);
    const hole = new THREE.Path(); hole.absarc(0, 0, ph, 0, Math.PI * 2, true); sh.holes.push(hole);
    const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: false, curveSegments: 32 }), steel());
    plate.position.z = 2 * t + 0.0005; plate.castShadow = true;
    // plate bolts
    for (const [px, py] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 6), steelDark());
      b.rotation.x = Math.PI / 2; b.position.set(px * ps * 0.36, py * ps * 0.36, 2 * t + 0.012);
      g.add(b);
    }
    const holeDisc = new THREE.Mesh(new THREE.CylinderGeometry(ph, ph, 2 * t + 0.01, 32), new THREE.MeshBasicMaterial({ color: 0x0b0906 }));
    holeDisc.rotation.x = Math.PI / 2; holeDisc.position.z = t;
    g.add(plate, holeDisc);
    // tie-bolt nuts + washers
    const nuts = new THREE.Group(); nuts.name = "nuts";
    for (let i = 0; i < bolts; i++) {
      const a = (i / bolts) * Math.PI * 2 + Math.PI / bolts;
      const rr = rd * 0.72;
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.005, 24), steel());
      w.rotation.x = Math.PI / 2; w.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 2 * t + 0.003);
      const n = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 6), steelDark());
      n.rotation.x = Math.PI / 2; n.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 2 * t + 0.014);
      const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.034, 12), steel());
      stud.rotation.x = Math.PI / 2; stud.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 2 * t + 0.02);
      w.castShadow = n.castShadow = true;
      nuts.add(w, n, stud);
    }
    g.add(nuts);
    g.userData.nuts = nuts;
    if (side < 0) g.rotation.y = Math.PI; // mirror so outer face points outward
    g.position.z = side * traverse / 2;
    return g;
  }
  const flL = makeFlange(-1), flR = makeFlange(1);

  // drum staves
  const drumG = new THREE.Group(); drumG.name = "drum";
  const N = Math.max(12, Math.round((2 * Math.PI * rd) / 0.085));
  const staveW = (2 * Math.PI * rd) / N * 0.965, staveT = 0.028;
  const staves = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const geo = woodBox(staveW, staveT, traverse);
    const m = new THREE.Mesh(geo, pick(mats, r));
    const piv = new THREE.Group();
    piv.rotation.z = a - Math.PI / 2;
    m.position.y = rd - staveT / 2;
    m.castShadow = m.receiveShadow = true;
    piv.add(m); drumG.add(piv);
    staves.push(m);
  }
  // inner dark core so gaps read as depth
  const core = new THREE.Mesh(new THREE.CylinderGeometry(rd - staveT - 0.002, rd - staveT - 0.002, traverse * 0.98, 40), new THREE.MeshStandardMaterial({ color: 0x1a130c, roughness: 1 }));
  core.rotation.x = Math.PI / 2; drumG.add(core);

  // tie rods (visible when exploded)
  const rods = new THREE.Group(); rods.name = "rods";
  for (let i = 0; i < bolts; i++) {
    const a = (i / bolts) * Math.PI * 2 + Math.PI / bolts, rr = rd * 0.72;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, traverse + 4 * t + 0.03, 12), steel());
    rod.rotation.x = Math.PI / 2; rod.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 0);
    rod.castShadow = true;
    rods.add(rod);
  }
  rods.visible = false;

  root.add(flL, flR, drumG, rods);
  const halfW = traverse / 2 + 2 * t;
  root.userData = {
    R, rd, traverse, t, halfW, flL, flR, drumG, staves, rods, staveT,
    anchors: {
      flange: new THREE.Vector3(0, R * 0.97, traverse / 2 + t),
      drum: new THREE.Vector3(0, rd, 0),
      bolt: new THREE.Vector3(Math.cos(Math.PI / bolts) * rd * 0.72, Math.sin(Math.PI / bolts) * rd * 0.72, halfW + 0.02),
      hole: new THREE.Vector3(0, 0, halfW + 0.006),
    },
  };
  return root;
}

// e: 0 assembled … 1 fully exploded
export function explodeReel(reel, e) {
  const u = reel.userData;
  const k = e * e * (3 - 2 * e);
  u.flL.position.z = -u.traverse / 2 - k * 0.62;
  u.flR.position.z = u.traverse / 2 + k * 0.62;
  u.flL.userData.nuts.position.z = k * 0.22;
  u.flR.userData.nuts.position.z = k * 0.22;
  for (const s of u.staves) s.position.y = u.rd - u.staveT / 2 + k * 0.09;
  u.rods.visible = k > 0.02;
  u.rods.scale.z = 1 + k * 0.9;
  u.anchors.flangeZ = u.flR.position.z;
}

// EUR pallet 1200 × 800 × 144 mm
export function buildPallet(seed = 5) {
  const r = rng(seed);
  const mats = woodMaterials(6, seed + 40);
  const g = new THREE.Group();
  const add = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(woodBox(w, h, d), pick(mats, r));
    m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };
  const L = 1.2, W = 0.8, bt = 0.022, bh = 0.078;
  // bottom boards (along length)
  for (const [z, w] of [[-(W / 2 - 0.05), 0.1], [0, 0.145], [W / 2 - 0.05, 0.1]]) add(L, bt, w, 0, bt / 2, z);
  // blocks
  for (const x of [-(L / 2 - 0.0725), 0, L / 2 - 0.0725]) for (const [z, w] of [[-(W / 2 - 0.05), 0.1], [0, 0.145], [W / 2 - 0.05, 0.1]]) {
    const b = add(x === 0 ? 0.145 : 0.145, bh, w, x, bt + bh / 2, z);
    b.material = mats[(Math.floor(r() * 3)) % mats.length];
  }
  // cross boards (along width)
  for (const x of [-(L / 2 - 0.0725), 0, L / 2 - 0.0725]) add(0.145, bt, W, x, bt + bh + bt / 2, 0);
  // top deck boards (along length)
  const tops = [[-(W / 2 - 0.0725), 0.145], [-0.1925, 0.1], [0, 0.145], [0.1925, 0.1], [W / 2 - 0.0725, 0.145]];
  for (const [z, w] of tops) add(L, bt, w, 0, bt * 2 + bh + bt / 2, z);
  g.userData.size = new THREE.Vector3(L, bt * 3 + bh, W);
  return g;
}

// Closed export crate on skids, framed and braced.
export function buildCrate(seed = 9) {
  const r = rng(seed);
  const mats = woodMaterials(6, seed + 60);
  const g = new THREE.Group();
  const add = (w, h, d, x, y, z, rz = 0, rx = 0, ry = 0) => {
    const m = new THREE.Mesh(woodBox(w, h, d), pick(mats, r));
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };
  const L = 1.5, H = 1.0, W = 0.95, sk = 0.09, st = 0.02, ft = 0.022;
  // skids
  for (const z of [-(W / 2 - 0.06), 0, W / 2 - 0.06]) add(L + 0.06, sk, 0.09, 0, sk / 2, z);
  const y0 = sk;
  // sheathing planks on long sides and ends (horizontal boards with gaps)
  const pH = 0.14, gap = 0.006, n = Math.round(H / pH);
  for (let i = 0; i < n; i++) {
    const y = y0 + i * pH + pH / 2;
    add(L, pH - gap, st, 0, y, W / 2 - st / 2);
    add(L, pH - gap, st, 0, y, -(W / 2 - st / 2));
    add(st, pH - gap, W - 2 * st, L / 2 - st / 2, y, 0);
    add(st, pH - gap, W - 2 * st, -(L / 2 - st / 2), y, 0);
  }
  // lid planks
  for (let i = 0; i < 7; i++) {
    const w = W / 7;
    add(L + 0.01, st, w - gap, 0, y0 + n * pH + st / 2, -W / 2 + w * i + w / 2);
  }
  const top = y0 + n * pH;
  // outer frame on the long faces
  for (const s of [1, -1]) {
    const z = s * (W / 2 + ft / 2);
    add(L, 0.09, ft, 0, y0 + 0.045, z);
    add(L, 0.09, ft, 0, top - 0.045, z);
    for (const x of [-(L / 2 - 0.045), 0, L / 2 - 0.045]) add(0.09, top - y0 - 0.18, ft, x, (top + y0) / 2, z);
    const hh = top - y0 - 0.18, ww = L / 2 - 0.09;
    const len = Math.hypot(hh, ww), ang = Math.atan2(hh, ww);
    add(len, 0.08, ft, -L / 4, (top + y0) / 2, z + s * 0.001, ang);
    add(len, 0.08, ft, L / 4, (top + y0) / 2, z + s * 0.001, -ang);
  }
  // end frames
  for (const s of [1, -1]) {
    const x = s * (L / 2 + ft / 2);
    add(ft, 0.09, W, x, y0 + 0.045, 0);
    add(ft, 0.09, W, x, top - 0.045, 0);
    add(ft, top - y0 - 0.18, 0.09, x, (top + y0) / 2, W / 2 - 0.045);
    add(ft, top - y0 - 0.18, 0.09, x, (top + y0) / 2, -(W / 2 - 0.045));
  }
  g.userData.size = new THREE.Vector3(L, top + st, W);
  return g;
}

// Studio lighting shared by hero and renders
export function studio(scene, renderer, { shadowSize = 4, envIntensity = 0.55 } = {}) {
  const hemi = new THREE.HemisphereLight(0xfff3e2, 0x3a3228, 0.55);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0dc, 2.6);
  key.position.set(3.2, 4.6, 3.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const s = shadowSize;
  Object.assign(key.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.5, far: 20 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe0ff, 0.9);
  rim.position.set(-4, 2.5, -3);
  scene.add(rim);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return { key, hemi, rim, envIntensity };
}

export function shadowFloor(size = 12, opacity = 0.28) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShadowMaterial({ opacity }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------------------
// Additional products and production scenes
// ---------------------------------------------------------------------------
function canvasTex(size, draw, repeat = [1, 1]) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function kraftTexture(seed = 2, base = [176, 132, 86]) {
  const r = rng(seed);
  return canvasTex(512, (g, s) => {
    g.fillStyle = `rgb(${base})`; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 9000; i++) {
      const v = r() < 0.5 ? "60,36,14" : "255,236,205";
      g.fillStyle = `rgba(${v},${0.04 + r() * 0.08})`;
      g.fillRect(r() * s, r() * s, 1 + r() * 3, 1);
    }
  });
}

// Fibre/cardboard reel: kraft tube + pressed board flanges.
export function buildCardboardReel(opts = {}) {
  const { D = 0.62, drum = 0.26, traverse = 0.42, t = 0.018, seed = 4 } = opts;
  const R = D / 2, rd = drum / 2;
  const flangeMat = new THREE.MeshStandardMaterial({ map: kraftTexture(seed, [150, 108, 68]), roughness: 0.95 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x6e4a2a, roughness: 1 });
  const tubeTex = canvasTex(512, (g, s) => {
    g.fillStyle = "rgb(190,148,98)"; g.fillRect(0, 0, s, s);
    g.strokeStyle = "rgba(90,58,26,.45)"; g.lineWidth = 3;
    for (let k = -4; k < 8; k++) { g.beginPath(); g.moveTo(0, k * 80); g.lineTo(s, k * 80 + 140); g.stroke(); }
    const r = rng(seed + 9);
    for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(70,40,14,${r() * 0.06})`; g.fillRect(r() * s, r() * s, 2, 1); }
  }, [2, 1]);
  const tubeMat = new THREE.MeshStandardMaterial({ map: tubeTex, roughness: 0.9 });
  const g = new THREE.Group();
  const shape = new THREE.Shape(); shape.absarc(0, 0, R, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.026, 0, Math.PI * 2, true); shape.holes.push(hole);
  for (const s of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 1, curveSegments: 64 });
    const m = new THREE.Mesh(geo, [flangeMat, edgeMat]);
    m.position.z = s > 0 ? traverse / 2 : -traverse / 2 - t;
    m.castShadow = m.receiveShadow = true; g.add(m);
    // drive holes
    for (let i = 0; i < 2; i++) {
      const a = i * Math.PI + 0.4;
      const dh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, t + 0.004, 16), new THREE.MeshBasicMaterial({ color: 0x120c06 }));
      dh.rotation.x = Math.PI / 2; dh.position.set(Math.cos(a) * rd * 0.6, Math.sin(a) * rd * 0.6, m.position.z + t / 2); g.add(dh);
    }
  }
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(rd, rd, traverse, 64, 1, true), tubeMat);
  tube.rotation.x = Math.PI / 2; tube.castShadow = tube.receiveShadow = true; g.add(tube);
  const holeCore = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, traverse + 2 * t + 0.01, 24), new THREE.MeshBasicMaterial({ color: 0x0d0905 }));
  holeCore.rotation.x = Math.PI / 2; g.add(holeCore);
  g.userData = { R, halfW: traverse / 2 + t };
  return g;
}

export function marbleTexture(seed = 7) {
  const r = rng(seed);
  return canvasTex(1024, (g, s) => {
    const grd = g.createLinearGradient(0, 0, s, s);
    grd.addColorStop(0, "#e4e2dc"); grd.addColorStop(1, "#cfccc4");
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = `rgba(${70 + r() * 40},${72 + r() * 40},${80 + r() * 40},${0.22 + r() * 0.4})`;
      g.lineWidth = 0.6 + r() * 2.6;
      g.beginPath();
      let x = r() * s, y = -20;
      g.moveTo(x, y);
      while (y < s + 20) { x += (r() - 0.45) * 60; y += 20 + r() * 50; g.lineTo(x, y); }
      g.stroke();
    }
    
  });
}

// Open slatted marble crate (mermer kasası) with slabs standing inside.
export function buildMarbleCrate(seed = 12) {
  const r = rng(seed);
  const mats = woodMaterials(6, seed + 80);
  const g = new THREE.Group();
  const add = (w, h, d, x, y, z, rz = 0) => {
    const m = new THREE.Mesh(woodBox(w, h, d), pick(mats, r));
    m.position.set(x, y, z); m.rotation.z = rz; m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };
  const L = 2.0, W = 0.55, H = 1.25, sk = 0.1, post = 0.08;
  for (const z of [-(W / 2 - 0.05), W / 2 - 0.05]) add(L + 0.1, sk, 0.1, 0, sk / 2, z);
  for (const x of [-(L / 2 - 0.25), 0, L / 2 - 0.25]) add(0.1, 0.03, W + 0.08, x, sk + 0.015, 0);
  const y0 = sk + 0.03;
  for (const s of [1, -1]) {
    const z = s * (W / 2 + 0.02);
    for (const x of [-(L / 2 - post / 2), -L / 6, L / 6, L / 2 - post / 2]) add(post, H, 0.04, x, y0 + H / 2, z);
    for (const y of [y0 + 0.08, y0 + H * 0.55, y0 + H - 0.05]) add(L, 0.1, 0.03, 0, y, z + s * 0.035);
    const hh = H * 0.47, ww = L / 3 - post;
    add(Math.hypot(hh, ww), 0.08, 0.03, -L / 3, y0 + 0.08 + hh / 2, z + s * 0.065, Math.atan2(hh, ww));
    add(Math.hypot(hh, ww), 0.08, 0.03, L / 3, y0 + 0.08 + hh / 2, z + s * 0.065, -Math.atan2(hh, ww));
  }
  for (const x of [-(L / 2 - post / 2), L / 2 - post / 2]) add(0.04, H, W + 0.04, x, y0 + H / 2, 0).visible = false;
  for (const x of [-(L / 2 - post / 2), L / 2 - post / 2]) {
    add(0.03, 0.1, W + 0.1, x, y0 + H - 0.05, 0);
    add(0.03, 0.1, W + 0.1, x, y0 + 0.08, 0);
  }
  const mt = marbleTexture(seed);
  mt.repeat.set(0.8, 0.6);
  const slabMat = new THREE.MeshStandardMaterial({ map: mt, roughness: 0.3, metalness: 0, color: 0xdedbd4 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xd8d6d0, roughness: 0.7 });
  const n = 9, th = 0.03;
  for (let i = 0; i < n; i++) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(L - 0.2, H - 0.12, th), [edge, edge, edge, edge, slabMat, slabMat]);
    slab.position.set((r() - 0.5) * 0.02, y0 + (H - 0.12) / 2 + 0.01, -W / 2 + 0.08 + i * ((W - 0.16) / (n - 1)));
    slab.castShadow = slab.receiveShadow = true; g.add(slab);
  }
  g.userData.size = new THREE.Vector3(L, y0 + H, W);
  return g;
}

export function barkTexture(seed = 3) {
  const r = rng(seed);
  return canvasTex(512, (g, s) => {
    g.fillStyle = "#4a3624"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 260; i++) {
      const x = r() * s, w = 4 + r() * 14;
      g.fillStyle = `rgba(${r() < 0.5 ? "28,18,10" : "120,92,64"},${0.25 + r() * 0.4})`;
      g.beginPath(); g.ellipse(x, r() * s, w / 2, 20 + r() * 70, 0, 0, 6.29); g.fill();
    }
  }, [3, 1]);
}
export function endGrainTexture(seed = 5) {
  const r = rng(seed);
  return canvasTex(512, (g, s) => {
    g.fillStyle = "#d9b585"; g.fillRect(0, 0, s, s);
    const cx = s / 2 + (r() - 0.5) * 40, cy = s / 2 + (r() - 0.5) * 40;
    for (let k = 4; k < s * 0.5; k += 5 + r() * 7) {
      g.strokeStyle = `rgba(140,92,48,${0.25 + r() * 0.35})`; g.lineWidth = 1 + r() * 2;
      g.beginPath(); g.ellipse(cx, cy, k, k * (0.96 + r() * 0.06), r(), 0, 6.29); g.stroke();
    }
    g.strokeStyle = "rgba(90,58,26,.5)"; g.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const a = r() * 6.28; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * s * 0.4, cy + Math.sin(a) * s * 0.4); g.stroke(); }
  });
}

export function buildLogPile(seed = 21, { rows = 4, len = 3.2, rMin = 0.16, rMax = 0.22 } = {}) {
  const r = rng(seed);
  const bark = new THREE.MeshStandardMaterial({ map: barkTexture(seed), roughness: 1 });
  const ends = [0, 1, 2].map((i) => new THREE.MeshStandardMaterial({ map: endGrainTexture(seed + i), roughness: 0.9 }));
  const g = new THREE.Group();
  const base = 7;
  for (let row = 0; row < rows; row++) {
    const count = base - row;
    for (let i = 0; i < count; i++) {
      const rr = rMin + r() * (rMax - rMin);
      const e = ends[Math.floor(r() * 3)];
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr * 1.04, len + (r() - 0.5) * 0.3, 28), [bark, e, e]);
      m.rotation.x = Math.PI / 2;
      m.position.set((i - (count - 1) / 2) * 0.42, 0.2 + row * 0.36, (r() - 0.5) * 0.25);
      m.castShadow = m.receiveShadow = true; g.add(m);
    }
  }
  return g;
}

export function buildLumberStack(seed = 31, { layers = 9, perLayer = 8, len = 3.0 } = {}) {
  const r = rng(seed);
  const mats = woodMaterials(7, seed + 3);
  const g = new THREE.Group();
  const bw = 0.15, bt = 0.045, stick = 0.025;
  let y = 0.06;
  for (const x of [-len / 2 + 0.2, 0, len / 2 - 0.2]) {
    const s = new THREE.Mesh(woodBox(0.1, 0.06, perLayer * (bw + 0.02) + 0.1), mats[0]); s.position.set(x, 0.03, 0); s.castShadow = true; g.add(s);
  }
  for (let l = 0; l < layers; l++) {
    for (let i = 0; i < perLayer; i++) {
      const m = new THREE.Mesh(woodBox(len + (r() - 0.5) * 0.06, bt, bw), pick(mats, r));
      m.position.set((r() - 0.5) * 0.03, y + bt / 2, (i - (perLayer - 1) / 2) * (bw + 0.02));
      m.castShadow = m.receiveShadow = true; g.add(m);
    }
    y += bt;
    if (l < layers - 1) {
      for (const x of [-len / 2 + 0.2, 0, len / 2 - 0.2]) {
        const s = new THREE.Mesh(woodBox(0.04, stick, perLayer * (bw + 0.02)), mats[3]); s.position.set(x, y + stick / 2, 0); s.castShadow = true; g.add(s);
      }
      y += stick;
    }
  }
  return g;
}

export function concreteFloor(size = 30, seed = 41) {
  const r = rng(seed);
  const tex = canvasTex(1024, (g, s) => {
    g.fillStyle = "#7a766f"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 40000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "40,40,40" : "220,218,212"},${r() * 0.08})`; g.fillRect(r() * s, r() * s, 2, 2); }
    g.strokeStyle = "rgba(50,50,50,.35)"; g.lineWidth = 2;
    for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(0, (k * s) / 4); g.lineTo(s, (k * s) / 4 + 6); g.stroke(); g.beginPath(); g.moveTo((k * s) / 4, 0); g.lineTo((k * s) / 4 - 4, s); g.stroke(); }
  }, [size / 6, size / 6]);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}
