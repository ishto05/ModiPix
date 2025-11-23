// src/lib/sightEngine.ts
import type { ModerationItem } from "@/lib/moderation";

/* -------------------------------------------------------
   RAW SIGHTENGINE TYPES (STRICT)
------------------------------------------------------- */
export interface SEFace {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  attributes?: {
    age?: {
      minor?: number; // probability
    };
  };
}

export interface SightEngineRaw {
  nudity?: {
    erotica?: number;
    sexual_activity?: number;
    sexual_display?: number;
    suggestive?: number;
    very_suggestive?: number;
  };
  weapon?: {
    classes?: Record<string, number>;
  };
  violence?: { prob?: number };
  gore?: { prob?: number };
  offensive?: Record<string, number>;
  alcohol?: { prob?: number };
  recreational_drug?: { prob?: number };
  tobacco?: { prob?: number };
  money?: { prob?: number };
  gambling?: { prob?: number };
  genai?: number;
  faces?: SEFace[];
  ["people-counting"]?: Record<string, number>;
  quality?: { score?: number };
}

/* -------------------------------------------------------
   Helper for numeric probability
------------------------------------------------------- */
const v = (n?: number) => (typeof n === "number" ? n : 0);

/* -------------------------------------------------------
   STRICT NORMALIZER → ModerationItem[]
------------------------------------------------------- */
export function normalizeSightEngineResponse(se: SightEngineRaw): ModerationItem[] {
  const out: ModerationItem[] = [];

  const push = (cls: string, score: number, box = [0, 0, 0, 0] as [number, number, number, number]) => {
    if (score >= 0.05) {
      out.push({
        class: cls.toUpperCase(),
        score,
        box,
        provider: "sightengine",
      });
    }
  };

  /* 1. Nudity */
  if (se.nudity) {
    for (const [key, prob] of Object.entries(se.nudity)) {
      push(key.toUpperCase(), v(prob));
    }
  }

  /* 2. Weapons */
  if (se.weapon?.classes) {
    for (const [key, prob] of Object.entries(se.weapon.classes)) {
      push(key.toUpperCase(), v(prob));
    }
  }

  /* 3. Violence + Gore */
  push("VIOLENCE", v(se.violence?.prob));
  push("GORE", v(se.gore?.prob));

  /* 4. Offensive */
  if (se.offensive) {
    for (const [key, prob] of Object.entries(se.offensive)) {
      push(key.toUpperCase(), v(prob));
    }
  }

  /* 5. Alcohol / Drugs / Tobacco / Money / Gambling */
  const probModels: [string, number | undefined][] = [
    ["ALCOHOL", se.alcohol?.prob],
    ["DRUG", se.recreational_drug?.prob],
    ["TOBACCO", se.tobacco?.prob],
    ["MONEY", se.money?.prob],
    ["GAMBLING", se.gambling?.prob],
  ];


  for (const [cls, prob] of probModels) push(cls, v(prob));

  /* 6. GenAI */
  push("AI_GENERATED", v(se.genai));

  /* 7. Faces */
  if (se.faces) {
    for (const f of se.faces) {
      const box: [number, number, number, number] = [f.x1, f.y1, f.x2, f.y2];
      push("FACE", 0.5, box);

      if (v(f.attributes?.age?.minor) > 0.3)
        push("MINOR_DETECTED", v(f.attributes?.age?.minor), box);
    }
  }

  /* 8. People counting */
    const pc = se["people-counting"];
    if (pc) {
      const pcEntries = Object.entries(pc) as [string, number][];
      const [countKey, countProb] = pcEntries.sort((a, b) => b[1] - a[1])[0] ?? [];

      if (countKey && typeof countProb === "number") {
      push(`PEOPLE_COUNT_${countKey}`, v(countProb));
      }
    }


  /* 9. Quality */
  push("QUALITY", v(se.quality?.score));

  return out;
}
