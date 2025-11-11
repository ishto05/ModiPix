/**
 * Input validation middleware using Joi
 * Provides centralized validation for all endpoints
 */

import Joi from 'joi';
import { sendValidationError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi schema object
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Validation failed', {
        errors,
        property,
        requestId: req.requestId,
        path: req.path
      });

      return sendValidationError(res, errors);
    }

    // Replace the original property with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * File upload validation schemas
 */
export const uploadSchemas = {
  // Basic file validation (handled by multer + fileValidator)
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/webp').required(),
    size: Joi.number().max(5 * 1024 * 1024).required(), // 5MB max
    buffer: Joi.binary().required()
  })
};

/**
 * User validation schemas
 */
export const userSchemas = {
  clerkWebhook: Joi.object({
    type: Joi.string().valid('user.created', 'user.updated', 'user.deleted').required(),
    data: Joi.object({
      id: Joi.string().required(),
      email_addresses: Joi.array().items(
        Joi.object({
          email_address: Joi.string().email().required()
        })
      ).optional(),
      username: Joi.string().optional(),
      image_url: Joi.string().uri().optional()
    }).required()
  })
};

/**
 * Moderation validation schemas
 */
export const moderationSchemas = {
  moderationResult: Joi.object({
    categories: Joi.array().items(
      Joi.object({
        class: Joi.string().required(),
        score: Joi.number().min(0).max(1).required(),
        level: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').required()
      })
    ).required(),
    summary: Joi.object({
      action: Joi.string().optional(),
      overallRisk: Joi.number().min(0).max(1).optional(),
      overallLevel: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
      reasons: Joi.array().items(Joi.string()).optional()
    }).optional()
  })
};

/**
 * Query parameter validation schemas
 */
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('created_at', 'updated_at', 'status').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),
  
  imageFilter: Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected', 'processing').optional(),
    user_id: Joi.string().uuid().optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().optional()
  })
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize request body middleware
 */
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeInput(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    
    sanitizeObject(req.body);
  }
  
  next();
};
