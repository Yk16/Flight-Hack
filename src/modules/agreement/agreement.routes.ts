import { Router } from 'express';
import { agreementController } from './agreement.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { createAgreementSchema, updateAgreementStatusSchema } from './agreement.schema';

const router = Router();

router.use(authenticate);

// Create an agreement (Owner only)
router.post(
    '/',
    validateRequest(createAgreementSchema),
    agreementController.createAgreement
);

// Get specific agreement
router.get(
    '/:id',
    agreementController.getAgreement
);

// Update agreement status (e.g. DRAFT to SIGNED/ACTIVE)
router.put(
    '/:id/status',
    validateRequest(updateAgreementStatusSchema),
    agreementController.updateStatus
);

export default router;