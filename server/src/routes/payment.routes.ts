import { Router } from 'express';
import { 
  initiatePayment, 
  paychanguWebhook, 
  getInvoices, 
  getReceipts 
} from '../controllers/payment.controller';
import { validateRequest } from '../middleware/validateRequest';
import { initiatePaymentSchema } from '../validations/payment.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public Webhook (Secured via signature typically, handled in controller)
router.post('/webhook/paychangu', paychanguWebhook);

// Protected routes
router.use(authenticate);
router.post('/initiate', validateRequest(initiatePaymentSchema), initiatePayment);
router.get('/invoices', getInvoices);
router.get('/receipts', getReceipts);

export default router;
