import { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler, successResponse } from '../../shared/utils/response';

export class AuthController {
    /**
     * POST /api/v1/auth/register
     * Register with email and password
     */
    register = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.register(req.body);
        successResponse(res, result, 'Registration successful', 201);
    });

    /**
     * POST /api/v1/auth/register/phone
     * Register with phone number
     */
    registerWithPhone = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.registerWithPhone(req.body);
        successResponse(res, result, 'OTP sent for verification', 201);
    });

    /**
     * POST /api/v1/auth/login
     * Login with email and password
     */
    login = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.login(req.body);
        successResponse(res, result, 'Login successful');
    });

    /**
     * POST /api/v1/auth/otp/send
     * Request OTP
     */
    sendOTP = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.sendOTP(req.body);
        successResponse(res, result);
    });

    /**
     * POST /api/v1/auth/otp/verify
     * Verify OTP and login
     */
    verifyOTP = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.verifyOTP(req.body);
        successResponse(res, result, 'OTP verified successfully');
    });

    /**
     * POST /api/v1/auth/refresh
     * Refresh access token
     */
    refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const result = await authService.refreshToken(refreshToken);
        successResponse(res, result, 'Token refreshed');
    });

    /**
     * POST /api/v1/auth/logout
     * Logout user
     */
    logout = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { refreshToken } = req.body;
        const result = await authService.logout(userId, refreshToken);
        successResponse(res, result);
    });

    /**
     * POST /api/v1/auth/password-reset/request
     * Request password reset
     */
    requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.requestPasswordReset(req.body);
        successResponse(res, result);
    });

    /**
     * POST /api/v1/auth/password-reset/reset
     * Reset password with token
     */
    resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.resetPassword(req.body);
        successResponse(res, result, 'Password reset successful');
    });

    /**
     * POST /api/v1/auth/oauth/:provider
     * OAuth login
     */
    oauthLogin = asyncHandler(async (req: Request, res: Response) => {
        const { provider } = req.params;
        const { token } = req.body;
        const result = await authService.oauthLogin({ provider: provider as 'google' | 'facebook', token });
        successResponse(res, result, 'OAuth login successful');
    });
}

export const authController = new AuthController();
