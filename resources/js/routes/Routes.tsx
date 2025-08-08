import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import { routes, defaultRoute } from './routeConfig';

function Routes() {
    return (
        <RouterRoutes>
            {/* Dynamic Routes from Configuration */}
            {routes.map(({ path, element: Element, isProtected, isPublic }) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        isProtected ? (
                            <ProtectedRoute>
                                <Element />
                            </ProtectedRoute>
                        ) : isPublic ? (
                            <PublicRoute>
                                <Element />
                            </PublicRoute>
                        ) : (
                            <Element />
                        )
                    }
                />
            ))}

            {/* Default redirects */}
            <Route path="/" element={<Navigate to={defaultRoute} replace />} />
            <Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </RouterRoutes>
    );
}

export default Routes; 