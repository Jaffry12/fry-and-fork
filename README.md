# Fry & Fork website

> **Two versions, same design:**
> - **`fry-and-fork-next/`**: the **Next.js** version, live on Vercel at https://fry-and-fork.vercel.app. See its own README.
> - **`website/`**: the original plain HTML/CSS/JS version, kept as a backup and live on GitHub Pages at https://jaffry12.github.io/fry-and-fork/. It needs no installation.
>
> The rest of this file describes the design and the static version. Both versions get their menu data from `tools/build_menu.py`.

A one-page website for **Fry & Fork**, 135 Link Street, Kirkcaldy KY1 1QR (01592 264123).

It's plain HTML, CSS and JavaScript, with no framework and no build step. The whole site is the `website/` folder (about 2.4 MB).

## What's on the page

- **Hero**: a full-screen photo (`images/hero-bg-*.webp`, from the image supplied by the client) with the header floating over it. "Good food • Great company", the headline "A Culinary *Experience* Like No Other", "Explore Our Menu" and "Call to Order" buttons, a glass strip of three promises (fresh ingredients, expert chef, open 7 days with the live open/closed status), a scroll cue and a handwritten "Good Food Brings People Together". The header is see-through at the top and turns into a dark bar as you scroll; its links underline the section being read.
- **Our menu** ("Something for Every Craving"): the client's design: intro with a gold line drawing of a fork twirling spaghetti, a large Fish & Chips feature with a "British classics" stamp (a small fish at its centre) and handwritten notes, then Pizza, Pasta, Burgers, Meal Deals and Sides & Extras as tilted, gold-trimmed photo cards with Explore buttons. The photos are `images/menu-*.webp`, cut from the design; each keeps its tilted frame through an SVG clip path. On laptops and desktops (1000px+) the whole design scales evenly to fit one screen below the header; tablets show a grid and phones compact rows. Each card opens its section of the menu. The design's leaves were swapped for Fry & Fork's own gold ornaments (the fork, the fish, and a different line drawing on each card: a pizza slice, a wedge of parmesan, a grill flame, a drink cup and a carton of chips); leaves that were printed on the burger and meal-deal photos were painted out.
- **Our kitchen** ("Passion Behind Every Plate"): a gold sprig and "OUR KITCHEN" label, the heading, a short paragraph, four promises with round icons (fresh ingredients, expert chef, homemade goodness, authentic flavours) and a "Discover Our Menu" button. On the right, a collage of the client's three photos (`images/kitchen-chef-*`, `kitchen-pasta-dish-*`, `kitchen-basil-*`) in gold frames, with a round "Food brings people together" stamp, line-drawn sprigs and two handwritten notes. The collage is laid out in percentages of its own box, so it scales as one piece; on tablets and phones it sits under the text.
- **Menu showcase** ("From the Fryer to the Fork"): the client's design on the home page. An intro with a "View Full Menu" button, pills that pick out one part of the menu (the other cards fade back), and six cards with a few dishes each: Fish & Chips and Pizza & Italian (a 10"/12"/16" price table) with photos, Burgers & Rolls, Kebabs & Chicken, Sides & Extras, and Kids Meals. The photos (`images/showcase-*.webp`) are cut from the design. Names and prices come from the menu data, so they always match the full menu: Fish & Chips shows supper prices (with chips), burgers the ¼lb price, chicken the single price. Each card's "View All" button opens that section of the full menu.
- **Full menu page** (`menu.html`; `/menu` in the Next.js version), after the client's two designs. All 18 sections and 189 dishes from the printed menu:
  - a "Made Fresh. *Served Properly.*" hero, then a sticky bar of pills (All, Fish Bar, Pizzas, Calzones, Burgers, Kebabs, Chicken, Rolls, Sides, Kids, Italian, Veggie, Meal Deals, Desserts, Drinks) and a search box
  - **All** shows the overview: Fish & Chips with a Single / Supper price table, a dark "Most Loved at Fry & Fork" band, Pizza & Italian with a 10"/12"/16" table, Burgers & Rolls and Kebabs & Chicken with tall photos, Sides / Kids / Italian cards and "Good to Know"; each block's "View All" button opens its pill
  - every other pill shows its dishes in full, under a heading with the section's gold line emblem: each dish has its sizes to pick from (Single | Supper, 10" / 12" / 16", the meal deal options), a quantity stepper and an **Add** button
  - search (e.g. "haggis", "pepperoni", "12 inch", "veggie", "spicy") looks across the whole menu and groups the matches
  - links such as `menu.html#cat-pizza` (`/menu#cat-pizza`) open that section directly; the home page's photo cards, showcase buttons, "Meal deals" link and footer menu links all use them
  - it ends with the allergens, then the footer as a single band (the home page's "Good Food. Good Mood." call to order is left out, since this page already offers Call to Order), exactly as tall as the page's hero on laptops and desktops; on phones a "View Order" bar sits at the bottom of the screen (in place of the home page's Call / Your order bar)
- **"Your Order" panel** (on both pages): each dish with a photo (or its section's gold emblem), quantity and a bin, a note for the shop ("no onions, extra cheese…"), the subtotal, then **Call to Order** and **Continue Ordering**. The list and note are saved on the visitor's device and never sent anywhere: the customer calls the shop and reads them out (the design's "Checkout" became "Call to Order" because the shop takes orders by phone). The header shows the running total beside the bag.
- **Allergen notice** with the 14 allergens, at the foot of the full menu page.
- **Contact** ("We'd Love to Hear from You"): the client's design. Call Us, Opening Hours and Visit Us cards and a "View on Map" button on the left. On the right, a "Let's Talk" form (name, email, optional phone, subject, message) over the restaurant photo (`images/contact-bg-*.webp`, supplied by the client), cut with the design's rounded chevron edge. On laptops and desktops (1280px+) it fills one screen below the header; smaller screens stack it, with the photo framing the form. The form checks the required fields and has a hidden spam trap. See "Put it live" for switching it on. The design's "Email Us" card became Opening Hours because the shop has no email address yet.
- **Footer**: the client's design. A "Good Food. *Good Mood.*" call-to-order band with a handwritten "Fresh Food / Great Vibes" note, then the brand (gold olive sprig and wordmark), Quick Links, Our Menu (each link opens its section of the menu) and Get in Touch (address with directions, phone, hours), and a slim base bar with the allergen link, "Prices may vary", "Photos for illustration" and a back-to-top button. One olive-table photo (`images/footer-bg.webp`, from the image supplied by the client) runs behind the band and the main footer, dimmed where the text sits. On laptops and desktops (1000px+) the footer fills exactly one screen below the header; spare height goes mostly to the "Good Food" band, and the three columns sit at the top of the main footer. The design had Facebook, Instagram and Tripadvisor buttons; no official Fry & Fork accounts could be found, so those three round buttons are "Your order", "Full menu" and "Directions" for now. Send the real page links and they can be swapped in.
- On phones there's a **Call / Your order bar** fixed to the bottom of the screen.
- **SEO**: page title and description, a Restaurant schema (address, phone, hours) and a share image for WhatsApp and Facebook.

## Website prices (client instruction)

Every website price is lower than the printed menu:

| Printed price | Website price |
|---|---|
| £10.00 or more | £1.00 less (e.g. £11.49 becomes £10.49) |
| under £10.00 | 50p less (e.g. £6.99 becomes £6.49) |

Every size of every item follows this rule, including the meal deals, kids meals and the "add batter" extra (£1.00 becomes £0.50).

**`price-changes.csv`** lists all 294 prices: printed price, website price and the reduction. It opens in Excel and is useful for the owner to sign off or to update the till.

## Preview it

- **Quickest:** double-click `website/index.html`. Everything works. Opened this way, the fonts load from Google Fonts, because browsers block local font files on pages opened straight from disk.
- **Like the live site:** run `python -m http.server 8000` inside `website/` and open http://localhost:8000.

## Put it live

The Next.js version is live on Vercel at https://fry-and-fork.vercel.app; `fry-and-fork-next/README.md` explains how it deploys.

**This static version is live on GitHub Pages** at https://jaffry12.github.io/fry-and-fork/, from the repository github.com/Jaffry12/fry-and-fork. Every push to `main` runs `.github/workflows/pages.yml`, which publishes the `website/` folder in about a minute (progress is under the repository's **Actions** tab). Nothing is built: the folder goes up as it is, except that the workflow gives the share picture (`og:image`, and `image` and `logo` in the JSON-LD block) the site's full address, which link previews need. To move to the shop's own domain later, add it under the repository's **Settings → Pages → Custom domain**; the share picture's address follows automatically.

The folder works on any other static host too: upload the **contents of `website/`** to Netlify (drag the folder onto app.netlify.com/drop), Cloudflare Pages or ordinary cPanel hosting. There's nothing to install or build.

Once there's a domain, finish these:

1. Only if the site moves off GitHub Pages: in `index.html`, change `og:image` to the full address (e.g. `https://frynfork.co.uk/images/og-image.jpg`) so link previews show the picture, and make the same change for `image` and `logo` in the JSON-LD block. Then run `python tools/sync_menu_page.py` to copy it to `menu.html`.
2. The printed menu says "Phone & online orders welcome". If the shop is on Just Eat, Deliveroo or Uber Eats, add that link next to the Call buttons.
3. Link the new site from the shop's Google Business Profile.
4. Ask the owner to confirm the allergen wording and the opening hours.
5. **Switch on the contact form.** The site has no server of its own, so messages go through a form service such as Formspree (free for low volume). Sign up with the shop's email address, create a form, and copy its address (like `https://formspree.io/f/abcdwxyz`). Static site: put it in `data-endpoint=""` on the form in `index.html`. Next.js: set `NEXT_PUBLIC_CONTACT_ENDPOINT` to it and rebuild. Messages then arrive by email with the visitor's name, email, phone, subject and message. Until this is done, "Send Message" politely asks the visitor to call instead.

## Changing the menu or prices

All the menu data is in one file, **`website/js/menu.js`**. Edit a price there and it updates everywhere on the site (menu and order totals). The prices in that file are the final website prices.

You can also edit the **printed** prices in `tools/build_menu.py` and run:

```
python tools/build_menu.py
```

This re-applies the discount rule, regenerates `menu.js` and refreshes `price-changes.csv`. It **overwrites** `menu.js`, so use one method or the other. To change the rule itself, edit `web_price()` at the top of the script.

Opening hours are in two places: the `HOURS` line near the top of `website/js/app.js` (drives the open/closed status) and the hours text in `index.html` (hero, contact cards and footer).

**The full menu page's layout** (which pills there are, what each shows, their headings, and what the "All" overview lists) is in `fry-and-fork-next/src/data/menu-page.json`. Prices are never typed there. After changing it, run `node tools/build_menu_page.js`: it checks every dish named is on the menu and copies the layout for the static site (the Next.js version reads the file directly).

**The home page's menu showcase** picks its dishes from `fry-and-fork-next/src/data/menu-showcase.json` (which dish, and which size's price to show). Prices are never typed there: they come from the menu data, and the static page refreshes them from `menu.js` when it loads. After changing that file, run `node tools/build_showcase.js` to rebuild the static home page's copy of the section (the Next.js version reads it directly).

## Files

```
website/
  index.html            home page
  menu.html             full menu page (its header, footer and order drawer come from index.html)
  css/styles.css        all styles; brand colours are the tokens at the top
  js/menu.js            menu data and website prices
  js/menu-page.js       the full menu page's layout (made by tools/build_menu_page.js)
  js/app.js             the menu page, search, order list, open/closed status, contact form
  fonts/                Fraunces, Manrope, Caveat (self-hosted, SIL Open Font Licence)
  images/               logo cut-out, food photos (WebP), share image
  favicon.ico, icon-*.png, apple-touch-icon.png, site.webmanifest
tools/build_menu.py     printed-menu transcription + discount rule, regenerates menu.js
tools/build_showcase.js rebuilds the home page's menu showcase from menu-showcase.json
tools/build_menu_page.js checks menu-page.json against the menu and copies it to js/menu-page.js
tools/sync_menu_page.py copies the header, footer and order drawer from index.html into menu.html;
                        run it after changing anything outside <main> on the home page
price-changes.csv       printed vs website price for every item
.github/workflows/pages.yml  publishes website/ to GitHub Pages on every push to main
_source/                the original logo and menu photos from WhatsApp (kept on the
                        computer the site was built on; left out of the GitHub repository)
```

The brand colours were sampled from the logo: navy `#021223`, copper `#B86F30`, cream `#F1D9C3`.

## Photos

The photos on the page (hero, the six category cards, the kitchen collage and the footer backdrop) all come from images supplied by the client. The footer says "Photos for illustration". For the best result, replace them with real photos of Fry & Fork's own food, keeping the same file names and a similar shape.

The share picture (`images/og-image.jpg`, shown when the link is posted on WhatsApp or Facebook) is a stock photo from Unsplash, which is free for commercial use: Winston Tjia, https://unsplash.com/photos/a-white-plate-topped-with-fried-fish-and-fries-DyGo_AGOQwI

The earlier "Find us" section, with its own night map of Linktown drawn from OpenStreetMap data, was replaced by the Contact section. Its two map images are kept in `_source/map-night/` (not in the GitHub repository) in case they are wanted again (they would need the "© OpenStreetMap contributors" credit). Note: OpenStreetMap and Royal Mail list the street as **Links Street**; the printed menu says "Link Street", and the site text follows the menu.
