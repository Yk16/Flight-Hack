import { Request, Response } from 'express';
import { marketplaceService } from './service.service';
import { asyncHandler, successResponse } from '../../shared/utils/response';

export class ServiceController {
    createListing = asyncHandler(async (req: Request, res: Response) => {
        const result = await marketplaceService.createListing(req.user!.userId, req.body);
        successResponse(res, result, 'Service listing created', 201);
    });

    getListings = asyncHandler(async (req: Request, res: Response) => {
        const result = await marketplaceService.getListings(req.query.type as string);
        successResponse(res, result);
    });

    bookService = asyncHandler(async (req: Request, res: Response) => {
        const result = await marketplaceService.bookService(req.user!.userId, req.body);
        successResponse(res, result, 'Service booked successfully');
    });

    // GET /services/bookings/provider
    getProviderBookings = asyncHandler(async (req: Request, res: Response) => {
        const result = await marketplaceService.getProviderBookings(req.user!.userId);
        successResponse(res, result);
    });

    // PATCH /services/bookings/:id
    updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const { status } = req.body;
        const result = await marketplaceService.updateBookingStatus(id, req.user!.userId, status);
        successResponse(res, result, 'Booking status updated');
    });

    // ============================================
    // ADMIN ENDPOINTS
    // ============================================

    // GET /admin/services/providers - Get all service providers pending verification
    getPendingProviders = asyncHandler(async (req: Request, res: Response) => {
        const result = await marketplaceService.getPendingProviders(req.query as any);
        successResponse(res, result.providers, undefined, 200, {
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
        });
    });

    // GET /admin/services/providers/:id - Get service provider details for verification
    getProviderDetails = asyncHandler(async (req: Request, res: Response) => {
        const result = await marketplaceService.getProviderDetails(Number(req.params.id));
        successResponse(res, result);
    });

    // PATCH /admin/services/providers/:id/verify - Approve or reject service provider
    verifyServiceProvider = asyncHandler(async (req: Request, res: Response) => {
        const result = await marketplaceService.verifyServiceProvider(
            Number(req.params.id),
            req.body
        );
        successResponse(res, result, `Service provider ${req.body.status.toLowerCase()}ed successfully`);
    });
}

export const serviceController = new ServiceController();