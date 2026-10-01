// Copies the full menu page's layout (fry-and-fork-next/src/data/menu-page.json) into
// website/js/menu-page.js for the static site, after checking every dish it names is on
// the menu. Run after changing that file:   node tools/build_menu_page.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..') + path.sep;
global.window = {};
require(ROOT + 'website/js/menu.js');
const MENU = window.FF_MENU;
const PAGE = JSON.parse(fs.readFileSync(ROOT + 'fry-and-fork-next/src/data/menu-page.json', 'utf8'));

const slug = s => s.replace(/¼/g, 'quarter').replace(/½/g, 'half').replace(/&/g, 'and').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const keys = new Map(), cats = new Set();
for (const c of MENU.categories) {
  cats.add(c.id);
  for (const i of c.items) keys.set(c.id + '/' + slug(i.name), Array.isArray(i.price) ? i.price.length : i.opts ? i.opts.length : 1);
}
const problems = [];
const check = ref => {
  const [key, n] = ref.split('#');
  if (!keys.has(key)) problems.push('no dish "' + key + '"');
  else if (n !== undefined && Number(n) >= keys.get(key)) problems.push('"' + ref + '" has no such size');
};
const seen = new Set();
for (const g of PAGE.groups) for (const c of g.cats) { if (!cats.has(c)) problems.push('no section "' + c + '"'); seen.add(c); }
for (const c of cats) if (!seen.has(c)) problems.push('section "' + c + '" is in no group');
const o = PAGE.overview;
[o.fish, o.pizza, ...o.pairs, ...o.cards].forEach(b => b.items.forEach(check));
o.loved.items.forEach(i => check(i.id));
if (problems.length) { console.error('menu-page.json:\n  ' + problems.join('\n  ')); process.exit(1); }

const { _about, ...data } = PAGE;
fs.writeFileSync(ROOT + 'website/js/menu-page.js',
  '/*\n * Fry & Fork — the full menu page\'s layout (pills, section headings, the "All" overview).\n' +
  ' * GENERATED from fry-and-fork-next/src/data/menu-page.json by tools/build_menu_page.js.\n */\n' +
  'window.FF_MENU_PAGE = ' + JSON.stringify(data, null, 1) + ';\n');
console.log('menu-page.js written:', PAGE.groups.length, 'groups; every dish found on the menu');
