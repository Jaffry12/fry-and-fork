/** Opening hours in minutes after midnight, UK time. Index 0 = Sunday. */
export const HOURS: readonly (readonly [open: number, close: number])[] = [
  [900, 1350],
  [900, 1350],
  [900, 1350],
  [900, 1350],
  [900, 1350],
  [900, 1410],
  [900, 1410],
];

export type OpenState = "open" | "soon" | "closed";

export interface OpeningStatus {
  state: OpenState;
  short: string;
  long: string;
  /** Today in the UK, 0 = Sunday. */
  day: number;
}

/** Shown before the browser works out the live status (and to search engines). */
export const STATUS_FALLBACK = "Open 7 days from 3pm";

/** The day and time in the UK, wherever the visitor is. */
function ukNow(): { day: number; mins: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const h = parseInt(get("hour"), 10) % 24;
    const m = parseInt(get("minute"), 10);
    if (day < 0 || Number.isNaN(h) || Number.isNaN(m)) throw new Error("unparsed");
    return { day, mins: h * 60 + m };
  } catch {
    const d = new Date();
    return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
  }
}

/** 1350 -> "10:30pm", 900 -> "3pm" */
function clock(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h = h24 % 12 || 12;
  return h + (m ? ":" + (m < 10 ? "0" : "") + m : "") + suffix;
}

export function currentStatus(): OpeningStatus {
  const now = ukNow();
  const [open, close] = HOURS[now.day];
  if (now.mins >= open && now.mins < close) {
    const soon = close - now.mins <= 30;
    const short = soon ? "Closing soon" : "Open now";
    return { state: soon ? "soon" : "open", short, long: short + " · until " + clock(close), day: now.day };
  }
  if (now.mins < open) {
    return { state: "closed", short: "Closed now", long: "Closed · opens " + clock(open) + " today", day: now.day };
  }
  const tomorrow = HOURS[(now.day + 1) % 7][0];
  return { state: "closed", short: "Closed now", long: "Closed · opens " + clock(tomorrow) + " tomorrow", day: now.day };
}
