import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import messageRoutes from './message.routes';
import reviewRoutes from './review.routes';
import analyticsRoutes from './analytics.routes';
import uploadRoutes from './upload.routes';
import favoriteRoutes from './favorite.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/messages', messageRoutes);
router.use('/reviews', reviewRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/uploads', uploadRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/notifications', notificationRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Smart Properties Malawi API is running' });
});

export default router;

