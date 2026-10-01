# Keeps website/menu.html (the full menu page) in step with website/index.html.
#
# The two pages share everything outside <main>: the icons, header, footer, order drawer
# and scripts (the menu page leaves out the phones' Call / Your order bar: it has its own
# "View Order" bar). index.html is the source for those; menu.html keeps its own <main>
# (the menu) and its own title and description. Run this after changing the
# header, footer or anything else outside <main> on the home page:
#
#     python tools/sync_menu_page.py
#
# Links are adjusted so each page points at the other correctly: on the menu page, links
# to home-page sections become "index.html#…" and links to the menu become "#…".
import os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + os.sep
WEB = ROOT + 'website' + os.sep
TITLE = 'Full Menu | Fry &amp; Fork, Kirkcaldy'
DESCRIPTION = ('The full Fry &amp; Fork menu: fish suppers, pizza in three sizes, pasta, burgers, kebabs, pakora, '
               'kids meals and meal deals, with prices. Search it, then call 01592 264123 to order.')
HOME_SECTIONS = ('explore', 'kitchen', 'contact')


def between(s, start, end):
    a = s.index(start); b = s.index(end, a) + len(end)
    return a, b


home = open(WEB + 'index.html', encoding='utf-8').read()
menu_path = WEB + 'menu.html'
if not os.path.exists(menu_path):
    sys.exit('website/menu.html is missing: it holds the menu page\'s own <main>, which this script keeps.')
menu_main = open(menu_path, encoding='utf-8').read()
a, b = between(menu_main, '  <main id="main">', '  </main>')
menu_main = menu_main[a:b]

# ---- <head>: the page's own title and description; nothing that only the home page needs
head_end = home.index('</head>')
head, body = home[:head_end], home[head_end:]
head = re.sub(r'<title>.*?</title>', f'<title>{TITLE}</title>', head, count=1)
head = re.sub(r'(<meta name="description" content=")[^"]*(">)', lambda m: m.group(1) + DESCRIPTION + m.group(2), head, count=1)
head = re.sub(r'(<meta property="og:title" content=")[^"]*(">)', lambda m: m.group(1) + TITLE + m.group(2), head, count=1)
head = re.sub(r'(<meta property="og:description" content=")[^"]*(">)', lambda m: m.group(1) + DESCRIPTION + m.group(2), head, count=1)
head = re.sub(r'  <link rel="preload" as="image" href="images/hero-bg-[^"]*"[^>]*>\n', '', head)   # the hero photo
a, b = between(head, '  <script type="application/ld+json">', '  </script>\n')                   # restaurant details: home page
head = head[:a] + head[b:]

# ---- everything outside <main>, with links adjusted for this page
a, b = between(body, '  <main id="main">', '  </main>')
before, after = body[:a], body[b:]

def adjust(s):
    s = s.replace('href="menu.html#', 'href="#').replace('href="menu.html"', 'href="#menu"')
    for sec in HOME_SECTIONS:
        s = s.replace(f'href="#{sec}"', f'href="index.html#{sec}"')
    return s

before = adjust(before)
after = adjust(after)
def swap(s, old, new):
    """Replace one expected piece of markup; stop if it has changed on the home page."""
    if old not in s:
        sys.exit('sync_menu_page: expected to find ' + old)
    return s.replace(old, new, 1)

before = swap(before, '<body>', '<body data-page="menu">')
before = swap(before, '<a class="brand" href="#top" aria-label="Fry &amp; Fork, back to top">',
              '<a class="brand" href="index.html" aria-label="Fry &amp; Fork home">')
before = swap(before, '<li><a href="#top" data-spy="top" aria-current="true">Home</a></li>',
              '<li><a href="index.html" data-spy="top">Home</a></li>')
before = swap(before, '<li><a href="#menu" data-spy="menu">Menu</a></li>',
              '<li><a href="#menu" data-spy="menu" aria-current="true">Menu</a></li>')
after = swap(after, '<li><a href="#top">Home</a></li>', '<li><a href="index.html">Home</a></li>')
# the footer is one band here, as tall as the page's hero (.site-footer--menu)
after = swap(after, '<footer class="site-footer">', '<footer class="site-footer site-footer--menu">')
# on phones the page has its own "View Order" bar, so the site's Call / Your order bar is left out
a, b = between(after, '  <!-- ============ Mobile action bar ============ -->', '  <!-- ============ Order drawer ============ -->')
after = after[:a] + '  <!-- ============ Order drawer ============ -->' + after[b:]

out = head + before + menu_main + after
for sec in HOME_SECTIONS:
    assert f'href="#{sec}"' not in out, sec
open(menu_path, 'w', encoding='utf-8', newline='\n').write(out)
print('menu.html synced from index.html')
