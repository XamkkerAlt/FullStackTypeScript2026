import { cleanupExpiredTokens } from '../services/authService.js';

export function startTokenCleanup(intervalMs = 60 * 60 * 1000): NodeJS.Timeout {
    return setInterval(() => {
        cleanupExpiredTokens().catch((error: unknown) => {
            console.error('Failed to clean up expired refresh tokens', error);
        });
    }, intervalMs);
}
