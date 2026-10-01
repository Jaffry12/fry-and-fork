export const SITE = {
  name: "Fry & Fork",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "01592 264123",
  phoneHref: "tel:+441592264123",
  street: "135 Link Street",
  town: "Kirkcaldy",
  postcode: "KY1 1QR",
  // The shop's exact spot (OpenStreetMap), so directions land on the door.
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=56.102605%2C-3.161252",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=56.102605%2C-3.161252",
  // Where the contact form posts messages as JSON (a form service such as Formspree).
  // Until it's set, sending asks the visitor to call instead.
  contactEndpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "",
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
