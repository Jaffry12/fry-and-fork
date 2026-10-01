import Image from "next/image";
import { Icon } from "@/components/Icon";
import { StatusLong } from "@/context/StatusContext";
import { SITE } from "@/lib/site";

/** Full-screen photo hero: copy on the dark left, a glass strip of three promises,
 *  a scroll cue and a handwritten note. The header floats over it. */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* The photo is already sized for each screen, so it is served as it is. */}
      <div className="hero-bg" aria-hidden="true">
        <picture>
          <source media="(max-width: 700px)" srcSet="/images/hero-bg-1000.webp" />
          <img src="/images/hero-bg-1672.webp" width={1672} height={941} alt="" fetchPriority="high" />
        </picture>
      </div>
      <Image className="hero-sprig" src="/images/hero-sprig.svg" width={360} height={330} alt="" aria-hidden="true" loading="eager" />

      <div className="container">
        <div className="hero-copy">
          <p className="hero-kicker">
            Good Food <span aria-hidden="true">•</span> Great Company
          </p>
          <h1 id="hero-title">
            <span className="visually-hidden">Fry &amp; Fork, fish &amp; chips, pizza &amp; pasta in Kirkcaldy: </span>
            <span className="line">A Culinary</span>
            <em className="line">Experience</em>
            <span className="line">Like No Other</span>
          </h1>
          <p className="hero-lede">Fresh ingredients, bold flavours and golden fish suppers come together in our kitchen on Link Street, Kirkcaldy.</p>
          <div className="hero-ctas">
            <a className="btn btn-sand" href="#menu">
              Explore Our Menu
              <Icon id="i-arrow-right" />
            </a>
            <a className="btn btn-hero-outline" href={SITE.phoneHref}>
              Call to Order
              <Icon id="i-arrow-right" />
            </a>
          </div>
        </div>
        <ul className="hero-features">
          <li>
            <Icon id="i-leaf" />
            <b>Fresh Ingredients</b>
            <span>Homemade dough &amp; sauce</span>
          </li>
          <li>
            <Icon id="i-chef" />
            <b>Expert Chef</b>
            <span>Pasta &amp; risotto made fresh</span>
          </li>
          <li>
            <Icon id="i-clock" />
            <b>Open 7 Days</b>
            <StatusLong />
          </li>
        </ul>
      </div>

      <a className="hero-scroll" href="#explore">
        <span className="hero-scroll-mouse" aria-hidden="true" />
        Scroll down
      </a>
      {/* A box the same shape as the photo, so the note always sits under the plate */}
      <div className="hero-frame" aria-hidden="true">
        <p className="hero-note">
          Good Food
          <br />
          Brings People
          <br />
          Together
          <svg viewBox="0 0 120 16">
            <path d="M4 11c30-8 70-10 112-4" />
          </svg>
        </p>
      </div>
    </section>
  );
}
