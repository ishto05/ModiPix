// src/lib/nudenet.ts

import type { ModerationItem } from "./moderation";

/* ---------------------------------------------
   RAW NUDE-NET TYPES (strict)
--------------------------------------------- */
export interface NudeNetBox {
  score: number;
  label: string;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface NudeNetRaw {
  detections: NudeNetBox[];
}

/* ---------------------------------------------
   NudeNet → ModerationItem[]
--------------------------------------------- */
export function normalizeNudeNetResponse(raw: NudeNetRaw): ModerationItem[] {
  if (!raw?.detections || !Array.isArray(raw.detections)) return [];

  return raw.detections.map((d) => ({
    class: d.label?.toUpperCase() ?? "UNKNOWN",
    score: typeof d.score === "number" ? d.score : 0,
    box: d.box ?? [0, 0, 0, 0],
    provider: "nudenet",
  }));
}
