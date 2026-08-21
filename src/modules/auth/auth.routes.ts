import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import {
    registerSchema,
    phoneRegisterSchema,
    loginSchema,
    otpRequestSchema,
    otpVerifySchema,
    refreshTokenSchema,
    passwordResetRequestSchema,
    passwordResetSchema,
} from './auth.schema';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user with email/password
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/register/phone
 * @desc    Register new user with phone (sends OTP)
 * @access  Public
 */
router.post('/register/phone', validate(phoneRegisterSchema), authController.registerWithPhone);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with email/password
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/otp/send
 * @desc    Request OTP for phone login
 * @access  Public
 */
router.post('/otp/send', validate(otpRequestSchema), authController.sendOTP);

/**
 * @route   POST /api/v1/auth/otp/verify
 * @desc    Verify OTP and login
 * @access  Public
 */
router.post('/otp/verify', validate(otpVerifySchema), authController.verifyOTP);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout and revoke refresh token
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/password-reset/request
 * @desc    Request password reset (sends token via email)
 * @access  Public
 */
router.post('/password-reset/request', validate(passwordResetRequestSchema), authController.requestPasswordReset);

/**
 * @route   POST /api/v1/auth/password-reset/reset
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/password-reset/reset', validate(passwordResetSchema), authController.resetPassword);

/**
 * @route   POST /api/v1/auth/oauth/:provider
 * @desc    OAuth login (placeholder)
 * @access  Public
 */
router.post('/oauth/:provider', authController.oauthLogin);

export default router;
