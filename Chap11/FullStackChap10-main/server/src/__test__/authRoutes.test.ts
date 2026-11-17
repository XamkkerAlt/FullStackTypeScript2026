import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import test from 'node:test';
import { PrismaPg } from '@prisma/adapter-pg';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '../generated/prisma/client.js';
import request from 'supertest';

let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;
let client: PrismaClient;
let app: (typeof import('../app.js'))['default'];
let cleanupExpiredTokens: typeof import('../services/authService.js')['cleanupExpiredTokens'];

test.before(async () => {
    container = await new PostgreSqlContainer('postgres:17.5-alpine3.22')
        .withDatabase('auth_tests')
        .withUsername('postgres')
        .withPassword('postgres')
        .start();

    const url = container.getConnectionUri();
    process.env.DATABASE_URL = url;
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    execSync('npx prisma db push', {
        env: { ...process.env, DATABASE_URL: url },
        stdio: 'inherit',
    });

    client = new PrismaClient({
        adapter: new PrismaPg({ connectionString: url }),
    });
    app = (await import('../app.js')).default;
    cleanupExpiredTokens = (await import('../services/authService.js'))
        .cleanupExpiredTokens;
});

test.after(async () => {
    await client.$disconnect();
    await container.stop();
});

test('registers a user without returning the password', async () => {
    const response = await request(app)
        .post('/api/auth/register')
        .send({
            email: 'auth@example.com',
            username: 'auth-user',
            password: 'correct horse battery staple',
        });

    assert.equal(response.status, 201);
    assert.equal(response.body.user.email, 'auth@example.com');
    assert.equal(response.body.user.password, undefined);
    assert.equal(typeof response.body.accessToken, 'string');
    assert.ok(response.headers['set-cookie']);
});

test('rejects invalid login credentials', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'auth@example.com',
            password: 'wrong password',
        });

    assert.equal(response.status, 401);
    assert.equal(response.body.error, 'UNAUTHORIZED');
});

test('rotates a valid refresh token', async () => {
    const login = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'auth@example.com',
            password: 'correct horse battery staple',
        });
    const refresh = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', login.headers['set-cookie']);

    assert.equal(login.status, 200);
    assert.equal(refresh.status, 200);
    assert.equal(typeof refresh.body.accessToken, 'string');
    assert.ok(refresh.headers['set-cookie']);
});

test('validates required authentication fields', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'auth@example.com' });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, 'VALIDATION_ERROR');
});

test('removes expired refresh tokens', async () => {
    const user = await client.user.create({
        data: {
            email: 'cleanup@example.com',
            username: 'cleanup-user',
            password: 'not-used',
        },
    });
    await client.refreshToken.create({
        data: {
            token: 'expired-refresh-token',
            userId: user.id,
            expiresAt: new Date(Date.now() - 1000),
        },
    });

    const deletedCount = await cleanupExpiredTokens();

    assert.equal(deletedCount, 1);
    assert.equal(
        await client.refreshToken.findUnique({
            where: { token: 'expired-refresh-token' },
        }),
        null,
    );
});

test('logs out and clears the refresh-token cookie', async () => {
    const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', 'refreshToken=not-a-real-token');

    assert.equal(response.status, 204);
    assert.match(response.headers['set-cookie']?.[0] ?? '', /refreshToken=/);
});
