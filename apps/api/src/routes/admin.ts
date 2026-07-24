/**
 * FleetNest — Admin Routes
 * Full platform management for admins
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// GET /api/admin/stats — Platform overview statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, newUsers, totalCompanies, pendingCompanies,
      totalListings, pendingListings, totalBookings, recentBookings,
      totalRevenue, pendingReviews,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.company.count(),
      prisma.company.count({ where: { status: 'PENDING' } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.review.count({ where: { isHidden: false } }),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, new: newUsers },
        companies: { total: totalCompanies, pending: pendingCompanies },
        listings: { total: totalListings, pending: pendingListings },
        bookings: { total: totalBookings, recent: recentBookings },
        revenue: { total: totalRevenue._sum.amount || 0 },
        reviews: { total: pendingReviews },
      },
    });
  } catch (err) { next(err); }
});

// GET /api/admin/users — List all users
router.get('/users', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const q = req.query.q as string;
    const role = req.query.role as string;

    const where: any = {
      ...(q ? { OR: [{ email: { contains: q, mode: 'insensitive' } }, { firstName: { contains: q, mode: 'insensitive' } }] } : {}),
      ...(role ? { role } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, createdAt: true, isEmailVerified: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// PUT /api/admin/users/:id — Update user (suspend/activate)
router.put('/users/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, role } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { ...(status ? { status } : {}), ...(role ? { role } : {}) },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// GET /api/admin/companies — List all companies
router.get('/companies', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as string;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where: { ...(status ? { status: status as any } : {}) },
        include: { owner: { select: { email: true, firstName: true, lastName: true } }, _count: { select: { listings: true, bookings: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.company.count({ where: { ...(status ? { status: status as any } : {}) } }),
    ]);

    res.json({ success: true, data: companies, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// PUT /api/admin/companies/:id/verify — Verify or reject company
router.put('/companies/:id/verify', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['VERIFIED', 'REJECTED', 'SUSPENDED'].includes(status)) throw new ApiError(400, 'Invalid status.');

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: {
        status,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
        verifiedBy: status === 'VERIFIED' ? req.user!.id : null,
        rejectionReason: rejectionReason || null,
      },
      include: { owner: { select: { id: true, email: true, firstName: true } } },
    });

    // Notify company owner
    await prisma.notification.create({
      data: {
        userId: company.owner.id,
        type: status === 'VERIFIED' ? 'COMPANY_VERIFIED' : 'SYSTEM',
        title: status === 'VERIFIED' ? 'Company Verified ✓' : 'Verification Update',
        message: status === 'VERIFIED'
          ? 'Your company has been verified! You can now add listings.'
          : `Your company verification was not approved. Reason: ${rejectionReason}`,
        link: '/company/dashboard',
      },
    });

    res.json({ success: true, message: `Company ${status.toLowerCase()}.`, data: company });
  } catch (err) { next(err); }
});

// GET /api/admin/listings — All listings with status
router.get('/listings', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as string;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { ...(status ? { status: status as any } : {}) },
        include: {
          company: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where: { ...(status ? { status: status as any } : {}) } }),
    ]);

    res.json({ success: true, data: listings, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// PUT /api/admin/listings/:id/approve — Approve or reject listing
router.put('/listings/:id/approve', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['ACTIVE', 'REJECTED'].includes(status)) throw new ApiError(400, 'Invalid status.');

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        status,
        approvedAt: status === 'ACTIVE' ? new Date() : null,
        approvedBy: status === 'ACTIVE' ? req.user!.id : null,
      },
      include: { company: { include: { owner: { select: { id: true } } } } },
    });

    await prisma.notification.create({
      data: {
        userId: listing.company.ownerId,
        type: status === 'ACTIVE' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
        title: status === 'ACTIVE' ? 'Listing Approved!' : 'Listing Not Approved',
        message: status === 'ACTIVE' ? `"${listing.title}" is now live!` : `"${listing.title}" was not approved. Reason: ${rejectionReason}`,
        link: `/company/listings/${listing.id}`,
      },
    });

    res.json({ success: true, data: listing });
  } catch (err) { next(err); }
});

// GET /api/admin/bookings — All bookings
router.get('/bookings', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          listing: { select: { title: true } },
          company: { select: { name: true } },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count(),
    ]);

    res.json({ success: true, data: bookings, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// GET /api/admin/analytics — Platform analytics
router.get('/analytics', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      bookingsByCategory,
      revenueByMonth,
      topListings,
      topCompanies,
    ] = await Promise.all([
      prisma.booking.groupBy({ by: ['listingId'], _count: true }),
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as bookings, SUM("totalAmount") as revenue
        FROM bookings WHERE status = 'COMPLETED'
        GROUP BY month ORDER BY month DESC LIMIT 12
      `,
      prisma.listing.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { totalBookings: 'desc' },
        take: 5,
        select: { id: true, title: true, totalBookings: true, rating: true, category: true },
      }),
      prisma.company.findMany({
        where: { status: 'VERIFIED' },
        orderBy: { totalBookings: 'desc' },
        take: 5,
        select: { id: true, name: true, totalBookings: true, totalRevenue: true, rating: true },
      }),
    ]);

    res.json({ success: true, data: { bookingsByCategory, revenueByMonth, topListings, topCompanies } });
  } catch (err) { next(err); }
});

export default router;
