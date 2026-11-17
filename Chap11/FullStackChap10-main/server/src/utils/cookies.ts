import type { Response } from 'express';
export function setRefreshTokenCookie(
    res: Response,
    token: string,
): void {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
    });
}
export function clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refreshToken', { path: '/api/auth' });
}