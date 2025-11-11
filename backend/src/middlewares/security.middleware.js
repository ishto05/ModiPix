/**
 * Security middleware for enhanced protection
 * Includes rate limiting, CORS, and security headers
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
// import cors from 'cors';
import { logger } from '../utils/logger.js';

/**
 * Rate limiting configuration for different endpoints
 */
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message,
        timestamp: new Date().toISOString()
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        requestId: req.requestId
      });
      res.status(429).json({
        success: false,
        error: {
          message,
          timestamp: new Date().toISOString(),
          requestId: req.requestId
        }
      });
    }
  });
};

// Specific rate limits for different endpoints
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP');
export const uploadRateLimit = createRateLimit(15 * 60 * 1000, 10, 'Too many upload requests from this IP');
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication requests from this IP');

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID']
};

/**
 * Security headers configuration
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Request ID middleware
 */
export const requestIdMiddleware = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.locals.requestId = req.requestId;
  res.set('X-Request-ID', req.requestId);
  next();
};

/**
 * Security logging middleware
 */
export const securityLogging = (req, res, next) => {
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /eval\(/i,  // Code injection
    /javascript:/i  // JavaScript injection
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || pattern.test(JSON.stringify(req.body))
  );
  
  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      body: req.body,
      requestId: req.requestId
    });
  }
  
  next();
};
