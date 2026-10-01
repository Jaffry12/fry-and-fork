"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Icon } from "@/components/Icon";
import { MenuOverview } from "@/components/MenuOverview";
import { useOrder } from "@/context/OrderContext";
import { addLabel, CATS, fmt, matches, spoken, TAGS, tokens, type Item } from "@/lib/menu";
import { EMBLEMS, GROUP_OF, GROUPS, pcsText, type Group } from "@/lib/menu-page";
import { prefersReducedMotion } from "@/lib/site";

function Emblem({ catId }: { catId: string }) {
  return (
    <svg className="emblem" aria-hidden="true">
      <use href={"#" + (EMBLEMS[catId] ?? "i-spark")} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
 * One dish: its sizes (or options), a quantity stepper and Add
 * ------------------------------------------------------------------------- */
function useFlash(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Restart the CSS "pop" even on repeated taps.
    el.classList.remove("is-added");
    void el.offsetWidth;
    el.classList.add("is-added");
    setActive(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      el.classList.remove("is-added");
      setActive(false);
    }, 1100);
  }, [ref]);
  return [active, flash] as const;
}

function Row({ item, table, h, hidden }: { item: Item; table: boolean; h: "h3" | "h4"; hidden: boolean }) {
  const { lines, add, changeQty } = useOrder();
  const addRef = useRef<HTMLButtonElement>(null);
  const [added, flash] = useFlash(addRef);
  // Until a size is picked here, show the size that's already in the order (if any).
  const [picked, setPicked] = useState<number | null>(null);
  // the latest pick, even before React has re-rendered (a quick pick-then-Add)
  const pickedNow = useRef<number | null>(null);
  const pick = (i: number) => {
    pickedNow.current = i;
    setPicked(i);
  };
  const inOrder = item.options.findIndex((_, i) => lines.some((l) => l.id === item.key + "#" + i));
  const sel = picked ?? (inOrder > 0 ? inOrder : 0);
  const opt = item.options[sel];
  const id = item.key + "#" + sel;
  const qty = lines.find((l) => l.id === id)?.qty ?? 0;
  const several = item.options.length > 1;
  const desc = item.includes ? item.includes.join(" · ") : [item.flag ?? "", item.desc ?? ""].filter(Boolean).join(" ");
  const spokenName = item.name + (opt.label && !item.opts ? ", " + spoken(opt.label) : "");
  const Heading = h;

  return (
    <li className={"mrow" + (table ? " mrow--table" : "")} data-key={item.key} data-sel={sel} hidden={hidden}>
      <div className="mrow-info">
        <div className="mrow-top">
          <Heading className="mrow-name">
            {item.name}
            {item.pcs ? (
              <>
                {" "}
                <small>({pcsText(item)})</small>
              </>
            ) : null}
            {(item.tags ?? []).map((t) => (
              <span key={t} className={"tag tag-" + t}>
                <Icon id={TAGS[t].icon} />
                {TAGS[t].label}
              </span>
            ))}
          </Heading>
          {several ? null : (
            <>
              <span className="mrow-dots" aria-hidden="true" />
              <b className="mrow-price" data-price-of={item.key + "#0"}>
                {fmt(item.options[0].pence)}
              </b>
            </>
          )}
        </div>
        {desc ? <p className="mrow-desc">{desc}</p> : null}
        {several && !table ? (
          <div className="mrow-opts" role="radiogroup" aria-label={"Choose " + (item.opts ? "an option" : "a size") + " for " + item.name}>
            {item.options.map((o, i) => (
              <Fragment key={i}>
                {i ? (
                  <span className="mrow-sep" aria-hidden="true">
                    |
                  </span>
                ) : null}
                <button className="mrow-opt" type="button" role="radio" aria-checked={i === sel} data-pick={i} onClick={() => pick(i)}>
                  <span>{o.label}</span>
                  <b data-price-of={item.key + "#" + i}>{fmt(o.pence)}</b>
                </button>
              </Fragment>
            ))}
            <span className="mrow-dots" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      {table ? (
        <div className="mrow-cells" role="radiogroup" aria-label={"Choose a size for " + item.name}>
          {item.options.map((o, i) => (
            <button
              key={i}
              className="mrow-cell"
              type="button"
              role="radio"
              aria-checked={i === sel}
              data-pick={i}
              aria-label={spoken(o.label) + ", " + fmt(o.pence)}
              onClick={() => pick(i)}
            >
              <small className="mrow-cell-size" aria-hidden="true">
                {o.label}
              </small>
              <span data-price-of={item.key + "#" + i}>{fmt(o.pence)}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="mrow-buy">
        {table ? null : (
          <div className="stepper">
            <button type="button" data-dec={id} aria-label={"One fewer " + spokenName} disabled={qty === 0} onClick={() => changeQty(id, -1)}>
              <Icon id="i-minus" />
            </button>
            <output data-qty-of={id} aria-label="Number in your order">
              {qty}
            </output>
            <button type="button" data-inc={id} aria-label={"One more " + spokenName} onClick={() => changeQty(id, 1)}>
              <Icon id="i-plus" />
            </button>
          </div>
        )}
        <button
          ref={addRef}
          className="mrow-add"
          type="button"
          data-add={id}
          aria-label={addLabel(item, opt)}
          onClick={() => {
            add(item.key + "#" + (pickedNow.current ?? sel));
            flash();
          }}
        >
          {added ? "Added" : "Add"}
        </button>
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------------------
 * A pill's detail view: its heading (with the gold emblem), then every dish
 * ------------------------------------------------------------------------- */
function GroupView({ g, hidden, shown }: { g: Group; hidden: boolean; shown: Map<string, boolean> }) {
  const multi = g.cats.length > 1;
  return (
    <section className="mg" id={"group-" + g.id} data-group-section={g.id} aria-labelledby={"mg-" + g.id + "-title"} hidden={hidden}>
      <header className="mg-head">
        <div className="mg-intro">
          <p className="mg-kicker">{g.kicker}</p>
          <h2 id={"mg-" + g.id + "-title"}>{g.title}</h2>
          <p className="mg-sub">{g.sub}</p>
          <p className="mg-desc">{g.desc}</p>
        </div>
        <span className="mg-emblem" aria-hidden="true">
          <Emblem catId={g.cats[0]} />
        </span>
      </header>
      {g.cats.map((c) => {
        const cat = CATS.get(c)!;
        const table = !!cat.sizes && cat.sizes.length > 2;
        const bandRow = (
          <div className="mrow-band-row">
            <span />
            <div className="mrow-band-sizes">
              {cat.sizes?.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <span />
          </div>
        );
        const catShown = cat.items.some((item) => shown.get(item.key));
        return (
          <section key={c} className="menu-cat" id={"cat-" + c} tabIndex={-1} aria-label={cat.name} hidden={!catShown}>
            {multi ? (
              <header className="mc-head">
                <span className="mc-emblem">
                  <Emblem catId={c} />
                </span>
                <div>
                  <h3>{cat.name}</h3>
                  {cat.note ? <p>{cat.note}</p> : null}
                </div>
              </header>
            ) : null}
            {table ? (
              <div className="mrow-band" aria-hidden="true">
                {bandRow}
                {bandRow}
              </div>
            ) : null}
            <ul className={"mrows" + (table ? " mrows--table" : "")}>
              {cat.items.map((item) => (
                <Row key={item.key} item={item} table={table} h={multi ? "h4" : "h3"} hidden={!shown.get(item.key)} />
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * The full menu: pills and search, then the overview or a pill's view
 * ------------------------------------------------------------------------- */
type NavRequest = { n: number; kind?: "view" | "cat"; id?: string; scroll?: boolean; instant?: boolean };

export function MenuBoard({ children }: { children?: ReactNode }) {
  const [view, setView] = useState("all");
  const [query, setQuery] = useState(""); // what's in the box
  const [q, setQ] = useState(""); // what we search for (slightly debounced)
  const [nav, setNav] = useState<NavRequest>({ n: 0 });
  const menuRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  // The footer on this page is as tall as the page's hero (see .site-footer--menu).
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".mp-hero");
    if (!hero) return;
    const root = document.documentElement;
    const sync = () => root.style.setProperty("--mp-hero-h", hero.offsetHeight + "px");
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(hero);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--mp-hero-h");
    };
  }, []);

  // Which dishes match the search; without one, every dish shows.
  const result = useMemo(() => {
    const toks = tokens(q);
    const searching = toks.length > 0;
    const shown = new Map<string, boolean>();
    const groupShown = new Map<string, number>();
    let total = 0;
    for (const g of GROUPS) {
      let n = 0;
      for (const c of g.cats) {
        for (const item of CATS.get(c)?.items ?? []) {
          const ok = !searching || matches(item, toks, []);
          shown.set(item.key, ok);
          if (ok) n++;
        }
      }
      groupShown.set(g.id, n);
      if (searching) total += n;
    }
    return { searching, shown, groupShown, total };
  }, [q]);
  const { searching } = result;

  /* ---- scrolling ---- */
  const headerHeight = () => document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
  const scrollToY = (y: number, instant?: boolean) =>
    window.scrollTo({ top: Math.max(0, y), behavior: instant || prefersReducedMotion() ? "instant" : "smooth" });
  // Bring the top of the menu (the pill bar) up under the header, if the page is past it.
  const scrollToMenuTop = useCallback((instant?: boolean) => {
    const menu = menuRef.current;
    if (!menu) return;
    const top = menu.getBoundingClientRect().top + window.scrollY - headerHeight();
    if (window.scrollY > top + 2) scrollToY(top, instant);
  }, []);

  const setHash = (hash: string) => history.replaceState(history.state, "", hash || location.pathname + location.search);

  const clearSearch = useCallback(() => {
    setQuery("");
    setQ("");
  }, []);

  const showView = useCallback(
    (id: string, opts: { hash?: boolean; scroll?: boolean; instant?: boolean } = {}) => {
      const g = GROUPS.find((x) => x.id === id);
      if (id !== "all" && !g) return;
      clearSearch();
      setView(id);
      if (opts.hash !== false) setHash(id === "all" ? "" : "#cat-" + g!.cats[0]);
      setNav((p) => ({ n: p.n + 1, kind: "view", id, scroll: opts.scroll !== false, instant: opts.instant }));
    },
    [clearSearch],
  );

  // A section link (#cat-pizza): its pill's view, scrolled to that section.
  const goToCat = useCallback(
    (catId: string, opts: { hash?: boolean; instant?: boolean } = {}) => {
      const groupId = GROUP_OF[catId];
      if (!groupId) return;
      clearSearch();
      setView(groupId);
      if (opts.hash !== false && location.hash !== "#cat-" + catId) setHash("#cat-" + catId);
      setNav((p) => ({ n: p.n + 1, kind: "cat", id: catId, instant: opts.instant }));
    },
    [clearSearch],
  );

  // After the view is on screen: reveal its pill and scroll.
  useLayoutEffect(() => {
    if (!nav.n || !nav.id) return;
    const pills = pillsRef.current;
    const groupId = nav.kind === "cat" ? GROUP_OF[nav.id] : nav.id;
    const pill = pills?.querySelector<HTMLElement>(`[data-group="${groupId}"]`);
    if (pills && pill && pills.scrollWidth > pills.clientWidth + 1) {
      pills.scrollTo({ left: Math.max(0, pill.offsetLeft - (pills.clientWidth - pill.offsetWidth) / 2), behavior: prefersReducedMotion() ? "instant" : "smooth" });
    }
    if (nav.kind === "view") {
      if (nav.scroll) scrollToMenuTop(nav.instant);
      return;
    }
    const menu = menuRef.current;
    const g = GROUPS.find((x) => x.id === groupId);
    if (!menu || !g) return;
    const first = g.cats[0] === nav.id;
    const section = document.getElementById("cat-" + nav.id);
    const target = first
      ? menu.getBoundingClientRect().top + window.scrollY - headerHeight()
      : (section?.getBoundingClientRect().top ?? 0) + window.scrollY - headerHeight() - (barRef.current?.offsetHeight ?? 0) - 12;
    scrollToY(target, nav.instant);
  }, [nav, scrollToMenuTop]);

  // A new search brings the results into view.
  const searched = useRef(false);
  useEffect(() => {
    if (!searched.current) {
      searched.current = true;
      return;
    }
    scrollToMenuTop();
  }, [q, scrollToMenuTop]);

  // Links anywhere on the page (#cat-fish etc.) open that section; so do back/forward
  // and a section link opened directly.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="#cat-"]');
      const id = link?.getAttribute("href")?.slice(5);
      if (!id || !CATS.has(id)) return;
      e.preventDefault();
      goToCat(id);
    };
    const onHash = () => {
      const id = location.hash.startsWith("#cat-") ? location.hash.slice(5) : "";
      if (CATS.has(id)) goToCat(id, { hash: false });
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);

    const startId = location.hash.startsWith("#cat-") ? location.hash.slice(5) : "";
    let frame = 0;
    let onLoad: (() => void) | undefined;
    if (CATS.has(startId)) {
      frame = requestAnimationFrame(() => goToCat(startId, { hash: false, instant: true }));
      // The browser's own jump to #cat-… can land after ours, so repeat it once the page has loaded.
      if (document.readyState !== "complete") {
        onLoad = () => requestAnimationFrame(() => goToCat(startId, { hash: false, instant: true }));
        window.addEventListener("load", onLoad, { once: true });
      }
    }
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
      if (onLoad) window.removeEventListener("load", onLoad);
    };
  }, [goToCat]);

  const resultsText = result.total === 1 ? "1 dish matches" : result.total + " dishes match";
  const resetSearch = () => {
    clearSearch();
    searchRef.current?.focus({ preventScroll: true });
  };

  return (
    <section className="menu" id="menu" aria-label="The menu" ref={menuRef}>
      <div className="mp-bar" data-menu-bar ref={barRef}>
        <div className="container mp-bar-inner">
          <div className="mp-pills" role="group" aria-label="Show part of the menu" data-pills ref={pillsRef}>
            <button className="mp-pill" type="button" aria-pressed={!searching && view === "all"} data-group="all" onClick={() => showView("all")}>
              All
            </button>
            {GROUPS.map((g) => (
              <button key={g.id} className="mp-pill" type="button" aria-pressed={!searching && view === g.id} data-group={g.id} onClick={() => showView(g.id)}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="search" data-search-wrap>
            <Icon id="i-search" />
            <label className="visually-hidden" htmlFor="menu-search">
              Search the menu
            </label>
            <input
              ref={searchRef}
              type="search"
              id="menu-search"
              placeholder="Search for a dish… (e.g. Margherita, Haggis)"
              autoComplete="off"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query) {
                  e.preventDefault();
                  clearSearch();
                }
              }}
            />
            <button
              className="search-clear"
              type="button"
              aria-label="Clear search"
              hidden={!query}
              onClick={() => {
                clearSearch();
                searchRef.current?.focus();
              }}
            >
              <Icon id="i-x" />
            </button>
          </div>
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite" data-menu-status>
        {searching ? resultsText : ""}
      </p>

      <div className="container mp-body">
        <MenuOverview hidden={searching || view !== "all"} onGroup={(id) => showView(id)} />
        <div className={"mp-list" + (searching ? " is-results" : "")} data-menu-list>
          <div className="results-head" data-results-head hidden={!searching || result.total === 0}>
            <p data-results-count>{resultsText}</p>
            <button className="btn btn-quiet" type="button" data-reset-filters aria-label="Clear search" onClick={resetSearch}>
              <Icon id="i-x" />
              Clear
            </button>
          </div>
          {GROUPS.map((g) => (
            <GroupView key={g.id} g={g} hidden={searching ? (result.groupShown.get(g.id) ?? 0) === 0 : g.id !== view} shown={result.shown} />
          ))}
        </div>
        <div className="menu-empty" data-menu-empty hidden={!searching || result.total > 0}>
          <p className="menu-empty-title">Nothing matches that just now.</p>
          <p>Try another word, or clear your search.</p>
          <button className="btn btn-ghost" type="button" data-reset-filters onClick={resetSearch}>
            Clear search
          </button>
        </div>
        {children}
      </div>
    </section>
  );
}
