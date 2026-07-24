/**
 * FleetNest — Listings Routes
 * Full CRUD for vehicle/service listings with search & filtering
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { body, query, validationResult } from 'express-validator';

const router = Router();

function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(422).json({ success: false, errors: errors.array() }); return; }
  next();
}

// ──────────────────────────────────────────────
// GET /api/listings — Search & filter listings
// ──────────────────────────────────────────────
router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      q, category, city, state, minPrice, maxPrice,
      minRating, fuelType, transmission, features,
      sortBy = 'rating', sortOrder = 'desc',
      page = '1', limit = '12', companyId,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build dynamic where clause
    const where: any = {
      status: 'ACTIVE',
      ...(category && { category }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { contains: state, mode: 'insensitive' } }),
      ...(fuelType && { fuelType }),
      ...(transmission && { transmission }),
      ...(companyId && { companyId }),
      ...(minPrice || maxPrice ? {
        pricePerDay: {
          ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
          ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
        },
      } : {}),
      ...(minRating ? { rating: { gte: parseFloat(minRating) } } : {}),
      ...(features ? { features: { hasSome: features.split(',') } } : {}),
      ...(q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { make: { contains: q, mode: 'insensitive' } },
          { model: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: [q.toLowerCase()] } },
        ],
      } : {}),
    };

    // Build orderBy
    const orderByMap: Record<string, any> = {
      rating: { rating: sortOrder },
      price: { pricePerDay: sortOrder },
      newest: { createdAt: sortOrder },
      popular: { totalBookings: sortOrder },
    };
    const orderBy = orderByMap[sortBy] || { rating: 'desc' };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          company: { select: { id: true, name: true, slug: true, logo: true, city: true, rating: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    // Check wishlist status for authenticated user
    let wishlistIds: string[] = [];
    if (req.user) {
      const wishlist = await prisma.wishlistItem.findMany({
        where: { userId: req.user.id },
        select: { listingId: true },
      });
      wishlistIds = wishlist.map((w) => w.listingId);
    }

    const data = listings.map((l) => ({
      ...l,
      primaryImage: l.images[0]?.url || null,
      isWishlisted: wishlistIds.includes(l.id),
    }));

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /api/listings/featured — Featured listings for homepage
// ──────────────────────────────────────────────
router.get('/featured', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'ACTIVE', rating: { gte: 4.5 } },
      orderBy: { totalBookings: 'desc' },
      take: 8,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        company: { select: { id: true, name: true, logo: true, city: true } },
      },
    });

    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /api/listings/:id — Get single listing
// ──────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findFirst({
      where: { OR: [{ id }, { slug: id }], status: 'ACTIVE' },
      include: {
        images: { orderBy: { order: 'asc' } },
        company: {
          select: {
            id: true, name: true, slug: true, logo: true, coverImage: true,
            description: true, city: true, state: true, phone: true,
            whatsappNumber: true, email: true, rating: true, totalReviews: true,
            totalBookings: true, status: true, verifiedAt: true,
          },
        },
        reviews: {
          where: { isHidden: false },
          include: {
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, bookings: true } },
      },
    });

    if (!listing) throw new ApiError(404, 'Listing not found.');

    // Increment view count
    await prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });

    // Check wishlist status
    let isWishlisted = false;
    if (req.user) {
      const wishlistItem = await prisma.wishlistItem.findUnique({
        where: { userId_listingId: { userId: req.user.id, listingId: listing.id } },
      });
      isWishlisted = !!wishlistItem;
    }

    res.json({ success: true, data: { ...listing, isWishlisted } });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/listings — Create a listing (company only)
// ──────────────────────────────────────────────
router.post('/', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get company for this owner
    const company = await prisma.company.findUnique({
      where: { ownerId: req.user!.id },
    });

    if (!company && req.user!.role !== 'ADMIN') {
      throw new ApiError(404, 'Company not found. Please register your company first.');
    }

    if (company && company.status !== 'VERIFIED' && req.user!.role !== 'ADMIN') {
      throw new ApiError(403, 'Your company must be verified before adding listings.');
    }

    const companyId = req.body.companyId || company?.id;
    const slug = `${req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const listing = await prisma.listing.create({
      data: {
        ...req.body,
        companyId,
        slug,
        status: req.user!.role === 'ADMIN' ? 'ACTIVE' : 'PENDING_APPROVAL',
      },
    });

    res.status(201).json({ success: true, message: 'Listing created and submitted for approval.', data: listing });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// PUT /api/listings/:id — Update listing
// ──────────────────────────────────────────────
router.put('/:id', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({ where: { id }, include: { company: true } });

    if (!listing) throw new ApiError(404, 'Listing not found.');

    // Ensure owner can only edit their own listings
    if (req.user!.role !== 'ADMIN' && listing.company.ownerId !== req.user!.id) {
      throw new ApiError(403, 'You can only edit your own listings.');
    }

    const { images, ...updateData } = req.body;

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, message: 'Listing updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// DELETE /api/listings/:id — Delete listing
// ──────────────────────────────────────────────
router.delete('/:id', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({ where: { id }, include: { company: true } });

    if (!listing) throw new ApiError(404, 'Listing not found.');
    if (req.user!.role !== 'ADMIN' && listing.company.ownerId !== req.user!.id) {
      throw new ApiError(403, 'You can only delete your own listings.');
    }

    await prisma.listing.delete({ where: { id } });
    res.json({ success: true, message: 'Listing deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /api/listings/:id/availability
// ──────────────────────────────────────────────
router.get('/:id/availability', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { month, year } = req.query as Record<string, string>;

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const blocked = await prisma.availability.findMany({
      where: {
        listingId: id,
        date: { gte: startDate, lte: endDate },
        isBlocked: true,
      },
      select: { date: true, reason: true },
    });

    res.json({ success: true, data: { blocked } });
  } catch (err) {
    next(err);
  }
});

export default router;
