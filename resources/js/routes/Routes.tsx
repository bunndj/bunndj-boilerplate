import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import { routes, defaultRoute } from './routeConfig';

function Routes() {
  return (
    <RouterRoutes>
      {/* Dynamic Routes from Configuration */}
      {routes.map(({ path, element: Element, isProtected, isPublic, layout: LayoutComponent }) => {
        let routeElement = <Element />;

        // Wrap with layout if specified
        if (LayoutComponent) {
          routeElement = <LayoutComponent>{routeElement}</LayoutComponent>;
        }

        // Wrap with route protection if needed
        if (isProtected) {
          routeElement = <ProtectedRoute>{routeElement}</ProtectedRoute>;
        } else if (isPublic) {
          routeElement = <PublicRoute>{routeElement}</PublicRoute>;
        }

        return <Route key={path} path={path} element={routeElement} />;
      })}

      {/* Default redirects */}
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </RouterRoutes>
  );
}

export default Routes;
