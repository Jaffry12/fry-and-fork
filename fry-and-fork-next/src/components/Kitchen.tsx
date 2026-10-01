import { Icon } from "@/components/Icon";

const FEATURES = [
  { icon: "i-leaf", title: "Fresh Ingredients", text: "Always fresh, full of flavour" },
  { icon: "i-chef", title: "Expert Chef", text: "Passionate & experienced" },
  { icon: "i-heart", title: "Homemade Goodness", text: "From dough to sauces" },
  { icon: "i-utensils", title: "Authentic Flavours", text: "Italian & British classics" },
];

/* The photos are exported at the sizes the collage uses, so they're served as they are
   (a plain <img> with srcSet rather than next/image). */
const PHOTOS = [
  {
    cls: "kc-main",
    base: "kitchen-chef",
    widths: [440, 800],
    w: 800,
    h: 1142,
    sizes: "(max-width: 1100px) min(52vw, 292px), 316px",
    alt: "Our chef dusting fresh pizza dough with flour",
  },
  {
    cls: "kc-top",
    base: "kitchen-pasta-dish",
    widths: [320, 600],
    w: 600,
    h: 698,
    sizes: "(max-width: 1100px) min(31vw, 176px), 188px",
    alt: "Pasta with roasted cherry tomatoes, parmesan and basil",
  },
  {
    cls: "kc-bottom",
    base: "kitchen-basil",
    widths: [320, 600],
    w: 600,
    h: 531,
    sizes: "(max-width: 1100px) min(30vw, 170px), 181px",
    alt: "Fresh basil being chopped beside cherry tomatoes",
  },
];

/** Copy and four promises on the left; a collage of three framed photos on the right
 *  with a round stamp, gold sprigs and two handwritten notes. */
export function Kitchen() {
  return (
    <section className="section kitchen" id="kitchen" aria-labelledby="kitchen-title">
      <div className="container kitchen-grid">
        <div className="kitchen-copy reveal">
          <svg className="kitchen-sprig" aria-hidden="true">
            <use href="#i-sprig" />
          </svg>
          <p className="kitchen-kicker">Our Kitchen</p>
          <h2 id="kitchen-title">
            Passion Behind <em>Every Plate</em>
          </h2>
          <p className="kitchen-lede">
            Our kitchen is where fresh ingredients, traditional recipes and modern flavours come together. From hand-prepared dough to chef-crafted dishes, everything is
            made with care to give you an unforgettable meal.
          </p>
          <ul className="kitchen-features">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <span className="kf-icon">
                  <Icon id={f.icon} />
                </span>
                <b>{f.title}</b>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
          <a className="btn kitchen-btn" href="#menu">
            Discover Our Menu
            <Icon id="i-arrow-right" />
          </a>
        </div>

        <div className="kitchen-collage reveal">
          {PHOTOS.map((photo) => (
            <figure key={photo.cls} className={"kc-photo " + photo.cls}>
              {/* eslint-disable-next-line @next/next/no-img-element -- already sized; see PHOTOS */}
              <img
                src={`/images/${photo.base}-${photo.widths[1]}.webp`}
                srcSet={photo.widths.map((w) => `/images/${photo.base}-${w}.webp ${w}w`).join(", ")}
                sizes={photo.sizes}
                width={photo.w}
                height={photo.h}
                loading="lazy"
                alt={photo.alt}
              />
            </figure>
          ))}
          <svg className="kc-sprig kc-sprig--left" aria-hidden="true">
            <use href="#i-sprig" />
          </svg>
          <svg className="kc-sprig kc-sprig--mid" aria-hidden="true">
            <use href="#i-sprig" />
          </svg>
          <svg className="kc-stamp" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="kc-arc-top" d="M30 100A70 70 0 0 1 170 100" />
              <path id="kc-arc-bottom" d="M18 100A82 82 0 0 0 182 100" />
            </defs>
            <circle cx="100" cy="100" r="96" className="kc-stamp-disc" />
            <text>
              <textPath href="#kc-arc-top" startOffset="50%" textAnchor="middle">
                FOOD BRINGS
              </textPath>
            </text>
            <text>
              <textPath href="#kc-arc-bottom" startOffset="50%" textAnchor="middle">
                PEOPLE TOGETHER
              </textPath>
            </text>
            <circle cx="24" cy="100" r="2.6" className="kc-stamp-dot" />
            <circle cx="176" cy="100" r="2.6" className="kc-stamp-dot" />
            <use href="#i-sprig" x="82" y="72" width="36" height="56" transform="rotate(38 100 100)" className="kc-stamp-sprig" />
          </svg>
          <p className="kc-note kc-note--top" aria-hidden="true">
            Handcrafted
            <br />
            With Care
            <svg viewBox="0 0 80 64">
              <path d="M52 4C58 30 44 50 12 52" />
              <path d="M22 42 10 52l13 8" />
            </svg>
          </p>
          <p className="kc-note kc-note--side" aria-hidden="true">
            Fresh
            <br />
            Flavours
            <br />
            Always
            <svg viewBox="0 0 100 16">
              <path d="M4 13C32 6 62 3 96 5" />
            </svg>
          </p>
        </div>
      </div>
    </section>
  );
}
