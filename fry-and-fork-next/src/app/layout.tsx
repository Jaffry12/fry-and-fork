import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { OrderProvider } from "@/context/OrderContext";
import { StatusProvider } from "@/context/StatusContext";
import { SITE } from "@/lib/site";
import "./globals.css";

const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});
const manrope = localFont({
  src: "./fonts/manrope.woff2",
  weight: "400 800",
  variable: "--font-manrope",
  display: "swap",
});
const caveat = localFont({
  src: "./fonts/caveat.woff2",
  weight: "400 700",
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

const TITLE = "Fry & Fork | Fish & Chips, Pizza & Pasta in Kirkcaldy";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: TITLE,
  description:
    "Fry & Fork, 135 Link Street, Kirkcaldy. Fish suppers, pizza on fresh homemade dough, chef-cooked pasta, burgers, kebabs and homemade pakora. Open 7 days from 3pm. Call 01592 264123 to order.",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: TITLE,
    description: "From fryer to fork. Fish suppers, fresh-dough pizza and chef-cooked pasta on Link Street, Kirkcaldy. Open 7 days from 3pm.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1A2C",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${fraunces.variable} ${manrope.variable} ${caveat.variable}`}
      data-scroll-behavior="smooth"
      // Scripts below add classes/attributes to <html> before React loads.
      suppressHydrationWarning
    >
      <head>
        {/* Lets CSS hide the scroll-reveal blocks only when JavaScript is running. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <StatusProvider>
          <OrderProvider>{children}</OrderProvider>
        </StatusProvider>
      </body>
    </html>
  );
}
