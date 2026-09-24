"use client";

import { useEffect, useRef } from "react";
import { RESUME_URL } from "@/content/site";
import { startParticleSignature } from "@/lib/particle-signature";

export default function Hero() {
  const hero = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const slot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hero.current || !canvas.current || !slot.current) return;
    return startParticleSignature({ hero: hero.current, canvas: canvas.current, slot: slot.current });
  }, []);

  return (
    <section className="hero" id="hero" ref={hero}>
      <canvas ref={canvas} aria-hidden="true" />
      <div className="hero-copy">
        {/* On tablet/phone the particle logo is drawn into this slot, centred above the copy */}
        <div className="sig-slot" ref={slot} aria-hidden="true" />
        <p className="eb">Hi, my name is</p>
        <h1>Selva Jaya.</h1>
        <h2>Senior AI Engineer.</h2>
        <p className="lede">
          <span className="long">
            I build AI-powered products end to end: <b>LLM chat and voice interfaces</b>,{" "}
            <b>Claude agent workflows</b> and automated testing, shipped with React, Next.js and TypeScript and{" "}
            <b>pixel-perfect</b> down to the last detail. At <b>Techjays</b> since 2021.
          </span>
          <span className="short">
            I build AI products end to end: <b>LLM chat &amp; voice</b>, <b>Claude agent workflows</b> and automated
            testing. <b>Pixel-perfect</b>, in React and Next.js.
          </span>
        </p>
        <div className="ctas">
          <a className="btn solid" href="#work">
            See my work
          </a>
          <a className="btn" href={RESUME_URL} target="_blank" rel="noopener">
            Get CV
          </a>
        </div>
      </div>
      <div className="hero-foot">
        <div className="cue" aria-hidden="true">
          scroll
          <span />
        </div>
        <span className="hint">↖ move through the signature</span>
      </div>
    </section>
  );
}
