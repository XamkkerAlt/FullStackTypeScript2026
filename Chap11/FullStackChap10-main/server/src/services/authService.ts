import * as argon2 from 'argon2';
import { prisma } from '../db.js';
import {
    createAccessToken,
    createRefreshToken,
    daysFromNow,
} from '../utils/jwt.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.js';
import { AuthError } from '../errors.js';
export async function registerUser(input: RegisterInput) {
    const hashedPassword = await argon2.hash(input.password, {
        type: argon2.argon2id,
    });
    const user = await prisma.user.create({
        data: {
            email: input.email,
            username: input.username,
            password: hashedPassword,
        },
    });
    const accessToken = await createAccessToken(user.id, user.role);
    const refreshToken = await createRefreshToken(user.id);
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: daysFromNow(7),
        },
    });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
}
export async function loginUser(input: LoginInput) {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
        omit: { password: false },
    });
    if (!user) {
        throw new AuthError('Invalid email or password');
    }
    const validPassword = await argon2.verify(user.password, input.password);
    if (!validPassword) {
        throw new AuthError('Invalid email or password');
    }
    const accessToken = await createAccessToken(user.id, user.role);
    const refreshToken = await createRefreshToken(user.id);
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: daysFromNow(7),
        },
    });
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
}
export async function cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
        where: {
            expiresAt: { lt: new Date() },
        },
    });
    return result.count;
}