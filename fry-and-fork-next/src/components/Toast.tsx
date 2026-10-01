"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/Icon";
import { useOrder } from "@/context/OrderContext";

/** "Added Margherita (12") · £8.30" with a View button. Stays while hovered. */
export function Toast() {
  const { toast, hideToast, openDrawer } = useOrder();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!toast.visible) return;
    timer.current = setTimeout(hideToast, 2800);
    return () => clearTimeout(timer.current);
  }, [toast.nonce, toast.visible, hideToast]);

  return (
    <div
      className={"toast" + (toast.visible ? " is-visible" : "")}
      role="status"
      aria-live="polite"
      data-toast
      onMouseEnter={() => clearTimeout(timer.current)}
      onMouseLeave={() => {
        if (toast.visible) timer.current = setTimeout(hideToast, 1600);
      }}
    >
      <span className="toast-icon">
        <Icon id="i-check" />
      </span>
      <span className="toast-text" data-toast-text>{toast.text}</span>
      <button className="toast-action" type="button" data-open-order onClick={openDrawer}>
        View
      </button>
    </div>
  );
}
