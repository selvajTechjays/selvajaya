// Tiny 2D-canvas "3D" toolkit shared by the hero and the career tunnel.
// No WebGL and no libraries: perspective is done by hand, so it renders in every browser.

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
};

export type Surface = {
  ctx: CanvasRenderingContext2D;
  /** CSS pixels */
  w: number;
  h: number;
  dpr: number;
  destroy(): void;
};

/** Keeps a canvas sized to its host (CSS px × devicePixelRatio, capped at 2). */
export function fitCanvas(canvas: HTMLCanvasElement, host: HTMLElement): Surface {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const s: Surface = {
    ctx,
    w: 1,
    h: 1,
    dpr,
    destroy: () => ro.disconnect(),
  };
  const size = () => {
    s.w = host.clientWidth || 1;
    s.h = host.clientHeight || 1;
    canvas.width = Math.round(s.w * dpr);
    canvas.height = Math.round(s.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const ro = new ResizeObserver(size);
  ro.observe(host);
  size();
  return s;
}

export type Pointer = {
  /** px relative to the element */
  x: number;
  y: number;
  /** -1..1 */
  nx: number;
  ny: number;
  active: boolean;
  destroy(): void;
};

/** Mouse + touch position over an element. Touch listeners are passive so page scroll is never blocked. */
export function trackPointer(el: HTMLElement): Pointer {
  const p: Pointer = { x: 0, y: 0, nx: 0, ny: 0, active: false, destroy };
  const set = (cx: number, cy: number) => {
    const b = el.getBoundingClientRect();
    p.x = cx - b.left;
    p.y = cy - b.top;
    p.nx = (p.x / b.width) * 2 - 1;
    p.ny = (p.y / b.height) * 2 - 1;
    p.active = true;
  };
  const onPointer = (e: PointerEvent) => set(e.clientX, e.clientY);
  const onTouch = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) set(t.clientX, t.clientY);
  };
  const off = () => {
    p.active = false;
  };
  el.addEventListener("pointermove", onPointer);
  el.addEventListener("pointerdown", onPointer);
  el.addEventListener("pointerleave", off);
  el.addEventListener("touchstart", onTouch, { passive: true });
  el.addEventListener("touchmove", onTouch, { passive: true });
  el.addEventListener("touchend", off, { passive: true });
  el.addEventListener("touchcancel", off, { passive: true });
  function destroy() {
    el.removeEventListener("pointermove", onPointer);
    el.removeEventListener("pointerdown", onPointer);
    el.removeEventListener("pointerleave", off);
    el.removeEventListener("touchstart", onTouch);
    el.removeEventListener("touchmove", onTouch);
    el.removeEventListener("touchend", off);
    el.removeEventListener("touchcancel", off);
  }
  return p;
}

// One shared requestAnimationFrame loop for every animation on the page.
type Task = (t: number, dt: number) => void;
const tasks = new Set<Task>();
let raf = 0;
let last = 0;
let elapsed = 0;

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  elapsed += dt;
  for (const task of tasks) {
    try {
      task(elapsed, dt);
    } catch (err) {
      console.error(err);
    }
  }
  raf = tasks.size ? requestAnimationFrame(frame) : 0;
}

/** Runs `task` every frame until the returned function is called. */
export function addFrameTask(task: Task): () => void {
  tasks.add(task);
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  return () => {
    tasks.delete(task);
    if (!tasks.size && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}
