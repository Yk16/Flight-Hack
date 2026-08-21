import { Request, Response } from 'express';
import { housingService } from './housing.service';
import { asyncHandler, successResponse } from '../../shared/utils/response';

export class HousingController {
    /**
     * POST /api/v1/houses
     * Create a new house listing (OWNER only)
     */
    createHouse = asyncHandler(async (req: Request, res: Response) => {
        const result = await housingService.createHouse(req.user!.userId, req.body);
        successResponse(res, result, 'House listing created successfully', 201);
    });

    /**
     * GET /api/v1/houses
     * List houses with filters
     */
    listHouses = asyncHandler(async (req: Request, res: Response) => {
        const result = await housingService.listHouses(req.query as any);
        successResponse(res, result.houses, undefined, 200, {
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
        });
    });

    /**
     * GET /api/v1/houses/:id
     * Get house details
     */
    getHouse = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const incrementView = req.user?.userId !== undefined; // Only increment for logged-in users
        const result = await housingService.getHouseById(id, incrementView);
        successResponse(res, result);
    });

    /**
     * PUT /api/v1/houses/:id
     * Update house listing (OWNER only)
     */
    updateHouse = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await housingService.updateHouse(id, req.user!.userId, req.body);
        successResponse(res, result, 'House listing updated successfully');
    });

    /**
     * DELETE /api/v1/houses/:id
     * Delete house listing (OWNER only)
     */
    deleteHouse = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await housingService.deleteHouse(id, req.user!.userId);
        successResponse(res, result);
    });

    /**
     * GET /api/v1/houses/owner/my
     * Get current owner's houses
     */
    getMyHouses = asyncHandler(async (req: Request, res: Response) => {
        const result = await housingService.getOwnerHouses(req.user!.userId, req.query as any);
        successResponse(res, result.houses, undefined, 200, {
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
        });
    });

    /**
     * POST /api/v1/houses/:id/inquiry
     * Record an inquiry (when user contacts owner)
     */
    recordInquiry = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        await housingService.incrementInquiry(id);
        successResponse(res, { message: 'Inquiry recorded' });
    });
}

export const housingController = new HousingController();
