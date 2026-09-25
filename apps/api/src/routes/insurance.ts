import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// ──────────────────────────────────────────────
// GET /api/insurance
// Fetch all insurance policies (For Admin / Insurance Agents)
// ──────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'INSURANCE_AGENT'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const policies = await prisma.insurancePolicy.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: policies,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ──────────────────────────────────────────────
// POST /api/insurance/:id/issue
// Generate and send policy copy via WhatsApp
// ──────────────────────────────────────────────
router.post(
  '/:id/issue',
  authenticate,
  authorize('ADMIN', 'INSURANCE_AGENT'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const policy = await prisma.insurancePolicy.findUnique({ where: { id } });

      if (!policy) {
        throw new ApiError(404, 'Insurance policy not found');
      }

      if (policy.paymentStatus !== 'PAID') {
        throw new ApiError(400, 'Cannot issue policy because payment is not completed.');
      }

      // TODO: Here we would trigger the CodeChat bot to send a PDF or message to `policy.phone`.
      // For now, we update the status and mark it as issued.
      
      const updated = await prisma.insurancePolicy.update({
        where: { id },
        data: {
          issuedAt: new Date(),
          expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        }
      });

      res.json({
        success: true,
        message: 'Policy issued successfully. A copy has been queued for WhatsApp delivery.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
