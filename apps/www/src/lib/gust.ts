import type { GustProps } from "@maniktherana/gust";

export const quietGust = {
  duration: 280,
  exitDuration: 240,
  stagger: 12,
  exitBlur: 1,
} satisfies Partial<GustProps>;
