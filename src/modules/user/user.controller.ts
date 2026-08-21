import { Request, Response } from 'express';
import { userService } from './user.service';
import { asyncHandler, successResponse } from '../../shared/utils/response';

export class UserController {
    /**
     * GET /api/v1/users/me
     * Get current user profile
     */
    getProfile = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.getProfile(req.user!.userId);
        successResponse(res, result);
    });

    /**
     * PUT /api/v1/users/me
     * Update current user profile
     */
    updateProfile = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.updateProfile(req.user!.userId, req.body);
        successResponse(res, result, 'Profile updated successfully');
    });

    /**
     * POST /api/v1/users/me/password
     * Change password
     */
    changePassword = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.changePassword(req.user!.userId, req.body);
        successResponse(res, result);
    });

    /**
     * POST /api/v1/users/upgrade-request
     * Submit Upgrade documents
     */
    upgradeRequest = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.submitKYC(req.user!.userId, req.body);
        successResponse(res, result, 'Upgrade request submitted');
    });

    /**
     * GET /api/v1/users/kyc/status
     * Get KYC status
     */
    getKYCStatus = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.getKYCStatus(req.user!.userId);
        successResponse(res, result);
    });

    /**
     * GET /api/v1/users/:id/public
     * Get public user profile
     */
    getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.getPublicProfile(Number(req.params.id));
        successResponse(res, result);
    });

    // ============================================
    // ADMIN ENDPOINTS
    // ============================================

    /**
     * GET /api/v1/admin/users
     * List all users (Admin only)
     */
    listUsers = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.listUsers(req.query as any);
        successResponse(res, result.users, undefined, 200, {
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
        });
    });

    /**
     * PUT /api/v1/admin/users/:id/status
     * Update user status (Admin only)
     */
    updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.updateUserStatus(
            req.user!.userId,
            Number(req.params.id),
            req.body
        );
        successResponse(res, result);
    });

    /**
     * POST /api/v1/admin/users/:id/verify
     * Verify user (Admin only)
     */
    verifyUser = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.verifyUser(req.user!.userId, Number(req.params.id));
        successResponse(res, result);
    });
}

export const userController = new UserController();
