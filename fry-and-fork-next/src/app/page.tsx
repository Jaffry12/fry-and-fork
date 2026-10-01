import { Categories } from "@/components/Categories";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { IconSprite } from "@/components/Icon";
import { Kitchen } from "@/components/Kitchen";
import { Marquee } from "@/components/Marquee";
import { MenuShowcase } from "@/components/MenuShowcase";
import { MobileBar } from "@/components/MobileBar";
import { OrderDrawer } from "@/components/OrderDrawer";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Toast } from "@/components/Toast";
import { SITE } from "@/lib/site";

/** Search-engine details for the restaurant (schema.org). */
const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: SITE.name,
  slogan: "From Fryer to Fork",
  description: "Fish and chips, pizza, pasta, burgers, kebabs and homemade pakora in Kirkcaldy.",
  url: SITE.url,
  image: new URL("/images/og-image.jpg", SITE.url).toString(),
  logo: new URL("/icon-512.png", SITE.url).toString(),
  telephone: "+44 1592 264123",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.street,
    addressLocality: SITE.town,
    postalCode: SITE.postcode,
    addressCountry: "GB",
  },
  servesCuisine: ["Fish and chips", "Pizza", "Italian", "Burgers", "Kebabs"],
  priceRange: "£",
  paymentAccepted: "Credit card, Debit card",
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], opens: "15:00", closes: "22:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday", "Saturday"], opens: "15:00", closes: "23:30" },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }} />
      {/* The hero photo is the first thing seen; start fetching it straight away (React puts these in <head>). */}
      <link rel="preload" as="image" href="/images/hero-bg-1000.webp" media="(max-width: 700px)" />
      <link rel="preload" as="image" href="/images/hero-bg-1672.webp" media="(min-width: 701px)" />
      <a className="skip-link" href="#menu">
        Skip to the menu
      </a>
      <IconSprite />

      <Header />
      <main id="main">
        <Hero />
        <Marquee />
        <Categories />
        <Kitchen />
        <MenuShowcase />
        <Contact />
      </main>
      <Footer />

      <MobileBar />
      <OrderDrawer />
      <Toast />
      <RevealOnScroll />
    </>
  );
}
