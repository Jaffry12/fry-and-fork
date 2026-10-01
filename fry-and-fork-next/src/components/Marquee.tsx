import { Fragment } from "react";
import { Icon } from "@/components/Icon";

const WORDS = ["Fish suppers", "Fresh-dough pizza", "Chef-cooked pasta", "Pounder burgers", "Kebabs & wraps", "Homemade pakora", "Haggis suppers", "Risotto"];

/** The scrolling line of specialities under the hero (decorative, so hidden from screen readers). */
export function Marquee() {
  const group = (
    <div className="marquee-group">
      {WORDS.map((w) => (
        <Fragment key={w}>
          <span>{w}</span>
          <Icon id="i-spark" />
        </Fragment>
      ))}
    </div>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {group}
        {group}
      </div>
    </div>
  );
}
