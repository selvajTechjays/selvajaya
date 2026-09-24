"use client";

import { useRef, useState } from "react";
import { EMAIL, GITHUB, LINKEDIN } from "@/content/site";

export default function Contact() {
  const value = useRef<HTMLElement>(null);
  const [label, setLabel] = useState("Copy");

  const flash = (text: string) => {
    setLabel(text);
    setTimeout(() => setLabel("Copy"), 1800);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      flash("Copied ✓");
    } catch {
      // Clipboard blocked: select the address so Ctrl/Cmd+C works
      if (value.current) {
        const range = document.createRange();
        range.selectNodeContents(value.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      flash("Selected");
    }
  };

  return (
    <section className="contact" id="contact">
      <p className="eb">03. What&apos;s next?</p>
      <h2>Get in touch</h2>
      <p className="body">
        I&apos;m open to senior AI engineering roles and collaborations, and I bring pixel-perfect design to everything I
        ship. Whether you have a question or just want to say hi, my inbox is open.
      </p>
      <div className="reach">
        <div className="reach-row">
          <span className="reach-k">Email</span>
          <code className="reach-v" ref={value}>
            {EMAIL}
          </code>
          <button className="btn solid" onClick={copy} aria-label="Copy email">
            {label}
          </button>
        </div>
      </div>
      <div className="socials">
        <a href={LINKEDIN} target="_blank" rel="noopener">
          LinkedIn ↗
        </a>
        <a href={GITHUB} target="_blank" rel="noopener">
          GitHub ↗
        </a>
      </div>
    </section>
  );
}
