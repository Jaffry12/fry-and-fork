import { Icon } from "@/components/Icon";
import { MenuBoard } from "@/components/MenuBoard";
import { MenuOrderBar } from "@/components/MenuOrderBar";

const ALLERGENS = ["Celery", "Gluten", "Crustaceans", "Eggs", "Fish", "Lupin", "Milk", "Molluscs", "Mustard", "Nuts", "Peanuts", "Sesame", "Soya", "Sulphites"];

/** The full menu page, after the client's two designs: the "Made Fresh. Served Properly."
 *  hero, the menu (pills and search, the "All" overview or a pill's detail view), the
 *  allergens and, on phones, the "View Order" bar. */
export function MenuSection() {
  return (
    <>
      <section className="mp-hero" aria-labelledby="menu-title">
        {/* eslint-disable-next-line @next/next/no-img-element -- the page's first image; already sized */}
        <img className="mp-hero-photo" src="/images/mp-hero.webp" width={1000} height={472} alt="" fetchPriority="high" />
        <div className="container mp-hero-inner">
          <div className="mp-hero-copy">
            <p className="mp-kicker">Our Menu</p>
            <h1 id="menu-title">
              Made Fresh. <em>Served Properly.</em>
            </h1>
            <p className="mp-lede">
              From proper Scottish fish suppers to handmade pizzas, pasta, burgers and family favourites, explore everything Fry &amp; Fork has to offer.
            </p>
          </div>
          <p className="mp-hero-note" aria-hidden="true">
            <span>Freshly made,</span>
            <span>every day</span>
            <svg viewBox="0 0 44 60">
              <path d="M36 4C40 26 30 44 8 54" />
              <path d="M9 42 7 55l13-2" />
            </svg>
          </p>
        </div>
      </section>

      <MenuBoard>
        <aside className="allergens" id="allergens" aria-labelledby="allergens-title">
          <span className="allergens-icon">
            <Icon id="i-alert" />
          </span>
          <div>
            <h2 id="allergens-title">Food allergies &amp; intolerances</h2>
            <p>
              If you have a food allergy or intolerance, please speak to a member of our team about the ingredients in your meal before you order. Ask us about any of the 14 major
              allergens:
            </p>
            <ul className="allergen-list">
              {ALLERGENS.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="small-print">Prices subject to change without prior notice.</p>
          </div>
        </aside>
      </MenuBoard>

      <MenuOrderBar />
    </>
  );
}
