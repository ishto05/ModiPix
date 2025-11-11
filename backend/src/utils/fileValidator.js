/**
 * File validation utility with magic number checking
 * Provides secure file type validation beyond just extension checking
 */

import fileType from 'file-type';
import { logger } from '../utils/logger.js';

// Allowed file types with their MIME types and magic numbers
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
};

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate file content using magic numbers
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename
 * @returns {Object} Validation result
 */
export const validateFileContent = async (buffer, originalName) => {
  try {
    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    // Check if buffer is empty
    if (buffer.length === 0) {
      return {
        isValid: false,
        error: 'File is empty'
      };
    }

    // Get file type from magic numbers
    const fileTypeResult = await fileType.fromBuffer(buffer);
    
    if (!fileTypeResult) {
      return {
        isValid: false,
        error: 'Unable to determine file type'
      };
    }

    // Check if MIME type is allowed
    if (!ALLOWED_FILE_TYPES[fileTypeResult.mime]) {
      return {
        isValid: false,
        error: `File type ${fileTypeResult.mime} is not allowed. Only ${Object.keys(ALLOWED_FILE_TYPES).join(', ')} are supported`
      };
    }

    // Validate extension matches MIME type
    const extension = originalName.toLowerCase().split('.').pop();
    const allowedExtensions = ALLOWED_FILE_TYPES[fileTypeResult.mime];
    
    if (!allowedExtensions.includes(`.${extension}`)) {
      return {
        isValid: false,
        error: `File extension .${extension} does not match detected file type ${fileTypeResult.mime}`
      };
    }

    logger.info('File validation successful', {
      originalName,
      mimeType: fileTypeResult.mime,
      size: buffer.length
    });

    return {
      isValid: true,
      mimeType: fileTypeResult.mime,
      size: buffer.length
    };

  } catch (error) {
    logger.error('File validation error', { error: error.message, originalName });
    return {
      isValid: false,
      error: 'File validation failed'
    };
  }
};

/**
 * Validate file extension (additional check)
 * @param {string} filename - Filename to validate
 * @returns {boolean} Whether extension is valid
 */
export const validateFileExtension = (filename) => {
  const extension = filename.toLowerCase().split('.').pop();
  const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat();
  return allowedExtensions.includes(`.${extension}`);
};

/**
 * Get allowed file types for error messages
 * @returns {Array} Array of allowed file types
 */
export const getAllowedFileTypes = () => {
  return Object.keys(ALLOWED_FILE_TYPES);
};

/**
 * Get allowed extensions for error messages
 * @returns {Array} Array of allowed extensions
 */
export const getAllowedExtensions = () => {
  return Object.values(ALLOWED_FILE_TYPES).flat();
};
