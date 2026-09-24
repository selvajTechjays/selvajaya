"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { PROJECTS } from "@/content/site";

/** Renders `backtick` spans in project copy as inline code. */
function withCode(text: string) {
  return text.split("`").map((part, i) =>
    i % 2 ? (
      <span className="mono" key={i}>
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export default function Work() {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  // On phones the cards become a swipe row; keep the position dots in sync.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const cards = el.children;
      if (cards.length < 2) return;
      const step = (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft || 1;
      setCurrent(Math.max(0, Math.min(cards.length - 1, Math.round(el.scrollLeft / step))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="sec" id="work">
      <h2 className="sec-title">
        <b>02.</b>Selected work
      </h2>
      <div className="cards" ref={track}>
        {PROJECTS.map((p) => (
          <article className="card" key={p.title}>
            <span className="k">{p.kicker}</span>
            <h3>{p.title}</h3>
            <p>{withCode(p.body)}</p>
            <div className="imp">
              <b>▹</b> {p.impact}
            </div>
            <div className="st">
              {p.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="cdots" aria-hidden="true">
        {PROJECTS.map((p, i) => (
          <i key={p.title} className={i === current ? "on" : undefined} />
        ))}
      </div>
    </section>
  );
}
