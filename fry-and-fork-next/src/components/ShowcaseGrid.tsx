"use client";

import { useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/site";

/** The showcase's layout and its pills: a pill picks out one part of the menu and the
 *  other cards fade back ("All" shows everything again). */
export function ShowcaseGrid({
  pills,
  intro,
  fish,
  cards,
}: {
  pills: { id: string; label: string }[];
  intro: ReactNode;
  fish: ReactNode;
  cards: ReactNode;
}) {
  const [filter, setFilter] = useState("all");

  function pick(id: string) {
    setFilter(id);
    if (id === "all") return;
    const card = document.querySelector(`[data-sc-card="${id}"]`);
    card?.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "instant" : "smooth" });
  }

  return (
    <div className="sc-grid" data-filter={filter}>
      {intro}
      <div className="sc-top">
        <div className="sc-pills" role="group" aria-label="Show part of the menu">
          {pills.map((p) => (
            <button key={p.id} className="sc-pill" type="button" aria-pressed={filter === p.id} onClick={() => pick(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        {fish}
      </div>
      {cards}
    </div>
  );
}
