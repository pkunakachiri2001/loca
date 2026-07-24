/**
 * FleetNest — Authentication Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 * POST /api/auth/refresh
 * POST /api/auth/forgot-password
 * POST /api/auth/reset-password
 * POST /api/auth/verify-email
 * GET  /api/auth/google
 * GET  /api/auth/google/callback
 * GET  /api/auth/me
 */

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt';
import { authenticate } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { emailService } from '../services/email';
import { body, validationResult } from 'express-validator';

const router = Router();

// ──────────────────────────────────────────────
// VALIDATION RULES
// ──────────────────────────────────────────────
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(['CUSTOMER', 'COMPANY_OWNER']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Validation result checker middleware
function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }
  next();
}

// ──────────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────────
router.post('/register', registerValidation, validate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role = 'CUSTOMER' } = req.body;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        emailVerifyToken,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    // Send verification email (non-blocking)
    emailService.sendVerificationEmail(email, firstName, emailVerifyToken).catch(() => {});

    // Generate tokens
    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      data: { user, accessToken: tokens.accessToken },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────
router.post('/login', loginValidation, validate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Your account has been suspended. Please contact support.');
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role });

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          loyaltyPoints: user.loyaltyPoints,
        },
        accessToken: tokens.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/logout
// ──────────────────────────────────────────────
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { refreshToken: null },
    });

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/refresh
// ──────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) throw new ApiError(401, 'Refresh token required.');

    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, refreshToken: true, status: true },
    });

    if (!user || user.refreshToken !== token) {
      throw new ApiError(401, 'Invalid refresh token. Please log in again.');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Account suspended.');
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/forgot-password
// ──────────────────────────────────────────────
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });

      // Always return success to prevent email enumeration
      if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
          where: { id: user.id },
          data: { resetToken, resetTokenExpiry },
        });

        emailService.sendPasswordResetEmail(email, user.firstName, resetToken).catch(() => {});
      }

      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────
// POST /api/auth/reset-password
// ──────────────────────────────────────────────
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], validate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired password reset link.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        refreshToken: null, // Force re-login
      },
    });

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/verify-email
// ──────────────────────────────────────────────
router.post('/verify-email', [body('token').notEmpty()], validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
      if (!user) throw new ApiError(400, 'Invalid or expired verification link.');

      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, emailVerifyToken: null },
      });

      res.json({ success: true, message: 'Email verified successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────
// GET /api/auth/me
// ──────────────────────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatar: true, role: true, status: true, isEmailVerified: true,
        loyaltyPoints: true, createdAt: true,
        company: {
          select: { id: true, name: true, slug: true, status: true, logo: true },
        },
      },
    });

    if (!user) throw new ApiError(404, 'User not found.');

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
