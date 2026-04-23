import { Router } from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favorite.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/my', getMyFavorites);
router.post('/toggle/:propertyId', toggleFavorite);

export default router;
