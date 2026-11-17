export interface RegisterInput {
    email: string;
    username: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthSchema<T> {
    parse(value: unknown): T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function requireString(
    value: Record<string, unknown>,
    field: string,
): string {
    const fieldValue = value[field];
    if (typeof fieldValue !== 'string' || fieldValue.trim() === '') {
        throw new Error(`${field} is required`);
    }
    return fieldValue;
}

export const registerSchema: AuthSchema<RegisterInput> = {
    parse(value) {
        if (!isRecord(value)) {
            throw new Error('Request body must be an object');
        }
        return {
            email: requireString(value, 'email'),
            username: requireString(value, 'username'),
            password: requireString(value, 'password'),
        };
    },
};

export const loginSchema: AuthSchema<LoginInput> = {
    parse(value) {
        if (!isRecord(value)) {
            throw new Error('Request body must be an object');
        }
        return {
            email: requireString(value, 'email'),
            password: requireString(value, 'password'),
        };
    },
};
