import { Navigate, Outlet, useLocation } from 'react-router';
import { useAppSelector } from '../store/hooks';
export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
    const location = useLocation();
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Outlet />;
}