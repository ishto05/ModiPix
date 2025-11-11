/**
 * Standardized response utility for consistent API responses
 * Ensures all endpoints return data in the same format
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId || null
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} details - Additional error details
 */
export const sendError = (res, message = 'Internal server error', statusCode = 500, details = null) => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || null
    }
  });
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 */
export const sendValidationError = (res, errors) => {
  res.status(400).json({
    success: false,
    error: {
      message: 'Validation failed',
      details: errors,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || null
    }
  });
};

/**
 * Send not found error response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource that was not found
 */
export const sendNotFound = (res, resource = 'Resource') => {
  res.status(404).json({
    success: false,
    error: {
      message: `${resource} not found`,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || null
    }
  });
};

/**
 * Send unauthorized error response
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
export const sendUnauthorized = (res, message = 'Unauthorized access') => {
  res.status(401).json({
    success: false,
    error: {
      message,
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || null
    }
  });
};
