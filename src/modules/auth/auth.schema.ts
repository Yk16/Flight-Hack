import { z } from 'zod';
// Removed UserRole from auth schema


// Email/Password Registration
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().min(8, 'Phone number must be at least 8 digits').max(18),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Phone Registration
export const phoneRegisterSchema = z.object({
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
    name: z.string().min(2).max(100).optional(),
});

// Email/Password Login (accepts email or phone as identifier)
export const loginSchema = z.object({
    email: z.string().min(1, 'Email or phone is required'),
    password: z.string().min(1, 'Password is required'),
});

// OTP Request
export const otpRequestSchema = z.object({
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
    purpose: z.enum(['LOGIN', 'REGISTRATION', 'PASSWORD_RESET']).default('LOGIN'),
});

// OTP Verification
export const otpVerifySchema = z.object({
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
    code: z.string().length(6, 'OTP must be 6 digits'),
    purpose: z.enum(['LOGIN', 'REGISTRATION', 'PASSWORD_RESET']).default('LOGIN'),
});

// Refresh Token
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// OAuth Login
export const oauthSchema = z.object({
    provider: z.enum(['google', 'facebook']),
    token: z.string().min(1, 'OAuth token is required'),
});

// Password Reset Request
export const passwordResetRequestSchema = z.object({
    email: z.string().email('Invalid email format'),
});

// Password Reset
export const passwordResetSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type PhoneRegisterInput = z.infer<typeof phoneRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OTPRequestInput = z.infer<typeof otpRequestSchema>;
export type OTPVerifyInput = z.infer<typeof otpVerifySchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type OAuthInput = z.infer<typeof oauthSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
