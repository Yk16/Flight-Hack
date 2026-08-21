import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { updateUserStatusSchema, userListQuerySchema } from './user.schema';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
});

/**
 * @route   GET /api/v1/admin/users
 * @desc    List all users with filters
 * @access  Admin only
 */
router.get('/users', validate(userListQuerySchema, 'query'), userController.listUsers);

/**
 * @route   PUT /api/v1/admin/users/:id/status
 * @desc    Update user status (block/unblock/verify)
 * @access  Admin only
 */
router.put('/users/:id/status', validate(updateUserStatusSchema), userController.updateUserStatus);

/**
 * @route   POST /api/v1/admin/users/:id/verify
 * @desc    Verify user account
 * @access  Admin only
 */
router.post('/users/:id/verify', userController.verifyUser);

export default router;
