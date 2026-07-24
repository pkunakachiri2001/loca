/**
 * FleetNest — Reviews Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// POST /api/reviews — Create review (only after completed booking)
router.post('/', authenticate, authorize('CUSTOMER'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'Rating must be between 1 and 5.');
    if (!comment?.trim()) throw new ApiError(400, 'Review comment is required.');

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, userId: req.user!.id, status: 'COMPLETED' },
    });

    if (!booking) throw new ApiError(404, 'Completed booking not found. Only completed bookings can be reviewed.');

    // Check no existing review
    const existing = await prisma.review.findUnique({ where: { bookingId } });
    if (existing) throw new ApiError(409, 'You have already reviewed this booking.');

    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        listingId: booking.listingId,
        companyId: booking.companyId,
        bookingId,
        rating,
        comment: comment.trim(),
      },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
    });

    // Update listing and company rating averages
    await updateRatings(booking.listingId, booking.companyId);

    // Notify company
    await prisma.notification.create({
      data: {
        userId: (await prisma.company.findUnique({ where: { id: booking.companyId }, select: { ownerId: true } }))!.ownerId,
        type: 'REVIEW_RECEIVED',
        title: 'New Review Received',
        message: `A customer left a ${rating}-star review.`,
        link: `/company/reviews`,
        metadata: { reviewId: review.id },
      },
    });

    res.status(201).json({ success: true, message: 'Review posted successfully.', data: review });
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/listing/:listingId
router.get('/listing/:listingId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { listingId } = req.params;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId, isHidden: false },
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { listingId, isHidden: false } }),
    ]);

    res.json({ success: true, data: reviews, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/reviews/:id/respond — Company responds to review
router.put('/:id/respond', authenticate, authorize('COMPANY_OWNER'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { response } = req.body;
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });

    if (!review) throw new ApiError(404, 'Review not found.');
    if (review.company.ownerId !== req.user!.id) throw new ApiError(403, 'Access denied.');

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { response, respondedAt: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reviews/:id — Admin can hide/delete reviews
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.review.update({ where: { id: req.params.id }, data: { isHidden: true } });
    res.json({ success: true, message: 'Review hidden.' });
  } catch (err) {
    next(err);
  }
});

// Helper: recalculate and update ratings
async function updateRatings(listingId: string, companyId: string) {
  const [listingStats, companyStats] = await Promise.all([
    prisma.review.aggregate({ where: { listingId, isHidden: false }, _avg: { rating: true }, _count: true }),
    prisma.review.aggregate({ where: { companyId, isHidden: false }, _avg: { rating: true }, _count: true }),
  ]);

  await Promise.all([
    prisma.listing.update({
      where: { id: listingId },
      data: { rating: listingStats._avg.rating || 0, totalReviews: listingStats._count },
    }),
    prisma.company.update({
      where: { id: companyId },
      data: { rating: companyStats._avg.rating || 0, totalReviews: companyStats._count },
    }),
  ]);
}

export default router;
