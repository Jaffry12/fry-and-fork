import SHOWCASE from "@/data/menu-showcase.json";
import { Icon } from "@/components/Icon";
import { ShowcaseGrid } from "@/components/ShowcaseGrid";
import { CATS, ITEMS, fmt, pcsLabel, spoken } from "@/lib/menu";

interface CardConfig {
  id: string;
  title: string;
  kicker: string;
  desc?: string;
  section: string;
  button: string;
  table?: boolean;
  photo?: { src: string; w: number; h: number; alt: string };
  items: { key: string; size?: number; suffix?: string }[];
}

/** A dish as the showcase shows it: its name, a small note and the price(s), taken from the menu. */
function rowsOf(card: CardConfig) {
  return card.items.map(({ key, size, suffix }) => {
    const item = ITEMS.get(key);
    if (!item) throw new Error(`Menu showcase: no dish "${key}" on the menu`);
    const note = [item.pcs && item.pcs > 1 ? pcsLabel(item.pcs) : "", suffix ?? ""].filter(Boolean).join(", ");
    const shown = card.table ? item.options.map((o, i) => ({ o, i })) : [{ o: item.options[size ?? 0], i: size ?? 0 }];
    return {
      key,
      name: item.name,
      note,
      // pizza toppings: what's on it besides the house tomato sauce & mozzarella
      toppings: card.table ? toppings(item.desc ?? "") : "",
      prices: shown.map(({ o, i }) => ({ id: `${key}#${i}`, label: o.label, text: fmt(o.pence) })),
    };
  });
}
function toppings(desc: string) {
  const base = "Homemade tomato sauce, mozzarella cheese";
  if (!desc.startsWith(base)) return desc;
  const rest = desc.slice(base.length).replace(/^(,| &| with)\s*/, "");
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

function Card({ card }: { card: CardConfig }) {
  const rows = rowsOf(card);
  const sizes = card.table ? (CATS.get(card.section)?.sizes ?? []) : [];
  return (
    <article className={`sc-card sc-card--${card.id} reveal`} data-sc-card={card.id} aria-labelledby={`sc-${card.id}-title`}>
      {card.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- cut from the design at its displayed size
        <img className="sc-photo" src={`/images/${card.photo.src}.webp`} width={card.photo.w} height={card.photo.h} loading="lazy" alt={card.photo.alt} />
      ) : null}
      <Deco id={card.id} />
      <div className="sc-body">
        <h3 id={`sc-${card.id}-title`}>{card.title}</h3>
        {card.table ? (
          <div className="sc-table-head">
            <div>
              <p className="sc-sub">{card.kicker}</p>
              {card.desc ? <p className="sc-desc">{card.desc}</p> : null}
            </div>
            <div className="sc-sizes" aria-hidden="true">
              {sizes.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="sc-sub">{card.kicker}</p>
            {card.desc ? <p className="sc-desc">{card.desc}</p> : null}
          </>
        )}
        {card.table ? (
          <table className="sc-table">
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <th scope="row">
                    <span className="sc-name">{r.name}</span>
                    {r.toppings ? <span className="sc-toppings">{r.toppings}</span> : null}
                  </th>
                  {r.prices.map((p) => (
                    <td key={p.id}>
                      <span className="visually-hidden">{spoken(p.label)} </span>
                      <span data-price-of={p.id}>{p.text}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul className="sc-list">
            {rows.map((r) => (
              <li key={r.key}>
                <span className="sc-name">
                  {r.name}
                  {r.note ? <small> ({r.note})</small> : null}
                </span>
                <span className="sc-dots" aria-hidden="true" />
                <span className="sc-price" data-price-of={r.prices[0].id}>
                  {r.prices[0].text}
                </span>
              </li>
            ))}
          </ul>
        )}
        <a className="sc-btn" href={`/menu#cat-${card.section}`}>
          {card.button}
          <Icon id="i-arrow-right" />
        </a>
      </div>
    </article>
  );
}

/** The small gold flourishes from the design (sparkles, dotted and solid arcs). */
function Deco({ id }: { id: string }) {
  if (id === "burgers")
    return (
      <svg className="sc-deco sc-deco--burgers" viewBox="0 0 110 110" aria-hidden="true">
        <path className="sc-deco-dots" d="M4 28H32" />
        <path d="M40 34C70 36 98 56 108 106" />
        <use href="#i-spark" x="54" y="4" width="26" height="26" />
      </svg>
    );
  if (id === "kebabs")
    return (
      <svg className="sc-deco sc-deco--kebabs" viewBox="0 0 100 80" aria-hidden="true">
        <path className="sc-deco-dots" d="M4 12H40M4 21H40M4 30H40M4 39H40" />
        <path d="M46 2C76 8 96 36 98 76" />
      </svg>
    );
  if (id === "sides")
    return (
      <svg className="sc-deco sc-deco--sides" viewBox="0 0 100 60" aria-hidden="true">
        <use href="#i-spark" x="18" y="6" width="22" height="22" />
        <use href="#i-spark" x="2" y="36" width="9" height="9" />
        <path className="sc-deco-dots" d="M62 6H98" />
        <path d="M14 58C40 58 70 44 98 16" />
      </svg>
    );
  return null;
}

/** "From the Fryer to the Fork": a taste of the menu as the design's six cards, with a
 *  link to the full menu page. Names and prices come from the menu data. */
export function MenuShowcase() {
  const cards = SHOWCASE.cards as CardConfig[];
  const [fish, ...rest] = cards;
  return (
    <section className="section showcase" id="menu" aria-labelledby="showcase-title">
      <div className="container">
        <ShowcaseGrid
          pills={SHOWCASE.pills}
          intro={
            <div className="sc-intro reveal">
              <p className="sc-kicker">
                <Icon id="i-spark" />
                Our Menu
              </p>
              <h2 id="showcase-title">
                From the Fryer <em>to the Fork</em>
              </h2>
              <p className="sc-lede">
                Golden fish suppers, fresh-dough pizza and proper pasta, all cooked to order. Here are a few favourites; the full menu has all{" "}
                <span data-dish-count>{ITEMS.size}</span> dishes.
              </p>
              <a className="sc-full" href="/menu">
                View Full Menu
                <span className="sc-full-go">
                  <Icon id="i-arrow-right" />
                </span>
              </a>
              <svg className="sc-deco sc-deco--intro" viewBox="0 0 140 170" aria-hidden="true">
                <path className="sc-deco-dots" d="M72 4C104 12 126 38 128 72" />
                <path d="M128 60C130 116 80 156 6 160" />
                <use href="#i-spark" x="58" y="50" width="34" height="34" />
                <use href="#i-spark" x="114" y="126" width="18" height="18" />
                <use href="#i-spark" x="98" y="150" width="10" height="10" />
              </svg>
            </div>
          }
          fish={<Card card={fish} />}
          cards={rest.map((c) => (
            <Card key={c.id} card={c} />
          ))}
        />
      </div>
    </section>
  );
}
