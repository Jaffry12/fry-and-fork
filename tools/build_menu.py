# Transcription of the Fry & Fork printed menu (ORIGINAL printed prices), plus the
# website pricing rule. Generates website/js/menu.js and price-changes.csv.
#
# Run:  python tools/build_menu.py
# Note: this REWRITES website/js/menu.js, so any hand edits made there are lost.
#       Change prices here (as printed) if you want the rule re-applied.
#
# Rule (from the client brief):
#   printed price £10.00 or more  -> £1.00 off
#   printed price under £10.00    -> £0.50 off
from decimal import Decimal
import csv, json, os, re

# Project root (the folder that contains website/ and tools/).
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + os.sep

def web_price(p):
    p = Decimal(str(p))
    return p - (Decimal('1.00') if p >= 10 else Decimal('0.50'))

# ---- transcription ---------------------------------------------------------
# item tuple: (name, desc, price(s), extra-dict)
S_SUP = ['Single', 'Supper']
PIZZA = ['10"', '12"', '16"']
BURG = ['¼lb', '½lb']
TS = 'Homemade tomato sauce, mozzarella cheese'

C = []  # categories

C.append(dict(id='deals', name='Meal Deals', tab='Deals', layout='deals',
    note='Feeding the whole house? Grab a box.', items=[
    ('Meal Deal 1', None, 20.99, dict(includes=['16" Margherita pizza', 'Medium chips', 'Garlic bread', '2 cans of juice'])),
    ('Meal Deal 2', 'Pick your size:', None, dict(
        opts=[('2× 10" pizzas & 2 can drinks', 18.49), ('2× 12" pizzas & 2 can drinks', 22.49), ('2× 16" pizzas & a bottle drink', 30.49)])),
    ('Combo Box 1', None, 18.49, dict(includes=['10" Margherita pizza', '3× veg & 2× chicken pakora', 'Doner', 'Chips', 'Salad & sauce', 'Can of juice'])),
    ('Combo Box 2', None, 21.49, dict(includes=['Margherita pizza', '3× veg & 3× chicken pakora', 'Doner', 'Chips', 'Salad & sauce', '2 cans of juice'])),
    ('Chippy Box', None, 22.49, dict(includes=['1× jumbo sausage', '1× hamburger', 'Large fish', '1× mince pie or homemade steak pie', 'Medium chips', '2 cans'])),
    ('Crunchy Box', None, 16.49, dict(includes=['Half pizza crunch', 'Onion rings', 'Battered mushrooms', 'Potato fritters', 'Chips', 'Can of juice'])),
    ('Chicken Box', None, 23.49, dict(includes=['5× spicy wings', '1× chicken steak', '1× spicy chicken steak', '12× popcorn chicken', '10× chicken nuggets', 'Medium chips', '2 cans of juice'])),
    ('Family Box', None, 26.49, dict(includes=['2× jumbo sausage', '2× hamburgers', '1× fried pizza', 'Large fish', 'Homemade steak pie or mince pie', 'Large chips', 'Big bottle of juice'])),
]))

C.append(dict(id='fish', name='Fish Bar', tab='Fish Bar', sizes=S_SUP,
    note='Single on its own, or make it a supper with chips.', items=[
    ('Large Fish', None, [9.99, 12.50], {}),
    ('Fish Cake', None, [4.99, 7.30], {}),
    ('Scampi', None, [6.20, 8.20], dict(pcs=10)),
    ('Jumbo Smoked Sausage (Battered)', None, [6.00, 8.70], {}),
    ('Jumbo Smoked Sausage', None, [4.80, 7.90], {}),
    ('Jumbo Sausage', None, [4.80, 7.50], dict(pcs=2)),
    ('Hamburger', None, [4.80, 7.50], {}),
    ('White Pudding', None, [4.80, 7.50], {}),
    ('Black Pudding', None, [4.80, 7.50], {}),
    ('Haggis Pudding', None, [4.80, 7.70], {}),
    ('Jumbo Haggis', None, [4.80, 7.80], {}),
    ('King Rib', None, [4.80, 7.80], {}),
    ('Rump Steak', None, [4.80, 7.70], {}),
    ('Cheese N Burger', 'Homemade', [5.30, 8.70], {}),
    ('Mince Pie', None, [4.80, 7.90], {}),
    ('Homemade Steak Pie', None, [4.80, 7.90], {}),
    ('Fried Pizza', None, [5.10, 7.80], {}),
    ('Half Fried Pizza', None, [3.99, 6.80], {}),
    ('Fried Pizza Crunch', None, [5.99, 8.70], {}),
    ('Half Fried Pizza Crunch', None, [4.40, 7.60], {}),
]))

C.append(dict(id='chips', name='Chips', tab='Chips', items=[
    ('Medium Chips', None, 3.70, {}),
    ('Large Chips', None, 5.99, {}),
    ('Chips & Curry Sauce', None, 5.50, {}),
    ('Chip Roll', None, 3.60, {}),
    ('Medium Chips & Cheese', None, 5.70, {}),
    ('Large Chips & Cheese', None, 7.50, {}),
    ('Chips & Doner', None, 7.70, {}),
    ('Chips & Pesto', None, 6.00, {}),
    ('Chips & Bolognese', None, 7.30, {}),
    ('Chips, Cheese & Doner Meat', None, 8.20, {}),
    ('Chips, Cheese, Doner & Curry Sauce', None, 9.70, {}),
    ('Chips, Cheese & Gravy', None, 7.20, {}),
    ('Chips, Cheese & Curry Sauce', None, 7.00, {}),
]))

C.append(dict(id='pizza', name='Pizzas', tab='Pizza', sizes=PIZZA,
    note='Made on fresh, homemade dough.', items=[
    ('Margherita', 'Homemade tomato sauce & mozzarella cheese', [6.99, 8.80, 12.60], {}),
    ('Create Your Own Pizza', None, [6.99, 8.80, 12.60], {}),
    ('Tre Formaggi', 'Homemade tomato sauce, mozzarella, parmesan & gorgonzola', [7.99, 8.50, 13.99], {}),
    ('Hawaiian', TS + ', ham & pineapple', [8.99, 11.99, 16.99], {}),
    ('Funghi', TS + ' & mushrooms', [8.99, 10.99, 15.50], {}),
    ('Stagoni', TS + ', ham, mushrooms, artichokes & spicy sausage', [9.99, 12.60, 17.99], {}),
    ('Campagnola', TS + ', anchovies & black olives', [8.99, 11.50, 17.50], {}),
    ('Pacanti (Pepperoni)', TS + ' & spicy sausage', [8.99, 11.50, 17.50], dict(tags=['hot'])),
    ('Napolitana', TS + ', anchovies & black olives', [8.99, 11.50, 16.50], {}),
    ('Favorita', TS + ', chicken, olives & peppers', [8.99, 11.20, 15.80], {}),
    ('Salami', TS + ' & Italian salami', [8.99, 11.99, 15.99], {}),
    ('Valentino', TS + ', peppers, spicy sausage, Italian sausage & Italian salami', [8.99, 11.20, 16.50], {}),
    ('Grantourco', TS + ', chicken & sweetcorn', [8.99, 11.20, 17.50], {}),
    ('Pollo Alla Pesto', 'Homemade tomato sauce, pesto, mozzarella cheese & chicken', [8.99, 10.70, 15.50], {}),
    ('Mexicana', TS + ', chicken, peppers, onions & chilli', [9.20, 11.60, 17.50], dict(tags=['hot'])),
    ('Sicili', TS + ', mushrooms, pepperoni & onion', [9.50, 11.99, 16.50], {}),
    ('Diavola', TS + ', peppers, chilli & spicy sausage', [9.50, 11.99, 16.50], dict(tags=['hot'])),
    ('Mantarana', TS + ', spicy sausage, onions & peppers', [9.50, 11.99, 16.50], {}),
    ('Cardinal', TS + ', ham & mushrooms', [9.50, 11.99, 16.50], {}),
    ('Vegetarian', TS + ', artichokes, peppers, onions, mushrooms & jalapeños', [9.50, 12.50, 17.50], dict(tags=['v'])),
    ('Bianca', TS + ', ham, spicy sausage & jalapeños', [9.50, 11.50, 17.00], {}),
    ('Norcia', TS + ', mushrooms, pepperoni & peppers', [9.50, 12.20, 16.70], {}),
    ('Veronese', TS + ', mushrooms & Parma ham', [9.50, 11.99, 15.99], {}),
    ('Volcano', TS + ', spicy sausage, chicken, olives & jalapeños', [9.50, 11.99, 15.99], dict(tags=['hot'])),
    ('Sorrento', TS + ', spicy sausage, chicken & red onion', [9.50, 10.80, 16.50], {}),
    ('Caprina', TS + ', bacon, Italian spicy sausage & mixed peppers', [9.80, 11.99, 16.50], dict(tags=['new'])),
    ('Barbecue Chicken', TS + ' with barbecued chicken', [9.80, 11.99, 16.50], dict(tags=['new'])),
    ('Marinara', TS + ' with mixed seafood', [9.80, 11.99, 16.50], {}),
    ('Capricosa', TS + ', mushrooms, peppers, black olives & pepperoni', [9.99, 12.60, 17.50], {}),
    ('Prosciutto', TS + ' & Italian Parma ham', [9.99, 12.60, 18.50], {}),
    ('Doner', TS + ' & doner meat', [9.99, 12.60, 19.99], {}),
    ('Chef Special', 'Homemade tomato sauce, mozzarella, smoked sausage, onion & pineapple', [9.99, 11.80, 16.50], {}),
    ('Meat Feast', 'Chicken, spicy mince, ham & spicy sauce', [10.50, 13.00, 18.50], {}),
    ('Nostara', 'Tomato, mozzarella, spicy chicken, spicy sausage & mushrooms', [10.30, 12.50, 17.99], {}),
]))

C.append(dict(id='calzones', name='Calzones', tab='Calzones', items=[
    ('Calzone', TS + ', mushrooms, ham & spicy sausage', 11.49, {}),
    ('Calzone Doner', TS + ' & doner meat', 12.99, {}),
    ('Calzone Vegetable', TS + ', mushrooms, artichokes, peppers, onions & olives', 10.99, dict(tags=['v'])),
    ('Chicken Hoagie Calzone', 'Homemade tomato sauce, peppers, onions, chicken, chips, cheese & mozzarella cheese', 15.49, {}),
    ('Doner Hoagie Calzone', 'Homemade tomato sauce, chips, cheese & doner meat', 14.99, {}),
    ('Mixed Hoagie Calzone', 'Homemade tomato sauce, chips & cheese, doner, chicken, green peppers & onions', 16.99, {}),
]))

C.append(dict(id='pasta', name='Pasta', tab='Pasta',
    note='All cooked by our professional chef, and every pasta comes with parmesan.', items=[
    ('Penne Vegetarian', 'Homemade tomato sauce, broccoli, mushrooms, artichokes, garlic & olives', 10.50, dict(tags=['v'])),
    ('Penne Napoli', 'Homemade tomato sauce, garlic & basil', 8.99, {}),
    ('Penne Funghi Crema', 'Mushrooms, garlic & cream sauce', 10.50, {}),
    ('Penne Della Casa', 'Homemade tomato sauce, peppers, onions & spicy sausage', 10.50, {}),
    ('Penne Alla Pesto', 'Homemade pesto, homemade tomato sauce & cream', 10.00, {}),
    ('Penne Ducale', 'Homemade tomato sauce, mushrooms, chicken, garlic & a kiss of pesto & cream', 11.99, {}),
    ('Penne Sicilliana', 'Homemade tomato sauce, cream, chicken, onion, blue cheese & broccoli', 12.50, {}),
    ('Penne Alla Formage', 'Gorgonzola, parmesan & mozzarella cooked in a garlic cream sauce', 9.99, {}),
    ('Penne Alfredo', 'Chicken & broccoli cooked in a rich gorgonzola cream sauce', 12.50, {}),
    ('Penne Alla Carbozola', 'Smoky sausage & mushroom in a garlic & creamy blue cheese sauce', 12.80, {}),
    ('Penne Alla Barese', 'Smoky sausage & broccoli in a cream & homemade tomato sauce', 12.80, {}),
    ('Penne Alla Genovese', 'Pesto, chicken & mushroom in a garlic & creamy sauce', 12.50, dict(tags=['chef'], flag="Please try, chef's favourite!")),
    ('Spaghetti Carbonara', 'Bacon, garlic & cream', 9.99, {}),
    ('Spaghetti Arrablata', 'Homemade tomato sauce, garlic & chilli', 8.99, dict(tags=['hot'])),
    ('Spaghetti Amatriciana', 'Homemade tomato sauce, bacon, garlic & onions', 9.99, {}),
    ('Spaghetti Bolognese', 'Homemade tomato sauce, minced beef & garlic', 11.99, {}),
    ('Spaghetti Marinara', 'Mixed seafood, homemade tomato sauce, onions, garlic & a kiss of chilli', 13.50, {}),
    ('Tagliatelle Papalina', 'Onions, mushrooms, bacon, peas, blue cheese & cream sauce', 13.50, {}),
    ('Tagliatelle Chef Special', 'Homemade tomato sauce, cream, mushroom, bolognese & spicy sausage', 12.80, dict(tags=['chef'], flag='Please try!')),
    ('Tagliatelle Ciociara', 'Homemade tomato sauce, mushrooms, ham, peas, garlic & a touch of cream', 10.99, {}),
    ('Gnocchi Alforno', 'Homemade potato dumplings in tomato & cream sauce, topped with mozzarella', 11.99, {}),
    ('Gnocchi Alla Romana', 'Homemade potato dumplings cooked with spinach, gorgonzola cheese & cream', 12.50, {}),
    ('Tortellini Della Casa', 'Spinach & chicken cooked in a lovely cream & homemade tomato sauce', 12.50, {}),
    ('Tortellini Alferno', 'Cooked in tomato & cream sauce with a kiss of pesto, topped with mozzarella cheese', 12.50, {}),
    ('Tortellini Funghi Alla Crema', 'Mushrooms cooked in a cream cheese sauce, topped with mozzarella cheese', 12.50, {}),
]))

C.append(dict(id='risotto', name='Risotto', tab='Risotto',
    note='All cooked by our professional chef.', items=[
    ('Risotto Funghi E Crema', 'Rice cooked with mushrooms, onions, garlic & cream', 9.50, {}),
    ('Risotto Fattore', 'Rice cooked with chicken & spinach in a tomato & cream sauce', 11.50, {}),
    ('Risotto Mariyanara', 'Rice cooked with mixed seafood, onions, garlic & a kiss of chilli in homemade tomato sauce', 12.20, {}),
    ('Risotto Della Casa', 'Rice cooked with mushrooms, ham, peas & onions in a tomato & cream sauce', 11.50, {}),
    ('Risotto Pollo Funghi Crema', 'Rice cooked with chicken & mushrooms in a creamy garlic sauce', 10.99, {}),
    ('Risotto Sorrentina', 'Rice cooked with onion, smoked sausage & ham in a creamy homemade tomato sauce', 12.50, {}),
]))

C.append(dict(id='italian-sides', name='Italian Sides', tab='Italian Sides', items=[
    ('Focaccia', 'Pizza bread topped with rosemary', 4.50, {}),
    ('Focaccia Con Mozzarella', 'Pizza bread with cheese', 6.60, {}),
    ('Focaccia Piccante', 'Pizza bread with spicy homemade tomato sauce', 5.30, dict(tags=['hot'])),
    ('Focaccia Alla Parma', 'Pizza bread with cheese, topped with Italian Parma ham', 7.20, {}),
    ('Focaccia Bruschetta', 'Pizza bread topped with fresh tomato', 6.60, {}),
    ('Funghi Aglio', 'Fried garlic mushrooms', 4.70, {}),
    ('Funghi Alla Crema', 'Mushrooms cooked in a cream cheese sauce, topped with mozzarella cheese & oven baked', 5.30, {}),
]))

C.append(dict(id='burgers', name='Burgers', tab='Burgers', sizes=BURG,
    note='All served with salad, chips & sauce.', items=[
    ('Pounder Burger', None, [6.80, 8.50], {}),
    ('Pounder Cheese Burger', None, [7.95, 9.50], {}),
    ('Pounder Cheese & Bacon Burger', None, [8.90, 9.95], {}),
    ('Pounder with Doner Meat Burger', None, [8.95, 10.20], {}),
    ('Chicken Burger', None, 7.50, {}),
    ('Zinger Burger', None, 7.50, {}),
]))

C.append(dict(id='kebabs', name='Kebabs & Wraps', tab='Kebabs',
    note='Kebabs are served with separate salad & sauces.', items=[
    ('Doner Kebab', None, 9.50, {}),
    ('Chicken Kebab', None, 10.99, {}),
    ('Mixed Kebab', None, 12.50, {}),
    ('Doner Meat', None, 7.20, {}),
    ('Doner Wrap', None, 10.50, {}),
    ('Chicken Wrap', None, 11.99, {}),
    ('Mixed Wrap', 'Doner & chicken kebab', 13.20, {}),
    ('Hoagie Wrap', 'Chips, cheese, salad & doner', 12.50, {}),
    ('Chips & Cheese Wrap', None, 5.20, {}),
    ('Chicken Royal Wrap', None, 6.80, {}),
    ('Spicy Chicken Royal Wrap', None, 7.00, dict(tags=['hot'])),
    ('Mixed Hoagie Wrap', 'Serves 2. Salad, chicken, doner, chips, cheese & your choice of sauce', 14.80, {}),
]))

C.append(dict(id='chicken', name='Chicken', tab='Chicken', sizes=S_SUP,
    note='Add batter to a ¼ or ½ chicken for {batter}.', items=[
    ('¼ Chicken', None, [6.50, 8.99], {}),
    ('Half Chicken', None, [8.99, 11.99], {}),
    ('Chicken Nuggets', None, [5.20, 7.00], dict(pcs=8)),
    ('Chicken Steak', None, [5.10, 8.70], dict(pcs=2)),
    ('Spicy Chicken Wings', None, [5.50, 7.50], dict(pcs=5, tags=['hot'])),
    ('Chicken Popcorn', None, [4.59, 6.10], dict(pcs=12)),
]))
BATTER_ADDON = 1.00   # "ADD BATTER TO 1/4 or 1/2 Chicken for £1.00"

C.append(dict(id='pakora', name='Pakora', tab='Pakora',
    note='Homemade pakora, served with salad & sauce.', items=[
    ('Mixed Pakora', '4 chicken & 5 veg pieces', 7.80, {}),
    ('Vegetable Pakora', None, 6.50, dict(pcs=8, tags=['v'])),
    ('Chicken Pakora', None, 7.50, dict(pcs=6)),
]))

C.append(dict(id='rolls', name='Hot Filled Rolls', tab='Rolls', items=[
    ('Hamburger Roll', None, 3.20, {}),
    ('Hamburger Chip Roll', None, 5.50, {}),
    ('Sausage Roll', None, 3.20, {}),
    ('Sausage Chip Roll', None, 5.50, {}),
    ('Cheese N Burger Roll', None, 5.90, {}),
    ('Veggie Burger Roll', None, 3.99, dict(tags=['v'])),
    ('Fritter Roll', None, 3.99, dict(pcs=4)),
    ('Doner Roll', None, 5.20, {}),
]))

C.append(dict(id='vegetarian', name='Vegetarian', tab='Vegetarian', sizes=S_SUP,
    note='Single on its own, or make it a supper with chips.', items=[
    ('Veggie Burger', 'Comes in a bun with salad', [4.50, 6.50], dict(tags=['v'])),
    ('Veggie Spring Roll', None, [3.99, 5.99], dict(pcs=2, tags=['v'])),
    ('Vegetable Pakora', None, [6.50, 8.70], dict(pcs=7, tags=['v'])),
    ('Pitta Salad', None, [3.50, 5.50], dict(tags=['v'])),
]))

C.append(dict(id='sides', name='Side Orders', tab='Sides', items=[
    ('Mozzarella Sticks', None, 4.50, {}),
    ('Onion Rings', None, 4.99, {}),
    ('Battered Mushrooms', None, 4.99, {}),
    ('Mixed Salad', None, 3.99, {}),
    ('Fritters', None, 5.40, dict(pcs=10)),
    ('Mushy Peas', None, 1.60, {}),
    ('Gravy Sauce', None, 1.60, {}),
    ('Curry Sauce', None, 1.60, {}),
    ('Battered Mars Bar', None, 3.40, {}),
    ('Battered Snickers Bar', None, 3.95, {}),
    ('Rolls', None, 1.20, {}),
    ('Dips', None, 0.85, {}),
    ('Jar of Mussels', None, 4.20, {}),
    ('Chippy Sauce', None, 4.20, {}),
]))

C.append(dict(id='kids', name='Kids Meals', tab='Kids', layout='kids',
    note='Every kids meal comes with chips, a bottle of Fruit Shoot & a lollipop.', items=[
    ('Jumbo Sausage', None, 5.50, dict(pcs=1)),
    ('Hamburger', None, 5.50, dict(pcs=1)),
    ('Fishcake', None, 5.50, dict(pcs=1)),
    ('Chicken Steak', None, 5.50, dict(pcs=1)),
    ('Chicken Nuggets', None, 5.50, dict(pcs=4)),
    ('Scampi', None, 5.50, dict(pcs=5)),
    ('Chicken Popcorn', None, 5.50, dict(pcs=10)),
]))

C.append(dict(id='desserts', name='Desserts', tab='Desserts', items=[
    ('Strawberry Cheesecake', None, 5.60, {}),
    ('Tiramisu', None, 5.60, {}),
    ('Chocolate Gateau', None, 5.30, {}),
    ('Mars Bar', None, 2.20, {}),
    ('Snickers', None, 2.20, {}),
    ("Ben & Jerry's Ice Cream", 'Chocolate Fudge Brownie, Cookie Dough, Caramel Chew Chew, Half Baked, Peanut Buttercup or Phish Food', 7.40, {}),
]))

C.append(dict(id='drinks', name='Soft Drinks', tab='Drinks', items=[
    ('Can', '330ml', 1.70, {}),
    ('Bottle', '500ml', 2.60, {}),
    ('Big Bottle', None, 3.99, {}),
    ('Water', '750ml', 1.70, {}),
]))

# ---- helpers ---------------------------------------------------------------
def slug(s):
    s = s.replace('¼', 'quarter').replace('½', 'half').replace('&', 'and')
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def money(d):
    return f'{d:.2f}'

def js_str(s):
    return json.dumps(s, ensure_ascii=False)

rows = []   # audit rows for the CSV
out = []
out.append('/*\n'
           ' * Fry & Fork — menu data (single source of truth for the whole site).\n'
           ' *\n'
           ' * Prices are the live WEBSITE prices in pounds. To change a price, edit it here.\n'
           ' *   price: 9.00               -> one price\n'
           ' *   price: [6.49, 8.30, 12.10] -> one price per size, matching the category\'s `sizes`\n'
           ' *   opts:  [[label, price], …] -> named options (used by Meal Deal 2)\n'
           ' * tags: v = vegetarian, hot = spicy, new = new dish, chef = chef\'s pick\n'
           ' * pcs:  piece count shown next to the name\n'
           ' */\n')
out.append('window.FF_MENU = {\n')
batter = web_price(BATTER_ADDON)
out.append(f'  batterAddOn: {money(batter)},\n')
out.append('  categories: [\n')

seen = set()
for cat in C:
    head = [f"id: {js_str(cat['id'])}", f"name: {js_str(cat['name'])}", f"tab: {js_str(cat['tab'])}"]
    if cat.get('layout'): head.append(f"layout: {js_str(cat['layout'])}")
    if cat.get('sizes'): head.append('sizes: [' + ', '.join(js_str(s) for s in cat['sizes']) + ']')
    note = cat.get('note')
    if note:
        note = note.replace('{batter}', '£' + money(batter))
        head.append(f'note: {js_str(note)}')
    out.append('    {\n      ' + ', '.join(head) + ',\n      items: [\n')
    for (name, desc, price, extra) in cat['items']:
        key = cat['id'] + '/' + slug(name)
        assert key not in seen, key
        seen.add(key)
        parts = [f'name: {js_str(name)}']
        if desc: parts.append(f'desc: {js_str(desc)}')
        if extra.get('includes'):
            parts.append('includes: [' + ', '.join(js_str(s) for s in extra['includes']) + ']')
        if extra.get('opts'):
            ol = []
            for label, p in extra['opts']:
                w = web_price(p); ol.append(f'[{js_str(label)}, {money(w)}]')
                rows.append([cat['name'], f'{name} — {label}', money(Decimal(str(p))), money(w), money(Decimal(str(p)) - w)])
            parts.append('opts: [' + ', '.join(ol) + ']')
        elif isinstance(price, list):
            ws = [web_price(p) for p in price]
            parts.append('price: [' + ', '.join(money(w) for w in ws) + ']')
            for size, p, w in zip(cat['sizes'], price, ws):
                rows.append([cat['name'], f'{name} ({size})', money(Decimal(str(p))), money(w), money(Decimal(str(p)) - w)])
        else:
            w = web_price(price)
            parts.append(f'price: {money(w)}')
            rows.append([cat['name'], name, money(Decimal(str(price))), money(w), money(Decimal(str(price)) - w)])
        if extra.get('pcs'): parts.append(f"pcs: {extra['pcs']}")
        if extra.get('tags'): parts.append('tags: [' + ', '.join(js_str(t) for t in extra['tags']) + ']')
        if extra.get('flag'): parts.append(f"flag: {js_str(extra['flag'])}")
        out.append('        { ' + ', '.join(parts) + ' },\n')
    out.append('      ],\n    },\n')
out.append('  ],\n};\n')
rows.append(['Chicken', 'Add batter to ¼ or ½ chicken (add-on)', money(Decimal('1.00')), money(batter), money(Decimal('1.00') - batter)])

open(ROOT + 'website/js/menu.js', 'w', encoding='utf-8', newline='\n').write(''.join(out))

# The Next.js app reads the same data as a typed module.
NEXT_DATA = ROOT + 'fry-and-fork-next/src/data/menu.ts'
if os.path.isdir(os.path.dirname(NEXT_DATA)):
    ts = ''.join(out)
    ts = ts.replace(' * Prices are the live WEBSITE prices in pounds. To change a price, edit it here.\n',
                    ' * GENERATED by tools/build_menu.py: change prices there (as printed) and re-run it.\n'
                    ' * Prices here are the live WEBSITE prices in pounds.\n', 1)
    ts = ts.replace('window.FF_MENU = {\n', 'import type { MenuData } from "@/lib/menu-types";\n\nexport const MENU_DATA: MenuData = {\n', 1)
    open(NEXT_DATA, 'w', encoding='utf-8', newline='\n').write(ts)
with open(ROOT + 'price-changes.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['Section', 'Item', 'Printed menu price (£)', 'Website price (£)', 'Reduction (£)'])
    w.writerows(rows)

# sanity checks on the rule
for r in rows:
    old, new, cut = Decimal(r[2]), Decimal(r[3]), Decimal(r[4])
    assert cut == (Decimal('1.00') if old >= 10 else Decimal('0.50')), r
    assert new > 0, r
print('categories', len(C), 'items', sum(len(c['items']) for c in C), 'price points', len(rows))
print('£10.00 exactly:', [r[1] for r in rows if Decimal(r[2]) == 10])
print('lowest:', sorted(rows, key=lambda r: Decimal(r[3]))[:4])
