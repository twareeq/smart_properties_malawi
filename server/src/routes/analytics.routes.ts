import { Router } from 'express';
import { getAdminDashboardMetrics, getPublicStats } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Publicly accessible stats
router.get('/public-stats', getPublicStats);

// Protected routes
router.use(authenticate);
router.use(authorizeRoles('ADMIN')); // only property owners/system admins depending on role mapping

router.get('/metrics', getAdminDashboardMetrics);

export default router;
