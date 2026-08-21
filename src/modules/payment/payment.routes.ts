import { Router } from 'express';
import { paymentController } from './payment.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { createOrderSchema, verifyPaymentSchema } from './payment.schema';

const router = Router();

router.use(authenticate);

// Initialize payment (Create Order)
router.post('/order', validateRequest(createOrderSchema), paymentController.createOrder);

// Verify payment signature
router.post('/verify', validateRequest(verifyPaymentSchema), paymentController.verifyPayment);

// Get my transactions
router.get('/my', paymentController.getMyPayments);

export default router;