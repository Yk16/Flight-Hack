import { Router } from 'express';
import { flatmateController } from './flatmate.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { updateFlatmateProfileSchema, searchFlatmatesSchema } from './flatmate.schema';

const router = Router();

// Protect all routes
router.use(authenticate);

// Get my flatmate profile
router.get('/me', flatmateController.getMyProfile);

// Create my flatmate profile
router.post('/me', validateRequest(updateFlatmateProfileSchema), flatmateController.createMyProfile);

// Update my preferences
router.put('/me', validateRequest(updateFlatmateProfileSchema), flatmateController.updateMyProfile);

// Update profile and get matches
router.put('/me/matches', validateRequest(updateFlatmateProfileSchema), flatmateController.updateProfileAndGetMatches);

// Get my matches
router.get('/matches', flatmateController.getMyMatches);

// Browse potential flatmates
router.get('/', validateRequest(searchFlatmatesSchema), flatmateController.browseFlatmates);

export default router;