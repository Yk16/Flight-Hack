import { Router } from 'express';
import { userController } from './user.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import {
    updateProfileSchema,
    changePasswordSchema,
    kycSubmitSchema,
    updateUserStatusSchema,
    userListQuerySchema,
} from './user.schema';

const router = Router();

// ============================================
// USER ROUTES (authenticated)
// ============================================

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, userController.getProfile);

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticate, validateRequest({ body: updateProfileSchema }), userController.updateProfile);

/**
 * @route   POST /api/v1/users/me/password
 * @desc    Change password
 * @access  Private
 */
router.post('/me/password', authenticate, validateRequest({ body: changePasswordSchema }), userController.changePassword);

/**
 * @route   POST /api/v1/users/upgrade-request
 * @desc    Request privileges (Owner, Provider) after KYC
 * @access  Private
 */
router.post('/upgrade-request', authenticate, validateRequest({ body: kycSubmitSchema }), userController.upgradeRequest);

/**
 * @route   GET /api/v1/users/kyc/status
 * @desc    Get KYC verification status
 * @access  Private
 */
router.get('/kyc/status', authenticate, userController.getKYCStatus);

/**
 * @route   GET /api/v1/users/:id/public
 * @desc    Get public user profile
 * @access  Private
 */
router.get('/:id/public', authenticate, userController.getPublicProfile);

export default router;
