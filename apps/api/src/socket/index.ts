/**
 * FleetNest — Socket.io Real-time Server
 * Handles live booking status, notifications, and GPS tracking architecture
 */

import { Server, Socket } from 'socket.io';
import http from 'http';
import { verifyAccessToken } from '../config/jwt';
import { logger } from '../config/logger';

let io: Server;

// Map of userId -> Set of socketIds for multi-device support
const userSockets = new Map<string, Set<string>>();

export function initSocket(server: http.Server): void {
  io = new Server(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware for Socket.io
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        // Allow unauthenticated connections (for public rooms)
        socket.data.userId = null;
        return next();
      }

      const decoded = verifyAccessToken(token);
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch {
      // Allow connection even with invalid token (for public features)
      socket.data.userId = null;
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string | null;

    if (userId) {
      // Track user socket
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);
      socket.join(`user:${userId}`);
      logger.debug(`User ${userId} connected (socket: ${socket.id})`);
    }

    // ──────────────────────────────────────────────
    // BOOKING ROOM — Real-time booking status updates
    // ──────────────────────────────────────────────
    socket.on('join_booking', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      logger.debug(`Socket ${socket.id} joined booking room: ${bookingId}`);
    });

    socket.on('leave_booking', (bookingId: string) => {
      socket.leave(`booking:${bookingId}`);
    });

    // ──────────────────────────────────────────────
    // GPS TRACKING (Architecture stub)
    // Company driver sends location updates
    // ──────────────────────────────────────────────
    socket.on('driver_location_update', (data: { bookingId: string; lat: number; lng: number }) => {
      if (!userId || socket.data.role !== 'COMPANY_OWNER') return;
      // Broadcast to the booking room (customer sees live location)
      io.to(`booking:${data.bookingId}`).emit('location_update', {
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString(),
      });
    });

    // ──────────────────────────────────────────────
    // COMPANY ROOM — Company-specific events
    // ──────────────────────────────────────────────
    socket.on('join_company', (companyId: string) => {
      if (socket.data.role === 'COMPANY_OWNER' || socket.data.role === 'ADMIN') {
        socket.join(`company:${companyId}`);
      }
    });

    // ──────────────────────────────────────────────
    // DISCONNECT CLEANUP
    // ──────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (userId) {
        userSockets.get(userId)?.delete(socket.id);
        if (userSockets.get(userId)?.size === 0) {
          userSockets.delete(userId);
        }
      }
      logger.debug(`Socket ${socket.id} disconnected`);
    });
  });

  logger.info('✅ Socket.io initialized');
}

/**
 * Emit an event to a specific user across all their devices
 */
export function emitToUser(userId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit to a booking room (both customer and company see it)
 */
export function emitToBooking(bookingId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`booking:${bookingId}`).emit(event, data);
}

/**
 * Emit to a company room
 */
export function emitToCompany(companyId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`company:${companyId}`).emit(event, data);
}

/**
 * Broadcast to all connected clients (system announcements)
 */
export function broadcast(event: string, data: unknown): void {
  if (!io) return;
  io.emit(event, data);
}

export { io };
