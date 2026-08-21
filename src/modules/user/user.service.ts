import bcrypt from 'bcryptjs';
import { AccountStatus } from '../../shared/types/enums';
import prisma from '../../shared/database/prisma';
import {
    NotFoundError,
    UnauthorizedError,
    ValidationError,
    ForbiddenError
} from '../../shared/errors';
import {
    UpdateProfileInput,
    ChangePasswordInput,
    KYCSubmitInput,
    UpdateUserStatusInput,
    UserListQuery,
} from './user.schema';

const SALT_ROUNDS = 12;

export class UserService {
    private parseKycDocuments(raw: string | null | undefined): Array<Record<string, unknown>> {
        if (!raw) return [];

        try {
            const parsed = JSON.parse(raw as any);
            if (!Array.isArray(parsed)) return [];

            // Backward compatible: older records may be string URLs.
            return parsed.map((entry: any) => {
                if (typeof entry === 'string') {
                    return {
                        documentImage: entry,
                        documentType: 'unknown',
                    };
                }
                if (entry && typeof entry === 'object') {
                    return entry;
                }
                return {
                    documentImage: String(entry),
                    documentType: 'unknown',
                };
            });
        } catch {
            return [];
        }
    }

    /**
     * Get current user profile
     */
    async getProfile(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                isAdmin: true,
                isOwner: true,
                isProvider: true,
                status: true,
                name: true,
                avatar: true,
                dateOfBirth: true,
                gender: true,
                occupation: true,
                aadhaarVerified: true,
                panVerified: true,
                trustScore: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: number, input: UpdateProfileInput) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...input,
                dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
            },
            select: {
                id: true,
                email: true,
                phone: true,
                isAdmin: true,
                isOwner: true,
                isProvider: true,
                status: true,
                name: true,
                avatar: true,
                dateOfBirth: true,
                gender: true,
                occupation: true,
                updatedAt: true,
            },
        });

        // Log the update
        await this.createAuditLog(userId, 'PROFILE_UPDATE', 'user', { fields: Object.keys(input) });

        return updatedUser;
    }

    /**
     * Change password
     */
    async changePassword(userId: number, input: ChangePasswordInput) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            throw new NotFoundError('User not found');
        }

        // Verify current password
        const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedError('Current password is incorrect');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        // Revoke all refresh tokens
        await prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        await this.createAuditLog(userId, 'PASSWORD_CHANGE', 'user', {});

        return { message: 'Password changed successfully. Please login again.' };
    }

    /**
     * Submit KYC documents
     */
    async submitKYC(userId: number, input: KYCSubmitInput) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        // TODO: Integrate with actual KYC verification service
        // This is a placeholder that stores the document info

        let currentDocs: string[] = [];
        try {
            if (user.kycDocuments) {
                currentDocs = JSON.parse(user.kycDocuments as any);
            }
        } catch (e) {}

        const updateData: { kycDocuments: string; aadhaarVerified?: boolean; panVerified?: boolean } = {
            kycDocuments: JSON.stringify([
                ...this.parseKycDocuments(user.kycDocuments as any),
                {
                    documentType: input.documentType,
                    documentNumber: input.documentNumber,
                    documentImage: input.documentImage,
                    submittedAt: new Date().toISOString(),
                },
            ]),
        };

        // In production, this would be set after actual verification
        if (input.documentType === 'aadhaar') {
            updateData.aadhaarVerified = true; // Placeholder
        } else if (input.documentType === 'pan') {
            updateData.panVerified = true; // Placeholder
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        await this.createAuditLog(userId, 'KYC_SUBMIT', 'user', { documentType: input.documentType });

        return {
            message: 'KYC document submitted for verification',
            status: 'pending_verification',
        };
    }

    /**
     * Get KYC status
     */
    async getKYCStatus(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                aadhaarVerified: true,
                panVerified: true,
                kycDocuments: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        let docCount = 0;
        try {
            if (user.kycDocuments) {
                docCount = JSON.parse(user.kycDocuments as any).length;
            }
        } catch (e) {}

        return {
            aadhaarVerified: user.aadhaarVerified,
            panVerified: user.panVerified,
            documentsSubmitted: docCount,
            overallStatus: user.aadhaarVerified || user.panVerified ? 'verified' : 'pending',
        };
    }

    /**
     * Get public user profile
     */
    async getPublicProfile(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                avatar: true,
                isAdmin: true,
                isOwner: true,
                isProvider: true,
                trustScore: true,
                aadhaarVerified: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    // ============================================
    // ADMIN METHODS
    // ============================================

    /**
     * List users with filters (Admin only)
     */
    async listUsers(query: UserListQuery) {
        const { page, limit, isAdmin, isOwner, isProvider, status, search, kycSubmitted } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        const andConditions: any[] = [];
        if (isAdmin !== undefined) where.isAdmin = isAdmin;
        if (isOwner !== undefined) where.isOwner = isOwner;
        if (isProvider !== undefined) where.isProvider = isProvider;
        if (status) where.status = status;
        if (kycSubmitted === true) {
            andConditions.push({
                OR: [
                    { kycDocuments: { not: '[]' } },
                    { aadhaarVerified: true },
                    { panVerified: true },
                ],
            });
        }
        if (search) {
            andConditions.push({
                OR: [
                { email: { contains: search } },
                { phone: { contains: search } },
                { name: { contains: search } },
                { name: { contains: search } },
                ],
            });
        }

        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    isAdmin: true,
                    isOwner: true,
                    isProvider: true,
                    status: true,
                    name: true,
                    aadhaarVerified: true,
                    panVerified: true,
                    kycDocuments: true,
                    trustScore: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        const usersWithKyc = users
            .map((user: any) => {
            const documents = this.parseKycDocuments(user.kycDocuments as any);
            return {
                ...user,
                kycDocuments: documents,
                kycDocumentCount: documents.length,
            };
        })
            .filter((user: any) => (kycSubmitted === true ? user.kycDocumentCount > 0 : true));

        return {
            users: usersWithKyc,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update user status (Admin only)
     */
    async updateUserStatus(adminId: number, targetUserId: number, input: UpdateUserStatusInput) {
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            throw new NotFoundError('User not found');
        }

        // Prevent admin from modifying other admins
        if (targetUser.isAdmin) {
            throw new ForbiddenError('Cannot modify admin accounts');
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { status: input.status as AccountStatus },
        });

        // If blocking, revoke all tokens
        if (input.status === 'BLOCKED') {
            await prisma.refreshToken.updateMany({
                where: { userId: targetUserId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }

        await this.createAuditLog(adminId, 'USER_STATUS_UPDATE', 'user', {
            targetUserId,
            newStatus: input.status,
            reason: input.reason,
        });

        return {
            id: updatedUser.id,
            status: updatedUser.status,
            message: `User status updated to ${input.status}`,
        };
    }

    /**
     * Verify user (Admin only - KYC approval)
     */
    async verifyUser(adminId: number, targetUserId: number) {
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            throw new NotFoundError('User not found');
        }

        if (targetUser.status === AccountStatus.VERIFIED) {
            throw new ValidationError('User is already verified');
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: { 
                status: AccountStatus.VERIFIED,
                isProvider: true,
                isOwner: true,
            },
        });

        await this.createAuditLog(adminId, 'USER_VERIFY', 'user', { targetUserId });

        return {
            id: updatedUser.id,
            status: updatedUser.status,
            isProvider: updatedUser.isProvider,
            isOwner: updatedUser.isOwner,
            message: 'User verified successfully and upgraded to Provider and Owner',
        };
    }

    // Helper methods
    private async createAuditLog(
        userId: number,
        action: string,
        resource: string,
        details: Record<string, unknown>
    ) {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                resource,
                details: JSON.stringify(details),
            },
        });
    }
}

export const userService = new UserService();
