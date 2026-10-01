"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** The year in the footer, kept current in the browser even if the page was built last year. */
export function CurrentYear({ builtIn }: { builtIn: number }) {
  const year = useSyncExternalStore(noSubscribe, () => new Date().getFullYear(), () => builtIn);
  return <>{year}</>;
}
