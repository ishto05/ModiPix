/**
 * Centralized error handling middleware
 * Provides consistent error responses and logging
 */

import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Handle Prisma-specific errors
 * @param {Error} error - Prisma error
 * @returns {Object} Standardized error response
 */
const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      return {
        statusCode: 409,
        message: 'Resource already exists',
        details: 'A record with this information already exists'
      };
    case 'P2025':
      return {
        statusCode: 404,
        message: 'Record not found',
        details: 'The requested record could not be found'
      };
    case 'P2003':
      return {
        statusCode: 400,
        message: 'Foreign key constraint failed',
        details: 'Referenced record does not exist'
      };
    case 'P2014':
      return {
        statusCode: 400,
        message: 'Invalid ID',
        details: 'The provided ID is invalid'
      };
    default:
      return {
        statusCode: 500,
        message: 'Database error',
        details: 'An error occurred while processing the database request'
      };
  }
};

/**
 * Handle validation errors
 * @param {Error} error - Validation error
 * @returns {Object} Standardized error response
 */
const handleValidationError = (error) => {
  return {
    statusCode: 400,
    message: 'Validation failed',
    details: error.details || error.message
  };
};

/**
 * Handle file upload errors
 * @param {Error} error - File upload error
 * @returns {Object} Standardized error response
 */
const handleFileUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      statusCode: 413,
      message: 'File too large',
      details: 'File size exceeds the maximum allowed limit'
    };
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return {
      statusCode: 400,
      message: 'Too many files',
      details: 'Only one file is allowed per request'
    };
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return {
      statusCode: 400,
      message: 'Unexpected file field',
      details: 'File must be uploaded using the correct field name'
    };
  }
  
  return {
    statusCode: 400,
    message: 'File upload error',
    details: error.message
  };
};

/**
 * Handle external API errors
 * @param {Error} error - External API error
 * @returns {Object} Standardized error response
 */
const handleExternalApiError = (error) => {
  if (error.code === 'ECONNREFUSED') {
    return {
      statusCode: 503,
      message: 'Service unavailable',
      details: 'External service is currently unavailable'
    };
  }
  
  if (error.code === 'ETIMEDOUT') {
    return {
      statusCode: 504,
      message: 'Service timeout',
      details: 'External service request timed out'
    };
  }
  
  if (error.response?.status === 401) {
    return {
      statusCode: 502,
      message: 'Authentication failed',
      details: 'External service authentication failed'
    };
  }
  
  if (error.response?.status === 429) {
    return {
      statusCode: 503,
      message: 'Rate limit exceeded',
      details: 'External service rate limit exceeded'
    };
  }
  
  return {
    statusCode: 502,
    message: 'External service error',
    details: 'An error occurred while communicating with external service'
  };
};

/**
 * Main error handling middleware
 */
export const errorHandler = (error, req, res) => {
  let errorResponse;
  
  // Log the error
  logger.error('Unhandled error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    },
    requestId: req.requestId
  });
  
  // Handle different types of errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    errorResponse = handlePrismaError(error);
  } else if (error.name === 'ValidationError' || error.isJoi) {
    errorResponse = handleValidationError(error);
  } else if (error.code && error.code.startsWith('LIMIT_')) {
    errorResponse = handleFileUploadError(error);
  } else if (error.isAxiosError || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    errorResponse = handleExternalApiError(error);
  } else if (error.name === 'UnauthorizedError') {
    errorResponse = {
      statusCode: 401,
      message: 'Unauthorized',
      details: 'Authentication required'
    };
  } else if (error.name === 'ForbiddenError') {
    errorResponse = {
      statusCode: 403,
      message: 'Forbidden',
      details: 'Insufficient permissions'
    };
  } else if (error.name === 'NotFoundError') {
    errorResponse = {
      statusCode: 404,
      message: 'Not found',
      details: 'The requested resource was not found'
    };
  } else {
    // Generic error
    errorResponse = {
      statusCode: 500,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message
    };
  }
  
  // Send error response
  sendError(
    res, 
    errorResponse.message, 
    errorResponse.statusCode, 
    errorResponse.details
  );
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId
  });
  
  sendError(res, 'Route not found', 404);
};

/**
 * Handle uncaught exceptions
 */
export const uncaughtExceptionHandler = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
export const unhandledRejectionHandler = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { 
      reason: reason?.message || reason, 
      stack: reason?.stack,
      promise: promise.toString()
    });
    process.exit(1);
  });
};
