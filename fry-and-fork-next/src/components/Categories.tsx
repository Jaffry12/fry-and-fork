import { Icon } from "@/components/Icon";

/* Generated from the design's measurements (see the static site's categories section):
   each photo keeps the tilted, rounded frame it has in the design (clip), and the fish
   and pasta photos have a thin gold outline set just off the frame (outline, in photo px). */
const CARDS: {
  id: string;
  href: string;
  title: string;
  desc: string;
  alt: string;
  w: number;
  h: number;
  clip: string;
  outline: string | null;
  /** the card's gold line drawing (an icon id), if it has one */
  doodle: string | null;
}[] = [
  {
    "id": "fish",
    "href": "/menu#cat-fish",
    "title": "Fish & Chips",
    "desc": "Crispy, golden and freshly prepared with the finest fish.",
    "alt": "Golden battered fish with chips, mushy peas, tartare sauce and lemon",
    "w": 520,
    "h": 392,
    "clip": "M0.0408,0.1877 L0.9195,0.0129 Q0.9537,0.0061 0.9555,0.0520 L0.9920,0.9482 Q0.9938,0.9941 0.9593,0.9917 L0.0517,0.9282 Q0.0171,0.9258 0.0164,0.8799 L0.0073,0.2404 Q0.0066,0.1945 0.0408,0.1877 Z",
    "outline": "M14.4,64.1 L492.9,-6.8 Q512.7,-9.7 513.8,10.3 L533.5,376.6 Q534.5,396.6 514.6,395.5 L20.7,370.2 Q0.7,369.2 0.3,349.2 L-4.9,87.1 Q-5.3,67.1 14.4,64.1 Z",
    "doodle": null
  },
  {
    "id": "pizza",
    "href": "/menu#cat-pizza",
    "title": "Pizza",
    "desc": "Authentic Italian pizzas with homemade dough and fresh toppings.",
    "alt": "Margherita pizza with cherry tomatoes and fresh basil",
    "w": 477,
    "h": 269,
    "clip": "M0.1429,0.0943 L0.9547,0.0112 Q0.9924,0.0074 0.9910,0.0743 L0.9737,0.9237 Q0.9723,0.9905 0.9346,0.9871 L0.0463,0.9066 Q0.0087,0.9032 0.0165,0.8378 L0.0974,0.1636 Q0.1052,0.0981 0.1429,0.0943 Z",
    "outline": null,
    "doodle": "i-slice"
  },
  {
    "id": "pasta",
    "href": "/menu#cat-pasta",
    "title": "Pasta",
    "desc": "Traditional recipes, rich flavours and freshly prepared Italian pasta dishes.",
    "alt": "Pasta with roasted cherry tomatoes, parmesan and basil",
    "w": 419,
    "h": 265,
    "clip": "M0.0508,0.1393 L0.7836,0.0191 Q0.8263,0.0121 0.8373,0.0778 L0.9798,0.9250 Q0.9908,0.9906 0.9479,0.9880 L0.1446,0.9381 Q0.1017,0.9354 0.0938,0.8687 L0.0159,0.2131 Q0.0080,0.1463 0.0508,0.1393 Z",
    "outline": "M14.4,27.7 L342.7,-7.3 Q362.6,-9.4 367.5,10.0 L428.6,249.0 Q433.6,268.3 413.6,267.7 L54.8,255.4 Q34.8,254.7 31.3,235.0 L-2.0,49.5 Q-5.5,29.8 14.4,27.7 Z",
    "doodle": "i-cheese"
  },
  {
    "id": "burger",
    "href": "/menu#cat-burgers",
    "title": "Burgers",
    "desc": "Succulent burgers made with quality ingredients.",
    "alt": "Cheeseburger with lettuce, tomato and onion",
    "w": 318,
    "h": 269,
    "clip": "M0.1297,0.0754 L0.8077,0.0167 Q0.8641,0.0118 0.8726,0.0780 L0.9813,0.9221 Q0.9899,0.9883 0.9334,0.9828 L0.0655,0.8993 Q0.0090,0.8938 0.0143,0.8272 L0.0680,0.1469 Q0.0732,0.0803 0.1297,0.0754 Z",
    "outline": null,
    "doodle": "i-flame"
  },
  {
    "id": "meal",
    "href": "/menu#cat-deals",
    "title": "Meal Deals",
    "desc": "Great value combinations for everyone.",
    "alt": "Fish supper with chips, peas and a can of juice",
    "w": 297,
    "h": 238,
    "clip": "M0.1411,0.0125 L0.9291,0.0177 Q0.9897,0.0181 0.9865,0.0936 L0.9516,0.9129 Q0.9484,0.9884 0.8878,0.9871 L0.0724,0.9688 Q0.0118,0.9675 0.0172,0.8921 L0.0751,0.0874 Q0.0805,0.0121 0.1411,0.0125 Z",
    "outline": null,
    "doodle": "i-cup"
  },
  {
    "id": "sides",
    "href": "/menu#cat-sides",
    "title": "Sides & Extras",
    "desc": "Tasty add-ons to complete your meal.",
    "alt": "Onion rings, garlic bread, chips and ketchup",
    "w": 310,
    "h": 268,
    "clip": "M0.1395,0.0767 L0.8502,0.0152 Q0.9081,0.0102 0.9138,0.0770 L0.9854,0.9238 Q0.9911,0.9906 0.9332,0.9850 L0.0691,0.9020 Q0.0112,0.8964 0.0170,0.8296 L0.0758,0.1486 Q0.0816,0.0817 0.1395,0.0767 Z",
    "outline": null,
    "doodle": "i-fries"
  }
];

/** "Our menu": intro on the left and the six favourites as tilted, gold-trimmed photo
 *  cards. On laptops and desktops it follows the design exactly and the whole canvas
 *  scales to fit one screen; smaller screens stack the cards. Each card opens its section
 *  of the menu. */
export function Categories() {
  return (
    <section className="section cats" id="explore" aria-labelledby="cats-title">
      <svg className="sprite" aria-hidden="true" focusable="false">
        <defs>
          {CARDS.map((c) => (
            <clipPath key={c.id} id={`cc-clip-${c.id}`} clipPathUnits="objectBoundingBox">
              <path d={c.clip} />
            </clipPath>
          ))}
        </defs>
      </svg>
      <div className="container">
        <div className="cats-canvas">
          <div className="cats-intro reveal">
            <svg className="cats-branch" aria-hidden="true">
              <use href="#i-twirl" />
            </svg>
            <p className="cats-kicker">
              <svg className="cats-kicker-sprig" aria-hidden="true">
                <use href="#i-spark" />
              </svg>
              Our Menu
            </p>
            <h2 id="cats-title">
              Something for <em>Every Craving</em>
            </h2>
            <p className="cats-lede">
              At Fry &amp; Fork, we bring together the best of British chippy favourites and authentic Italian classics, all made with fresh ingredients and a
              passion for great food.
            </p>
          </div>

          {CARDS.map((c) => (
            <a key={c.id} className={`cc cc--${c.id}`} href={c.href}>
              <figure className="cc-photo">
                {/* eslint-disable-next-line @next/next/no-img-element -- clipped to the design's frame; already sized */}
                <img src={`/images/menu-${c.id}.webp`} width={c.w} height={c.h} loading="lazy" alt={c.alt} />
                {c.outline ? (
                  <svg className="cc-outline" viewBox={`0 0 ${c.w} ${c.h}`} preserveAspectRatio="none" aria-hidden="true">
                    <path d={c.outline} />
                  </svg>
                ) : null}
                {c.id === "fish" ? <Stamp /> : null}
              </figure>
              {c.id === "fish" ? (
                <p className="cc-note cc-note--fish" aria-hidden="true">
                  <span>Our</span>
                  <span>Signature</span>
                  <span>Classic</span>
                  <svg viewBox="0 0 60 50">
                    <path d="M50 4C50 26 34 40 8 44" />
                    <path d="M17 35 7 44l12 5" />
                  </svg>
                </p>
              ) : null}
              {c.id === "pasta" ? (
                <p className="cc-note cc-note--pasta" aria-hidden="true">
                  <span>Authentic</span>
                  <span>Italian</span>
                  <span>Flavours</span>
                  <svg viewBox="0 0 40 60">
                    <path d="M30 4C36 26 30 44 12 54" />
                    <path d="M13 42 11 55l12-3" />
                  </svg>
                </p>
              ) : null}
              {c.doodle ? (
                <svg className="cc-doodle" aria-hidden="true">
                  <use href={"#" + c.doodle} />
                </svg>
              ) : null}
              <span className="cc-text">
                <span className="cc-title">{c.title}</span>
                <span className="cc-desc">{c.desc}</span>
                <span className="cc-cta">
                  <span className="cc-explore">
                    Explore
                    <Icon id="i-arrow-right" />
                  </span>
                  <span className="cc-go">
                    <Icon id="i-arrow-right" />
                  </span>
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The round "British classics · freshly prepared" stamp on the fish photo. */
function Stamp() {
  return (
    <svg className="cc-stamp" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id="cc-arc-top" d="M30 100A70 70 0 0 1 170 100" />
        <path id="cc-arc-bottom" d="M18 100A82 82 0 0 0 182 100" />
      </defs>
      <circle cx="100" cy="100" r="96" className="cc-stamp-disc" />
      <text>
        <textPath href="#cc-arc-top" startOffset="50%" textAnchor="middle">
          BRITISH CLASSICS
        </textPath>
      </text>
      <text>
        <textPath href="#cc-arc-bottom" startOffset="50%" textAnchor="middle">
          FRESHLY PREPARED
        </textPath>
      </text>
      <circle cx="24" cy="100" r="2.6" className="cc-stamp-dot" />
      <circle cx="176" cy="100" r="2.6" className="cc-stamp-dot" />
      <use href="#i-fish" x="64" y="79" width="72" height="44" className="cc-stamp-fish" />
    </svg>
  );
}
