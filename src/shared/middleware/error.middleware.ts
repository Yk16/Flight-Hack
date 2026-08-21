import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

/**
 * Global error handling middleware
 */
export const errorHandler = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', error);

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
            },
        });
        return;
    }

    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        const errorDetails = (error as any).meta || error.message;
        console.error('Prisma Error:', errorDetails);
        res.status(400).json({
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: 'Database operation failed',
                details: errorDetails
            },
        });
        return;
    }

    // Default error response
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : error.message,
        },
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
};
