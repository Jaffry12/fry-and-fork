import { CurrentYear } from "@/components/CurrentYear";
import { FooterOrderButton } from "@/components/FooterOrderButton";
import { Icon } from "@/components/Icon";
import { SITE } from "@/lib/site";

type Page = "home" | "menu";

/** Where each link goes from the home page and from the full menu page. */
const HOME: Record<Page, string> = { home: "#top", menu: "/" };
const onHome = (page: Page, id: string) => (page === "home" ? "#" : "/#") + id;
const onMenu = (page: Page, id: string) => (page === "menu" ? "#" : "/menu#") + id;

const quickLinks = (page: Page) => [
  { href: HOME[page], label: "Home" },
  { href: onMenu(page, "menu"), label: "Full Menu" },
  { href: onHome(page, "kitchen"), label: "Our Kitchen" },
  { href: onMenu(page, "allergens"), label: "Allergen Info" },
  { href: onHome(page, "contact"), label: "Contact Us" },
  { href: SITE.phoneHref, label: "Call to Order" },
];

/** Menu sections; each opens its tab in the menu board. */
const MENU_LINKS = [
  { id: "fish", label: "Fish Bar" },
  { id: "pizza", label: "Pizza" },
  { id: "pasta", label: "Pasta" },
  { id: "burgers", label: "Burgers" },
  { id: "kebabs", label: "Kebabs & Wraps" },
  { id: "deals", label: "Meal Deals" },
  { id: "desserts", label: "Desserts" },
];

/** Three bands, after the design: the "Good Food. Good Mood." call to order, the main
 *  footer (brand, quick links, menu, contact) and a slim base bar. */
export function Footer({ page = "home" }: { page?: Page }) {
  return (
    // On the menu page the footer is one band, as tall as the page's hero (.site-footer--menu).
    <footer className={"site-footer" + (page === "menu" ? " site-footer--menu" : "")}>
      {/* one olive-table photo behind the call to order and the main footer */}
      <div className="footer-scene">
        <section className="footer-cta" aria-labelledby="footer-cta-title">
          <div className="container footer-cta-inner">
            <p className="footer-kicker">Order Now</p>
            <h2 id="footer-cta-title">
              Good Food. <em>Good Mood.</em>
            </h2>
            <p className="footer-cta-lede">Make your next meal a special one. Call ahead and collect it fresh from the fryer.</p>
            <a className="footer-cta-btn" href={SITE.phoneHref}>
              Call to Order
              <Icon id="i-arrow-right" />
            </a>
            <p className="footer-note" aria-hidden="true">
              <span>Fresh Food</span>
              <span>Great Vibes</span>
              <svg>
                <use href="#i-olive" />
              </svg>
            </p>
          </div>
        </section>

        <div className="footer-main">
          <div className="container footer-grid">
            <div className="footer-brand">
              <a className="footer-logo" href="#top" aria-label="Fry & Fork, back to the top">
                <svg className="footer-logo-sprig" aria-hidden="true">
                  <use href="#i-olive" />
                </svg>
                <span className="footer-logo-name">
                  Fry <span className="amp">&amp;</span> Fork
                </span>
                <span className="footer-logo-tag">Fish &amp; Chips · Pizza · Pasta</span>
              </a>
              <div className="footer-about">
                <p>A proper Kirkcaldy chippy with an Italian kitchen: golden fish suppers, fresh-dough pizza and pasta, all cooked to order.</p>
                <ul className="footer-actions">
                  <li>
                    <FooterOrderButton />
                  </li>
                  <li>
                    <a className="footer-action" href={onMenu(page, "menu")} aria-label="Full menu">
                      <Icon id="i-utensils" />
                    </a>
                  </li>
                  <li>
                    <a className="footer-action" href={SITE.directionsUrl} target="_blank" rel="noopener" aria-label="Directions (opens Google Maps)">
                      <Icon id="i-nav" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <nav className="footer-col" aria-labelledby="footer-links-title">
              <h2 id="footer-links-title">Quick Links</h2>
              <ul>
                {quickLinks(page).map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="footer-col" aria-labelledby="footer-menu-title">
              <h2 id="footer-menu-title">Our Menu</h2>
              <ul>
                {MENU_LINKS.map((l) => (
                  <li key={l.id}>
                    <a href={onMenu(page, "cat-" + l.id)}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="footer-col footer-touch">
              <h2>Get in Touch</h2>
              <ul className="footer-contact">
                <li>
                  <span className="footer-contact-icon">
                    <Icon id="i-pin-solid" />
                  </span>
                  <a className="footer-contact-main" href={SITE.directionsUrl} target="_blank" rel="noopener">
                    {SITE.street}, {SITE.town} {SITE.postcode}
                  </a>
                </li>
                <li>
                  <span className="footer-contact-icon">
                    <Icon id="i-phone-solid" />
                  </span>
                  <span>
                    <a className="footer-contact-main" href={SITE.phoneHref}>
                      {SITE.phone}
                    </a>
                    <small>Call to order for collection</small>
                  </span>
                </li>
                <li>
                  <span className="footer-contact-icon">
                    <Icon id="i-clock-solid" />
                  </span>
                  <span>
                    <span className="footer-contact-main">Open 7 days from 3pm</span>
                    <small>Till 10:30pm, 11:30pm Fri &amp; Sat</small>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bar">
        <div className="container footer-bar-inner">
          <p className="footer-copy">
            © <CurrentYear builtIn={new Date().getFullYear()} /> Fry &amp; Fork, Kirkcaldy. All rights reserved.
          </p>
          <span className="footer-ornament" aria-hidden="true">
            <svg>
              <use href="#i-olive" />
            </svg>
          </span>
          <div className="footer-bar-end">
            <ul className="footer-legal">
              <li>
                <a href={onMenu(page, "allergens")}>Allergen Info</a>
              </li>
              <li>Prices may vary</li>
              <li>Photos for illustration</li>
            </ul>
            <a className="footer-top" href="#top" aria-label="Back to the top">
              <Icon id="i-arrow-up" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
