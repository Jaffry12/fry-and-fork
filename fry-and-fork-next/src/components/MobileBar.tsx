"use client";

import { Icon } from "@/components/Icon";
import { useOrder } from "@/context/OrderContext";
import { fmt } from "@/lib/menu";
import { SITE } from "@/lib/site";

/** Call / Your order bar fixed to the bottom of the screen on phones. */
export function MobileBar() {
  const { count, pence, openDrawer } = useOrder();
  return (
    <div className="mobile-bar">
      <a className="btn btn-primary" href={SITE.phoneHref}>
        <Icon id="i-phone" />
        Call
      </a>
      <button className="btn btn-dark" type="button" data-open-order onClick={openDrawer}>
        <Icon id="i-bag" />
        <span className="mobile-bar-label">Your order</span>
        <span className="mobile-bar-total" hidden={!count} data-order-summary>
          {count} · {fmt(pence)}
        </span>
      </button>
    </div>
  );
}
