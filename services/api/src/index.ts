import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './lib/config';
import { supabase } from './lib/supabaseClient';
import { requireAuth } from './http/middleware/auth';
import { errorHandler } from './http/middleware/error';
import { sanitizeInput } from './http/middleware/validation';
import { createRoutes } from './http/routes';

// Initialize Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware with enhanced headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// CORS configuration with security enhancements
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
}));

// Rate limiting with different tiers
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health', // Don't rate limit health checks
});

// Stricter rate limiting for sensitive operations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/auth/', authLimiter);
app.use('/api/', generalLimiter);

// Body parsing middleware with security limits
app.use(express.json({
  limit: '1mb',
  strict: true
}));
app.use(express.urlencoded({
  extended: true,
  limit: '1mb',
  parameterLimit: 100
}));

// Input sanitization middleware
app.use(sanitizeInput);

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'advent-calendar-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes (protected by auth)
app.use('/api', requireAuth, createRoutes());

// Global error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  // TODO: Implement proper logging service
  // Log:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  // TODO: Implement proper logging service
  process.exit(0);
});

process.on('SIGINT', () => {
  // TODO: Implement proper logging service
  process.exit(0);
});