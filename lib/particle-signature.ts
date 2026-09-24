import { addFrameTask, clamp, fitCanvas, onScreen, prefersReducedMotion, trackPointer } from "./engine";

type Options = {
  hero: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Layout slot for the stacked (tablet/phone) layout. Hidden (width 0) on desktop. */
  slot: HTMLElement;
  text?: string;
};

/**
 * The hero "SJ >>" logo as ~4k particles traced from the Amillina logo face.
 * Particles spring back to the glyph, scatter away from the cursor/finger, and burst toward the
 * viewer as the hero scrolls away (a hand-off into the career tunnel).
 * Returns a cleanup function.
 */
export function startParticleSignature({ hero, canvas, slot, text = "SJ >>" }: Options): () => void {
  let disposed = false;
  let stop = () => {};
  const surface = fitCanvas(canvas, hero);
  const pointer = trackPointer(hero);
  const reduce = prefersReducedMotion();

  (async () => {
    // --f-mark resolves to next/font's hashed Amillina family name
    const family = getComputedStyle(hero).getPropertyValue("--f-mark").trim() || "cursive";
    try {
      await Promise.race([document.fonts.load(`400 200px ${family}`), new Promise((r) => setTimeout(r, 2500))]);
    } catch {
      /* fall back to whatever face is available */
    }
    if (disposed) return;

    // ---- trace the logo into points, fitting the glyphs' real ink box (the J loop rises far above cap height)
    const W = 900;
    const H = 640;
    const oc = document.createElement("canvas");
    oc.width = W;
    oc.height = H;
    const x = oc.getContext("2d", { willReadFrequently: true })!;
    const font = (size: number) => `400 ${size}px ${family}`;
    x.font = font(100);
    const m0 = x.measureText(text);
    const inkW = (m0.actualBoundingBoxLeft || 0) + (m0.actualBoundingBoxRight || m0.width);
    const inkH = (m0.actualBoundingBoxAscent || 80) + (m0.actualBoundingBoxDescent || 20);
    const fs = 100 * Math.min((W * 0.9) / inkW, (H * 0.88) / inkH);
    x.font = font(fs);
    const m = x.measureText(text);
    const L = m.actualBoundingBoxLeft || 0;
    const R = m.actualBoundingBoxRight || m.width;
    const A = m.actualBoundingBoxAscent || fs * 0.8;
    const D = m.actualBoundingBoxDescent || fs * 0.2;
    x.fillStyle = x.strokeStyle = "#fff";
    x.lineWidth = Math.max(3, fs * 0.022);
    x.lineJoin = "round";
    const tx0 = (W - (L + R)) / 2 + L;
    const ty0 = (H - (A + D)) / 2 + A;
    x.strokeText(text, tx0, ty0);
    x.fillText(text, tx0, ty0);

    const data = x.getImageData(0, 0, W, H).data;
    let pts: number[] = [];
    for (let yy = 0; yy < H; yy += 3)
      for (let xx = 0; xx < W; xx += 3) if (data[(yy * W + xx) * 4 + 3] > 110) pts.push(xx, yy);
    let N = pts.length / 2;
    const MAX = window.innerWidth < 760 ? 2600 : 4200;
    if (N > MAX) {
      const keep: number[] = [];
      for (let i = 0; i < N; i++) if (Math.random() < MAX / N) keep.push(pts[i * 2], pts[i * 2 + 1]);
      pts = keep;
      N = keep.length / 2;
    }
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (let i = 0; i < N; i++) {
      minX = Math.min(minX, pts[i * 2]);
      maxX = Math.max(maxX, pts[i * 2]);
      minY = Math.min(minY, pts[i * 2 + 1]);
      maxY = Math.max(maxY, pts[i * 2 + 1]);
    }
    const SW = Math.max(1, maxX - minX);
    const SH = Math.max(1, maxY - minY);
    const ox = (minX + maxX) / 2;
    const oy = (minY + maxY) / 2;

    // base (target) position, live position, velocity, and a random burst direction per particle
    const bx = new Float32Array(N), by = new Float32Array(N), bz = new Float32Array(N);
    const px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N);
    const vx = new Float32Array(N), vy = new Float32Array(N), vz = new Float32Array(N);
    const dx = new Float32Array(N), dy = new Float32Array(N), dz = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      bx[i] = pts[i * 2] - ox;
      by[i] = pts[i * 2 + 1] - oy;
      bz[i] = (Math.random() - 0.5) * 36;
      dx[i] = Math.random() * 2 - 1;
      dy[i] = Math.random() * 2 - 1;
      dz[i] = Math.random();
      if (reduce) {
        px[i] = bx[i];
        py[i] = by[i];
        pz[i] = bz[i];
      } else {
        px[i] = (Math.random() - 0.5) * SW * 2.2;
        py[i] = (Math.random() - 0.5) * SW * 1.2;
        pz[i] = (Math.random() - 0.5) * 500;
      }
    }
    const dust = Array.from({ length: 260 }, () => [Math.random(), Math.random(), Math.random() * 0.8 + 0.2]);
    const F = 700; // focal length for the perspective divide
    const { ctx } = surface;

    stop = addFrameTask((t) => {
      if (!onScreen(hero)) return;
      const w = surface.w;
      const h = surface.h;
      const wide = !slot.offsetWidth;
      // shared content edge: max(gutter, (w - 1200) / 2); desktop copy column is 600px
      const gut = clamp(w * 0.05, 16, 64);
      const edge = Math.max(gut, (w - 1200) / 2);
      let sc: number, cx: number, cy: number;
      if (wide) {
        const target = clamp(w - 2 * edge - 600 - 48, 240, 720);
        sc = target / SW;
        cx = w - edge - target / 2;
        cy = h * 0.52;
      } else {
        // stacked: fill the CSS slot above the copy; 6% margin absorbs the sway
        const r = slot.getBoundingClientRect();
        const hr = hero.getBoundingClientRect();
        sc = Math.min(r.width / SW, r.height / SH) * 0.94;
        cx = r.left - hr.left + r.width / 2;
        cy = r.top - hr.top + r.height / 2;
      }
      const burst = clamp(-hero.getBoundingClientRect().top / (h * 0.8), 0, 1);
      const mx = (pointer.x - cx) / sc;
      const my = (pointer.y - cy) / sc;
      const RAD = 62;
      const R2 = RAD * RAD;
      const ang = reduce ? 0 : Math.sin(t * 0.35) * (wide ? 0.22 : 0.1) + (pointer.active ? pointer.nx * 0.18 : 0);
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#8892b0";
      for (const q of dust) {
        const sx = (((q[0] * w + t * 6 * q[2] + (pointer.active ? pointer.nx * 8 * q[2] : 0)) % w) + w) % w;
        ctx.globalAlpha = 0.25 + 0.35 * q[2];
        const s = 1.3 * q[2] + 0.4;
        ctx.fillRect(sx, q[1] * h, s, s);
      }

      ctx.fillStyle = "#64ffda";
      ctx.globalCompositeOperation = "lighter";
      const fade = 1 - burst * 0.85;
      for (let i = 0; i < N; i++) {
        const tx = bx[i] + dx[i] * burst * SW * 0.35;
        const ty = by[i] + Math.sin(t * 1.4 + bx[i] * 0.02) * 1.2 + dy[i] * burst * SW * 0.2;
        const tz = bz[i] + burst * (380 + dz[i] * 160);
        if (reduce) {
          px[i] = tx;
          py[i] = ty;
          pz[i] = tz;
        } else {
          let ax = (tx - px[i]) * 0.035;
          let ay = (ty - py[i]) * 0.035;
          let az = (tz - pz[i]) * 0.035;
          if (pointer.active) {
            const ex = px[i] - mx;
            const ey = py[i] - my;
            const dd = ex * ex + ey * ey;
            if (dd < R2) {
              const dist = Math.sqrt(dd) || 1;
              const f = (1 - dist / RAD) * 5;
              ax += (ex / dist) * f;
              ay += (ey / dist) * f;
              az += f * 4;
            }
          }
          vx[i] = (vx[i] + ax) * 0.88;
          vy[i] = (vy[i] + ay) * 0.88;
          vz[i] = (vz[i] + az) * 0.88;
          px[i] += vx[i];
          py[i] += vy[i];
          pz[i] += vz[i];
        }
        const rx = px[i] * ca - pz[i] * sa;
        const rz = px[i] * sa + pz[i] * ca;
        const den = F - rz;
        if (den < 60) continue;
        const k = F / den;
        const size = Math.max(1, 1.6 * k * Math.min(1.4, sc));
        ctx.globalAlpha = clamp(0.5 + rz / 80, 0.22, 1) * fade;
        ctx.fillRect(cx + rx * sc * k, cy + py[i] * sc * k, size, size);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    });
  })();

  return () => {
    disposed = true;
    stop();
    pointer.destroy();
    surface.destroy();
  };
}
