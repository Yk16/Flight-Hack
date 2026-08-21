import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory for request validation using Zod schemas
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const data = req[target];
            const validated = schema.parse(data);
            req[target] = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
                next(new ValidationError(messages.join(', ')));
            } else {
                next(error);
            }
        }
    };
};

/**
 * Validate multiple targets at once
 */
export const validateRequest = (schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
                next(new ValidationError(messages.join(', ')));
            } else {
                next(error);
            }
        }
    };
};
