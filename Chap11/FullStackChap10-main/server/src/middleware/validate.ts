import type { Request, Response, NextFunction } from 'express';
import type { AuthSchema } from '../schemas/auth.js';

export function validate<T>(schema: AuthSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Invalid request body';
            res.status(400).json({
                error: 'VALIDATION_ERROR',
                message,
            });
        }
    };
}
