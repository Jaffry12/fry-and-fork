import { Fragment, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { fmt, resolve, spoken, type Item } from "@/lib/menu";
import { OVERVIEW, pickRef, pcsText, type Block, type Photo } from "@/lib/menu-page";

/** A photo cut from the design, at its displayed size. */
export function Photo({ photo, className, alt }: { photo: Photo; className?: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- already sized and compressed
    <img className={className} src={`/images/${photo.src}.webp`} width={photo.w} height={photo.h} alt={alt ?? photo.alt ?? ""} loading="lazy" />
  );
}

/** Handwritten words on a photo; "|" starts a new line. */
export function Note({ note, className }: { note: string; className: string }) {
  return (
    <p className={className} aria-hidden="true">
      {note.split("|").map((line) => (
        <span key={line}>{line}</span>
      ))}
    </p>
  );
}

function Name({ item, note }: { item: Item; note: string }) {
  return (
    <>
      {item.name}
      {note ? (
        <>
          {" "}
          <small>({note})</small>
        </>
      ) : null}
    </>
  );
}

function Title({ b, id }: { b: Block; id: string }) {
  return (
    <>
      {b.kicker ? <p className="ov-kicker">{b.kicker}</p> : null}
      <h2 id={id}>{b.title}</h2>
      {b.sub ? <p className="ov-sub">{b.sub}</p> : null}
    </>
  );
}

function ViewAll({ b, onGroup }: { b: Block; onGroup: (id: string) => void }) {
  return (
    <button className="ov-btn" type="button" data-group={b.group} onClick={() => onGroup(b.group)}>
      {b.button}
      <Icon id="i-arrow-right" />
    </button>
  );
}

/** A short priced line: name ....... £0.00 */
function ListRow({ refId }: { refId: string }) {
  const { item, n } = pickRef(refId);
  return (
    <li>
      <span className="ov-name">
        <Name item={item} note={item.pcs && item.pcs > 1 ? pcsText(item) : ""} />
      </span>
      <span className="ov-dots" aria-hidden="true" />
      <span className="ov-price" data-price-of={item.key + "#" + n}>
        {fmt(item.options[n].pence)}
      </span>
    </li>
  );
}

/** The "All" view: feature blocks, most loved, cards and "Good to know". */
export function MenuOverview({ hidden, onGroup }: { hidden: boolean; onGroup: (id: string) => void }) {
  const { fish, loved, pizza, pairs, cards, good } = OVERVIEW;
  const fishSizes = pickRef(fish.items[0]).item.cat.sizes ?? [];
  const pizzaSizes = pickRef(pizza.items[0]).item.cat.sizes ?? [];
  return (
    <div className="ov" data-overview hidden={hidden}>
      <section className="ov-fish" aria-labelledby="ov-fish-title">
        <div className="ov-intro">
          <Title b={fish} id="ov-fish-title" />
          <p className="ov-desc">{fish.desc}</p>
          <ViewAll b={fish} onGroup={onGroup} />
        </div>
        <table className="ov-table">
          <thead>
            <tr>
              <td />
              {fishSizes.map((s) => (
                <th key={s} scope="col">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fish.items.map((k) => {
              const { item } = pickRef(k);
              return (
                <tr key={k}>
                  <th scope="row">
                    <span className="ov-line">
                      <span className="ov-name">
                        <Name item={item} note={item.pcs && item.pcs > 1 ? pcsText(item) : ""} />
                      </span>
                      <span className="ov-dots" aria-hidden="true" />
                    </span>
                  </th>
                  {item.options.map((o, i) => (
                    <td key={i} data-price-of={item.key + "#" + i}>
                      {fmt(o.pence)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <figure className="ov-photo">{fish.photo ? <Photo photo={fish.photo} /> : null}</figure>
      </section>

      <section className="ov-loved" aria-labelledby="ov-loved-title">
        <div className="ov-loved-intro">
          <p className="ov-kicker">{loved.kicker}</p>
          <h2 id="ov-loved-title">
            {loved.title} <em>{loved.titleEm}</em>
          </h2>
          <p>{loved.lede}</p>
        </div>
        <ul className="ov-loved-list">
          {loved.items.map((it) => {
            const hit = resolve(it.id);
            if (!hit) return null;
            return (
              <li key={it.id}>
                <a className="ov-loved-card" href={"#cat-" + hit.item.cat.id}>
                  <Photo photo={it.photo} alt="" />
                  <span className="ov-loved-name">{it.name}</span>
                  <span className="ov-loved-price" data-price-of={it.id}>
                    {fmt(hit.opt.pence)}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="ov-pizza" aria-labelledby="ov-pizza-title">
        <div className="ov-pizza-copy">
          <div className="ov-pizza-head">
            <div>
              <Title b={pizza} id="ov-pizza-title" />
            </div>
            <div className="ov-sizes" aria-hidden="true">
              {pizzaSizes.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
          <ul className="ov-plist">
            {pizza.items.map((k) => {
              const { item } = pickRef(k);
              return (
                <li key={k}>
                  <span className="ov-name">{item.name}</span>
                  <span className="ov-dots" aria-hidden="true" />
                  {item.options.map((o, i) => (
                    <span key={i} className="ov-price">
                      <span className="visually-hidden">{spoken(o.label) + " "}</span>
                      <span data-price-of={item.key + "#" + i}>{fmt(o.pence)}</span>
                    </span>
                  ))}
                  {item.desc ? <span className="ov-pdesc">{item.desc}</span> : null}
                </li>
              );
            })}
          </ul>
          <ViewAll b={pizza} onGroup={onGroup} />
        </div>
        <figure className="ov-pizza-photo">
          {pizza.photo ? <Photo photo={pizza.photo} /> : null}
          {pizza.note ? <Note note={pizza.note} className="ov-note" /> : null}
        </figure>
      </section>

      <div className="ov-pairs">
        {pairs.map((b, i) => (
          <section key={b.group} className="ov-pair" aria-labelledby={"ov-pair-" + i}>
            <div className="ov-pair-copy">
              <Title b={b} id={"ov-pair-" + i} />
              <ul className="ov-list">
                {b.items.map((r) => (
                  <ListRow key={r} refId={r} />
                ))}
              </ul>
              <ViewAll b={b} onGroup={onGroup} />
            </div>
            <figure className="ov-tall">{b.photo ? <Photo photo={b.photo} /> : null}</figure>
          </section>
        ))}
      </div>

      <div className="ov-cards">
        {cards.map((b, i) => (
          <section key={b.group} className={"ov-card" + (b.feature ? " ov-card--feature" : "")} aria-labelledby={"ov-card-" + i}>
            <h2 id={"ov-card-" + i}>{b.title}</h2>
            <p className="ov-sub">{b.sub}</p>
            {b.note ? <p className="ov-card-note">{b.note}</p> : null}
            <ul className="ov-list">
              {b.items.map((r) => (
                <ListRow key={r} refId={r} />
              ))}
            </ul>
            <ViewAll b={b} onGroup={onGroup} />
            {b.photo ? <Photo photo={b.photo} className="ov-card-photo" /> : null}
            {b.feature ? <span className="ov-card-grid" aria-hidden="true" /> : null}
          </section>
        ))}
      </div>

      <section className="ov-good" aria-labelledby="ov-good-title">
        <div className="ov-good-intro">
          <p className="ov-kicker">{good.kicker}</p>
          <h2 id="ov-good-title">{good.title}</h2>
          <p>{good.lede}</p>
        </div>
        <ul className="ov-good-list">
          {good.items.map((g) => {
            const inner: ReactNode = (
              <>
                <span className="ov-good-icon">
                  <svg className={g.icon.startsWith("i-m-") ? "emblem" : "icon"} aria-hidden="true">
                    <use href={"#" + g.icon} />
                  </svg>
                </span>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
              </>
            );
            return <li key={g.title}>{g.href ? <a href={g.href}>{inner}</a> : <Fragment>{inner}</Fragment>}</li>;
          })}
        </ul>
      </section>
    </div>
  );
}
