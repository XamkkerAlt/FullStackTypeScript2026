import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, usersApi } from '../../api/endpoints';
import { setAccessToken } from '../../api/token';
import type { User } from '../../types';
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: {
        email: string; password:
        string
    }, { rejectWithValue }) => {
        try {
            const response = await authApi.login(credentials.email,
                credentials.password);
            setAccessToken(response.accessToken);
            return response.user;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Login failed'
            );
        }
    }
);
export const register = createAsyncThunk(
    'auth/register',
    async (
        data: { email: string; password: string; username: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await authApi.register(data.email, data.password,
                data.username);
            setAccessToken(response.accessToken);
            return response.user;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Registration failed'
            );
        }
    }
);
export const logout = createAsyncThunk('auth/logout', async () => {
    await authApi.logout();
    setAccessToken(null);
});
export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async (_, { rejectWithValue }) => {
        try {
            const { accessToken } = await authApi.refresh();
            setAccessToken(accessToken);
            const user = await usersApi.getProfile();
            return user;
        } catch {
            setAccessToken(null);
            return rejectWithValue('No valid session');
        }
    }
);
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(initializeAuth.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
            });
    },
});
export const { clearError } = authSlice.actions;
export default authSlice.reducer;
