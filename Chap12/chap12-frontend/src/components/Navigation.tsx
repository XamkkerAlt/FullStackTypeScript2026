import { Link } from 'react-router';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../features/auth/authSlice';
export function Navigation() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    return (
        <nav>
            <Link to="/">Home</Link>
            {isAuthenticated ? (
                <>
                    <Link to="/posts/new">New Post</Link>
                    <Link to="/profile">{user?.username}</Link>
                    {user?.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
                    <button onClick={() => dispatch(logout())}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
}