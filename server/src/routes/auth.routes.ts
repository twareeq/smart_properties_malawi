import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/auth.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);

export default router;
