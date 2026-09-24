import { addFrameTask, clamp, fitCanvas, onScreen, prefersReducedMotion, trackPointer } from "./engine";

type Options = {
  /** The tall scroll track (its height sets how long the flight lasts). */
  section: HTMLElement;
  /** The sticky, full-viewport stage inside the section. */
  pin: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Number of milestones along the tunnel. */
  steps: number;
  /** Called only when the active milestone changes. */
  onStep: (index: number) => void;
  /** Called every frame with 0..1 scroll progress (drive the progress bar without re-rendering). */
  onProgress: (progress: number) => void;
};

/** 0..1 progress through the section's scroll track. */
export function tunnelProgress(section: HTMLElement) {
  const r = section.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
}

/** Scroll so milestone `index` sits in the middle of its stretch of the track. */
export function scrollToStep(section: HTMLElement, index: number, steps: number) {
  const r = section.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  window.scrollTo({
    top: window.scrollY + r.top + span * ((index + 0.5) / steps),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

/**
 * Scroll-driven flight down an octagonal mint tunnel, one crystal marker per milestone.
 * Returns a cleanup function.
 */
export function startCareerTunnel({ section, pin, canvas, steps, onStep, onProgress }: Options): () => void {
  const surface = fitCanvas(canvas, pin);
  const pointer = trackPointer(pin);
  const reduce = prefersReducedMotion();
  const { ctx, dpr } = surface;

  const SP = 3; // ring spacing
  const RN = 64; // ring count
  const RAD = 5;
  const FAR = 58; // fog distance
  const TRAVEL = RN * SP - 40;
  const oct = Array.from({ length: 8 }, (_, s) => {
    const a = (s / 8) * Math.PI * 2 + Math.PI / 8;
    return [Math.cos(a) * RAD, Math.sin(a) * RAD];
  });
  const marks = Array.from({ length: steps }, (_, i) => {
    const a = i * 1.9 + 0.6;
    return [Math.cos(a) * 3.1, Math.sin(a) * 2.5, TRAVEL * ((i + 0.5) / steps) + 9];
  });
  const dust = Array.from({ length: 520 }, () => {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 4.4;
    return [Math.cos(a) * r, Math.sin(a) * r, Math.random() * RN * SP];
  });

  let smooth = tunnelProgress(section);
  let camX = 0;
  let camY = 0;
  let current = -1;

  const stop = addFrameTask((t) => {
    const pr = tunnelProgress(section);
    onProgress(pr);
    const step = Math.min(steps - 1, Math.floor(pr * steps));
    if (step !== current) {
      current = step;
      onStep(step);
    }
    if (!onScreen(pin)) return;

    smooth += (pr - smooth) * (reduce ? 1 : 0.09);
    const w = surface.w;
    const h = surface.h;
    const focal = h / 2 / Math.tan((35 * Math.PI) / 180);
    const camZ = smooth * TRAVEL - 6;
    camX += ((pointer.active ? pointer.nx * 1.2 : reduce ? 0 : Math.sin(t * 0.4) * 0.4) - camX) * 0.05;
    camY += ((pointer.active ? pointer.ny * 0.9 : reduce ? 0 : Math.cos(t * 0.3) * 0.3) - camY) * 0.05;
    const proj = (X: number, Y: number, Z: number) => {
      const dz = Z - camZ;
      if (dz < 0.35) return null;
      const k = focal / dz;
      return [(X - camX) * k, (Y - camY) * k, dz, k] as const;
    };
    const fog = (dz: number) => clamp(1 - (dz - 3) / (FAR - 3), 0, 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(smooth * 1.2);

    // longitudinal rails
    ctx.lineWidth = 1;
    for (let s = 0; s < 16; s++) {
      const a = (s / 16) * Math.PI * 2;
      const X = Math.cos(a) * RAD * 0.96;
      const Y = Math.sin(a) * RAD * 0.96;
      const n = proj(X, Y, camZ + 0.6);
      const f = proj(X, Y, camZ + FAR);
      if (!n || !f) continue;
      const g = ctx.createLinearGradient(n[0], n[1], f[0], f[1]);
      g.addColorStop(0, "rgba(43,74,112,.9)");
      g.addColorStop(1, "rgba(43,74,112,0)");
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(n[0], n[1]);
      ctx.lineTo(f[0], f[1]);
      ctx.stroke();
    }

    // rings, far to near; every 8th ring is mint
    for (let i = RN - 1; i >= 0; i--) {
      const Z = i * SP;
      const dz = Z - camZ;
      if (dz < 0.5 || dz > FAR) continue;
      const hot = i % 8 === 0;
      const a = fog(dz) * (hot ? 0.95 : 0.75);
      const cr = Math.cos(i * 0.035);
      const sr = Math.sin(i * 0.035);
      ctx.strokeStyle = hot ? `rgba(100,255,218,${a})` : `rgba(43,74,112,${a})`;
      ctx.lineWidth = hot ? 1.6 : 1;
      ctx.beginPath();
      for (let s = 0; s <= 8; s++) {
        const q = oct[s % 8];
        const P = proj(q[0] * cr - q[1] * sr, q[0] * sr + q[1] * cr, Z);
        if (!P) continue;
        if (s) ctx.lineTo(P[0], P[1]);
        else ctx.moveTo(P[0], P[1]);
      }
      ctx.stroke();
    }

    // dust
    ctx.fillStyle = "#ccd6f6";
    for (const q of dust) {
      const P = proj(q[0], q[1], q[2]);
      if (!P || P[2] > FAR) continue;
      ctx.globalAlpha = fog(P[2]) * 0.7;
      const s = Math.min(3, 0.05 * P[3]);
      ctx.fillRect(P[0], P[1], s, s);
    }
    ctx.globalAlpha = 1;

    // milestone crystals (rotating octahedra); the active one is larger and glows
    marks.forEach((mk, i) => {
      const P = proj(mk[0], mk[1], mk[2]);
      if (!P || P[2] > FAR) return;
      const r = (i === current ? 0.75 : 0.5) * P[3];
      const spin = t * 1.2 + i;
      const cx2 = Math.cos(spin) * r;
      const a = fog(P[2]);
      ctx.strokeStyle = `rgba(100,255,218,${a})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(P[0], P[1] - r);
      ctx.lineTo(P[0] + cx2, P[1]);
      ctx.lineTo(P[0], P[1] + r);
      ctx.lineTo(P[0] - cx2, P[1]);
      ctx.closePath();
      ctx.moveTo(P[0] - r * 0.9, P[1]);
      ctx.lineTo(P[0] + r * 0.9, P[1]);
      ctx.moveTo(P[0], P[1] - r);
      ctx.lineTo(P[0] + Math.sin(spin) * r * 0.9, P[1]);
      ctx.lineTo(P[0], P[1] + r);
      ctx.stroke();
      if (i === current) {
        ctx.globalAlpha = a * 0.25;
        ctx.fillStyle = "#64ffda";
        ctx.beginPath();
        ctx.arc(P[0], P[1], r * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });
    ctx.restore();
  });

  return () => {
    stop();
    pointer.destroy();
    surface.destroy();
  };
}
