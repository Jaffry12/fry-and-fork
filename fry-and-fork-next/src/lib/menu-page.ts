import PAGE from "@/data/menu-page.json";
import { ITEMS, pcsLabel, type Item } from "@/lib/menu";

/** The full menu page's layout (src/data/menu-page.json): pills, headings and the "All" overview. */
export interface Photo {
  src: string;
  w: number;
  h: number;
  alt?: string;
}
export interface Group {
  id: string;
  label: string;
  /** the menu sections this pill shows */
  cats: string[];
  kicker: string;
  title: string;
  sub: string;
  desc: string;
}
export interface Block {
  group: string;
  kicker?: string;
  title: string;
  sub?: string;
  desc?: string;
  note?: string;
  items: string[];
  photo?: Photo;
  button: string;
  feature?: boolean;
}
export interface Overview {
  fish: Block;
  loved: { kicker: string; title: string; titleEm: string; lede: string; items: { id: string; name: string; photo: Photo }[] };
  pizza: Block;
  pairs: Block[];
  cards: Block[];
  good: { kicker: string; title: string; lede: string; items: { icon: string; title: string; text: string; href?: string }[] };
}

export const GROUPS = PAGE.groups as Group[];
export const OVERVIEW = PAGE.overview as Overview;
/** Order list thumbnails, by menu section. */
export const THUMBS = PAGE.thumbs as Record<string, string>;

/** Menu section -> the pill that shows it. */
export const GROUP_OF: Record<string, string> = {};
for (const g of GROUPS) for (const c of g.cats) GROUP_OF[c] = g.id;

/** Gold line emblems, used where a section has no photo (headings, the order list). */
export const EMBLEMS: Record<string, string> = {
  deals: "i-m-bag",
  fish: "i-fish",
  chips: "i-fries",
  pizza: "i-slice",
  calzones: "i-m-calzone",
  pasta: "i-m-pasta",
  risotto: "i-m-risotto",
  "italian-sides": "i-m-bread",
  burgers: "i-m-burger",
  kebabs: "i-m-kebab",
  chicken: "i-m-chicken",
  pakora: "i-m-pakora",
  rolls: "i-m-roll",
  vegetarian: "i-m-leaf",
  sides: "i-m-rings",
  kids: "i-m-lolly",
  desserts: "i-m-icecream",
  drinks: "i-cup",
};

/** "pizza/margherita#1" (a size) or "pizza/margherita" (its first price). */
export function pickRef(ref: string): { item: Item; n: number } {
  const [key, n] = ref.split("#");
  const item = ITEMS.get(key);
  if (!item) throw new Error(`Menu page: no dish "${key}" on the menu`);
  return { item, n: n === undefined ? 0 : Number(n) };
}

export function pcsText(item: Item): string {
  return item.pcs ? pcsLabel(item.pcs) : "";
}
