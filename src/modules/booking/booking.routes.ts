import { Router } from 'express';
import { bookingController } from './booking.controller';
import { validateRequest } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { createBookingSchema, updateBookingStatusSchema, getBookingSchema } from './booking.schema';

const router = Router();

// Protect all routes with authentication
router.use(authenticate);

// Create a booking request
router.post(
    '/',
    validateRequest(createBookingSchema),
    bookingController.createBooking
);

// Get tenant's requests (My Bookings)
router.get(
    '/my',
    bookingController.getMyBookings
);

// Get owner's incoming requests
router.get(
    '/owner/my',
    (req, res, next) => {
        if (!req.user?.isOwner) return res.status(403).json({ success: false, message: 'Provider/Owner access required' });
        next();
    },
    bookingController.getOwnerBookings
);

// Get specific booking details
router.get(
    '/:id',
    validateRequest(getBookingSchema),
    bookingController.getBooking
);

// Update booking status (User cancels, Owner accepts/rejects)
router.put(
    '/:id/status',
    validateRequest(updateBookingStatusSchema),
    bookingController.updateBookingStatus
);

export default router;