import { jwtVerify, errors } from 'jose';
import type { Request, Response, NextFunction } from 'express';
const secret = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET,
);
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
            error: 'UNAUTHORIZED',
            message: 'Missing or invalid authorization header',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const { payload } = await jwtVerify(token, secret);
        req.user = {
            id: Number(payload.sub),
            role: payload.role as string,
        };
        next();
    } catch (error) {
        if (error instanceof errors.JWTExpired) {
            res.status(401).json({
                error: 'TOKEN_EXPIRED',
                message: 'Access token has expired',
            });
            return;
        }
        res.status(401).json({
            error: 'INVALID_TOKEN',
            message: 'Invalid access token',
        });
    }
}