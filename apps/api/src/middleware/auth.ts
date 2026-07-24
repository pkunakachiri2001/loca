/**
 * FleetNest — Authentication Middleware
 * Verifies JWT access tokens and attaches user to request
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../config/jwt';
import { prisma } from '../config/database';
import { ApiError } from './errorHandler';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

/**
 * Middleware: Verify that the request has a valid JWT access token
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    const decoded = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, status: true },
    });

    if (!user) {
      throw new ApiError(401, 'User not found. Please log in again.');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Your account has been suspended. Please contact support.');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    if ((error as any).name === 'TokenExpiredError') {
      next(new ApiError(401, 'Session expired. Please log in again.'));
    } else if ((error as any).name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token. Please log in again.'));
    } else {
      next(error);
    }
  }
}

/**
 * Middleware: Require specific user roles
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required.'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, 'You do not have permission to perform this action.'));
      return;
    }

    next();
  };
}

/**
 * Middleware: Optional authentication (doesn't fail if no token)
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, firstName: true, lastName: true, status: true },
      });
      if (user && user.status === 'ACTIVE') {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      }
    }
    next();
  } catch {
    // Silently continue without user
    next();
  }
}
