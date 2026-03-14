import { Router } from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getPropertyBookings, 
  requestModification,
  downloadAgreement,
  getAdminBookings,
  getAdminBookingDetail
} from '../controllers/booking.controller';
import { validateRequest } from '../middleware/validateRequest';
import { createBookingSchema, modifyBookingSchema } from '../validations/booking.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Tenant Routes
router.post('/', validateRequest(createBookingSchema), createBooking);
router.get('/my-bookings', getMyBookings);
router.post('/:id/modify', validateRequest(modifyBookingSchema), requestModification);
router.get('/:id/agreement', downloadAgreement);

// Admin Routes
router.get('/admin/all', getAdminBookings);
router.get('/admin/:id', getAdminBookingDetail);
router.get('/property/:propertyId', getPropertyBookings);

export default router;

