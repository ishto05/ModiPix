// modipix-frontend/src/lib/moderation.ts - Enhanced Version

// Base moderation item (standardized across all providers)
export interface ModerationItem {
  class: string;
  score: number;
  box: [number, number, number, number]; // [x, y, width, height]
  provider?: string; // Track which service detected this
}

// Enhanced response with provider info
export interface ModerationResponse {
  status: string;
  moderationResult: ModerationItem[];
  provider?: 'nudenet' | 'sightengine' | 'mixed';
  processingTime?: number;
  metadata?: {
    imageSize?: { width: number; height: number };
    detectedObjects?: number;
    confidence?: 'high' | 'medium' | 'low';
  };
}

// Comprehensive safety scores
export interface SafetyScores {
  overall: number;
  nudity: number;
  violence: number;
  offensive: number;
  weapons: number;
  gore: number;
  scam: number;
}

// Extended class definitions for multiple providers
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
  "BACKGROUND",
  "SAFE_CONTENT"
];

export const NUDITY_CLASSES = [
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
  "SEXUAL_DISPLAY",
  "EROTICA"
];

export const VIOLENCE_CLASSES = [
  "WEAPON",
  "GUN",
  "KNIFE",
  "GORE",
  "BLOOD",
  "VIOLENCE",
  "FIGHTING"
];

export const OFFENSIVE_CLASSES = [
  "OFFENSIVE",
  "HATE_SYMBOL",
  "INAPPROPRIATE_GESTURE",
  "SCAM",
  "FRAUD"
];

export const ALL_UNSAFE_CLASSES = [
  ...NUDITY_CLASSES,
  ...VIOLENCE_CLASSES,
  ...OFFENSIVE_CLASSES
];

// Enhanced safety calculation with category breakdown
export const calculateComprehensiveSafetyScore = (results: ModerationItem[]): SafetyScores => {
  const scores: SafetyScores = {
    overall: 100,
    nudity: 100,
    violence: 100,
    offensive: 100,
    weapons: 100,
    gore: 100,
    scam: 100
  };

  if (!results || results.length === 0) return scores;

  const UNSAFE_THRESHOLD = 0.6;
  
  for (const item of results) {
    if (SAFE_CLASSES.includes(item.class)) continue;
    
    // Nudity scoring
    if (NUDITY_CLASSES.includes(item.class) && item.score >= UNSAFE_THRESHOLD) {
      scores.nudity = Math.min(scores.nudity, (1 - item.score) * 100);
    }
    
    // Violence/Weapons scoring
    if (VIOLENCE_CLASSES.includes(item.class) && item.score >= UNSAFE_THRESHOLD) {
      scores.violence = Math.min(scores.violence, (1 - item.score) * 100);
      if (['WEAPON', 'GUN', 'KNIFE'].includes(item.class)) {
        scores.weapons = Math.min(scores.weapons, (1 - item.score) * 100);
      }
      if (['GORE', 'BLOOD'].includes(item.class)) {
        scores.gore = Math.min(scores.gore, (1 - item.score) * 100);
      }
    }
    
    // Offensive content scoring
    if (OFFENSIVE_CLASSES.includes(item.class) && item.score >= UNSAFE_THRESHOLD) {
      scores.offensive = Math.min(scores.offensive, (1 - item.score) * 100);
      if (['SCAM', 'FRAUD'].includes(item.class)) {
        scores.scam = Math.min(scores.scam, (1 - item.score) * 100);
      }
    }
  }

  // Calculate overall score (worst category determines overall safety)
  scores.overall = Math.min(scores.nudity, scores.violence, scores.offensive);
  
  // Round all scores to 1 decimal place
  Object.keys(scores).forEach(key => {
    scores[key as keyof SafetyScores] = Math.round(scores[key as keyof SafetyScores] * 10) / 10;
  });

  return scores;
};

// Enhanced safety determination
export const isImageSafe = (results: ModerationItem[]): boolean => {
  const scores = calculateComprehensiveSafetyScore(results);
  return scores.overall >= 80; // Safe if overall score >= 80%
};

// Get safety level description
export const getSafetyLevel = (score: number): {
  level: 'safe' | 'caution' | 'unsafe';
  description: string;
  color: string;
} => {
  if (score >= 80) {
    return {
      level: 'safe',
      description: 'Safe for general use',
      color: 'text-green-600 dark:text-green-400'
    };
  } else if (score >= 60) {
    return {
      level: 'caution',
      description: 'Potentially inappropriate content detected',
      color: 'text-yellow-600 dark:text-yellow-400'
    };
  } else {
    return {
      level: 'unsafe',
      description: 'Inappropriate content detected',
      color: 'text-red-600 dark:text-red-400'
    };
  }
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.MODIPIX_PUBLIC_API || "http://localhost:3000",
  ENDPOINTS: {
    MODERATE: "/api/v1/moderation/uploads",
    HEALTH: "/health"
  },
  TIMEOUTS: {
    UPLOAD: 30000, // 30 seconds
    HEALTH_CHECK: 5000 // 5 seconds
  }
} as const;

// Enhanced error types
export type ModerationError = 
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'TIMEOUT_ERROR'
  | 'PROVIDER_ERROR'
  | 'UNKNOWN_ERROR';

export const ERROR_MESSAGES: Record<ModerationError, string> = {
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  INVALID_FILE_TYPE: 'Please select a valid image file (JPEG, PNG, WebP)',
  NETWORK_ERROR: 'Network connection failed. Please check your connection.',
  SERVER_ERROR: 'Server error occurred. Please try again.',
  TIMEOUT_ERROR: 'Upload timed out. Please try again.',
  PROVIDER_ERROR: 'Moderation service is temporarily unavailable.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// File validation
export const validateFile = (file: File): ModerationError | null => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return 'INVALID_FILE_TYPE';
  }

  if (file.size > maxSize) {
    return 'FILE_TOO_LARGE';
  }

  return null;
};