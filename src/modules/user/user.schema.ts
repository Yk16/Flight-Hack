import { z } from 'zod';

// Update profile
export const updateProfileSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    occupation: z.string().max(100).optional(),
    avatar: z.string().url().optional(),
});

// Change password
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

// KYC submission
export const kycSubmitSchema = z.object({
    documentType: z.enum(['aadhaar', 'pan']),
    documentNumber: z.string().min(1, 'Document number is required'),
    documentImage: z.string().url('Invalid document image URL').optional().or(z.literal('')),
});

// Admin: Update user status
export const updateUserStatusSchema = z.object({
    status: z.enum(['PENDING', 'VERIFIED', 'BLOCKED']),
    reason: z.string().optional(),
});

// Query params for user list
export const userListQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    isAdmin: z.boolean().optional(),
    isOwner: z.boolean().optional(),
    isProvider: z.boolean().optional(),
    status: z.enum(['PENDING', 'VERIFIED', 'BLOCKED']).optional(),
    search: z.string().optional(),
    kycSubmitted: z.coerce.boolean().optional(),
});

// Type exports
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type KYCSubmitInput = z.infer<typeof kycSubmitSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
