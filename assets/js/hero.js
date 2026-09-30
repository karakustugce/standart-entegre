// Hero: live 3D cable reel that disassembles as you scroll.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildReel, explodeReel, studio, shadowFloor } from "./models.js";

const section = document.querySelector("[data-hero]");
const stage = section && section.querySelector("[data-stage]");
const canvas = stage && stage.querySelector("canvas");

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (p, a, b) => { const t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); };

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    if (!renderer.getContext()) throw new Error("no gl");
  } catch (e) {
    document.documentElement.classList.add("no-webgl");
    return;
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.42;
  const lights = studio(scene, renderer);
  lights.key.intensity = 2.9;
  lights.key.position.set(2.6, 4.2, 4.2);
  lights.rim.intensity = 1.4;
  lights.hemi.intensity = 0.4;

  const reel = buildReel({ D: 1.6, drum: 0.8, traverse: 0.9 });
  const holder = new THREE.Group();
  holder.add(reel);
  holder.position.y = 0.8;
  scene.add(holder);
  const floor = shadowFloor(14, 0.55);
  scene.add(floor);

  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
  const target = new THREE.Vector3(0, 0.78, 0);

  const u = reel.userData;
  const labels = [...stage.querySelectorAll("[data-anchor]")];
  const tmp = new THREE.Vector3();
  const anchorWorld = {
    flange: () => u.flR.localToWorld(tmp.set(-u.R * 0.42, u.R * 0.84, u.t * 2)),
    rod: () => reel.localToWorld(tmp.set(Math.cos(Math.PI * 1.5) * u.rd * 0.72, Math.sin(Math.PI * 1.5) * u.rd * 0.72, u.traverse / 2 + 0.06 + (u.flR.position.z - u.traverse / 2) * 0.45)),
    hole: () => u.flR.localToWorld(tmp.set(0, 0, u.t * 2 + 0.006)),
    drum: () => u.drumG.localToWorld(tmp.set(-0.05, u.rd + 0.02 + (u.staves[0].position.y - (u.rd - u.staveT / 2)), -0.12)),
  };

  let W = 0, H = 0, mobile = false;
  function resize() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    mobile = W / H < 0.9;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H, false);
    cam.aspect = W / H;
    // push the reel to the right on wide screens, up on tall screens
    const ox = mobile ? 0 : -W * 0.21;
    const oy = mobile ? H * 0.15 : H * 0.075;
    cam.setViewOffset(W, H, ox, oy, W, H);
    cam.fov = mobile ? 36 : 28;
    cam.updateProjectionMatrix();
  }

  let progress = 0, visible = true, t0 = performance.now();
  function readScroll() {
    const r = section.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    progress = span > 0 ? clamp(-r.top / span) : 0;
  }

  function frame(now) {
    const t = (now - t0) / 1000;
    const p = reduce ? 0 : progress;
    const e = ramp(p, 0.14, 0.52) - ramp(p, 0.84, 1.0);
    explodeReel(reel, e);
    const sway = reduce ? 0 : Math.sin(t * 0.35) * 0.045;
    holder.rotation.y = lerp(-0.6, -1.05, ramp(p, 0.08, 0.5)) + sway;
    holder.rotation.x = lerp(0, 0.06, ramp(p, 0.1, 0.5));
    const dist = lerp(mobile ? 9.6 : 6.7, mobile ? 12.4 : 7.3, ramp(p, 0.1, 0.5));
    const elev = lerp(1.3, 1.75, ramp(p, 0.1, 0.5));
    cam.position.set(0, elev, dist);
    cam.lookAt(target);
    renderer.render(scene, cam);

    // HTML layers driven by the same timeline
    stage.style.setProperty("--intro", String(1 - ramp(p, 0.06, 0.2)));
    stage.style.setProperty("--parts", String(ramp(p, 0.38, 0.5) - ramp(p, 0.8, 0.88)));
    stage.style.setProperty("--outro", String(ramp(p, 0.86, 0.95)));
    stage.style.setProperty("--progress", String(p));

    const c = holder.getWorldPosition(tmp).project(cam);
    const cx = (c.x * 0.5 + 0.5) * W;
    for (const el of labels) {
      const fn = anchorWorld[el.dataset.anchor];
      if (!fn) continue;
      const v = fn().project(cam);
      const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
      const side = el.dataset.side || (x < cx ? "l" : "r");
      for (const k of ["l", "r", "u", "d"]) el.classList.toggle(k, side === k);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
    if (visible && !reduce) requestAnimationFrame(frame);
  }

  resize();
  readScroll();
  addEventListener("resize", () => { resize(); if (reduce) requestAnimationFrame(frame); }, { passive: true });
  addEventListener("scroll", readScroll, { passive: true });
  new IntersectionObserver(([en]) => {
    const was = visible; visible = en.isIntersecting;
    if (visible && !was && !reduce) requestAnimationFrame(frame);
  }).observe(section);
  requestAnimationFrame((n) => { frame(n); stage.classList.add("is-live"); });
}

if (canvas) init();
