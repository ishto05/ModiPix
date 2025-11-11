/**
 * Unit tests for upload functionality
 * Tests file validation, upload process, and error handling
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { validateFileContent, validateFileExtension, getAllowedFileTypes, getAllowedExtensions } from '../utils/fileValidator.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitizeInput } from '../middlewares/validation.middleware.js';

describe('File Validation', () => {
  test('should validate correct file extensions', () => {
    expect(validateFileExtension('test.jpg')).toBe(true);
    expect(validateFileExtension('test.jpeg')).toBe(true);
    expect(validateFileExtension('test.png')).toBe(true);
    expect(validateFileExtension('test.webp')).toBe(true);
  });

  test('should reject invalid file extensions', () => {
    expect(validateFileExtension('test.txt')).toBe(false);
    expect(validateFileExtension('test.exe')).toBe(false);
    expect(validateFileExtension('test')).toBe(false);
  });

  test('should validate file content with magic numbers', async () => {
    // Mock a valid JPEG buffer (simplified)
    const validJpegBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, // JPEG magic number
      ...Array(100).fill(0) // Some data
    ]);

    const result = await validateFileContent(validJpegBuffer, 'test.jpg');
    expect(result.isValid).toBe(true);
    expect(result.mimeType).toBe('image/jpeg');
  });

  test('should reject files that are too large', async () => {
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const result = await validateFileContent(largeBuffer, 'large.jpg');
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('File size exceeds maximum');
  });

  test('should reject empty files', async () => {
    const emptyBuffer = Buffer.alloc(0);
    const result = await validateFileContent(emptyBuffer, 'empty.jpg');
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('File is empty');
  });
});

describe('Response Utilities', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      locals: { requestId: 'test-request-id' }
    };
  });

  test('should send success response with correct format', () => {
    const testData = { id: 1, name: 'test' };
    const testMessage = 'Success message';
    
    sendSuccess(mockRes, testData, testMessage, 201);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: testData,
      message: testMessage,
      timestamp: expect.any(String),
      requestId: 'test-request-id'
    });
  });

  test('should send error response with correct format', () => {
    const errorMessage = 'Test error';
    const statusCode = 400;
    const details = { field: 'test' };
    
    sendError(mockRes, errorMessage, statusCode, details);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: errorMessage,
        details: details,
        timestamp: expect.any(String),
        requestId: 'test-request-id'
      }
    });
  });
});

describe('Security Features', () => {
  test('should sanitize input to prevent XSS', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
    expect(sanitizeInput('onclick=alert("xss")')).toBe('alert("xss")');
  });

  test('should validate file types properly', () => {
    const allowedTypes = getAllowedFileTypes();
    const allowedExtensions = getAllowedExtensions();
    
    expect(allowedTypes).toContain('image/jpeg');
    expect(allowedTypes).toContain('image/png');
    expect(allowedTypes).toContain('image/webp');
    
    expect(allowedExtensions).toContain('.jpg');
    expect(allowedExtensions).toContain('.jpeg');
    expect(allowedExtensions).toContain('.png');
    expect(allowedExtensions).toContain('.webp');
  });
});
