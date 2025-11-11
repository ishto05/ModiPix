# ModiPix Backend Setup Guide

## Overview
This guide covers the setup and configuration of the ModiPix backend after implementing critical security and performance improvements.

## Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- npm or yarn

## Environment Configuration

Create a `.env.development.local` file with the following variables:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/modipix
DIRECT_URL=postgresql://username:password@localhost:5432/modipix

# Clerk Authentication
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here

# Supabase Storage
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Moderation Services
MODERATION_PROVIDER=sightengine
SIGHTENGINE_API_USER=your_sightengine_api_user_here
SIGHTENGINE_API_SECRET=your_sightengine_api_secret_here
MODERATION_SERVICE_URL=http://localhost:8000

# Redis (for caching and background jobs)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
UPLOAD_RATE_LIMIT_MAX_REQUESTS=10

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# External Services
NGROK_AUTH_TOKEN=your_ngrok_auth_token_here
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Create logs directory:
```bash
mkdir logs
```

4. Start Redis server:
```bash
redis-server
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Key Improvements Implemented

### 🔒 Security Enhancements
- **File Content Validation**: Magic number checking instead of just extension validation
- **Rate Limiting**: Protection against DoS attacks
- **Security Headers**: Helmet.js for comprehensive security headers
- **CORS Configuration**: Restricted to allowed origins only
- **Input Sanitization**: XSS prevention
- **Request ID Tracking**: Enhanced logging and debugging

### ⚡ Performance Improvements
- **Background Job Processing**: Image moderation moved to background queue
- **Database Connection Pooling**: Optimized Prisma client configuration
- **Redis Caching**: Ready for caching implementation
- **Non-blocking Operations**: Ngrok tunnel doesn't block server startup
- **Graceful Shutdown**: Proper cleanup on server termination

### 🛠️ Code Quality
- **Structured Logging**: Winston logger with request tracking
- **Standardized Responses**: Consistent API response format
- **Error Handling**: Comprehensive error handling middleware
- **Input Validation**: Joi-based validation schemas
- **Database Schema Fixes**: Corrected field name mismatches

### 🧪 Testing
- **Unit Tests**: Basic test structure for critical functions
- **Error Scenario Testing**: Tests for edge cases and failures
- **Mock Implementations**: Proper mocking for external dependencies

## API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api/v1` - API information

### Image Moderation
- `POST /api/v1/moderation/uploads` - Upload and moderate images

### User Management
- `POST /api/v1/users/clerk/webhook/users` - Clerk webhook handler

## Monitoring and Logging

- **Structured Logs**: All logs include request IDs and contextual information
- **Error Tracking**: Comprehensive error logging with stack traces
- **Performance Metrics**: Database query logging in development
- **Security Monitoring**: Suspicious request detection and logging

## Background Jobs

The application now uses Bull queue for background processing:
- Image moderation jobs are processed asynchronously
- Failed jobs are automatically retried
- Queue statistics are available for monitoring

## Database Schema

The database schema has been corrected with proper field names:
- `images.file_name` (was `filename`)
- `images.file_url` (was `url`)
- `images.file_size` (BigInt type)

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **Rate Limiting**: Configure appropriate limits for your use case
3. **CORS**: Update allowed origins for production
4. **File Validation**: The system now validates file content, not just extensions
5. **Input Sanitization**: All user inputs are sanitized to prevent XSS

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Redis Connection**: Ensure Redis server is running
3. **File Uploads**: Check file size limits and allowed types
4. **Moderation Service**: Verify external service URLs and credentials

### Logs

Check the `logs/` directory for:
- `error.log` - Error logs
- `combined.log` - All logs (production)

## Next Steps

1. Set up monitoring and alerting
2. Implement comprehensive test coverage
3. Add API documentation (Swagger/OpenAPI)
4. Set up CI/CD pipeline
5. Configure production environment variables
6. Implement caching strategies
7. Add performance monitoring
