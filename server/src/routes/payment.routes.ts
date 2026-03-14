import { Router } from 'express';
import { 
  initiatePayment, 
  paychanguWebhook,
  verifyPayment, 
  getInvoices, 
  getReceipts,
  downloadInvoice,
  downloadReceipt
} from '../controllers/payment.controller';
import { validateRequest } from '../middleware/validateRequest';
import { initiatePaymentSchema } from '../validations/payment.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ─── Public: PayChangu Webhook ───────────────────────────────────────────────
// POST: server-to-server callback from PayChangu (must be public)
router.post('/webhook/paychangu', paychanguWebhook);

// GET: safety-net for when PayChangu browser-redirects to callback_url instead of return_url.
// Reads tx_ref from query string and forwards the user to the correct frontend page.
router.get('/webhook/paychangu', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const tx_ref = req.query.tx_ref as string | undefined;
  if (tx_ref) {
    return res.redirect(`${frontendUrl}/payment/callback?tx_ref=${encodeURIComponent(tx_ref)}`);
  }
  return res.redirect(`${frontendUrl}/payment/failure`);
});

// ─── Protected routes ─────────────────────────────────────────────────────────
router.use(authenticate);
router.post('/initiate', validateRequest(initiatePaymentSchema), initiatePayment);
router.post('/verify', verifyPayment);
router.get('/invoices', getInvoices);
router.get('/receipts', getReceipts);
router.get('/invoices/:id/download', downloadInvoice);
router.get('/receipts/:id/download', downloadReceipt);

export default router;

