import { MENU_DATA } from "@/data/menu";
import type { RawCategory, RawItem, TagId } from "@/lib/menu-types";

export type { TagId } from "@/lib/menu-types";

export interface PriceOption {
  label: string;
  pence: number;
}

export interface Category extends Omit<RawCategory, "items"> {
  items: Item[];
}

export interface Item extends RawItem {
  /** "pizza/margherita" */
  key: string;
  cat: Category;
  options: PriceOption[];
  /** Normalised text the menu search looks through. */
  search: string;
  tagSet: ReadonlySet<TagId>;
}

export const TAGS: Record<TagId, { label: string; icon: string; words: string }> = {
  v: { label: "Veg", icon: "i-leaf", words: "vegetarian veggie veg" },
  hot: { label: "Spicy", icon: "i-chilli", words: "spicy hot chilli" },
  new: { label: "New", icon: "i-spark", words: "new" },
  chef: { label: "Chef's pick", icon: "i-chef", words: "chef pick favourite" },
};

export function fmt(pence: number): string {
  return "£" + (pence / 100).toFixed(2);
}

export function slug(s: string): string {
  return s
    .replace(/¼/g, "quarter")
    .replace(/½/g, "half")
    .replace(/&/g, "and")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function norm(s: string): string {
  return String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9"]+/g, " ");
}

/** How a size label should be read aloud / searched ('12"' -> '12 inch'). */
export function spoken(label: string): string {
  return label
    .replace(/¼lb/g, "quarter pound")
    .replace(/½lb/g, "half pound")
    .replace(/"/g, " inch")
    .replace(/×/g, " x");
}

export function countLabel(n: number): string {
  return n + (n === 1 ? " item" : " items");
}

export function pcsLabel(pcs: number): string {
  return pcs + (pcs === 1 ? " pc" : " pcs");
}

/* ---------------------------------------------------------------------------
 * Index the menu
 * ------------------------------------------------------------------------- */
export const CATEGORIES: Category[] = [];
export const CATS = new Map<string, Category>();
export const ITEMS = new Map<string, Item>();

for (const raw of MENU_DATA.categories) {
  const cat: Category = { ...raw, items: [] };
  for (const rawItem of raw.items) {
    let options: PriceOption[];
    if (rawItem.opts) {
      options = rawItem.opts.map(([label, price]) => ({ label, pence: Math.round(price * 100) }));
    } else if (Array.isArray(rawItem.price)) {
      options = rawItem.price.map((p, i) => ({ label: raw.sizes?.[i] ?? "", pence: Math.round(p * 100) }));
    } else {
      options = [{ label: "", pence: Math.round((rawItem.price ?? 0) * 100) }];
    }
    const search = norm(
      [
        raw.name,
        raw.tab,
        rawItem.name,
        rawItem.desc ?? "",
        (rawItem.includes ?? []).join(" "),
        rawItem.flag ?? "",
        options.map((o) => o.label + " " + spoken(o.label) + (o.label === "Supper" ? " with chips" : "")).join(" "),
        (rawItem.tags ?? []).map((t) => TAGS[t]?.words ?? t).join(" "),
      ].join(" "),
    );
    const item: Item = {
      ...rawItem,
      key: raw.id + "/" + slug(rawItem.name),
      cat,
      options,
      search,
      tagSet: new Set(rawItem.tags ?? []),
    };
    cat.items.push(item);
    ITEMS.set(item.key, item);
  }
  CATEGORIES.push(cat);
  CATS.set(cat.id, cat);
}

/** Name used in the order list / toast, e.g. "Kids meal: Scampi", "Can (330ml)". */
export function titleOf(item: Item): string {
  if (item.cat.id === "kids") return "Kids meal: " + item.name;
  if (item.cat.id === "drinks" && item.desc) return item.name + " (" + item.desc + ")";
  return item.name;
}

/** "pizza/margherita#1" -> the item and its second price option. */
export function resolve(id: string): { item: Item; opt: PriceOption } | null {
  const [key, index] = String(id).split("#");
  const item = ITEMS.get(key);
  const opt = item?.options[Number(index)];
  return item && opt ? { item, opt } : null;
}

export function addLabel(item: Item, opt: PriceOption): string {
  return "Add " + titleOf(item) + (opt.label ? ", " + spoken(opt.label) : "") + ", " + fmt(opt.pence) + ", to your order";
}

/** Cheapest price across one or more categories, e.g. for "from £6.49". */
export function fromPrice(...catIds: string[]): number {
  let min = Infinity;
  for (const id of catIds) {
    for (const item of CATS.get(id)?.items ?? []) {
      for (const o of item.options) min = Math.min(min, o.pence);
    }
  }
  return min;
}

/* ---------------------------------------------------------------------------
 * Search
 * ------------------------------------------------------------------------- */
const STOP_WORDS = ["and", "with", "the", "a", "an", "of", "in", "on", "or", "for", "some", "please"];
// "veggie" means dishes the menu marks vegetarian, not anything with a "veg" pakora in it.
const SYNONYMS: Record<string, string> = { veggie: "vegetarian", chili: "chilli", chilly: "chilli", fries: "chip" };

export function tokens(q: string): string[] {
  return norm(q)
    .split(" ")
    .filter((t) => t && !STOP_WORDS.includes(t))
    .map((t) => SYNONYMS[t] ?? (t.length > 3 && /[^s]s$/.test(t) ? t.slice(0, -1) : t)); // plurals: chips -> chip
}

export function matches(item: Item, toks: string[], tags: readonly TagId[]): boolean {
  return toks.every((t) => item.search.includes(t)) && tags.every((t) => item.tagSet.has(t));
}
