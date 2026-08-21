import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AccountStatus, OTPPurpose } from '../../shared/types/enums';
import prisma from '../../shared/database/prisma';
import { config } from '../../config';
import {
    UnauthorizedError,
    ConflictError,
    NotFoundError,
    ValidationError,
    TooManyRequestsError
} from '../../shared/errors';
import { JWTPayload } from '../../shared/middleware/auth.middleware';
import {
    RegisterInput,
    PhoneRegisterInput,
    LoginInput,
    OTPRequestInput,
    OTPVerifyInput,
    OAuthInput,
    PasswordResetRequestInput,
    PasswordResetInput,
} from './auth.schema';

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

export class AuthService {
    /**
     * Register a new user with email and password
     */
    async register(input: RegisterInput) {
        const { email, password, name, phone } = input;

        // Check if user exists
        const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
        if (existing) {
            throw new ConflictError('Email or phone already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                phone,
                passwordHash,
                status: AccountStatus.PENDING,
                name,
            },
        });

        // Generate tokens
        const tokens = this.generateTokens(user);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }

    /**
     * Register with phone number (sends OTP)
     */
    async registerWithPhone(input: PhoneRegisterInput) {
        const { phone, name } = input;

        // Check if phone exists
        const existing = await prisma.user.findUnique({ where: { phone } });
        if (existing) {
            throw new ConflictError('Phone number already registered');
        }

        // Create pending user
        const user = await prisma.user.create({
            data: {
                phone,
                status: AccountStatus.PENDING,
                name,
            },
        });

        // Generate and send OTP
        await this.sendOTP({ phone, purpose: 'REGISTRATION' });

        return {
            message: 'OTP sent to phone number',
            userId: user.id,
        };
    }

    /**
     * Login with email, phone, or username
     */
    async login(input: LoginInput) {
        const { email, password } = input;

        const isEmail = email.includes('@');
        const user = isEmail
            ? await prisma.user.findUnique({ where: { email } })
            : await prisma.user.findUnique({ where: { phone: email } });
        if (!user || !user.passwordHash) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new TooManyRequestsError('Account is temporarily locked. Try again later.');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            await this.handleFailedLogin(user.id, user.loginAttempts);
            throw new UnauthorizedError('Invalid credentials');
        }

        // Check if blocked
        if (user.status === AccountStatus.BLOCKED) {
            throw new UnauthorizedError('Account is blocked');
        }

        // Reset login attempts and update last login
        await prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });

        // Generate tokens
        const tokens = this.generateTokens(user);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return {
            user: this.sanitizeUser(user as any),
            ...tokens,
        };
    }

    /**
     * Send OTP to phone
     */
    async sendOTP(input: OTPRequestInput) {
        const { phone, purpose } = input;

        // Check rate limiting
        const recentOTPs = await prisma.oTPCode.count({
            where: {
                phone,
                createdAt: { gte: new Date(Date.now() - 60000) }, // Last 1 minute
            },
        });

        if (recentOTPs >= 1) {
            throw new TooManyRequestsError('Please wait before requesting another OTP');
        }

        // Generate OTP
        const code = this.generateOTPCode();
        const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60000);

        // Invalidate previous OTPs
        await prisma.oTPCode.updateMany({
            where: { phone, purpose: purpose as OTPPurpose, verified: false },
            data: { verified: true },
        });

        // Save new OTP
        await prisma.oTPCode.create({
            data: {
                code,
                phone,
                purpose: purpose as OTPPurpose,
                expiresAt,
            },
        });

        // TODO: Integrate with SMS gateway
        console.log(`[OTP Service] Sending OTP ${code} to ${phone}`);

        return { message: 'OTP sent successfully' };
    }

    /**
     * Verify OTP and login
     */
    async verifyOTP(input: OTPVerifyInput) {
        const { phone, code, purpose } = input;

        const otpRecord = await prisma.oTPCode.findFirst({
            where: {
                phone,
                code,
                purpose: purpose as OTPPurpose,
                verified: false,
                expiresAt: { gte: new Date() },
            },
        });

        if (!otpRecord) {
            throw new ValidationError('Invalid or expired OTP');
        }

        // Check attempts
        if (otpRecord.attempts >= 3) {
            throw new TooManyRequestsError('Too many failed attempts');
        }

        // Mark as verified
        await prisma.oTPCode.update({
            where: { id: otpRecord.id },
            data: { verified: true },
        });

        // Find or create user
        let user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Update user status if pending
        if (user.status === AccountStatus.PENDING) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { status: AccountStatus.VERIFIED },
            });
        }

        // Generate tokens
        const tokens = this.generateTokens(user);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return {
            user: this.sanitizeUser(user as any),
            ...tokens,
        };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string) {
        // Check if token exists and is valid
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
                revokedAt: null,
                expiresAt: { gte: new Date() },
            },
            include: { user: true },
        });

        if (!storedToken) {
            throw new UnauthorizedError('Refresh token not found or expired');
        }

        // Revoke old token
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });

        // Generate new tokens
        const tokens = this.generateTokens(storedToken.user as any);
        await this.saveRefreshToken(storedToken.userId, tokens.refreshToken);

        return tokens;
    }

    /**
     * Logout - revoke refresh token
     */
    async logout(userId: number, refreshToken?: string) {
        if (refreshToken) {
            await prisma.refreshToken.updateMany({
                where: { userId, token: refreshToken },
                data: { revokedAt: new Date() },
            });
        } else {
            // Revoke all tokens
            await prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }

        return { message: 'Logged out successfully' };
    }

    /**
     * OAuth login placeholder
     */
    async oauthLogin(input: OAuthInput) {
        const { provider, token } = input;

        // TODO: Verify token with OAuth provider
        // This is a placeholder implementation
        console.log(`[OAuth] Verifying ${provider} token: ${token.substring(0, 10)}...`);

        throw new ValidationError('OAuth not yet implemented. Use email/password or OTP login.');
    }

    /**
     * Request password reset - generates a reset token
     */
    async requestPasswordReset(input: PasswordResetRequestInput) {
        const { email } = input;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal if email exists
            return { message: 'If the email is registered, a reset link has been sent.' };
        }

        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store token in a password reset record or use OTPCode model
        await prisma.oTPCode.create({
            data: {
                code: resetToken,
                phone: user.phone || email,
                purpose: 'PASSWORD_RESET',
                expiresAt: resetExpires,
                userId: user.id,
            },
        });

        // TODO: Send email with reset link
        console.log(`[Password Reset] Token for ${email}: ${resetToken}`);

        return { message: 'If the email is registered, a reset link has been sent.' };
    }

    /**
     * Reset password using a valid reset token
     */
    async resetPassword(input: PasswordResetInput) {
        const { token, newPassword } = input;

        const otpRecord = await prisma.oTPCode.findFirst({
            where: {
                code: token,
                purpose: 'PASSWORD_RESET',
                verified: false,
                expiresAt: { gte: new Date() },
            },
        });

        if (!otpRecord) {
            throw new ValidationError('Invalid or expired reset token');
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update user password
        await prisma.user.update({
            where: { id: otpRecord.userId! },
            data: { passwordHash },
        });

        // Mark token as used
        await prisma.oTPCode.update({
            where: { id: otpRecord.id },
            data: { verified: true },
        });

        return { message: 'Password has been reset successfully.' };
    }

    // Helper methods
    private generateTokens(user: { id: number; email?: string | null; phone?: string | null; isAdmin: boolean; isOwner: boolean; isProvider: boolean; status: string }) {
        const crypto = require('crypto');
        const payload: JWTPayload & { jti?: string } = {
            userId: user.id,
            email: user.email || undefined,
            phone: user.phone || undefined,
            isAdmin: user.isAdmin,
            isOwner: user.isOwner,
            isProvider: user.isProvider,
            status: user.status as AccountStatus,
            jti: crypto.randomUUID()
        };

        const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
            expiresIn: config.jwt.accessExpiresIn as any,
        });

        const refreshToken = crypto.randomBytes(64).toString('hex');

        return { accessToken, refreshToken };
    }

    private async saveRefreshToken(userId: number, token: string) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    }

    private generateOTPCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async handleFailedLogin(userId: number, currentAttempts: number) {
        const attempts = currentAttempts + 1;
        const updateData: { loginAttempts: number; lockedUntil?: Date } = {
            loginAttempts: attempts,
        };

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60000);
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
    }

    private sanitizeUser(user: {
        id: number;
        email?: string | null;
        phone?: string | null;
        isAdmin: boolean;
        isOwner: boolean;
        isProvider: boolean;
        status: string;
        name?: string | null;
        avatar?: string | null;
        createdAt: Date;
    }) {
        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            isOwner: user.isOwner,
            isProvider: user.isProvider,
            status: user.status,
            name: user.name,
            avatar: user.avatar,
            createdAt: user.createdAt,
        };
    }
}

export const authService = new AuthService();
