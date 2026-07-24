/**
 * FleetNest — JWT Utility Functions
 */

import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface DecodedToken extends TokenPayload, JwtPayload {}

/**
 * Generate an access token (short-lived: 15 minutes)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
  });
}

/**
 * Generate a refresh token (long-lived: 7 days)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  });
}

/**
 * Verify an access token and return the decoded payload
 */
export function verifyAccessToken(token: string): DecodedToken {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as DecodedToken;
}

/**
 * Verify a refresh token and return the decoded payload
 */
export function verifyRefreshToken(token: string): DecodedToken {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as DecodedToken;
}

/**
 * Generate a pair of access and refresh tokens
 */
export function generateTokenPair(payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
