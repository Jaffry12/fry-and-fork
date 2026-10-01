# Fry & Fork: Next.js website

The Fry & Fork website (135 Link Street, Kirkcaldy) built with **Next.js 16**, **React 19** and **TypeScript**. It looks and works exactly like the static version in `../website/`.

## Run it

You need [Node.js](https://nodejs.org) 20.9 or newer.

```bash
npm install        # first time only
npm run dev        # development, at http://localhost:3000 (updates as you edit)
```

To run it the way it will run live:

```bash
npm run build
npm start          # http://localhost:3000
```

`npm run lint` checks the code.

## Put it live

It's live on **[Vercel](https://vercel.com)** (made by the Next.js team) at https://fry-and-fork.vercel.app. The Vercel project `fry-and-fork` builds this folder (its **Root Directory** is `fry-and-fork-next`) from the GitHub repository Jaffry12/fry-and-fork.

- **Updating it:** once the repository is connected to the project (on Vercel: the project's **Settings → Git**), every push to `main` deploys automatically. Without that connection, run `vercel deploy --prod` from the repository root.
- **Share picture and search-engine details** use the project's production address on their own (https://fry-and-fork.vercel.app, or the shop's domain once it's added). To use a different address, set `NEXT_PUBLIC_SITE_URL` under **Settings → Environment Variables** and redeploy. See `.env.example`.
- **The shop's domain:** add it under **Settings → Domains**.
- **Plan:** Vercel's free Hobby plan is for non-commercial use only. A business's live site needs the Pro plan (or a Vercel account of the shop's own on Pro).

Netlify and any Node.js host also work (`npm run build` then `npm start`).

## Changing things

| To change | Edit |
|---|---|
| Prices or dishes | `../tools/build_menu.py` (printed prices), then run `npm run menu`. It applies the website discount and rewrites `src/data/menu.ts` (and the static site's `menu.js`). |
| Opening hours | `HOURS` in `src/lib/hours.ts`, the table in `src/components/Visit.tsx` and the footer in `src/components/Footer.tsx` |
| Phone, address | `src/lib/site.ts` |
| Colours, spacing, fonts | the tokens at the top of `src/app/globals.css` |
| Photos | `public/images/` (keep the same file names and shapes) |

## How it's built

```
src/
  app/
    layout.tsx       fonts (next/font), page title, social-share and icon metadata
    page.tsx         the page: all sections in order, plus search-engine data
    globals.css      all styles (same stylesheet as the static site)
    fonts/           Fraunces, Manrope, Caveat (self-hosted)
  components/        one file per section: Header, Hero, Marquee, Categories, Kitchen,
                     MenuSection + MenuBoard, Visit, Footer, MobileBar, OrderDrawer, Toast
  context/
    OrderContext     the "Your order" list (kept in the visitor's browser only)
    StatusContext    live "Open now / Closed" status, always UK time
  data/menu.ts       GENERATED menu data with website prices
  lib/               menu helpers and search, opening hours, site details
public/              images, favicon, app icons, web manifest
```

The page is pre-rendered as static HTML at build time, so it loads fast and search engines see the full menu. The interactive parts (menu tabs, search, order list, open/closed status, map) run in the browser.
