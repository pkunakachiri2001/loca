/**
 * FleetNest API — Express App Configuration
 * Sets up middleware, routes, and error handling
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import companyRoutes from './routes/companies';
import listingRoutes from './routes/listings';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';
import categoryRoutes from './routes/categories';
import couponRoutes from './routes/coupons';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import contactRoutes from './routes/contact';

export const app = express();

// ──────────────────────────────────────────────
// CORS — MUST be first, before Helmet or any other middleware
// Helmet can override/strip CORS headers if it runs first.
// ──────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Always reflect the requesting origin so credentials work
  res.setHeader('Access-Control-Allow-Origin', origin || 'https://loca-webpkuna.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-CSRF-Token, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
  res.setHeader('Vary', 'Origin');

  // Respond to preflight immediately — do NOT pass to Helmet or routes
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

// ──────────────────────────────────────────────
// SECURITY MIDDLEWARE (after CORS)
// ──────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));

// ──────────────────────────────────────────────
// RATE LIMITING
// ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ──────────────────────────────────────────────
// BODY PARSING & UTILITIES
// ──────────────────────────────────────────────
// Note: Stripe webhook needs raw body BEFORE JSON parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ──────────────────────────────────────────────
// LOGGING
// ──────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: (req) => req.url === '/api/health',
}));

// ──────────────────────────────────────────────
// STATIC FILES (local uploads fallback)
// ──────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FleetNest API Server is online',
    health: '/api/health',
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FleetNest API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ──────────────────────────────────────────────
// API ROUTES
// ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);

// ──────────────────────────────────────────────
// ERROR HANDLING
// ──────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
