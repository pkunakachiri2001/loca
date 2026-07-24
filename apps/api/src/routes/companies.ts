/**
 * FleetNest — Companies Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// ──────────────────────────────────────────────
// SPECIFIC /me ROUTES (MUST BE DECLARED BEFORE /:id)
// ──────────────────────────────────────────────

// GET /api/companies/me/dashboard — Company owner dashboard summary
router.get('/me/dashboard', authenticate, authorize('COMPANY_OWNER'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.findUnique({ where: { ownerId: req.user!.id } });
    if (!company) throw new ApiError(404, 'Company not found.');

    const [pendingBookings, recentBookings] = await Promise.all([
      prisma.booking.count({ where: { companyId: company.id, status: 'PENDING' } }),
      prisma.booking.findMany({
        where: { companyId: company.id },
        include: {
          listing: { select: { title: true } },
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    res.json({ success: true, data: { company, pendingBookings, recentBookings } });
  } catch (err) { next(err); }
});

// GET /api/companies/me/listings — Get company owner's listings
router.get('/me/listings', authenticate, authorize('COMPANY_OWNER'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.findUnique({ where: { ownerId: req.user!.id } });
    if (!company) throw new ApiError(404, 'Company profile not found.');

    const listings = await prisma.listing.findMany({
      where: { companyId: company.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        company: { select: { id: true, name: true, slug: true, logo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: listings });
  } catch (err) { next(err); }
});

// ──────────────────────────────────────────────
// GENERAL & PARAMETERIZED ROUTES
// ──────────────────────────────────────────────

// POST /api/companies — Register company
router.post('/', authenticate, authorize('COMPANY_OWNER'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.company.findUnique({ where: { ownerId: req.user!.id } });
    if (existing) throw new ApiError(409, 'You already have a registered company.');

    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const company = await prisma.company.create({
      data: { ...req.body, ownerId: req.user!.id, slug, status: 'PENDING' },
    });

    res.status(201).json({ success: true, message: 'Company registered and pending verification.', data: company });
  } catch (err) { next(err); }
});

// GET /api/companies/:id — Public company profile
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }], status: 'VERIFIED' },
      include: {
        listings: { where: { status: 'ACTIVE' }, include: { images: { where: { isPrimary: true }, take: 1 } }, take: 12 },
        reviews: { where: { isHidden: false }, include: { user: { select: { firstName: true, lastName: true, avatar: true } } }, orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!company) throw new ApiError(404, 'Company not found.');
    res.json({ success: true, data: company });
  } catch (err) { next(err); }
});

// PUT /api/companies/:id — Update own company
router.put('/:id', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) throw new ApiError(404, 'Company not found.');
    if (req.user!.role !== 'ADMIN' && company.ownerId !== req.user!.id) throw new ApiError(403, 'Access denied.');

    const { status, verifiedAt, ownerId, ...updateData } = req.body;
    const updated = await prisma.company.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// GET /api/companies/:id/analytics — Company analytics
router.get('/:id/analytics', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) throw new ApiError(404, 'Company not found.');
    if (req.user!.role !== 'ADMIN' && company.ownerId !== req.user!.id) throw new ApiError(403, 'Access denied.');

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalBookings, recentBookings, revenue, listings, avgRating] = await Promise.all([
      prisma.booking.count({ where: { companyId: req.params.id } }),
      prisma.booking.count({ where: { companyId: req.params.id, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.payment.aggregate({ where: { booking: { companyId: req.params.id }, status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.listing.count({ where: { companyId: req.params.id, status: 'ACTIVE' } }),
      prisma.review.aggregate({ where: { companyId: req.params.id, isHidden: false }, _avg: { rating: true } }),
    ]);

    // Monthly revenue for chart
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', p."paidAt") as month, SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p."bookingId" = b.id
      WHERE b."companyId" = ${req.params.id} AND p.status = 'COMPLETED'
      GROUP BY month ORDER BY month DESC LIMIT 6
    `;

    res.json({
      success: true,
      data: {
        totalBookings,
        recentBookings,
        totalRevenue: revenue._sum.amount || 0,
        activeListings: listings,
        avgRating: avgRating._avg.rating || 0,
        monthlyRevenue,
      },
    });
  } catch (err) { next(err); }
});

export default router;
