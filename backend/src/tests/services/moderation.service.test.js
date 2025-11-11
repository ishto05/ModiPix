/**
 * Unit tests for ModerationService
 * Tests both SightEngine and NudeNet moderation providers
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import ModerationService from '../../services/moderation.service.js';
import axios from 'axios';

describe('ModerationService', () => {
  let moderationService;

  beforeEach(() => {
    // Ensure required env vars are set for tests
    process.env.SIGHTENGINE_API_USER = process.env.SIGHTENGINE_API_USER || 'test_user';
    process.env.SIGHTENGINE_API_SECRET = process.env.SIGHTENGINE_API_SECRET || 'test_secret';
    process.env.MODERATION_PROVIDER = process.env.MODERATION_PROVIDER || 'sightengine';
    jest.clearAllMocks();
    moderationService = new ModerationService();
    jest.spyOn(axios, 'post').mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with default provider', () => {
      expect(moderationService.provider).toBe('sightengine');
    });

    test('should use environment variables for API credentials', () => {
      expect(moderationService.sightEngineApiUser).toBeDefined();
      expect(moderationService.sightEngineApiSecret).toBeDefined();
    });
  });

  describe('moderateImage', () => {
    test('should call SightEngine when provider is sightengine', async () => {
      const mockResponse = {
        data: {
          nudity: { raw: 0.1 },
          weapon: 0.2,
          alcohol: 0.3
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const fileBuffer = Buffer.from('test image data');
      const fileName = 'test.jpg';

      await moderationService.moderateImage(fileBuffer, fileName);

      expect(axios.post).toHaveBeenCalledWith(
        'https://api.sightengine.com/1.0/check.json',
        expect.any(Object),
        expect.objectContaining({
          headers: expect.any(Object),
          timeout: 30000
        })
      );
    });

    test('should call NudeNet when provider is nudenet', async () => {
      moderationService.provider = 'nudenet';
      const mockResponse = {
        data: [{ class: 'EXPOSED_BREAST_F', score: 0.8 }]
      };
      axios.post.mockResolvedValue(mockResponse);

      const fileBuffer = Buffer.from('test image data');
      const fileName = 'test.jpg';

      await moderationService.moderateImage(fileBuffer, fileName);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/moderate'),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.any(Object),
          timeout: 30000
        })
      );
    });

    test('should throw error for unsupported provider', async () => {
      moderationService.provider = 'unsupported';
      const fileBuffer = Buffer.from('test image data');

      await expect(moderationService.moderateImage(fileBuffer))
        .rejects.toThrow('Unsupported moderation provider: unsupported');
    });
  });

  describe('SightEngine Error Handling', () => {
    test('should handle connection refused error', async () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      axios.post.mockRejectedValue(error);

      const fileBuffer = Buffer.from('test image data');

      await expect(moderationService.moderateWithSightEngine(fileBuffer, 'test.jpg'))
        .rejects.toThrow('SightEngine service is unavailable');
    });

    test('should handle timeout error', async () => {
      const error = new Error('Timeout');
      error.code = 'ETIMEDOUT';
      axios.post.mockRejectedValue(error);

      const fileBuffer = Buffer.from('test image data');

      await expect(moderationService.moderateWithSightEngine(fileBuffer, 'test.jpg'))
        .rejects.toThrow('SightEngine request timed out');
    });

    test('should handle authentication error', async () => {
      const error = new Error('Unauthorized');
      error.response = { status: 401 };
      axios.post.mockRejectedValue(error);

      const fileBuffer = Buffer.from('test image data');

      await expect(moderationService.moderateWithSightEngine(fileBuffer, 'test.jpg'))
        .rejects.toThrow('SightEngine authentication failed');
    });

    test('should handle rate limit error', async () => {
      const error = new Error('Too Many Requests');
      error.response = { status: 429 };
      axios.post.mockRejectedValue(error);

      const fileBuffer = Buffer.from('test image data');

      await expect(moderationService.moderateWithSightEngine(fileBuffer, 'test.jpg'))
        .rejects.toThrow('SightEngine rate limit exceeded');
    });
  });

  describe('SightEngine Response Normalization', () => {
    test('should normalize nudity detection', () => {
      const sightEngineData = {
        nudity: { raw: 0.8, partial: 0.2 }
      };

      const result = moderationService.normalizeSightEngineResponse(sightEngineData);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0]).toEqual({
        class: 'NUDITY',
        score: 0.8,
        level: 'HIGH'
      });
    });

    test('should normalize weapon detection', () => {
      const sightEngineData = {
        weapon: 0.7
      };

      const result = moderationService.normalizeSightEngineResponse(sightEngineData);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0]).toEqual({
        class: 'WEAPON',
        score: 0.7,
        level: 'HIGH'
      });
    });

    test('should normalize multiple categories', () => {
      const sightEngineData = {
        nudity: { raw: 0.9 },
        weapon: 0.8,
        alcohol: 0.6,
        violence: 0.7
      };

      const result = moderationService.normalizeSightEngineResponse(sightEngineData);

      expect(result.categories).toHaveLength(4);
      expect(result.categories.map(c => c.class)).toContain('NUDITY');
      expect(result.categories.map(c => c.class)).toContain('WEAPON');
      expect(result.categories.map(c => c.class)).toContain('ALCOHOL');
      expect(result.categories.map(c => c.class)).toContain('VIOLENCE');
    });

    test('should include summary when provided', () => {
      const sightEngineData = {
        nudity: { raw: 0.8 },
        summary: {
          action: 'reject',
          reject_prob: 0.9,
          reject_reason: ['inappropriate content']
        }
      };

      const result = moderationService.normalizeSightEngineResponse(sightEngineData);

      expect(result.summary).toEqual({
        action: 'reject',
        overallRisk: 0.9,
        overallLevel: 'CRITICAL',
        reasons: ['inappropriate content']
      });
    });

    test('should filter out low-confidence detections', () => {
      const sightEngineData = {
        nudity: { raw: 0.05 }, // Below threshold
        weapon: 0.1, // Below threshold
        alcohol: 0.4 // Above threshold
      };

      const result = moderationService.normalizeSightEngineResponse(sightEngineData);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].class).toBe('ALCOHOL');
    });
  });

  describe('NudeNet Response Normalization', () => {
    test('should normalize NudeNet response format', () => {
      const nudeNetData = [
        { class: 'EXPOSED_BREAST_F', score: 0.8, box: [10, 20, 30, 40] },
        { class: 'EXPOSED_GENITALIA_F', score: 0.9, box: [50, 60, 70, 80] }
      ];

      const result = moderationService.normalizeNudeNetResponse(nudeNetData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        class: 'EXPOSED_BREAST_F',
        score: 0.8,
        box: [10, 20, 30, 40]
      });
    });
  });
});
