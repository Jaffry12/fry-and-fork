/*
 * Fry & Fork — site behaviour.
 * Builds the full menu page from js/menu.js (dishes, prices) and js/menu-page.js (layout),
 * then wires up the pills, search, the order list (kept in localStorage) and the live
 * opening status.
 */
(function () {
  'use strict';

  var MENU = window.FF_MENU;
  if (!MENU) return;

  // Opening hours in minutes after midnight, UK time. Index 0 = Sunday.
  var HOURS = [[900, 1350], [900, 1350], [900, 1350], [900, 1350], [900, 1350], [900, 1410], [900, 1410]];
  var STORE_KEY = 'ff-order-v1';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(pence) { return '£' + (pence / 100).toFixed(2); }
  function slug(s) {
    return s.replace(/¼/g, 'quarter').replace(/½/g, 'half').replace(/&/g, 'and')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function norm(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/&/g, ' and ').replace(/[^a-z0-9"]+/g, ' ');
  }
  // How a size label should be read aloud / searched ('12"' -> '12 inch').
  function spoken(label) {
    return label.replace(/¼lb/g, 'quarter pound').replace(/½lb/g, 'half pound')
      .replace(/"/g, ' inch').replace(/×/g, ' x');
  }
  function icon(id) { return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  var TAGS = {
    v: { label: 'Veg', icon: 'i-leaf', words: 'vegetarian veggie veg' },
    hot: { label: 'Spicy', icon: 'i-chilli', words: 'spicy hot chilli' },
    'new': { label: 'New', icon: 'i-spark', words: 'new' },
    chef: { label: "Chef's pick", icon: 'i-chef', words: 'chef pick favourite' }
  };

  /* ---------------------------------------------------------------------------
   * Index the menu
   * ------------------------------------------------------------------------- */
  var ITEMS = new Map();   // "pizza/margherita" -> item
  var CATS = new Map();    // "pizza" -> category

  MENU.categories.forEach(function (cat) {
    CATS.set(cat.id, cat);
    cat.items.forEach(function (item) {
      item.cat = cat;
      item.key = cat.id + '/' + slug(item.name);
      item.tagSet = new Set(item.tags || []);
      if (item.opts) {
        item.options = item.opts.map(function (o) { return { label: o[0], pence: Math.round(o[1] * 100) }; });
      } else if (Array.isArray(item.price)) {
        item.options = item.price.map(function (p, i) { return { label: cat.sizes[i], pence: Math.round(p * 100) }; });
      } else {
        item.options = [{ label: '', pence: Math.round(item.price * 100) }];
      }
      item.search = norm([
        cat.name, cat.tab, item.name, item.desc || '', (item.includes || []).join(' '), item.flag || '',
        item.options.map(function (o) { return o.label + ' ' + spoken(o.label) + (o.label === 'Supper' ? ' with chips' : ''); }).join(' '),
        (item.tags || []).map(function (t) { return TAGS[t] ? TAGS[t].words : t; }).join(' ')
      ].join(' '));
      ITEMS.set(item.key, item);
    });
  });

  // Name used in the order list / toast, e.g. "Kids meal: Scampi", "Can (330ml)".
  function titleOf(item) {
    if (item.cat.id === 'kids') return 'Kids meal: ' + item.name;
    if (item.cat.id === 'drinks' && item.desc) return item.name + ' (' + item.desc + ')';
    return item.name;
  }
  function resolve(id) {
    var parts = String(id).split('#');
    var item = ITEMS.get(parts[0]);
    var opt = item && item.options[Number(parts[1])];
    return opt ? { item: item, opt: opt } : null;
  }
  function addLabel(item, opt) {
    return 'Add ' + titleOf(item) + (opt.label ? ', ' + spoken(opt.label) : '') + ', ' + fmt(opt.pence) + ', to your order';
  }

  /* ---------------------------------------------------------------------------
   * Full menu page: building blocks (layout from js/menu-page.js)
   * ------------------------------------------------------------------------- */
  var PAGE_DATA = window.FF_MENU_PAGE || null;
  var GROUPS = PAGE_DATA ? PAGE_DATA.groups : [];
  var GROUP_OF = {};   // menu section -> the pill that shows it
  GROUPS.forEach(function (g) { g.cats.forEach(function (c) { GROUP_OF[c] = g.id; }); });

  // Gold line emblems, used where a section has no photo (headings, the order list).
  var EMBLEMS = {
    deals: 'i-m-bag', fish: 'i-fish', chips: 'i-fries', pizza: 'i-slice', calzones: 'i-m-calzone', pasta: 'i-m-pasta',
    risotto: 'i-m-risotto', 'italian-sides': 'i-m-bread', burgers: 'i-m-burger', kebabs: 'i-m-kebab', chicken: 'i-m-chicken',
    pakora: 'i-m-pakora', rolls: 'i-m-roll', vegetarian: 'i-m-leaf', sides: 'i-m-rings', kids: 'i-m-lolly',
    desserts: 'i-m-icecream', drinks: 'i-cup'
  };
  function emblemSvg(catId) {
    return '<svg class="emblem" aria-hidden="true"><use href="#' + (EMBLEMS[catId] || 'i-spark') + '"/></svg>';
  }
  function tagHtml(t) {
    var tag = TAGS[t];
    return tag ? '<span class="tag tag-' + t + '">' + icon(tag.icon) + tag.label + '</span>' : '';
  }
  function pcsText(item) { return item.pcs ? item.pcs + (item.pcs === 1 ? ' pc' : ' pcs') : ''; }
  function photoHtml(photo, cls) {
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="images/' + photo.src + '.webp" width="' + photo.w + '" height="' + photo.h + '" alt="' + esc(photo.alt || '') + '" loading="lazy">';
  }
  // "pizza/margherita#1" (a size) or "pizza/margherita" (its first price)
  function pickRef(r) {
    var parts = r.split('#');
    return { item: ITEMS.get(parts[0]), n: parts[1] === undefined ? 0 : Number(parts[1]), sized: parts[1] !== undefined };
  }
  function nameHtml(item, note) { return esc(item.name) + (note ? ' <small>(' + esc(note) + ')</small>' : ''); }
  function noteHtml(note, cls) {
    return '<p class="' + cls + '" aria-hidden="true">' + note.split('|').map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('') + '</p>';
  }
  function viewAllHtml(group, label) {
    return '<button class="ov-btn" type="button" data-group="' + group + '">' + esc(label) + icon('i-arrow-right') + '</button>';
  }
  function titleBlock(b, id) {
    return (b.kicker ? '<p class="ov-kicker">' + esc(b.kicker) + '</p>' : '') + '<h2 id="' + id + '">' + esc(b.title) + '</h2>' +
      (b.sub ? '<p class="ov-sub">' + esc(b.sub) + '</p>' : '');
  }
  // a short priced line: name ....... £0.00
  function listRow(r) {
    var x = pickRef(r), item = x.item, opt = item.options[x.n];
    var note = item.pcs > 1 ? pcsText(item) : '';
    return '<li><span class="ov-name">' + nameHtml(item, note) + '</span><span class="ov-dots" aria-hidden="true"></span>' +
      '<span class="ov-price" data-price-of="' + item.key + '#' + x.n + '">' + fmt(opt.pence) + '</span></li>';
  }

  /* ---- the "All" overview ---- */
  function ovFish(b) {
    var cat = ITEMS.get(b.items[0]).cat;
    return '<section class="ov-fish" aria-labelledby="ov-fish-title">' +
      '<div class="ov-intro">' + titleBlock(b, 'ov-fish-title') + '<p class="ov-desc">' + esc(b.desc) + '</p>' + viewAllHtml(b.group, b.button) + '</div>' +
      '<table class="ov-table"><thead><tr><td></td>' + cat.sizes.map(function (sz) { return '<th scope="col">' + esc(sz) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      b.items.map(function (k) {
        var item = ITEMS.get(k);
        return '<tr><th scope="row"><span class="ov-line"><span class="ov-name">' + nameHtml(item, item.pcs > 1 ? pcsText(item) : '') + '</span><span class="ov-dots" aria-hidden="true"></span></span></th>' +
          item.options.map(function (o, i) { return '<td data-price-of="' + item.key + '#' + i + '">' + fmt(o.pence) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table>' +
      '<figure class="ov-photo">' + photoHtml(b.photo) + '</figure></section>';
  }
  function ovLoved(b) {
    return '<section class="ov-loved" aria-labelledby="ov-loved-title"><div class="ov-loved-intro"><p class="ov-kicker">' + esc(b.kicker) + '</p>' +
      '<h2 id="ov-loved-title">' + esc(b.title) + ' <em>' + esc(b.titleEm) + '</em></h2><p>' + esc(b.lede) + '</p></div>' +
      '<ul class="ov-loved-list">' + b.items.map(function (it) {
        var hit = resolve(it.id);
        return '<li><a class="ov-loved-card" href="#cat-' + hit.item.cat.id + '">' + photoHtml({ src: it.photo.src, w: it.photo.w, h: it.photo.h, alt: '' }) +
          '<span class="ov-loved-name">' + esc(it.name) + '</span><span class="ov-loved-price" data-price-of="' + it.id + '">' + fmt(hit.opt.pence) + '</span></a></li>';
      }).join('') + '</ul></section>';
  }
  function ovPizza(b) {
    var cat = ITEMS.get(b.items[0]).cat;
    return '<section class="ov-pizza" aria-labelledby="ov-pizza-title"><div class="ov-pizza-copy">' +
      '<div class="ov-pizza-head"><div>' + titleBlock(b, 'ov-pizza-title') + '</div>' +
      '<div class="ov-sizes" aria-hidden="true">' + cat.sizes.map(function (sz) { return '<span>' + esc(sz) + '</span>'; }).join('') + '</div></div>' +
      '<ul class="ov-plist">' + b.items.map(function (k) {
        var item = ITEMS.get(k);
        return '<li><span class="ov-name">' + esc(item.name) + '</span><span class="ov-dots" aria-hidden="true"></span>' +
          item.options.map(function (o, i) { return '<span class="ov-price"><span class="visually-hidden">' + esc(spoken(o.label)) + ' </span><span data-price-of="' + item.key + '#' + i + '">' + fmt(o.pence) + '</span></span>'; }).join('') +
          (item.desc ? '<span class="ov-pdesc">' + esc(item.desc) + '</span>' : '') + '</li>';
      }).join('') + '</ul>' + viewAllHtml(b.group, b.button) + '</div>' +
      '<figure class="ov-pizza-photo">' + photoHtml(b.photo) + (b.note ? noteHtml(b.note, 'ov-note') : '') + '</figure></section>';
  }
  function ovPair(b, i) {
    return '<section class="ov-pair" aria-labelledby="ov-pair-' + i + '"><div class="ov-pair-copy">' + titleBlock(b, 'ov-pair-' + i) +
      '<ul class="ov-list">' + b.items.map(listRow).join('') + '</ul>' + viewAllHtml(b.group, b.button) + '</div>' +
      '<figure class="ov-tall">' + photoHtml(b.photo) + '</figure></section>';
  }
  function ovCard(b, i) {
    return '<section class="ov-card' + (b.feature ? ' ov-card--feature' : '') + '" aria-labelledby="ov-card-' + i + '">' +
      '<h2 id="ov-card-' + i + '">' + esc(b.title) + '</h2><p class="ov-sub">' + esc(b.sub) + '</p>' +
      (b.note ? '<p class="ov-card-note">' + esc(b.note) + '</p>' : '') +
      '<ul class="ov-list">' + b.items.map(listRow).join('') + '</ul>' + viewAllHtml(b.group, b.button) +
      (b.photo ? photoHtml(b.photo, 'ov-card-photo') : '') + (b.feature ? '<span class="ov-card-grid" aria-hidden="true"></span>' : '') + '</section>';
  }
  function ovGood(b) {
    return '<section class="ov-good" aria-labelledby="ov-good-title"><div class="ov-good-intro"><p class="ov-kicker">' + esc(b.kicker) + '</p>' +
      '<h2 id="ov-good-title">' + esc(b.title) + '</h2><p>' + esc(b.lede) + '</p></div><ul class="ov-good-list">' +
      b.items.map(function (g) {
        var inner = '<span class="ov-good-icon"><svg class="' + (g.icon.indexOf('i-m-') === 0 ? 'emblem' : 'icon') + '" aria-hidden="true"><use href="#' + g.icon + '"/></svg></span>' +
          '<h3>' + esc(g.title) + '</h3><p>' + esc(g.text) + '</p>';
        return '<li>' + (g.href ? '<a href="' + g.href + '">' + inner + '</a>' : inner) + '</li>';
      }).join('') + '</ul></section>';
  }

  /* ---- a pill's detail view: every dish, with sizes, quantity and Add ---- */
  function rowHtml(item, table, h) {
    var id0 = item.key + '#0', opt0 = item.options[0];
    var several = item.options.length > 1;
    var desc = item.includes ? item.includes.join(' · ') : [item.flag || '', item.desc || ''].filter(Boolean).join(' ');
    var info = '<div class="mrow-info"><div class="mrow-top"><' + h + ' class="mrow-name">' + esc(item.name) +
      (item.pcs ? ' <small>(' + pcsText(item) + ')</small>' : '') + (item.tags || []).map(tagHtml).join('') + '</' + h + '>' +
      (several ? '' : '<span class="mrow-dots" aria-hidden="true"></span><b class="mrow-price" data-price-of="' + id0 + '">' + fmt(opt0.pence) + '</b>') + '</div>' +
      (desc ? '<p class="mrow-desc">' + esc(desc) + '</p>' : '') +
      (several && !table ? '<div class="mrow-opts" role="radiogroup" aria-label="Choose ' + (item.opts ? 'an option' : 'a size') + ' for ' + esc(item.name) + '">' +
        item.options.map(function (o, i) {
          return (i ? '<span class="mrow-sep" aria-hidden="true">|</span>' : '') + '<button class="mrow-opt" type="button" role="radio" aria-checked="' + (i === 0) + '" data-pick="' + i + '">' +
            '<span>' + esc(o.label) + '</span><b data-price-of="' + item.key + '#' + i + '">' + fmt(o.pence) + '</b></button>';
        }).join('') + '<span class="mrow-dots" aria-hidden="true"></span></div>' : '') + '</div>';
    var cells = table ? '<div class="mrow-cells" role="radiogroup" aria-label="Choose a size for ' + esc(item.name) + '">' +
      item.options.map(function (o, i) {
        return '<button class="mrow-cell" type="button" role="radio" aria-checked="' + (i === 0) + '" data-pick="' + i + '" aria-label="' + esc(spoken(o.label)) + ', ' + fmt(o.pence) + '">' +
          '<small class="mrow-cell-size" aria-hidden="true">' + esc(o.label) + '</small><span data-price-of="' + item.key + '#' + i + '">' + fmt(o.pence) + '</span></button>';
      }).join('') + '</div>' : '';
    var nm = esc(item.name + (opt0.label && !item.opts ? ', ' + spoken(opt0.label) : ''));
    var stepper = table ? '' : '<div class="stepper"><button type="button" data-dec="' + id0 + '" aria-label="One fewer ' + nm + '" disabled>' + icon('i-minus') + '</button>' +
      '<output data-qty-of="' + id0 + '" aria-label="Number in your order">0</output>' +
      '<button type="button" data-inc="' + id0 + '" aria-label="One more ' + nm + '">' + icon('i-plus') + '</button></div>';
    return '<li class="mrow' + (table ? ' mrow--table' : '') + '" data-key="' + item.key + '" data-sel="0">' + info + cells +
      '<div class="mrow-buy">' + stepper + '<button class="mrow-add" type="button" data-add="' + id0 + '" aria-label="' + esc(addLabel(item, opt0)) + '">Add</button></div></li>';
  }
  function catHtml(cat, multi) {
    var table = !!cat.sizes && cat.sizes.length > 2;
    var bandRow = table ? '<div class="mrow-band-row"><span></span><div class="mrow-band-sizes">' +
      cat.sizes.map(function (sz) { return '<span>' + esc(sz) + '</span>'; }).join('') + '</div><span></span></div>' : '';
    return '<section class="menu-cat" id="cat-' + cat.id + '" tabindex="-1" aria-label="' + esc(cat.name) + '">' +
      (multi ? '<header class="mc-head"><span class="mc-emblem">' + emblemSvg(cat.id) + '</span><div><h3>' + esc(cat.name) + '</h3>' + (cat.note ? '<p>' + esc(cat.note) + '</p>' : '') + '</div></header>' : '') +
      (table ? '<div class="mrow-band" aria-hidden="true">' + bandRow + bandRow + '</div>' : '') +
      '<ul class="mrows' + (table ? ' mrows--table' : '') + '">' + cat.items.map(function (item) { return rowHtml(item, table, multi ? 'h4' : 'h3'); }).join('') + '</ul></section>';
  }
  function groupHtml(g) {
    var multi = g.cats.length > 1;
    return '<section class="mg" id="group-' + g.id + '" data-group-section="' + g.id + '" aria-labelledby="mg-' + g.id + '-title" hidden>' +
      '<header class="mg-head"><div class="mg-intro"><p class="mg-kicker">' + esc(g.kicker) + '</p>' +
      '<h2 id="mg-' + g.id + '-title">' + esc(g.title) + '</h2><p class="mg-sub">' + esc(g.sub) + '</p><p class="mg-desc">' + esc(g.desc) + '</p></div>' +
      '<span class="mg-emblem" aria-hidden="true">' + emblemSvg(g.cats[0]) + '</span></header>' +
      g.cats.map(function (c) { return catHtml(CATS.get(c), multi); }).join('') + '</section>';
  }

  var header = $('.site-header');
  // The full menu page (menu.html) says so on <body>; the home page has the showcase instead.
  var PAGE = document.body.getAttribute('data-page') || 'home';

  // Prices elsewhere on the page come from the same data.
  $$('[data-price-of]').forEach(function (el) {
    var hit = resolve(el.getAttribute('data-price-of'));
    if (hit) el.textContent = fmt(hit.opt.pence);
  });
  $$('[data-count-of]').forEach(function (el) {
    var cat = CATS.get(el.getAttribute('data-count-of'));
    if (cat) el.textContent = cat.items.length;
  });
  $$('[data-from]').forEach(function (card) {
    var min = Infinity;
    card.getAttribute('data-from').split(',').forEach(function (id) {
      var cat = CATS.get(id.trim());
      if (cat) cat.items.forEach(function (i) { i.options.forEach(function (o) { min = Math.min(min, o.pence); }); });
    });
    if (min === Infinity) return;
    var label = $('[data-from-label]', card);
    if (label) label.textContent = 'from ' + fmt(min);
    var price = $('[data-from-price]', card);
    if (price) price.textContent = fmt(min);
  });
  $$('[data-dish-count]').forEach(function (el) { el.textContent = ITEMS.size; });

  /* ---------------------------------------------------------------------------
   * Home page menu showcase: a pill picks out one card and the others fade back
   * ------------------------------------------------------------------------- */
  var scGrid = $('[data-sc-grid]');
  if (scGrid) {
    $$('[data-sc-filter]', scGrid).forEach(function (pill) {
      pill.addEventListener('click', function () {
        var id = pill.getAttribute('data-sc-filter');
        scGrid.setAttribute('data-filter', id);
        $$('[data-sc-filter]', scGrid).forEach(function (p) { p.setAttribute('aria-pressed', String(p === pill)); });
        var card = id !== 'all' && $('[data-sc-card="' + id + '"]', scGrid);
        if (card) card.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'instant' : 'smooth' });
      });
    });
  }

  // The footer on the full menu page is as tall as the page's hero (see .site-footer--menu).
  var mpHero = $('.mp-hero');
  if (mpHero) {
    var syncHeroHeight = function () { document.documentElement.style.setProperty('--mp-hero-h', mpHero.offsetHeight + 'px'); };
    syncHeroHeight();
    if ('ResizeObserver' in window) new ResizeObserver(syncHeroHeight).observe(mpHero);
    else window.addEventListener('resize', syncHeroHeight);
  }

  /* ---------------------------------------------------------------------------
   * The full menu page: pills, search, and the two views
   * ------------------------------------------------------------------------- */
  var menuList = $('[data-menu-list]');
  var pickFromOrder = null;   // set below: shows each dish at the size already in the order
  if (menuList && PAGE_DATA) {
    var overview = $('[data-overview]');
    var pillsEl = $('[data-pills]');
    var menuSection = $('#menu');
    var OV = PAGE_DATA.overview;

    overview.innerHTML = ovFish(OV.fish) + ovLoved(OV.loved) + ovPizza(OV.pizza) +
      '<div class="ov-pairs">' + OV.pairs.map(ovPair).join('') + '</div>' +
      '<div class="ov-cards">' + OV.cards.map(ovCard).join('') + '</div>' + ovGood(OV.good);
    menuList.innerHTML = '<div class="results-head" data-results-head hidden><p data-results-count></p>' +
      '<button class="btn btn-quiet" type="button" data-reset-filters aria-label="Clear search">' + icon('i-x') + 'Clear</button></div>' +
      GROUPS.map(groupHtml).join('');
    pillsEl.innerHTML = '<button class="mp-pill" type="button" aria-pressed="true" data-group="all">All</button>' +
      GROUPS.map(function (g) { return '<button class="mp-pill" type="button" aria-pressed="false" data-group="' + g.id + '">' + esc(g.label) + '</button>'; }).join('');

    MENU.categories.forEach(function (cat) {
      cat.section = document.getElementById('cat-' + cat.id);
      cat.items.forEach(function (item) { item.el = $('[data-key="' + item.key + '"]', cat.section); });
    });
    GROUPS.forEach(function (g) {
      g.el = $('[data-group-section="' + g.id + '"]', menuList);
      g.pill = $('[data-group="' + g.id + '"]', pillsEl);
    });
    var allPill = $('[data-group="all"]', pillsEl);

    var searchInput = $('#menu-search');
    var searchClear = $('.search-clear');
    var emptyState = $('[data-menu-empty]');
    var menuStatus = $('[data-menu-status]');
    var resultsHead = $('[data-results-head]');
    var resultsCount = $('[data-results-count]');
    var view = 'all';
    var query = '';

    var STOP_WORDS = ['and', 'with', 'the', 'a', 'an', 'of', 'in', 'on', 'or', 'for', 'some', 'please'];
    // "veggie" means dishes the menu marks vegetarian, not anything with a "veg" pakora in it.
    var SYNONYMS = { veggie: 'vegetarian', chili: 'chilli', chilly: 'chilli', fries: 'chip' };
    function tokens(q) {
      return norm(q).split(' ').filter(function (t) { return t && STOP_WORDS.indexOf(t) === -1; }).map(function (t) {
        if (SYNONYMS[t]) return SYNONYMS[t];
        return t.length > 3 && /[^s]s$/.test(t) ? t.slice(0, -1) : t;   // plurals: chips -> chip
      });
    }

    // "All" shows the overview; a pill shows its sections; a search shows matches from everywhere.
    function render() {
      var toks = tokens(query);
      var searching = toks.length > 0;
      var total = 0;
      GROUPS.forEach(function (g) {
        var shown = 0;
        g.cats.forEach(function (c) {
          var cat = CATS.get(c), catShown = 0;
          cat.items.forEach(function (item) {
            var ok = !searching || toks.every(function (t) { return item.search.indexOf(t) !== -1; });
            item.el.hidden = !ok;
            if (ok) catShown++;
          });
          cat.section.hidden = catShown === 0;
          shown += catShown;
        });
        if (searching) total += shown;
        g.el.hidden = searching ? shown === 0 : g.id !== view;
      });
      overview.hidden = searching || view !== 'all';
      menuList.classList.toggle('is-results', searching);
      resultsCount.textContent = total === 1 ? '1 dish matches' : total + ' dishes match';
      resultsHead.hidden = !searching || total === 0;
      emptyState.hidden = !searching || total > 0;
      menuStatus.textContent = searching ? resultsCount.textContent : '';
      allPill.setAttribute('aria-pressed', String(!searching && view === 'all'));
      GROUPS.forEach(function (g) { g.pill.setAttribute('aria-pressed', String(!searching && g.id === view)); });
    }

    function scrollToY(y, instant) {
      window.scrollTo({ top: Math.max(0, y), behavior: instant || reduceMotion ? 'instant' : 'smooth' });
    }
    function stickyTop() { return header.offsetHeight + $('[data-menu-bar]').offsetHeight; }
    // Bring the top of the menu (the pill bar) up under the header, if the page is past it.
    function scrollToMenuTop(instant) {
      var top = menuSection.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
      if (window.scrollY > top + 2) scrollToY(top, instant);
    }
    function revealPill(pill) {
      if (pillsEl.scrollWidth <= pillsEl.clientWidth + 1) return;
      pillsEl.scrollTo({ left: Math.max(0, pill.offsetLeft - (pillsEl.clientWidth - pill.offsetWidth) / 2), behavior: reduceMotion ? 'instant' : 'smooth' });
    }
    function setHash(hash) {
      try { history.replaceState(null, '', hash || location.pathname + location.search); } catch (e) { /* not allowed in some file:// previews */ }
    }

    function clearSearch() {
      clearTimeout(searchTimer);
      searchInput.value = '';
      searchClear.hidden = true;
      query = '';
    }
    function setView(id, opts) {
      opts = opts || {};
      if (id !== 'all' && !GROUPS.some(function (g) { return g.id === id; })) return;
      clearSearch();
      view = id;
      render();
      revealPill(id === 'all' ? allPill : GROUPS.filter(function (g) { return g.id === id; })[0].pill);
      if (opts.hash !== false) setHash(id === 'all' ? '' : '#cat-' + GROUPS.filter(function (g) { return g.id === id; })[0].cats[0]);
      if (opts.scroll !== false) scrollToMenuTop(opts.instant);
    }
    // A section link (#cat-pizza): its pill's view, scrolled to that section.
    function goToCat(catId, opts) {
      opts = opts || {};
      var groupId = GROUP_OF[catId];
      if (!groupId) return;
      setView(groupId, { hash: false, scroll: false });
      if (opts.hash !== false && location.hash !== '#cat-' + catId) setHash('#cat-' + catId);
      var first = GROUPS.filter(function (g) { return g.id === groupId; })[0].cats[0] === catId;
      var target = first ? menuSection.getBoundingClientRect().top + window.scrollY - header.offsetHeight
        : CATS.get(catId).section.getBoundingClientRect().top + window.scrollY - stickyTop() - 12;
      scrollToY(target, opts.instant);
    }

    var searchTimer;
    searchInput.addEventListener('input', function () {
      searchClear.hidden = !searchInput.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { query = searchInput.value; render(); scrollToMenuTop(); }, 120);
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchInput.value) { e.preventDefault(); clearSearch(); render(); }
    });
    searchClear.addEventListener('click', function () { clearSearch(); render(); searchInput.focus(); });
    $$('[data-reset-filters]').forEach(function (btn) {
      btn.addEventListener('click', function () { clearSearch(); render(); searchInput.focus({ preventScroll: true }); });
    });

    // A size or option picked on a dish: its Add button, stepper and count follow it.
    function pick(row, n) {
      var item = ITEMS.get(row.getAttribute('data-key'));
      var opt = item.options[n];
      if (!opt) return;
      var id = item.key + '#' + n;
      row.setAttribute('data-sel', n);
      $$('[data-pick]', row).forEach(function (btn) { btn.setAttribute('aria-checked', String(Number(btn.getAttribute('data-pick')) === n)); });
      var add = $('.mrow-add', row);
      add.setAttribute('data-add', id);
      add.setAttribute('aria-label', addLabel(item, opt));
      var out = $('[data-qty-of]', row);
      if (out) {
        var nm = item.name + (opt.label && !item.opts ? ', ' + spoken(opt.label) : '');
        out.setAttribute('data-qty-of', id);
        $('[data-dec]', row).setAttribute('data-dec', id);
        $('[data-dec]', row).setAttribute('aria-label', 'One fewer ' + nm);
        $('[data-inc]', row).setAttribute('data-inc', id);
        $('[data-inc]', row).setAttribute('aria-label', 'One more ' + nm);
        syncQty();
      }
    }
    pickFromOrder = function (inOrder) {
      $$('.mrow', menuList).forEach(function (row) {
        var key = row.getAttribute('data-key');
        var n = ITEMS.get(key).options.findIndex(function (o, i) { return inOrder(key + '#' + i); });
        if (n > 0) pick(row, n);
      });
    };

    document.addEventListener('click', function (e) {
      var pickBtn = e.target.closest('[data-pick]');
      if (pickBtn && menuList.contains(pickBtn)) return pick(pickBtn.closest('.mrow'), Number(pickBtn.getAttribute('data-pick')));
      var groupBtn = e.target.closest('[data-group]');
      if (groupBtn) return setView(groupBtn.getAttribute('data-group'));
      // Links such as the category cards (#cat-fish), the footer and "Most loved" open that section.
      var link = e.target.closest('a[href^="#cat-"]');
      if (link && CATS.has(link.getAttribute('href').slice(5))) {
        e.preventDefault();
        goToCat(link.getAttribute('href').slice(5));
      }
    });

    // Back / forward, or an edited address, can also point at a section.
    window.addEventListener('hashchange', function () {
      var id = location.hash.indexOf('#cat-') === 0 ? location.hash.slice(5) : '';
      if (CATS.has(id)) goToCat(id, { hash: false });
    });

    render();
    var startId = location.hash.indexOf('#cat-') === 0 ? location.hash.slice(5) : '';
    if (CATS.has(startId)) {
      // The browser's own jump to #cat-… can land before the layout settles, so place it ourselves.
      var jump = function () { goToCat(startId, { hash: false, instant: true }); };
      requestAnimationFrame(jump);
      window.addEventListener('load', function () { requestAnimationFrame(jump); }, { once: true });
    }
  }

  // Header links follow the section being read ("Home" while the top of the page shows).
  var spyLinks = $$('.site-nav [data-spy]');
  function updateNavSpy() {
    var line = header.offsetHeight + window.innerHeight * 0.3;
    var current = PAGE === 'menu' ? 'menu' : 'top';
    if (PAGE === 'home') ['kitchen', 'menu', 'contact'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    });
    spyLinks.forEach(function (link) {
      if (link.getAttribute('data-spy') === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      updateNavSpy();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------------
   * Order list
   * ------------------------------------------------------------------------- */
  var order = [];
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if (Array.isArray(saved)) {
      order = saved.filter(function (l) {
        return l && resolve(l.id) && Number.isFinite(l.qty) && l.qty > 0;
      }).map(function (l) { return { id: l.id, qty: Math.min(99, Math.floor(l.qty)) }; });
    }
  } catch (e) { order = []; }

  function persist() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(order)); } catch (e) { /* private mode: keep in memory */ }
  }
  function totals() {
    return order.reduce(function (acc, l) {
      var hit = resolve(l.id);
      acc.count += l.qty;
      acc.pence += l.qty * hit.opt.pence;
      return acc;
    }, { count: 0, pence: 0 });
  }

  var dialog = $('#order-dialog');
  var linesEl = $('[data-order-lines]');
  var emptyEl = $('[data-order-empty]');
  var footEl = $('[data-order-foot]');
  var noteEl = $('[data-order-note]');
  var orderBtn = $('.order-btn');
  var NOTE_KEY = 'ff-order-note-v1';
  try { noteEl.value = localStorage.getItem(NOTE_KEY) || ''; } catch (e) { /* storage blocked */ }
  noteEl.addEventListener('input', function () {
    try { localStorage.setItem(NOTE_KEY, noteEl.value); } catch (e) { /* storage blocked */ }
  });

  function qtyOf(id) {
    var line = order.find(function (l) { return l.id === id; });
    return line ? line.qty : 0;
  }
  // The steppers on the menu show how many of that dish (at the chosen size) are in the order.
  function syncQty() {
    $$('[data-qty-of]').forEach(function (out) {
      var q = qtyOf(out.getAttribute('data-qty-of'));
      out.textContent = q;
      out.previousElementSibling.disabled = q === 0;
    });
  }
  // "Large Fish Supper", "Margherita 12"", "Meal Deal 2"
  function lineName(item, opt) { return titleOf(item) + (opt.label && !item.opts ? ' ' + opt.label : ''); }

  function renderOrder() {
    var t = totals();
    var summary = t.count ? t.count + (t.count === 1 ? ' item, ' : ' items, ') + fmt(t.pence) : 'empty';
    orderBtn.setAttribute('aria-label', 'Your order: ' + summary);
    $$('[data-order-count]').forEach(function (el) { el.textContent = t.count; el.hidden = !t.count; });
    $$('[data-order-count-text]').forEach(function (el) { el.textContent = '(' + t.count + ')'; el.hidden = !t.count; });
    $$('[data-order-summary]').forEach(function (el) { el.textContent = t.count + ' · ' + fmt(t.pence); el.hidden = !t.count; });
    $$('[data-order-sum]').forEach(function (el) { el.textContent = fmt(t.pence); el.hidden = !t.count; });
    $$('[data-order-total]').forEach(function (el) { el.textContent = fmt(t.pence); });
    $$('.mp-orderbar').forEach(function (el) { el.classList.toggle('is-empty', !t.count); });
    emptyEl.hidden = t.count > 0;
    footEl.hidden = t.count === 0;
    linesEl.innerHTML = order.map(function (l) {
      var hit = resolve(l.id);
      var item = hit.item, opt = hit.opt;
      var name = lineName(item, opt);
      var meta = [item.opts ? opt.label : '', pcsText(item)].filter(Boolean).map(esc).join(' · ');
      var thumb = PAGE_DATA && PAGE_DATA.thumbs[item.cat.id];
      return '<li class="order-line">' +
        '<span class="ol-thumb">' + (thumb ? '<img src="images/' + thumb + '.webp" width="64" height="64" alt="" loading="lazy">' : emblemSvg(item.cat.id)) + '</span>' +
        '<div class="ol-info"><p class="ol-name">' + esc(name) + '</p>' + (meta ? '<p class="ol-meta">' + meta + '</p>' : '') +
          '<div class="qty">' +
            '<button type="button" data-dec="' + l.id + '" aria-label="' + (l.qty === 1 ? 'Remove ' : 'One fewer ') + esc(name) + '">' + icon('i-minus') + '</button>' +
            '<output aria-label="Quantity">' + l.qty + '</output>' +
            '<button type="button" data-inc="' + l.id + '" aria-label="One more ' + esc(name) + '">' + icon('i-plus') + '</button>' +
          '</div></div>' +
        '<div class="ol-side"><p class="ol-total">' + fmt(opt.pence * l.qty) + '</p>' +
          '<button class="ol-remove" type="button" data-remove="' + l.id + '" aria-label="Remove ' + esc(name) + ' from your order">' + icon('i-trash') + '</button></div>' +
      '</li>';
    }).join('');
    syncQty();
  }

  function changeQty(id, delta) {
    var line = order.find(function (l) { return l.id === id; });
    if (!line) {
      if (delta <= 0) return;
      line = { id: id, qty: 0 };
      order.push(line);
    }
    line.qty = Math.min(99, line.qty + delta);
    if (line.qty <= 0) order = order.filter(function (l) { return l !== line; });
    persist();
    renderOrder();
  }

  function flashButton(btn) {
    var use = $('use', btn);
    var textOnly = btn.classList.contains('mrow-add');
    btn.classList.remove('is-added');
    void btn.offsetWidth;
    btn.classList.add('is-added');
    if (use) use.setAttribute('href', '#i-check');
    if (textOnly) btn.textContent = 'Added';
    clearTimeout(btn._ffTimer);
    btn._ffTimer = setTimeout(function () {
      btn.classList.remove('is-added');
      if (use) use.setAttribute('href', '#i-plus');
      if (textOnly) btn.textContent = 'Add';
    }, 1100);
  }

  function addToOrder(id, btn) {
    var hit = resolve(id);
    if (!hit) return;
    changeQty(id, 1);
    if (btn) flashButton(btn);
    orderBtn.classList.remove('is-bumped');
    void orderBtn.offsetWidth;
    orderBtn.classList.add('is-bumped');
    showToast('Added ' + titleOf(hit.item) + (hit.opt.label ? ' (' + hit.opt.label + ')' : '') + ' · ' + fmt(hit.opt.pence));
  }

  function orderText() {
    var lines = order.map(function (l) {
      var hit = resolve(l.id);
      return l.qty + ' x ' + titleOf(hit.item) + (hit.opt.label ? ' (' + hit.opt.label + ')' : '') + ' - ' + fmt(hit.opt.pence * l.qty);
    });
    var note = noteEl.value.trim();
    return ['My Fry & Fork order:'].concat(lines, ['Total: ' + fmt(totals().pence)], note ? ['Note: ' + note] : []).join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    (dialog.open ? dialog : document.body).appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function openOrder() {
    if (dialog.open) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    hideToast();
  }
  function closeOrder() {
    if (!dialog.open) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  dialog.addEventListener('click', function (e) { if (e.target === dialog) closeOrder(); });

  var clearBtn = $('[data-clear-order]');
  var clearLabel = clearBtn.lastChild;
  var clearTimer;
  function disarmClear() { delete clearBtn.dataset.armed; clearLabel.textContent = 'Clear'; }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-add],[data-inc],[data-dec],[data-remove],[data-open-order],[data-close-order],[data-copy-order],[data-clear-order]');
    if (!el) return;
    if (el.hasAttribute('data-remove')) return changeQty(el.getAttribute('data-remove'), -qtyOf(el.getAttribute('data-remove')));
    if (el.hasAttribute('data-add')) return addToOrder(el.getAttribute('data-add'), el);
    if (el.hasAttribute('data-inc')) return changeQty(el.getAttribute('data-inc'), 1);
    if (el.hasAttribute('data-dec')) return changeQty(el.getAttribute('data-dec'), -1);
    if (el.hasAttribute('data-open-order')) return openOrder();
    if (el.hasAttribute('data-close-order')) return closeOrder();
    if (el.hasAttribute('data-copy-order')) {
      copyText(orderText()).then(function (ok) {
        var label = el.lastChild;
        label.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(function () { label.textContent = 'Copy list'; }, 1800);
      });
      return;
    }
    if (el.hasAttribute('data-clear-order')) {
      if (!clearBtn.dataset.armed) {
        clearBtn.dataset.armed = '1';
        clearLabel.textContent = 'Tap again to clear';
        clearTimeout(clearTimer);
        clearTimer = setTimeout(disarmClear, 3000);
        return;
      }
      clearTimeout(clearTimer);
      disarmClear();
      order = [];
      noteEl.value = '';
      try { localStorage.removeItem(NOTE_KEY); } catch (err) { /* storage blocked */ }
      persist();
      renderOrder();
    }
  });

  // Keep several open tabs in step.
  window.addEventListener('storage', function (e) {
    if (e.key !== STORE_KEY) return;
    try {
      var next = JSON.parse(e.newValue || '[]');
      order = Array.isArray(next) ? next.filter(function (l) { return l && resolve(l.id) && l.qty > 0; }) : [];
    } catch (err) { order = []; }
    renderOrder();
  });

  renderOrder();
  if (pickFromOrder) pickFromOrder(function (id) { return qtyOf(id) > 0; });

  /* ---------------------------------------------------------------------------
   * Toast
   * ------------------------------------------------------------------------- */
  var toast = $('[data-toast]');
  var toastText = $('[data-toast-text]');
  var toastTimer;
  function showToast(text) {
    toastText.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 2800);
  }
  function hideToast() {
    clearTimeout(toastTimer);
    toast.classList.remove('is-visible');
  }
  toast.addEventListener('mouseenter', function () { clearTimeout(toastTimer); });
  toast.addEventListener('mouseleave', function () { toastTimer = setTimeout(hideToast, 1600); });

  /* ---------------------------------------------------------------------------
   * Mobile navigation
   * ------------------------------------------------------------------------- */
  var navToggle = $('.nav-toggle');
  function setNav(open) {
    header.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  navToggle.addEventListener('click', function () { setNav(!header.classList.contains('nav-open')); });
  $$('.site-nav a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) { setNav(false); navToggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) setNav(false);
  });

  /* ---------------------------------------------------------------------------
   * Opening status (always UK time, wherever the visitor is)
   * ------------------------------------------------------------------------- */
  function ukNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
      }).formatToParts(new Date());
      var get = function (type) { var p = parts.find(function (x) { return x.type === type; }); return p ? p.value : ''; };
      var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      var h = parseInt(get('hour'), 10) % 24;
      var m = parseInt(get('minute'), 10);
      if (day < 0 || isNaN(h) || isNaN(m)) throw new Error('unparsed');
      return { day: day, mins: h * 60 + m };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function clock(mins) {
    var h = Math.floor(mins / 60) % 24, m = mins % 60;
    var suffix = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + (m ? ':' + (m < 10 ? '0' : '') + m : '') + suffix;
  }
  function updateStatus() {
    var now = ukNow();
    var today = HOURS[now.day];
    var s;
    if (now.mins >= today[0] && now.mins < today[1]) {
      var soon = today[1] - now.mins <= 30;
      s = { state: soon ? 'soon' : 'open', short: soon ? 'Closing soon' : 'Open now', long: (soon ? 'Closing soon' : 'Open now') + ' · until ' + clock(today[1]) };
    } else if (now.mins < today[0]) {
      s = { state: 'closed', short: 'Closed now', long: 'Closed · opens ' + clock(today[0]) + ' today' };
    } else {
      s = { state: 'closed', short: 'Closed now', long: 'Closed · opens ' + clock(HOURS[(now.day + 1) % 7][0]) + ' tomorrow' };
    }
    document.documentElement.setAttribute('data-status', s.state);
    $$('[data-status-long]').forEach(function (el) { el.textContent = s.long; });
    $$('[data-status-short]').forEach(function (el) { el.textContent = s.short; });
    $$('[data-status-pill]').forEach(function (el) { el.hidden = false; });
    // Highlight today's line in the opening hours ("0,1,2,3,4" = Sunday to Thursday).
    $$('[data-days]').forEach(function (el) {
      el.classList.toggle('is-today', el.getAttribute('data-days').split(',').map(Number).indexOf(now.day) !== -1);
    });
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ---------------------------------------------------------------------------
   * Contact form
   * Posts the message as JSON to the form's data-endpoint (a form service such as
   * Formspree). Until an endpoint is set, sending asks the visitor to call instead.
   * ------------------------------------------------------------------------- */
  var contactForm = $('[data-contact-form]');
  if (contactForm) {
    var contactFields = $('.contact-fields', contactForm);
    var contactResult = $('[data-contact-result]', contactForm);
    var sendLabel = $('[data-send-label]', contactForm);
    var CONTACT_RESULTS = {
      sent: { icon: 'i-check', text: 'Your message is on its way. We’ll get back to you soon.', call: false, back: 'Send another message' },
      offline: { icon: 'i-phone-solid', title: 'Online messages aren’t switched on yet', text: 'Please give us a call and we’ll gladly help.', call: true, back: 'Back to the form' },
      error: { icon: 'i-alert', title: 'Sorry, that didn’t send', text: 'Please try again in a moment, or give us a call.', call: true, back: 'Try again' }
    };
    var showContactResult = function (kind, name) {
      var r = CONTACT_RESULTS[kind];
      $('[data-result-icon]', contactResult).setAttribute('href', '#' + r.icon);
      $('[data-result-title]', contactResult).textContent = kind === 'sent' ? 'Thanks, ' + name + '!' : r.title;
      $('[data-result-text]', contactResult).textContent = r.text;
      $('[data-result-call]', contactResult).hidden = !r.call;
      $('[data-result-back]', contactResult).textContent = r.back;
      contactFields.inert = true;
      contactResult.hidden = false;
      $('[data-result-title]', contactResult).focus();
    };
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      new FormData(contactForm).forEach(function (value, key) { data[key] = String(value).trim(); });
      var first = data.name.split(/\s+/)[0];
      if (data._gotcha) return showContactResult('sent', first);   // only bots fill the hidden field
      delete data._gotcha;
      var endpoint = contactForm.getAttribute('data-endpoint');
      if (!endpoint) return showContactResult('offline');
      data._subject = 'Website message: ' + data.subject;
      var send = $('.contact-send', contactFields);
      send.disabled = true;
      sendLabel.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          contactForm.reset();
          showContactResult('sent', first);
        })
        .catch(function () { showContactResult('error'); })
        .then(function () { send.disabled = false; sendLabel.textContent = 'Send Message'; });
    });
    $('[data-result-back]', contactResult).addEventListener('click', function () {
      contactResult.hidden = true;
      contactFields.inert = false;
      $('input', contactFields).focus();
    });
  }

  /* ---------------------------------------------------------------------------
   * Reveal on scroll & small things
   * ------------------------------------------------------------------------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
