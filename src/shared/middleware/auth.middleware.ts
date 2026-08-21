import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { hasPermission, hasAnyPermission } from '../utils/permissions';
import { AccountStatus } from '../types/enums';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export interface JWTPayload {
    userId: number;
    email?: string;
    phone?: string;
    isAdmin: boolean;
    isOwner: boolean;
    isProvider: boolean;
    status: AccountStatus;
    iat?: number;
    exp?: number;
}

/**
 * Middleware to authenticate JWT access token
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, config.jwt.accessSecret) as JWTPayload;

        // Check if account is blocked
        if (decoded.status === 'BLOCKED') {
            throw new ForbiddenError('Account is blocked');
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedError('Token expired'));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid token'));
        } else {
            next(error);
        }
    }
};

/**
 * Middleware to require specific permissions
 */
export const requirePermissions = (...permissions: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }
        
        const capabilities = {
            isAdmin: req.user.isAdmin,
            isOwner: req.user.isOwner,
            isProvider: req.user.isProvider
        };

        if (!hasAnyPermission(capabilities, permissions)) {
            return next(new ForbiddenError('Insufficient permissions'));
        }

        next();
    };
};

/**
 * Middleware to require verified account status
 */
export const requireVerified = (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.status !== 'VERIFIED') {
        return next(new ForbiddenError('Account verification required'));
    }

    next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, config.jwt.accessSecret) as JWTPayload;
        req.user = decoded;
    } catch {
        // Ignore token errors for optional auth
    }

    next();
};
