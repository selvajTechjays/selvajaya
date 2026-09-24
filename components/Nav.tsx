"use client";

import { useEffect, useRef, useState } from "react";
import { NAV_LINKS, RESUME_URL } from "@/content/site";

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Solid bar after the top of the page; slides away on scroll down, back on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > lastY && y > 300);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Drawer: lock page scroll, move focus in, close on Escape or when the viewport grows to desktop.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("menu-open", open);
    if (open) firstLink.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 761px)");
    const onMq = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={`nav${solid ? " solid" : ""}${hidden && !open ? " hide" : ""}`} id="nav">
        <a href="#top" className="mark" aria-label="Selva Jaya, home">
          SJ &gt;&gt;
        </a>
        <ol>
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>
                <b>{l.num}</b>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a className="btn sm" href={RESUME_URL} target="_blank" rel="noopener">
              Resume
            </a>
          </li>
        </ol>
        <button
          ref={menuBtn}
          className="menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="drawer"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      <div className="scrim" onClick={close} />
      <aside className="drawer" id="drawer" aria-label="Menu" aria-hidden={!open}>
        <nav>
          <ol>
            {NAV_LINKS.map((l, i) => (
              <li key={l.href}>
                <a ref={i === 0 ? firstLink : undefined} href={l.href} tabIndex={open ? 0 : -1} onClick={close}>
                  <b>{l.num}</b>
                  {l.label}
                </a>
              </li>
            ))}
          </ol>
          <a className="btn" href={RESUME_URL} target="_blank" rel="noopener" tabIndex={open ? 0 : -1} onClick={close}>
            Resume
          </a>
        </nav>
      </aside>
    </>
  );
}
