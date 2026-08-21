import { Router } from 'express';
import { serviceController } from './service.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate, requireVerified } from '../../shared/middleware/auth.middleware';
import { createListingSchema, bookServiceSchema, verifyServiceProviderSchema } from './service.schema';

const router = Router();

// ============================================
// ADMIN MIDDLEWARE
// ============================================
const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ 
            success: false, 
            error: { message: 'Admin access required' } 
        });
    }
    next();
};

// ============================================
// ADMIN ROUTES (must come first)
// ============================================

// GET /services/admin/providers - List pending service providers
router.get(
    '/admin/providers',
    authenticate,
    requireAdmin,
    serviceController.getPendingProviders
);

// GET /services/admin/providers/:id - Get service provider details
router.get(
    '/admin/providers/:id',
    authenticate,
    requireAdmin,
    serviceController.getProviderDetails
);

// PATCH /services/admin/providers/:id/verify - Approve or reject service provider
router.patch(
    '/admin/providers/:id/verify',
    authenticate,
    requireAdmin,
    validateRequest(verifyServiceProviderSchema),
    serviceController.verifyServiceProvider
);

// ============================================
// PUBLIC ROUTES
// ============================================

// Get listings (public - only APPROVED listings)
router.get('/', serviceController.getListings);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// Create a service listing (Provider or Admin only - status: PENDING)
router.post(
    '/',
    authenticate,
    (req, res, next) => {
        if (!req.user?.isProvider && !req.user?.isAdmin) {
            return res.status(403).json({ success: false, error: { message: 'Provider/Admin access required' } });
        }
        next();
    },
    requireVerified,
    validateRequest(createListingSchema),
    serviceController.createListing
);

// Book a service (authenticated)
router.post(
    '/book',
    authenticate,
    validateRequest(bookServiceSchema),
    serviceController.bookService
);

// Provider: get bookings for provider's listings
router.get(
    '/bookings/provider',
    authenticate,
    requireVerified,
    serviceController.getProviderBookings
);

// Provider: update booking status
router.patch(
    '/bookings/:id',
    authenticate,
    requireVerified,
    serviceController.updateBookingStatus
);

export default router;