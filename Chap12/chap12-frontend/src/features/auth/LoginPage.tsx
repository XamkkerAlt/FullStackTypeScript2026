import { useActionState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from './authSlice';
import { useNavigate, useLocation, Link } from 'react-router';
export function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { error } = useAppSelector((state) => state.auth);
    const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
    const [, submitAction, isPending] = useActionState(
        async (_prev: null, formData: FormData) => {
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;
            const result = await dispatch(login({ email, password }));
            if (login.fulfilled.match(result)) {
                navigate(from, { replace: true });
            }
            return null;
        },
        null
    );
    return (
        <form action={submitAction}>
            <h1>Log In</h1>
            {error && <p className="error">{error}</p>}
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit" disabled={isPending}>
                {isPending ? 'Logging in...' : 'Log In'}
            </button>
            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </form>
    );
}
