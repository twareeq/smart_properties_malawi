import { Router } from 'express';
import { 
  createProperty, 
  getProperties, 
  getPropertyById, 
  getMyProperties,
  updateProperty, 
  deleteProperty 
} from '../controllers/property.controller';
import { validateRequest } from '../middleware/validateRequest';
import { createPropertySchema, updatePropertySchema, propertyQuerySchema } from '../validations/property.schema';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', validateRequest(propertyQuerySchema), getProperties);

// We need an optional auth middleware if we want to track anonymous views vs logged in views in getPropertyById, 
// using authenticate directly would block Guests.
const optionalAuth = async (req: any, res: any, next: any) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const { config } = require('../config/env');
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = { id: decoded.id, role: decoded.role };
    }
  } catch(e) {}
  next();
};

// Must be before /:id to avoid conflict
router.get('/my/listings', authenticate, authorizeRoles('ADMIN'), getMyProperties);

router.get('/:id', optionalAuth, getPropertyById);

// Protected routes (Admin / Property Owner)
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.post('/', validateRequest(createPropertySchema), createProperty);
router.put('/:id', validateRequest(updatePropertySchema), updateProperty);
router.delete('/:id', deleteProperty);

export default router;
