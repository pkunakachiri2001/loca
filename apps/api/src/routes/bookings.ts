/**
 * FleetNest — Bookings Routes
 * Full booking lifecycle management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { emailService } from '../services/email';
import { emitToUser } from '../socket/index';

const router = Router();

// ──────────────────────────────────────────────
// POST /api/bookings — Create a new booking
// ──────────────────────────────────────────────
router.post('/', authenticate, authorize('CUSTOMER'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      listingId, startDate, endDate, startTime, endTime,
      pickupLocation, dropoffLocation, specialRequests,
      guestCount, driverRequested, couponCode,
    } = req.body;

    // Fetch listing with company
    const listing = await prisma.listing.findUnique({
      where: { id: listingId, status: 'ACTIVE' },
      include: { company: true },
    });

    if (!listing) throw new ApiError(404, 'Listing not found or unavailable.');

    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    if (durationDays < listing.minimumDays) {
      throw new ApiError(400, `Minimum booking duration is ${listing.minimumDays} day(s).`);
    }

    // Check availability (no overlapping confirmed/active bookings)
    const conflicting = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });

    if (conflicting) throw new ApiError(409, 'This vehicle is not available for the selected dates.');

    // Calculate pricing
    let baseAmount = listing.pricePerDay * durationDays;
    let discountAmount = 0;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode, isActive: true } });
      if (!coupon) throw new ApiError(400, 'Invalid or expired coupon code.');
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, 'This coupon has expired.');
      if (coupon.minBookingAmount && baseAmount < coupon.minBookingAmount) {
        throw new ApiError(400, `Minimum booking amount for this coupon is $${coupon.minBookingAmount.toLocaleString()}.`);
      }

      if (coupon.type === 'PERCENTAGE') {
        discountAmount = (baseAmount * coupon.value) / 100;
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      } else {
        discountAmount = coupon.value;
      }

      // Increment coupon usage
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
    }

    const totalAmount = baseAmount - discountAmount;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        listingId,
        companyId: listing.companyId,
        startDate: start,
        endDate: end,
        startTime,
        endTime,
        durationDays,
        baseAmount,
        discountAmount,
        couponCode: couponCode || null,
        taxAmount: 0,
        totalAmount,
        currency: listing.currency,
        deposit: listing.deposit,
        pickupLocation,
        dropoffLocation,
        specialRequests,
        guestCount,
        driverRequested: driverRequested || false,
      },
      include: {
        listing: { select: { title: true, make: true, model: true } },
        company: { select: { name: true, email: true } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    // Block availability dates
    const datesToBlock: Date[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      datesToBlock.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    await prisma.availability.createMany({
      data: datesToBlock.map((date) => ({
        listingId,
        date,
        isBlocked: true,
        reason: 'booked',
        bookingId: booking.id,
      })),
      skipDuplicates: true,
    });

    // Send notification to company
    await prisma.notification.create({
      data: {
        userId: listing.company.ownerId,
        type: 'BOOKING_CONFIRMED',
        title: 'New Booking Request',
        message: `${booking.user.firstName} ${booking.user.lastName} has booked "${listing.title}" for ${durationDays} day(s).`,
        link: `/company/bookings/${booking.id}`,
        metadata: { bookingId: booking.id },
      },
    });

    // Emit real-time event
    emitToUser(listing.company.ownerId, 'new_booking', booking);

    // Send confirmation email (non-blocking)
    emailService.sendBookingConfirmation(booking.user.email, booking).catch(() => {});

    res.status(201).json({ success: true, message: 'Booking created successfully.', data: booking });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /api/bookings/:id — Get booking details
// ──────────────────────────────────────────────
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        company: { select: { id: true, name: true, phone: true, whatsappNumber: true, logo: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        payment: true,
        review: true,
      },
    });

    if (!booking) throw new ApiError(404, 'Booking not found.');

    // Authorization: only owner, company owner, or admin
    const isOwner = booking.userId === req.user!.id;
    const isCompanyOwner = await prisma.company.findFirst({
      where: { id: booking.companyId, ownerId: req.user!.id },
    });

    if (!isOwner && !isCompanyOwner && req.user!.role !== 'ADMIN') {
      throw new ApiError(403, 'Access denied.');
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// PUT /api/bookings/:id/status — Update booking status (company/admin)
// ──────────────────────────────────────────────
router.put('/:id/status', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const validStatuses = ['CONFIRMED', 'ACTIVE', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) throw new ApiError(400, 'Invalid status.');

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, email: true } },
        listing: { select: { title: true } },
        company: true,
      },
    });

    if (!booking) throw new ApiError(404, 'Booking not found.');

    // Verify company owner
    if (req.user!.role !== 'ADMIN' && booking.company.ownerId !== req.user!.id) {
      throw new ApiError(403, 'Access denied.');
    }

    const updateData: any = { status };
    if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
    if (status === 'ACTIVE') updateData.startedAt = new Date();
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      // Award loyalty points (1 point per $1 spent)
      const pointsEarned = Math.floor(booking.totalAmount);
      await prisma.user.update({
        where: { id: booking.userId },
        data: { loyaltyPoints: { increment: pointsEarned } },
      });
      await prisma.loyaltyTransaction.create({
        data: { userId: booking.userId, points: pointsEarned, description: `Earned from booking ${booking.id}`, bookingId: id },
      });
    }
    if (status === 'REJECTED') {
      updateData.rejectionReason = rejectionReason;
      // Unblock availability dates
      await prisma.availability.deleteMany({ where: { bookingId: id } });
    }

    const updated = await prisma.booking.update({ where: { id }, data: updateData });

    // Notify customer
    const notifMap: Record<string, { type: any; title: string; message: string }> = {
      CONFIRMED: { type: 'BOOKING_CONFIRMED', title: 'Booking Confirmed!', message: `Your booking for "${booking.listing.title}" has been confirmed.` },
      COMPLETED: { type: 'BOOKING_COMPLETED', title: 'Booking Completed', message: `Your booking for "${booking.listing.title}" is complete. Please leave a review!` },
      REJECTED: { type: 'BOOKING_CANCELLED', title: 'Booking Declined', message: `Your booking for "${booking.listing.title}" was declined. Reason: ${rejectionReason}` },
    };

    if (notifMap[status]) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          ...notifMap[status],
          link: `/dashboard/bookings/${id}`,
          metadata: { bookingId: id },
        },
      });
      emitToUser(booking.userId, 'booking_status_update', { bookingId: id, status });
    }

    res.json({ success: true, message: 'Booking status updated.', data: updated });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/bookings/:id/cancel — Cancel booking (customer)
// ──────────────────────────────────────────────
router.post('/:id/cancel', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { listing: { select: { title: true, companyId: true } }, company: true },
    });

    if (!booking) throw new ApiError(404, 'Booking not found.');
    if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new ApiError(403, 'You can only cancel your own bookings.');
    }
    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status)) {
      throw new ApiError(400, 'This booking cannot be cancelled.');
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason },
    });

    // Unblock dates
    await prisma.availability.deleteMany({ where: { bookingId: id } });

    // Notify company
    await prisma.notification.create({
      data: {
        userId: booking.company.ownerId,
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        message: `A booking for "${booking.listing.title}" has been cancelled by the customer.`,
        link: `/company/bookings/${id}`,
      },
    });

    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
