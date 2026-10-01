"use client";

import { Icon } from "@/components/Icon";
import { useOrder } from "@/context/OrderContext";
import { fmt } from "@/lib/menu";

/** The "View Order" bar at the foot of the screen on phones (full menu page). */
export function MenuOrderBar() {
  const { count, pence, openDrawer } = useOrder();
  return (
    <button className={"mp-orderbar" + (count ? "" : " is-empty")} type="button" data-open-order onClick={openDrawer}>
      <span className="mp-orderbar-cart">
        <Icon id="i-bag" />
        <span className="mp-orderbar-count" data-order-count hidden={!count}>
          {count}
        </span>
      </span>
      <span className="mp-orderbar-label">View Order</span>
      <strong className="mp-orderbar-total" data-order-total>
        {fmt(pence)}
      </strong>
      <span className="mp-orderbar-go">
        <Icon id="i-arrow-right" />
      </span>
    </button>
  );
}
