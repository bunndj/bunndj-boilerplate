import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';

export interface RouteConfig {
    path: string;
    element: React.ComponentType;
    isProtected?: boolean;
    isPublic?: boolean;
}

export const routes: RouteConfig[] = [
    // Public Routes
    {
        path: '/signin',
        element: SignIn,
        isPublic: true,
    },
    {
        path: '/signup',
        element: SignUp,
        isPublic: true,
    },
    
    // Protected Routes
    {
        path: '/dashboard',
        element: Dashboard,
        isProtected: true,
    },
];

export const defaultRoute = '/signin';
export const dashboardRoute = '/dashboard'; 