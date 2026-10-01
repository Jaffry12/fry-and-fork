// Run:  node tools/build_showcase.js
//
// Builds the static site's menu showcase (home page) from the same config as the Next.js
// component (fry-and-fork-next/src/data/menu-showcase.json) and the menu data (menu.js),
// replacing the home page's menu section. Mirrors src/components/MenuShowcase.tsx.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..') + path.sep;   // the project folder
global.window = {};
require(ROOT + 'website/js/menu.js');
const MENU = window.FF_MENU;
const SHOWCASE = JSON.parse(fs.readFileSync(ROOT + 'fry-and-fork-next/src/data/menu-showcase.json', 'utf8'));

const slug = s => s.replace(/¼/g, 'quarter').replace(/½/g, 'half').replace(/&/g, 'and').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmt = pence => '£' + (pence / 100).toFixed(2);
const pcsLabel = n => n + (n === 1 ? ' pc' : ' pcs');
const spoken = l => l.replace(/¼lb/g, 'quarter pound').replace(/½lb/g, 'half pound').replace(/"/g, ' inch').replace(/×/g, ' x');

const ITEMS = new Map(), CATS = new Map();
let dishes = 0;
for (const cat of MENU.categories) {
  CATS.set(cat.id, cat);
  for (const item of cat.items) {
    dishes++;
    item.options = Array.isArray(item.price) ? item.price.map((p, i) => ({ label: cat.sizes[i], pence: Math.round(p * 100) }))
      : item.opts ? item.opts.map(o => ({ label: o[0], pence: Math.round(o[1] * 100) }))
      : [{ label: '', pence: Math.round(item.price * 100) }];
    ITEMS.set(cat.id + '/' + slug(item.name), item);
  }
}
function toppings(desc) {
  const base = 'Homemade tomato sauce, mozzarella cheese';
  if (!desc.startsWith(base)) return desc;
  const rest = desc.slice(base.length).replace(/^(,| &| with)\s*/, '');
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}
function rowsOf(card) {
  return card.items.map(({ key, size, suffix }) => {
    const item = ITEMS.get(key);
    if (!item) throw new Error('Menu showcase: no dish "' + key + '" on the menu');
    const note = [item.pcs && item.pcs > 1 ? pcsLabel(item.pcs) : '', suffix || ''].filter(Boolean).join(', ');
    const shown = card.table ? item.options.map((o, i) => ({ o, i })) : [{ o: item.options[size || 0], i: size || 0 }];
    return { key, name: item.name, note, toppings: card.table ? toppings(item.desc || '') : '', prices: shown.map(({ o, i }) => ({ id: key + '#' + i, label: o.label, text: fmt(o.pence) })) };
  });
}

const I = n => ' '.repeat(n);
function deco(id) {
  if (id === 'burgers') return `${I(12)}<svg class="sc-deco sc-deco--burgers" viewBox="0 0 110 110" aria-hidden="true"><path class="sc-deco-dots" d="M4 28H32"/><path d="M40 34C70 36 98 56 108 106"/><use href="#i-spark" x="54" y="4" width="26" height="26"/></svg>\n`;
  if (id === 'kebabs') return `${I(12)}<svg class="sc-deco sc-deco--kebabs" viewBox="0 0 100 80" aria-hidden="true"><path class="sc-deco-dots" d="M4 12H40M4 21H40M4 30H40M4 39H40"/><path d="M46 2C76 8 96 36 98 76"/></svg>\n`;
  if (id === 'sides') return `${I(12)}<svg class="sc-deco sc-deco--sides" viewBox="0 0 100 60" aria-hidden="true"><use href="#i-spark" x="18" y="6" width="22" height="22"/><use href="#i-spark" x="2" y="36" width="9" height="9"/><path class="sc-deco-dots" d="M62 6H98"/><path d="M14 58C40 58 70 44 98 16"/></svg>\n`;
  return '';
}
function card(c, indent) {
  const rows = rowsOf(c);
  const sizes = c.table ? (CATS.get(c.section).sizes || []) : [];
  const p = I(indent);
  let h = `${p}<article class="sc-card sc-card--${c.id} reveal" data-sc-card="${c.id}" aria-labelledby="sc-${c.id}-title">\n`;
  if (c.photo) h += `${p}  <img class="sc-photo" src="images/${c.photo.src}.webp" width="${c.photo.w}" height="${c.photo.h}" loading="lazy" alt="${esc(c.photo.alt)}">\n`;
  h += deco(c.id).replace(/^ {12}/, p + '  ');
  h += `${p}  <div class="sc-body">\n${p}    <h3 id="sc-${c.id}-title">${esc(c.title)}</h3>\n`;
  const intro = `<p class="sc-sub">${esc(c.kicker)}</p>` + (c.desc ? `<p class="sc-desc">${esc(c.desc)}</p>` : '');
  if (c.table) {
    h += `${p}    <div class="sc-table-head">\n${p}      <div>${intro}</div>\n${p}      <div class="sc-sizes" aria-hidden="true">${sizes.map(s => `<span>${esc(s)}</span>`).join('')}</div>\n${p}    </div>\n`;
    h += `${p}    <table class="sc-table">\n${p}      <tbody>\n`;
    for (const r of rows) {
      h += `${p}        <tr><th scope="row"><span class="sc-name">${esc(r.name)}</span>${r.toppings ? `<span class="sc-toppings">${esc(r.toppings)}</span>` : ''}</th>` +
        r.prices.map(x => `<td><span class="visually-hidden">${esc(spoken(x.label))} </span><span data-price-of="${esc(x.id)}">${x.text}</span></td>`).join('') + '</tr>\n';
    }
    h += `${p}      </tbody>\n${p}    </table>\n`;
  } else {
    h += `${p}    ${intro}\n${p}    <ul class="sc-list">\n`;
    for (const r of rows) {
      h += `${p}      <li><span class="sc-name">${esc(r.name)}${r.note ? `<small> (${esc(r.note)})</small>` : ''}</span><span class="sc-dots" aria-hidden="true"></span><span class="sc-price" data-price-of="${esc(r.prices[0].id)}">${r.prices[0].text}</span></li>\n`;
    }
    h += `${p}    </ul>\n`;
  }
  h += `${p}    <a class="sc-btn" href="menu.html#cat-${c.section}">${esc(c.button)}<svg class="icon"><use href="#i-arrow-right"/></svg></a>\n${p}  </div>\n${p}</article>\n`;
  return h;
}

const [fish, ...rest] = SHOWCASE.cards;
const html = `    <!-- ============ Menu showcase ============ -->
    <!-- "From the Fryer to the Fork": a taste of the menu as the design's six cards. Built
         from fry-and-fork-next/src/data/menu-showcase.json and the menu data; prices are
         refreshed from js/menu.js on load. The full menu is on menu.html. -->
    <section class="section showcase" id="menu" aria-labelledby="showcase-title">
      <div class="container">
        <div class="sc-grid" data-sc-grid data-filter="all">
          <div class="sc-intro reveal">
            <p class="sc-kicker"><svg class="icon"><use href="#i-spark"/></svg>Our Menu</p>
            <h2 id="showcase-title">From the Fryer <em>to the Fork</em></h2>
            <p class="sc-lede">Golden fish suppers, fresh-dough pizza and proper pasta, all cooked to order. Here are a few favourites; the full menu has all <span data-dish-count>${dishes}</span> dishes.</p>
            <a class="sc-full" href="menu.html">View Full Menu<span class="sc-full-go"><svg class="icon"><use href="#i-arrow-right"/></svg></span></a>
            <svg class="sc-deco sc-deco--intro" viewBox="0 0 140 170" aria-hidden="true"><path class="sc-deco-dots" d="M72 4C104 12 126 38 128 72"/><path d="M128 60C130 116 80 156 6 160"/><use href="#i-spark" x="58" y="50" width="34" height="34"/><use href="#i-spark" x="114" y="126" width="18" height="18"/><use href="#i-spark" x="98" y="150" width="10" height="10"/></svg>
          </div>
          <div class="sc-top">
            <div class="sc-pills" role="group" aria-label="Show part of the menu">
${SHOWCASE.pills.map(p => `              <button class="sc-pill" type="button" aria-pressed="${p.id === 'all'}" data-sc-filter="${p.id}">${esc(p.label)}</button>`).join('\n')}
            </div>
${card(fish, 12)}          </div>
${rest.map(c => card(c, 10)).join('')}        </div>
      </div>
    </section>

`;

const p = ROOT + 'website/index.html';
let s = fs.readFileSync(p, 'utf8');
const start = s.includes('    <!-- ============ Menu showcase ============ -->') ? s.indexOf('    <!-- ============ Menu showcase ============ -->') : s.indexOf('    <!-- ============ Menu ============ -->');
const end = s.indexOf('    <!-- ============ Contact ============ -->');
if (start < 0 || end < 0) throw new Error('markers not found');
s = s.slice(0, start) + html + s.slice(end);
fs.writeFileSync(p, s);
console.log('showcase written:', SHOWCASE.cards.length, 'cards,', dishes, 'dishes on the menu');
