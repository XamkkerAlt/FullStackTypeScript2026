import { Outlet } from 'react-router';
import { Navigation } from './Navigation';
export function Layout() {
    return (
        <>
            <Navigation />
            <Outlet />
        </>
    );
}