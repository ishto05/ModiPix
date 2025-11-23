// modipix-frontend/src/lib/moderation.ts

import type { SightEngineRaw } from "./sightEngine";
import { normalizeSightEngineResponse } from "./sightEngine";
import type { NudeNetRaw } from "./nudenet";
import { normalizeNudeNetResponse } from "./nudenet";

/* -------------------------------------------------------
   BASE TYPES
-------------------------------------------------------- */

export interface ModerationItem {
  class: string;
  score: number;
  box: [number, number, number, number];
  provider?: "sightengine" | "nudenet";
}

export interface ModerationResponse {
  status: string;
  moderationResult: ModerationItem[];
  provider: "sightengine" | "nudenet" | "mixed";
  processingTime?: number;
  metadata?: {
    imageSize?: { width: number; height: number };
    detectedObjects?: number;
    confidence?: "high" | "medium" | "low";
  };
}

/* -------------------------------------------------------
   MODERATION HISTORY ITEM
-------------------------------------------------------- */

export interface ModerationHistoryItem {
  id: string; // UUID from backend
  createdAt: string; // ISO date
  imageUrl: string; // storage URL
  raw: unknown; // raw provider response (un-normalized)
  normalized: ModerationItem[]; // normalized FE format
  provider: "sightengine" | "nudenet" | "mixed";
  scores: SafetyScores;
}


/* -------------------------------------------------------
   PROVIDER TYPE GUARDS (no any)
-------------------------------------------------------- */

function isSightEngine(raw: unknown): raw is SightEngineRaw {
  if (typeof raw !== "object" || raw === null) return false;
  const r = raw as Record<string, unknown>;
  return (
    "nudity" in r ||
    "weapon" in r ||
    "violence" in r ||
    "people-counting" in r
  );
}

function isNudeNet(raw: unknown): raw is NudeNetRaw {
  return (
    typeof raw === "object" &&
    raw !== null &&
    Array.isArray((raw as Record<string, unknown>).detections)
  );
}

/* -------------------------------------------------------
   AUTO-DETECT → NORMALIZE
-------------------------------------------------------- */

export function normalizeProviderResponse(raw: unknown): ModerationItem[] {
  if (isSightEngine(raw)) return normalizeSightEngineResponse(raw);
  if (isNudeNet(raw)) return normalizeNudeNetResponse(raw);
  return [];
}

/* -------------------------------------------------------
   WRAPPER NORMALIZER: returns ModerationItem[]
-------------------------------------------------------- */

export function normalizeModerationResponse(raw: unknown): ModerationItem[] {
  return normalizeProviderResponse(raw);
}

/* -------------------------------------------------------
   MERGE PROVIDERS (if needed)
-------------------------------------------------------- */

export function mergeNormalizedItems(
  ...groups: ModerationItem[][]
): ModerationItem[] {
  return groups.flat().sort((a, b) => b.score - a.score);
}

/* -------------------------------------------------------
   SAFETY SCORES
-------------------------------------------------------- */

export interface SafetyScores {
  overall: number;
  nudity: number;
  violence: number;
  offensive: number;
  weapons: number;
  gore: number;
  scam: number;
}

export const SAFE_CLASSES = [
  "FACE_FEMALE", "FACE_MALE", "FACE_OTHER", "ARM", "HAND",
  "LEG", "FEET", "BELLY", "CLOTHED", "BACKGROUND", "SAFE_CONTENT"
];

export const NUDITY_CLASSES = [
  "FEMALE_BREAST_EXPOSED", "FEMALE_GENITALIA_EXPOSED", 
  "FEMALE_BREAST_COVERED", "FEMALE_GENITALIA_COVERED",
  "MALE_GENITALIA_EXPOSED", "MALE_GENITALIA_COVERED",
  "BUTTOCKS_EXPOSED", "BUTTOCKS_COVERED",
  "ANUS_EXPOSED", "ANUS_COVERED",
  "SEXUAL_ACTIVITY", "SEXUAL_DISPLAY", "EROTICA"
];

export const VIOLENCE_CLASSES = [
  "WEAPON", "GUN", "KNIFE", "GORE", "BLOOD", "VIOLENCE", "FIGHTING"
];

export const OFFENSIVE_CLASSES = [
  "OFFENSIVE", "HATE_SYMBOL", "INAPPROPRIATE_GESTURE", "SCAM", "FRAUD"
];

export const ALL_UNSAFE_CLASSES = [
  ...NUDITY_CLASSES,
  ...VIOLENCE_CLASSES,
  ...OFFENSIVE_CLASSES
];

export function calculateComprehensiveSafetyScore(
  results: ModerationItem[]
): SafetyScores {
  const scores: SafetyScores = {
    overall: 100,
    nudity: 100,
    violence: 100,
    offensive: 100,
    weapons: 100,
    gore: 100,
    scam: 100
  };

  const UNSAFE_THRESHOLD = 0.6;

  for (const item of results) {
    if (SAFE_CLASSES.includes(item.class)) continue;

    if (NUDITY_CLASSES.includes(item.class) && item.score >= UNSAFE_THRESHOLD) {
      scores.nudity = Math.min(scores.nudity, (1 - item.score) * 100);
    }

    if (VIOLENCE_CLASSES.includes(item.class) && item.score >= UNSAFE_THRESHOLD) {
      scores.violence = Math.min(scores.violence, (1 - item.score) * 100);

      if (["WEAPON", "GUN", "KNIFE"].includes(item.class)) {
        scores.weapons = Math.min(scores.weapons, (1 - item.score) * 100);
      }

      if (["GORE", "BLOOD"].includes(item.class)) {
        scores.gore = Math.min(scores.gore, (1 - item.score) * 100);
      }
    }

    if (OFFENSIVE_CLASSES.includes(item.class) && item.score >= UNSAFE_THRESHOLD) {
      scores.offensive = Math.min(scores.offensive, (1 - item.score) * 100);

      if (["SCAM", "FRAUD"].includes(item.class)) {
        scores.scam = Math.min(scores.scam, (1 - item.score) * 100);
      }
    }
  }

  scores.overall = Math.min(
    scores.nudity,
    scores.violence,
    scores.offensive
  );

  return {
    overall: Math.round(scores.overall * 10) / 10,
    nudity: Math.round(scores.nudity * 10) / 10,
    violence: Math.round(scores.violence * 10) / 10,
    offensive: Math.round(scores.offensive * 10) / 10,
    weapons: Math.round(scores.weapons * 10) / 10,
    gore: Math.round(scores.gore * 10) / 10,
    scam: Math.round(scores.scam * 10) / 10
  };
}

/* -------------------------------------------------------
   SAFETY LABEL HELPERS
-------------------------------------------------------- */

export function isImageSafe(results: ModerationItem[]): boolean {
  return calculateComprehensiveSafetyScore(results).overall >= 80;
}

export function getSafetyLevel(score: number) {
  if (score >= 80) {
    return {
      level: "safe",
      description: "Safe for general use",
      color: "text-green-600 dark:text-green-400"
    };
  }
  if (score >= 60) {
    return {
      level: "caution",
      description: "Potentially inappropriate content",
      color: "text-yellow-600 dark:text-yellow-400"
    };
  }
  return {
    level: "unsafe",
    description: "Inappropriate content detected",
    color: "text-red-600 dark:text-red-400"
  };
}

/* -------------------------------------------------------
   API CONFIG
-------------------------------------------------------- */

export const API_CONFIG = {
  BASE_URL: process.env.MODIPIX_PUBLIC_API || "http://localhost:3000",
  ENDPOINTS: {
    MODERATE: "/api/v1/moderation/uploads",
    HEALTH: "/health",
    HISTORY: "/api/v1/moderation/history",
    HISTORY_ITEM: (id: string) => `/api/v1/moderation/history/${id}`
  },
  TIMEOUTS: {
    UPLOAD: 30000,
    HEALTH_CHECK: 5000
  }
} as const;

/* -------------------------------------------------------
   FILE VALIDATION
-------------------------------------------------------- */

export type ModerationError =
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "TIMEOUT_ERROR"
  | "PROVIDER_ERROR"
  | "UNKNOWN_ERROR";

export const ERROR_MESSAGES: Record<ModerationError, string> = {
  FILE_TOO_LARGE: "File size must be less than 5MB",
  INVALID_FILE_TYPE: "Please select a valid image file",
  NETWORK_ERROR: "Network error",
  SERVER_ERROR: "Server error",
  TIMEOUT_ERROR: "Request timed out",
  PROVIDER_ERROR: "Moderation service unavailable",
  UNKNOWN_ERROR: "Unexpected error"
};

export function validateFile(file: File): ModerationError | null {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return "INVALID_FILE_TYPE";
  if (file.size > 5 * 1024 * 1024) return "FILE_TOO_LARGE";
  return null;
}
export function detectProviderFromItems(items: ModerationItem[]): "sightengine" | "nudenet" | "mixed" {
  const hasSE = items.some((i) => i.provider === "sightengine");
  const hasNN = items.some((i) => i.provider === "nudenet");

  if (hasSE && hasNN) return "mixed";
  if (hasNN) return "nudenet";
  return "sightengine";
}

/* -------------------------------------------------------
   FETCH: All history
-------------------------------------------------------- */

/* -------------------------------------------------------
   HISTORY ITEM FETCHER (STRICT, NO ANY)
-------------------------------------------------------- */

export async function fetchModerationHistory(
  token: string
): Promise<ModerationHistoryItem[]> {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HISTORY}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: unknown = await res.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid history data: expected array");
  }

  return data
    .map((item): ModerationHistoryItem | null => {
      if (typeof item !== "object" || item === null) return null;

      const raw = (item as Record<string, unknown>).raw;

      const normalized = normalizeProviderResponse(raw);
      const scores = calculateComprehensiveSafetyScore(normalized);
      const provider = detectProviderFromItems(normalized);

      return {
        id: String((item as Record<string, unknown>).id ?? crypto.randomUUID()),
        createdAt: String(
          (item as Record<string, unknown>).createdAt ?? new Date().toISOString()
        ),
        imageUrl: String(
          (item as Record<string, unknown>).imageUrl ?? ""
        ),
        raw,
        normalized,
        provider,
        scores,
      };
    })
    .filter((v): v is ModerationHistoryItem => v !== null);
}


export async function fetchModerationHistoryItem(id: string, token: string) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HISTORY_ITEM(id)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const item = await res.json();

  const normalized = normalizeProviderResponse(item.raw);

  return {
    ...item,
    normalized,
    scores: calculateComprehensiveSafetyScore(normalized),
    provider: detectProviderFromItems(normalized),
  } as ModerationHistoryItem;
}
