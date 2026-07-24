/**
 * FleetNest — Users Routes (customer profile, bookings, wishlist, notifications)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// GET /api/users/me — Get own profile
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatar: true, role: true, status: true, isEmailVerified: true,
        loyaltyPoints: true, createdAt: true,
        company: { select: { id: true, name: true, slug: true, status: true, logo: true } },
      },
    });
    if (!user) throw new ApiError(404, 'User not found.');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

// PUT /api/users/me — Update profile
router.put('/me', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { firstName, lastName, phone, avatar },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true },
    });
    res.json({ success: true, message: 'Profile updated.', data: updated });
  } catch (err) { next(err); }
});

// GET /api/users/me/bookings — My bookings
router.get('/me/bookings', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const status = req.query.status as string;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: req.user!.id, ...(status ? { status: status as any } : {}) },
        include: {
          listing: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          company: { select: { name: true, logo: true, phone: true } },
          payment: { select: { status: true, paidAt: true, transactionRef: true } },
          review: { select: { id: true, rating: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where: { userId: req.user!.id, ...(status ? { status: status as any } : {}) } }),
    ]);

    res.json({ success: true, data: bookings, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// GET /api/users/me/wishlist — My wishlist
router.get('/me/wishlist', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: {
        listing: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            company: { select: { name: true, city: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: wishlist });
  } catch (err) { next(err); }
});

// POST /api/users/me/wishlist/:listingId — Add to wishlist
router.post('/me/wishlist/:listingId', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { listingId } = req.params;
    await prisma.wishlistItem.create({ data: { userId: req.user!.id, listingId } });
    res.status(201).json({ success: true, message: 'Added to wishlist.' });
  } catch (err) {
    if ((err as any).code === 'P2002') {
      res.json({ success: true, message: 'Already in wishlist.' });
      return;
    }
    next(err);
  }
});

// DELETE /api/users/me/wishlist/:listingId — Remove from wishlist
router.delete('/me/wishlist/:listingId', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.wishlistItem.deleteMany({ where: { userId: req.user!.id, listingId: req.params.listingId } });
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (err) { next(err); }
});

// GET /api/users/me/notifications
router.get('/me/notifications', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
    ]);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) { next(err); }
});

// PUT /api/users/me/notifications/read-all
router.put('/me/notifications/read-all', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user!.id, isRead: false }, data: { isRead: true } });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
});

// GET /api/users/me/loyalty
router.get('/me/loyalty', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [user, transactions] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user!.id }, select: { loyaltyPoints: true } }),
      prisma.loyaltyTransaction.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);
    res.json({ success: true, data: { points: user?.loyaltyPoints || 0, transactions } });
  } catch (err) { next(err); }
});

export default router;
