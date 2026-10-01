/** Shape of the generated menu data in `src/data/menu.ts`. */

export type TagId = "v" | "hot" | "new" | "chef";

export interface RawItem {
  name: string;
  desc?: string;
  /** What a meal deal comes with. */
  includes?: string[];
  /** One price, or one per size (matching the category's `sizes`). */
  price?: number | number[];
  /** Named options, e.g. Meal Deal 2's pizza sizes. */
  opts?: [string, number][];
  pcs?: number;
  tags?: TagId[];
  flag?: string;
}

export interface RawCategory {
  id: string;
  name: string;
  /** Short name for the tab strip on phones. */
  tab: string;
  layout?: "deals" | "kids";
  sizes?: string[];
  note?: string;
  items: RawItem[];
}

export interface MenuData {
  batterAddOn: number;
  categories: RawCategory[];
}
