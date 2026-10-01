import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IconSprite } from "@/components/Icon";
import { MenuSection } from "@/components/MenuSection";
import { OrderDrawer } from "@/components/OrderDrawer";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Toast } from "@/components/Toast";

const TITLE = "Full Menu | Fry & Fork, Kirkcaldy";
const DESCRIPTION =
  "The full Fry & Fork menu: fish suppers, pizza in three sizes, pasta, burgers, kebabs, pakora, kids meals and meal deals, with prices. Search it, then call 01592 264123 to order.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // (a page's openGraph replaces the layout's, so it's given in full)
  openGraph: {
    type: "website",
    siteName: "Fry & Fork",
    title: TITLE,
    description: DESCRIPTION,
    url: "/menu",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_GB",
  },
};

/** The full menu on a page of its own: every dish, search and filters, and the order list. */
export default function MenuPage() {
  return (
    <>
      <a className="skip-link" href="#menu">
        Skip to the menu
      </a>
      <IconSprite />

      <Header page="menu" />
      <main id="main">
        <MenuSection />
      </main>
      <Footer page="menu" />

      <OrderDrawer />
      <Toast />
      <RevealOnScroll />
    </>
  );
}
