import { Router } from 'express';
import { getCloudinarySignature, saveMediaMetadata, deleteMedia } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';
import { saveMediaSchema } from '../validations/property.schema';

const router = Router();

// Get signed payload for direct Cloudinary upload (authenticated users only)
router.get('/signature', authenticate, getCloudinarySignature);

// Save Cloudinary media metadata to a property
router.post('/property-image', authenticate, validateRequest(saveMediaSchema), saveMediaMetadata);

// Delete an image from DB and Cloudinary
router.delete('/property-image/:imageId', authenticate, deleteMedia);

export default router;
