import { Request, Response } from 'express';
import { bookingService } from './booking.service';
import { asyncHandler, successResponse } from '../../shared/utils/response';

export class BookingController {
    /**
     * POST /api/v1/bookings
     * Create a booking request
     */
    createBooking = asyncHandler(async (req: Request, res: Response) => {
        const result = await bookingService.createBooking(req.user!.userId, req.body);
        successResponse(res, result, 'House booking requested successfully', 201);
    });

    /**
     * GET /api/v1/bookings/my
     * Get the logged-in user's requests (tenant bookings)
     */
    getMyBookings = asyncHandler(async (req: Request, res: Response) => {
        const result = await bookingService.getTenantBookings(req.user!.userId);
        successResponse(res, result.bookings);
    });

    /**
     * GET /api/v1/bookings/owner/my
     * Get booking requests on the owner's houses
     */
    getOwnerBookings = asyncHandler(async (req: Request, res: Response) => {
        const result = await bookingService.getOwnerBookings(req.user!.userId);
        successResponse(res, result.bookings);
    });

    /**
     * GET /api/v1/bookings/:id
     * Get booking details
     */
    getBooking = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await bookingService.getBooking(req.user!.userId, id);
        successResponse(res, result);
    });

    /**
     * PUT /api/v1/bookings/:id/status
     * Update booking status (owner accepts/rejects, tenant cancels)
     */
    updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await bookingService.updateBookingStatus(req.user!.userId, id, req.body);
        successResponse(res, result, `Booking status updated to ${req.body.status}`);
    });
}

export const bookingController = new BookingController();