"use client";

import { Icon } from "@/components/Icon";
import { useOrder } from "@/context/OrderContext";

/** The round "Your order" button in the footer's brand column. */
export function FooterOrderButton() {
  const { openDrawer } = useOrder();
  return (
    <button className="footer-action" type="button" aria-label="Your order" data-open-order onClick={openDrawer}>
      <Icon id="i-bag" />
    </button>
  );
}
