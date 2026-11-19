import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { LoginPage } from './LoginPage';
function renderWithProviders(ui: React.ReactElement) {
    const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
            auth: {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            },
        },
    });
    return render(
        <Provider store={store}>
            <MemoryRouter>{ui}</MemoryRouter>
        </Provider>
    );
}
describe('LoginPage', () => {
    it('renders login form', () => {
        renderWithProviders(<LoginPage />);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });
    it('displays error from state', () => {
        const store = configureStore({
            reducer: { auth: authReducer },
            preloadedState: {
                auth: {
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: 'Invalid credentials',
                },
            },
        });
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
});
import { vi } from 'vitest';
import * as endpoints from '../../api/endpoints';
vi.mock('../../api/endpoints', () => ({
    authApi: {
        login: vi.fn(),
        register: vi.fn(),
        refresh: vi.fn(),
        logout: vi.fn(),
    },
    postsApi: {
        getAll: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
    },
}));