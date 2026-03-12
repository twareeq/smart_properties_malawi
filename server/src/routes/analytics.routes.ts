import { Router } from 'express';
import { getAdminDashboardMetrics } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN')); // only property owners/system admins depending on role mapping

router.get('/metrics', getAdminDashboardMetrics);

export default router;
