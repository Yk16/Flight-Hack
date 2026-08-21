import { Router } from 'express';
import { housingController } from './housing.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate, optionalAuth, requireVerified } from '../../shared/middleware/auth.middleware';
import {
    createHouseSchema,
    updateHouseSchema,
    houseListQuerySchema,
    houseIdParamSchema,
} from './housing.schema';

const router = Router();

// Custom Owner Check Middleware
const requireOwner = (req: any, res: any, next: any) => {
    if (!req.user?.isOwner) return res.status(403).json({ success: false, message: 'Provider/Owner access required' });
    next();
};

// ============================================
// PUBLIC ROUTES (with optional auth)
// ============================================

/**
 * @route   GET /api/v1/houses
 * @desc    List houses with filters and pagination
 * @access  Public (optional auth for view tracking)
 */
router.get('/', validate(houseListQuerySchema, 'query'), housingController.listHouses);

// ============================================
// OWNER ROUTES (authenticated + OWNER role)
// ============================================

/**
 * @route   GET /api/v1/houses/owner/my
 * @desc    Get current owner's listings
 * @access  OWNER only
 */
router.get('/owner/my', authenticate, requireOwner, validate(houseListQuerySchema, 'query'), housingController.getMyHouses);

/**
 * @route   GET /api/v1/houses/:id
 * @desc    Get house details
 * @access  Public (optional auth for view tracking)
 */
router.get('/:id', optionalAuth, validate(houseIdParamSchema, 'params'), housingController.getHouse);

/**
 * @route   POST /api/v1/houses
 * @desc    Create new house listing
 * @access  OWNER only
 */
router.post('/', authenticate, requireOwner, requireVerified, validate(createHouseSchema), housingController.createHouse);

/**
 * @route   PUT /api/v1/houses/:id
 * @desc    Update house listing
 * @access  OWNER only (own listings)
 */
router.put('/:id', authenticate, requireOwner, validate(houseIdParamSchema, 'params'), validate(updateHouseSchema), housingController.updateHouse);

/**
 * @route   DELETE /api/v1/houses/:id
 * @desc    Delete house listing
 * @access  OWNER only (own listings)
 */
router.delete('/:id', authenticate, requireOwner, validate(houseIdParamSchema, 'params'), housingController.deleteHouse);

// ============================================
// USER ROUTES (authenticated)
// ============================================

/**
 * @route   POST /api/v1/houses/:id/inquiry
 * @desc    Record inquiry when user contacts owner
 * @access  Authenticated users
 */
router.post('/:id/inquiry', authenticate, validate(houseIdParamSchema, 'params'), housingController.recordInquiry);

export default router;
