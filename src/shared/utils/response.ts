import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

export const successResponse = <T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
    meta?: ApiResponse['meta']
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        data,
        message,
        meta,
    };
    return res.status(statusCode).json(response);
};

export const errorResponse = (
    res: Response,
    error: AppError | Error,
    statusCode?: number
): Response => {
    const isAppError = error instanceof AppError;
    const response: ApiResponse = {
        success: false,
        error: {
            code: isAppError ? error.code : 'INTERNAL_ERROR',
            message: error.message,
        },
    };
    return res.status(statusCode || (isAppError ? error.statusCode : 500)).json(response);
};

// Async handler wrapper to catch errors
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
