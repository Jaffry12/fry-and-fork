"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { fmt, resolve, titleOf } from "@/lib/menu";

/**
 * The visitor's order list. It never leaves the device: it is kept in localStorage
 * (same key and format as the original site) and read out when they phone the shop.
 */
export interface OrderLine {
  id: string;
  qty: number;
}

interface OrderState {
  lines: OrderLine[];
  count: number;
  pence: number;
  add: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  clear: () => void;
  asText: () => string;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toast: { text: string; visible: boolean; nonce: number };
  hideToast: () => void;
  /** Increments on every add, so the header's bag can do a little bump. */
  bump: number;
}

const STORE_KEY = "ff-order-v1";
const MAX_QTY = 99;

const OrderContext = createContext<OrderState | null>(null);

function sanitise(raw: unknown): OrderLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l): l is OrderLine => !!l && typeof l.id === "string" && resolve(l.id) !== null && Number.isFinite(l.qty) && l.qty > 0)
    .map((l) => ({ id: l.id, qty: Math.min(MAX_QTY, Math.floor(l.qty)) }));
}

function parse(value: string | null): OrderLine[] {
  try {
    return sanitise(JSON.parse(value || "[]"));
  } catch {
    return [];
  }
}

/* The saved list as a tiny external store: localStorage (or memory if storage is blocked),
   shared by every component and kept in step with other open tabs. */
const listeners = new Set<() => void>();
let memoryCopy = "[]";

function readRaw(): string {
  try {
    return localStorage.getItem(STORE_KEY) ?? "[]";
  } catch {
    return memoryCopy;
  }
}

function writeLines(lines: OrderLine[]) {
  const raw = JSON.stringify(lines);
  memoryCopy = raw;
  try {
    localStorage.setItem(STORE_KEY, raw);
  } catch {
    /* private mode: keep it in memory only */
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORE_KEY) notify();
  };
  listeners.add(notify);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  // The server has no saved list, so it (and the first browser render) starts empty.
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const lines = useMemo(() => parse(raw), [raw]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState({ text: "", visible: false, nonce: 0 });
  const [bump, setBump] = useState(0);

  const changeQty = useCallback((id: string, delta: number) => {
    const current = parse(readRaw());
    const existing = current.find((l) => l.id === id);
    if (!existing && delta <= 0) return;
    const qty = Math.min(MAX_QTY, (existing?.qty ?? 0) + delta);
    const next =
      qty <= 0
        ? current.filter((l) => l.id !== id)
        : existing
          ? current.map((l) => (l.id === id ? { ...l, qty } : l))
          : [...current, { id, qty }];
    writeLines(next);
  }, []);

  const add = useCallback(
    (id: string) => {
      const hit = resolve(id);
      if (!hit) return;
      changeQty(id, 1);
      setBump((n) => n + 1);
      const text = "Added " + titleOf(hit.item) + (hit.opt.label ? " (" + hit.opt.label + ")" : "") + " · " + fmt(hit.opt.pence);
      setToast((t) => ({ text, visible: true, nonce: t.nonce + 1 }));
    },
    [changeQty],
  );

  const clear = useCallback(() => writeLines([]), []);

  const hideToast = useCallback(() => setToast((t) => ({ ...t, visible: false })), []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    hideToast();
  }, [hideToast]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const { count, pence } = useMemo(
    () =>
      lines.reduce(
        (acc, l) => {
          const hit = resolve(l.id);
          if (hit) {
            acc.count += l.qty;
            acc.pence += l.qty * hit.opt.pence;
          }
          return acc;
        },
        { count: 0, pence: 0 },
      ),
    [lines],
  );

  const asText = useCallback(() => {
    const rows = lines.flatMap((l) => {
      const hit = resolve(l.id);
      if (!hit) return [];
      return [l.qty + " x " + titleOf(hit.item) + (hit.opt.label ? " (" + hit.opt.label + ")" : "") + " - " + fmt(hit.opt.pence * l.qty)];
    });
    return ["My Fry & Fork order:", ...rows, "Total: " + fmt(pence)].join("\n");
  }, [lines, pence]);

  const value = useMemo<OrderState>(
    () => ({ lines, count, pence, add, changeQty, clear, asText, drawerOpen, openDrawer, closeDrawer, toast, hideToast, bump }),
    [lines, count, pence, add, changeQty, clear, asText, drawerOpen, openDrawer, closeDrawer, toast, hideToast, bump],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderState {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}
