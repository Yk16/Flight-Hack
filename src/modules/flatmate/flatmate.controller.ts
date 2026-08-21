import { Request, Response } from 'express';
import { flatmateService } from './flatmate.service';
import { asyncHandler, successResponse } from '../../shared/utils/response';

export class FlatmateController {
    /**
     * GET /api/v1/flatmates/me
     * Get user's flatmate profile
     */
    getMyProfile = asyncHandler(async (req: Request, res: Response) => {
        const result = await flatmateService.getProfile(req.user!.userId);
        successResponse(res, result);
    });

    /**
     * POST /api/v1/flatmates/me
     * Create user's flatmate profile
     */
    createMyProfile = asyncHandler(async (req: Request, res: Response) => {
        const result = await flatmateService.updateProfile(req.user!.userId, req.body);
        successResponse(res, result, 'Flatmate profile created');
    });

    /**
     * PUT /api/v1/flatmates/me
     * Set preferences for rooming
     */
    updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
        const result = await flatmateService.updateProfile(req.user!.userId, req.body);
        successResponse(res, result, 'Flatmate profile updated');
    });

    /**
     * PUT /api/v1/flatmates/me/matches
     * Update profile and get compatible matches
     */
    updateProfileAndGetMatches = asyncHandler(async (req: Request, res: Response) => {
        const result = await flatmateService.updateProfileAndFindMatches(req.user!.userId, req.body);
        successResponse(res, result, 'Profile updated and matches found');
    });

    /**
     * GET /api/v1/flatmates/matches
     * Get my compatible matches
     */
    getMyMatches = asyncHandler(async (req: Request, res: Response) => {
        const result = await flatmateService.findMatches(req.user!.userId);
        successResponse(res, result, 'Compatible matches found');
    });

    /**
     * GET /api/v1/flatmates
     * Find compatible roommates
     */
    browseFlatmates = asyncHandler(async (req: Request, res: Response) => {
        const result = await flatmateService.searchFlatmates(req.user!.userId, req.query as any);
        successResponse(res, result.profiles, 'Matching flatmates found', 200, {
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
        });
    });
}

export const flatmateController = new FlatmateController();