"use client";

import { useEffect, useRef, useState } from "react";
import { MILESTONES } from "@/content/site";
import { prefersReducedMotion } from "@/lib/engine";
import { scrollToStep, startCareerTunnel } from "@/lib/career-tunnel";

const pad = (n: number) => String(n).padStart(2, "0");

export default function CareerTunnel() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  const [active, setActive] = useState(0); // milestone the scroll position is on
  const [shown, setShown] = useState(0); // milestone currently rendered (lags during the fade)
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!section.current || !pin.current || !canvas.current) return;
    return startCareerTunnel({
      section: section.current,
      pin: pin.current,
      canvas: canvas.current,
      steps: MILESTONES.length,
      onStep: setActive,
      onProgress: (p) => {
        if (bar.current) bar.current.style.width = `${(p * 100).toFixed(2)}%`;
      },
    });
  }, []);

  // Cross-fade the milestone card when the active step changes.
  useEffect(() => {
    if (active === shown) return;
    if (prefersReducedMotion()) {
      setShown(active);
      return;
    }
    setFading(true);
    const id = setTimeout(() => {
      setShown(active);
      setFading(false);
    }, 220);
    return () => clearTimeout(id);
  }, [active, shown]);

  const m = MILESTONES[shown];

  return (
    <section className="tunnel" id="about" aria-label="About: career timeline" ref={section}>
      <div className="pin" ref={pin}>
        <canvas ref={canvas} aria-hidden="true" />
        <div className="t-head">
          <h2 className="sec-title">
            <b>01.</b>Where I&apos;ve been
          </h2>
          <p>Scroll to fly through five years of work.</p>
        </div>
        <div className={`mile${fading ? " out" : ""}`} aria-live="polite">
          <div className="yr">{m.kicker}</div>
          <h3>{m.title}</h3>
          <p>{m.body}</p>
          <div className="tags">
            {m.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
        <ul className="rail">
          {MILESTONES.map((ms, i) => (
            <li key={ms.rail}>
              <button
                className={i === active ? "on" : undefined}
                aria-label={`Jump to ${ms.rail}`}
                onClick={() => section.current && scrollToStep(section.current, i, MILESTONES.length)}
              >
                <span>{ms.rail}</span>
                <i />
              </button>
            </li>
          ))}
        </ul>
        <div className="t-foot">
          <span className="step">
            <b>{pad(active + 1)}</b> / {pad(MILESTONES.length)}
          </span>
          <div className="prog">
            <span ref={bar} />
          </div>
          <a href="#work">Skip timeline ↓</a>
        </div>
      </div>
    </section>
  );
}
