/**
 * FleetNest — Categories, Coupons, Upload, and Contact Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// ═══════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════
export const categoryRouter = Router();

categoryRouter.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

categoryRouter.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════
// COUPONS
// ═══════════════════════════════════════════
export const couponRouter = Router();

couponRouter.post('/validate', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, bookingAmount } = req.body;
    const coupon = await prisma.coupon.findUnique({ where: { code, isActive: true } });

    if (!coupon) throw new ApiError(404, 'Invalid coupon code.');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, 'This coupon has expired.');
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new ApiError(400, 'Coupon usage limit reached.');
    if (coupon.minBookingAmount && bookingAmount < coupon.minBookingAmount) {
      throw new ApiError(400, `Minimum booking amount: ₦${coupon.minBookingAmount.toLocaleString()}`);
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (bookingAmount * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.value, bookingAmount);
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discount,
        finalAmount: bookingAmount - discount,
      },
    });
  } catch (err) { next(err); }
});

couponRouter.get('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: coupons });
  } catch (err) { next(err); }
});

couponRouter.post('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════
// UPLOAD
// ═══════════════════════════════════════════
export const uploadRouter = Router();

// Configure multer for local storage (Cloudinary fallback)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.UPLOAD_MAX_SIZE_MB || '10', 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  },
});

uploadRouter.post('/image', authenticate, upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) throw new ApiError(400, 'No file uploaded.');

    const isMockCloudinary = process.env.CLOUDINARY_MOCK_MODE === 'true';

    if (!isMockCloudinary) {
      try {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'fleetnest',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });

        res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
        return;
      } catch {
        // Fall through to local storage on cloudinary error
      }
    }

    // Local storage URL
    const url = `${process.env.API_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    res.json({ success: true, data: { url, publicId: req.file.filename } });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════════
export const contactRouter = Router();

contactRouter.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      throw new ApiError(400, 'All fields are required.');
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, phone, subject, message },
    });

    res.status(201).json({ success: true, message: 'Message received. We will get back to you shortly.', data: contact });
  } catch (err) { next(err); }
});

contactRouter.get('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
});
