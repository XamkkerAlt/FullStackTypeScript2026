// src/errors.ts
export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthError';
    }
}

export function generalErrorHandler(
    error: unknown,
    _req: import('express').Request,
    res: import('express').Response,
    _next: import('express').NextFunction,
): void {
    if (error instanceof AuthError) {
        res.status(401).json({
            error: 'UNAUTHORIZED',
            message: error.message,
        });
        return;
    }

    console.error(error);
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
    });
}