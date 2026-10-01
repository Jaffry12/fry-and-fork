"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useOrder } from "@/context/OrderContext";
import { fmt, pcsLabel, resolve, titleOf } from "@/lib/menu";
import { EMBLEMS, THUMBS } from "@/lib/menu-page";
import { SITE } from "@/lib/site";

const NOTE_KEY = "ff-order-note-v1";

function legacyCopy(text: string, host: HTMLElement): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
  host.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

async function copyText(text: string, host: HTMLElement): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return legacyCopy(text, host);
    }
  }
  return legacyCopy(text, host);
}

/** "Your Order": a native modal <dialog> (focus trap, Escape and backdrop for free). Dishes
 *  with a photo or their section's emblem, quantity and remove; a note for the shop; the
 *  subtotal; then Call to Order (orders are placed by phone) or Continue Ordering. */
export function OrderDrawer() {
  const { lines, count, pence, changeQty, clear, asText, drawerOpen, closeDrawer } = useOrder();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [copyLabel, setCopyLabel] = useState("Copy list");
  const [armed, setArmed] = useState(false);

  // The note is kept on this device, like the list.
  useEffect(() => {
    try {
      if (noteRef.current) noteRef.current.value = localStorage.getItem(NOTE_KEY) ?? "";
    } catch {
      /* storage blocked */
    }
  }, []);

  // Open / close the native dialog to match state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      innerRef.current?.focus();
    } else if (!drawerOpen && dialog.open) {
      dialog.close();
    }
  }, [drawerOpen]);

  // "Tap again to clear" resets itself after a few seconds.
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  const closeNow = () => {
    // Close synchronously so a link inside can scroll the page straight away.
    dialogRef.current?.close();
    closeDrawer();
  };

  return (
    <dialog
      ref={dialogRef}
      className="order-dialog"
      id="order-dialog"
      aria-labelledby="order-title"
      onClose={closeDrawer}
      onClick={(e) => {
        if (e.target === dialogRef.current) closeNow();
      }}
    >
      <div className="order-inner" tabIndex={-1} ref={innerRef}>
        <header className="order-head">
          <h2 id="order-title">
            Your Order{" "}
            <span className="order-head-count" data-order-count-text hidden={!count}>
              ({count})
            </span>
          </h2>
          <button className="order-close" type="button" aria-label="Close your order" data-close-order onClick={closeNow}>
            <Icon id="i-x" />
          </button>
        </header>
        <div className="order-body">
          <div className="order-empty" hidden={count > 0} data-order-empty>
            <span className="order-empty-icon">
              <Icon id="i-bag" />
            </span>
            <p className="order-empty-title">Nothing here yet</p>
            <p>Add dishes from the menu and they&apos;ll appear here. Your list stays on this device.</p>
            <a className="btn btn-ghost" href="/menu#menu" onClick={closeNow}>
              Browse the menu
            </a>
          </div>
          <ul className="order-lines" data-order-lines>
            {lines.map((line) => {
              const hit = resolve(line.id);
              if (!hit) return null;
              const { item, opt } = hit;
              // "Large Fish Supper", "Margherita 12"", "Meal Deal 2"
              const name = titleOf(item) + (opt.label && !item.opts ? " " + opt.label : "");
              const meta = [item.opts ? opt.label : "", item.pcs ? pcsLabel(item.pcs) : ""].filter(Boolean).join(" · ");
              const thumb = THUMBS[item.cat.id];
              return (
                <li className="order-line" key={line.id}>
                  <span className="ol-thumb">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a 64px thumbnail, already sized
                      <img src={`/images/${thumb}.webp`} width={64} height={64} alt="" loading="lazy" />
                    ) : (
                      <svg className="emblem" aria-hidden="true">
                        <use href={"#" + (EMBLEMS[item.cat.id] ?? "i-spark")} />
                      </svg>
                    )}
                  </span>
                  <div className="ol-info">
                    <p className="ol-name">{name}</p>
                    {meta ? <p className="ol-meta">{meta}</p> : null}
                    <div className="qty">
                      <button type="button" aria-label={(line.qty === 1 ? "Remove " : "One fewer ") + name} data-dec={line.id} onClick={() => changeQty(line.id, -1)}>
                        <Icon id="i-minus" />
                      </button>
                      <output aria-label="Quantity">{line.qty}</output>
                      <button type="button" aria-label={"One more " + name} data-inc={line.id} onClick={() => changeQty(line.id, 1)}>
                        <Icon id="i-plus" />
                      </button>
                    </div>
                  </div>
                  <div className="ol-side">
                    <p className="ol-total">{fmt(opt.pence * line.qty)}</p>
                    <button
                      className="ol-remove"
                      type="button"
                      data-remove={line.id}
                      aria-label={"Remove " + name + " from your order"}
                      onClick={() => changeQty(line.id, -line.qty)}
                    >
                      <Icon id="i-trash" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <footer className="order-foot" hidden={count === 0} data-order-foot>
          <div className="order-note-field">
            <label htmlFor="order-note">Add a note (optional)</label>
            <textarea
              id="order-note"
              rows={2}
              placeholder="e.g. no onions, extra cheese…"
              ref={noteRef}
              data-order-note
              onInput={(e) => {
                try {
                  localStorage.setItem(NOTE_KEY, e.currentTarget.value);
                } catch {
                  /* storage blocked */
                }
              }}
            />
          </div>
          <div className="order-total">
            <span>Subtotal</span>
            <strong data-order-total>{fmt(pence)}</strong>
          </div>
          <a className="order-cta" href={SITE.phoneHref}>
            Call to Order
            <Icon id="i-arrow-right" />
          </a>
          <button className="order-continue" type="button" data-close-order onClick={closeNow}>
            Continue Ordering
          </button>
          <div className="order-actions">
            <button
              className="btn btn-quiet"
              type="button"
              onClick={async () => {
                const note = noteRef.current?.value.trim() ?? "";
                const ok = await copyText(asText() + (note ? "\nNote: " + note : ""), dialogRef.current ?? document.body);
                setCopyLabel(ok ? "Copied!" : "Copy failed");
                setTimeout(() => setCopyLabel("Copy list"), 1800);
              }}
            >
              <Icon id="i-copy" />
              {copyLabel}
            </button>
            <button
              className="btn btn-quiet"
              type="button"
              onClick={() => {
                if (!armed) {
                  setArmed(true);
                  return;
                }
                setArmed(false);
                clear();
                if (noteRef.current) noteRef.current.value = "";
                try {
                  localStorage.removeItem(NOTE_KEY);
                } catch {
                  /* storage blocked */
                }
              }}
            >
              <Icon id="i-trash" />
              {armed ? "Tap again to clear" : "Clear"}
            </button>
          </div>
          <p className="order-note">We don&apos;t take orders online: call us and read out your list and note. Please tell us about any allergies.</p>
        </footer>
      </div>
    </dialog>
  );
}
