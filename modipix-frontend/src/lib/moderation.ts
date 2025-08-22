// lib/moderation.ts

// Type describing a single moderation detection
export interface ModerationItem {
  class: string;
  score: number;
  box: [number, number, number, number]; // [x, y, width, height]
}

export interface ModerationResponse {
  status: string;
  moderationResult: ModerationItem[];
}

export const SAFE_CLASSES = [
  "FACE_FEMALE",
  "FACE_MALE", 
  "FACE_OTHER",
  "ARM",
  "HAND",
  "LEG",
  "FEET",
  "BELLY",
  "CLOTHED",
  "BACKGROUND"
];

export const UNSAFE_CLASSES = [
  "FEMALE_BREAST_EXPOSED",
  "FEMALE_GENITALIA_EXPOSED", 
  "FEMALE_BREAST_COVERED",
  "FEMALE_GENITALIA_COVERED",
  "MALE_GENITALIA_EXPOSED",
  "MALE_GENITALIA_COVERED",
  "BUTTOCKS_EXPOSED",
  "BUTTOCKS_COVERED", 
  "ANUS_EXPOSED",
  "ANUS_COVERED",
  "SEXUAL_ACTIVITY",
  "SEX_TOY",
  "ARTIFICIAL_GENITALIA"
];

export const isImageSafe = (results: ModerationItem[]): boolean => {
  const UNSAFE_THRESHOLD = 0.6;
  
  for (const item of results) {
    if (SAFE_CLASSES.includes(item.class)) continue;
    if (UNSAFE_CLASSES.includes(item.class) && item.score >= UNSAFE_THRESHOLD) {
      return false; // unsafe detection found
    }
  }
  return true;
};

// Calculate overall safety score out of 100
export const calculateSafetyScore = (results: ModerationItem[]): number => {
  if (!results || results.length === 0) return 100;
  
  const UNSAFE_THRESHOLD = 0.6;
  let totalUnsafeScore = 0;
  let unsafeDetections = 0;
  
  for (const item of results) {
    if (UNSAFE_CLASSES.includes(item.class)) {
      totalUnsafeScore += item.score;
      unsafeDetections++;
    }
  }
  
  if (unsafeDetections === 0) return 100;
  
  // Calculate average unsafe score and convert to safety percentage
  const avgUnsafeScore = totalUnsafeScore / unsafeDetections;
  const safetyScore = Math.max(0, Math.min(100, (1 - avgUnsafeScore) * 100));
  
  return Math.round(safetyScore * 10) / 10; // Round to 1 decimal place
};