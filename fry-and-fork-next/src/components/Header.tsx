"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useOrder } from "@/context/OrderContext";
import { StatusLong } from "@/context/StatusContext";
import { fmt } from "@/lib/menu";
import { SITE } from "@/lib/site";

/** `spy`: the section a link lights up for while it's being read. On the full menu page the
 *  links lead back to the home page's sections. */
const NAV = {
  home: [
    { href: "#top", label: "Home", spy: "top" },
    { href: "#menu", label: "Menu", spy: "menu" },
    { href: "/menu#cat-deals", label: "Meal deals" },
    { href: "#kitchen", label: "Our kitchen", spy: "kitchen" },
    { href: "#contact", label: "Find us", spy: "contact" },
  ],
  menu: [
    { href: "/", label: "Home", spy: "top" },
    { href: "#menu", label: "Menu", spy: "menu" },
    { href: "#cat-deals", label: "Meal deals" },
    { href: "/#kitchen", label: "Our kitchen", spy: "kitchen" },
    { href: "/#contact", label: "Find us", spy: "contact" },
  ],
};
const SPY_ORDER = ["kitchen", "menu", "contact"];

/** Transparent over the hero photo and a dark glass bar once the page scrolls. On the full
 *  menu page "Menu" is lit and the links lead back to the home page's sections. */
export function Header({ page = "home" }: { page?: "home" | "menu" }) {
  const { count, pence, openDrawer, bump } = useOrder();
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState(page === "menu" ? "menu" : "top");
  const [navOpen, setNavOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const bagRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setScrolled(window.scrollY > 8);
        if (page === "menu") return;
        // Header links follow the section being read ("Home" while the top of the page shows).
        const line = (headerRef.current?.offsetHeight ?? 0) + window.innerHeight * 0.3;
        let now = "top";
        for (const id of SPY_ORDER) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= line) now = id;
        }
        setCurrent(now);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [page]);

  // Close the mobile menu on Escape or on a click anywhere outside the header.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNavOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [navOpen]);

  // A little bump on the bag each time something is added.
  useEffect(() => {
    const el = bagRef.current;
    if (!bump || !el) return;
    el.classList.remove("is-bumped");
    void el.offsetWidth;
    el.classList.add("is-bumped");
  }, [bump]);

  const summary = count ? count + (count === 1 ? " item, " : " items, ") + fmt(pence) : "empty";
  const className = "site-header" + (scrolled ? " is-scrolled" : "") + (navOpen ? " nav-open" : "");

  return (
    // No id="top" here: with no such element, "#top" links scroll to the top of the page
    // (the sticky header is always on screen, so it would never be scrolled to).
    <header className={className} ref={headerRef}>
      <div className="container header-inner">
        <a className="brand" href={page === "menu" ? "/" : "#top"} aria-label={page === "menu" ? "Fry & Fork home" : "Fry & Fork, back to top"}>
          <Image src="/images/logo-sm.webp" width={176} height={176} alt="" loading="eager" />
          <span className="brand-text">
            <span className="brand-name">
              Fry <span className="amp">&amp;</span> Fork
            </span>
            <span className="brand-tag">Fish &amp; Chips · Pizza · Pasta</span>
          </span>
        </a>

        <nav className="site-nav" id="site-nav" aria-label="Main">
          <ul>
            {NAV[page].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  data-spy={item.spy}
                  aria-current={item.spy && item.spy === current ? "true" : undefined}
                  onClick={() => setNavOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-extra">
            <p className="nav-status">
              <span className="status-dot" />
              <StatusLong />
            </p>
            <a className="btn btn-sand btn-block" href={SITE.phoneHref}>
              <Icon id="i-phone" />
              Call {SITE.phone}
            </a>
          </div>
        </nav>

        <div className="header-actions">
          <a className="btn header-call" href={SITE.phoneHref}>
            Call to Order
            <Icon id="i-arrow-right" />
          </a>
          <button ref={bagRef} className="icon-btn order-btn" type="button" aria-label={"Your order: " + summary} data-open-order onClick={openDrawer}>
            <Icon id="i-bag" />
            <span className="order-count" hidden={!count} data-order-count>
              {count}
            </span>
          </button>
          <span className="order-sum" data-order-sum hidden={!count}>
            {fmt(pence)}
          </span>
          <button
            ref={toggleRef}
            className="icon-btn nav-toggle"
            type="button"
            aria-expanded={navOpen}
            aria-controls="site-nav"
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setNavOpen((o) => !o)}
          >
            <span className="nav-toggle-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
