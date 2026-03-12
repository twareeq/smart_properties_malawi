import { Router } from 'express';
import { submitReview, getPropertyReviews } from '../controllers/review.controller';
import { validateRequest } from '../middleware/validateRequest';
import { submitReviewSchema } from '../validations/review.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/property/:propertyId', getPropertyReviews);
router.post('/', authenticate, validateRequest(submitReviewSchema), submitReview);

export default router;
